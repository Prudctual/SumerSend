import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Worker } from 'bullmq';
import { supabase } from './db.js';
import { sendWhatsAppMessage } from './whatsapp.js';
import { sendSmsMessage } from './sms.js';
import { redisConnectionOpts, redisClient } from './redis.js';
import { queueMessageJob, queueWebhookJob } from './queue.js';
import { htmlToText, decryptText } from './utils.js';

// Cache of NodeMailer transporters (LRU Map with size limit)
const transporters = new Map();
const MAX_CACHE_SIZE = 100;

function createTransporter(config) {
  if (!config.host || !config.user || !config.pass) {
    return null;
  }
  
  // Hash all config variables (including password) to invalidate cache on credential changes
  const cacheKey = crypto.createHash('md5')
    .update(`${config.host}:${config.port}:${config.user}:${config.pass}`)
    .digest('hex');

  if (transporters.has(cacheKey)) {
    const cached = transporters.get(cacheKey);
    transporters.delete(cacheKey);
    transporters.set(cacheKey, cached);
    return cached;
  }

  // Evict oldest if limit exceeded
  if (transporters.size >= MAX_CACHE_SIZE) {
    const oldestKey = transporters.keys().next().value;
    const oldestTransporter = transporters.get(oldestKey);
    if (oldestTransporter) {
      try {
        oldestTransporter.close();
      } catch (err) {
        console.error('Error closing evicted SMTP transporter:', err);
      }
    }
    transporters.delete(oldestKey);
  }

  const transporter = nodemailer.createTransport({
    pool: true,
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    tls: {
      rejectUnauthorized: false
    },
    maxConnections: 5,
    maxMessages: 100
  });

  transporters.set(cacheKey, transporter);
  return transporter;
}

// Queue Worker instances
let messageWorker = null;
let webhookWorker = null;
let isWorkerRunning = false;
let fallbackInterval = null;
let realtimeChannel = null;

export function startQueueWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  console.log('[Worker] Starting BullMQ-based background queue processor...');

  // 1. Initialize BullMQ Message Worker
  messageWorker = new Worker('messageQueue', async (job) => {
    const { msgId } = job.data;
    console.log(`[Worker] Processing message job ${job.id} (Message ID: ${msgId})`);

    // Fetch latest message state from database
    const { data: msg, error: fetchErr } = await supabase
      .from('message_queue')
      .select('*')
      .eq('id', msgId)
      .single();

    if (fetchErr || !msg) {
      console.warn(`[Worker] Message ${msgId} not found in DB. Skipping job.`);
      return;
    }

    // Skip if already processed
    if (msg.status === 'completed' || msg.status === 'failed') {
      console.log(`[Worker] Message ${msgId} already has final status ${msg.status}. Skipping.`);
      return;
    }

    // Update status to processing in DB
    await supabase
      .from('message_queue')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', msgId);

    const { user_id: userId, type, recipient, subject, body, attempts, max_attempts, metadata = {} } = msg;
    let success = false;
    let lastError = '';

    try {
      if (type === 'email') {
        const { data: smtpConfig, error: smtpError } = await supabase
          .from('smtp_configs')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (smtpError || !smtpConfig) {
          throw new Error('SMTP configurations are not set for this user.');
        }

        const transporter = createTransporter({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.username,
          pass: decryptText(smtpConfig.password || '')
        });

        if (!transporter) {
          throw new Error('Could not create SMTP transporter. Invalid config.');
        }

        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.APP_URL || 'http://127.0.0.1:3000');
        const unsubscribeUrl = `${baseUrl}/api/public/subscribers/unsubscribe/${userId}?email=${encodeURIComponent(recipient)}`;

        await transporter.sendMail({
          from: smtpConfig.sender || `Sumer Send <onboarding@sumersend.com>`,
          to: recipient,
          subject: subject || 'No Subject',
          html: body,
          text: htmlToText(body),
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          }
        });
        success = true;

      } else if (type === 'sms') {
        await sendSmsMessage(userId, recipient, body);
        success = true;

      } else if (type === 'whatsapp') {
        // Send WhatsApp message
        await sendWhatsAppMessage(userId, recipient, body);
        success = true;
      }
    } catch (err) {
      lastError = err.message || 'Unknown processing error';
      console.error(`[Worker] Failed to process message ${msgId} on attempt ${job.attemptsMade + 1}:`, lastError);
      throw err; // Throw error to trigger BullMQ retry/backoff
    }

    if (success) {
      // Mark as completed in DB
      await supabase
        .from('message_queue')
        .update({ 
          status: 'completed', 
          attempts: job.attemptsMade + 1, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', msgId);

      // Create log entry
      await supabase.from('logs').insert({
        id: `msg_${crypto.randomUUID()}`,
        user_id: userId,
        type,
        sender: type === 'email' ? 'SMTP Config Sender' : 'Sumer Send API',
        recipient,
        subject: subject || '',
        body,
        status: 'delivered'
      });

      // Dispatch delivered webhook
      await queueWebhook(userId, `${type}.delivered`, {
        id: msgId,
        type,
        recipient,
        subject,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
    }
  }, {
    ...redisConnectionOpts,
    concurrency: 5 // Process up to 5 messages concurrently
  });

  // Handle message job failures and retries
  messageWorker.on('failed', async (job, err) => {
    if (!job) return;
    const { msgId } = job.data;
    
    // Fetch latest message details to get metadata and attempts info
    const { data: msg } = await supabase.from('message_queue').select('*').eq('id', msgId).single();
    if (!msg) return;

    const { user_id: userId, type, recipient, body, subject, max_attempts, metadata = {} } = msg;
    const currentAttempt = job.attemptsMade; // attemptsMade starts at 1 on first failure
    const lastError = err.message || 'Unknown error';

    // Determine if we should fail over to SMS immediately on permanent WhatsApp errors
    const isWhatsApp = (type === 'whatsapp');
    const isPermanentWhatsAppError = isWhatsApp && (
      lastError.includes('not registered') || 
      lastError.includes('not connected') || 
      lastError.includes('not exist') ||
      lastError.includes('not a WhatsApp number')
    );
    const isFinalAttempt = currentAttempt >= job.opts.attempts;
    const shouldFailover = isWhatsApp && metadata.failover_to_sms && (isPermanentWhatsAppError || isFinalAttempt);

    if (shouldFailover) {
      console.log(`[Worker Failover] WhatsApp message ${msgId} failed. Triggering failover to SMS...`);
      
      // 1. Mark WhatsApp message as failed in database
      await supabase
        .from('message_queue')
        .update({
          status: 'failed',
          attempts: currentAttempt,
          last_error: `WhatsApp Delivery Failed: ${lastError}. Automatically failed over to SMS.`,
          updated_at: new Date().toISOString()
        })
        .eq('id', msgId);

      // 2. Refund WhatsApp cost (150 units)
      const refundCost = 150;
      const refundTxId = `TX_REF_FO_${crypto.randomUUID()}`;
      try {
        await supabase.rpc('refund_wallet_atomic', {
          p_user_id: userId,
          p_amount: refundCost,
          p_description: `WhatsApp Failover Refund: WhatsApp to ${recipient} failed.`,
          p_provider: 'Sumer Send System',
          p_tx_id: refundTxId
        });
      } catch (refundEx) {
        console.error(`[Worker Failover] Exception during wallet refund for WhatsApp message ${msgId}:`, refundEx);
      }

      // 3. Create SMS message in message_queue
      const smsMsgId = crypto.randomUUID();
      const { data: newSms, error: smsInsertErr } = await supabase
        .from('message_queue')
        .insert({
          id: smsMsgId,
          user_id: userId,
          type: 'sms',
          recipient: recipient,
          body: body,
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
          metadata: {
            parent_whatsapp_id: msgId,
            is_failover: true
          }
        })
        .select()
        .single();

      if (!smsInsertErr && newSms) {
        // 4. Charge SMS cost (120 units)
        const smsCost = 120;
        const chargeTxId = `TX_CHG_FO_${crypto.randomUUID()}`;
        try {
          const charged = await supabase.rpc('charge_wallet_atomic', {
            p_user_id: userId,
            p_amount: smsCost,
            p_description: `Failover SMS to ${recipient}`,
            p_provider: 'Sumer Send System',
            p_tx_id: chargeTxId
          });
          
          if (charged) {
            // 5. Queue the SMS in BullMQ immediately with high priority
            await queueMessageJob(smsMsgId, { priority: 'high' });
            console.log(`[Worker Failover] Successfully queued failover SMS job ${smsMsgId} for recipient ${recipient}.`);
          } else {
            console.error(`[Worker Failover] Insufficient wallet balance for failover SMS.`);
            await supabase.from('message_queue').update({
              status: 'failed',
              last_error: 'Insufficient wallet balance for failover SMS.'
            }).eq('id', smsMsgId);
          }
        } catch (chargeEx) {
          console.error(`[Worker Failover] Exception during wallet charging for failover SMS:`, chargeEx);
        }
      } else {
        console.error(`[Worker Failover] Failed to insert failover SMS to message_queue:`, smsInsertErr);
      }

      // 6. Log the WhatsApp failure
      await supabase.from('logs').insert({
        id: `msg_${crypto.randomUUID()}`,
        user_id: userId,
        type: 'whatsapp',
        sender: 'Sumer Send API',
        recipient,
        subject: subject || '',
        body,
        status: 'failed',
        error: `Failed WhatsApp delivery: ${lastError}. Triggered failover to SMS.`
      });

      // 7. Dispatch failed webhook for WhatsApp
      await queueWebhook(userId, `whatsapp.failed`, {
        id: msgId,
        type: 'whatsapp',
        recipient,
        subject,
        body,
        status: 'failed',
        error: `Failed WhatsApp delivery: ${lastError}. Triggered failover to SMS.`,
        timestamp: new Date().toISOString()
      });

    } else if (isFinalAttempt) {
      // Permanent failure (no failover or non-whatsapp or all retries exhausted)
      console.log(`[Worker] Job ${job.id} failed permanently after ${currentAttempt} attempts. Error: ${lastError}`);

      await supabase
        .from('message_queue')
        .update({
          status: 'failed',
          attempts: currentAttempt,
          last_error: lastError,
          updated_at: new Date().toISOString()
        })
        .eq('id', msgId);

      // Refund wallet atomically
      const refundCost = type === 'email' ? 10 : (type === 'sms' ? 120 : 150);
      const refundTxId = `TX_REF_${crypto.randomUUID()}`;
      try {
        await supabase.rpc('refund_wallet_atomic', {
          p_user_id: userId,
          p_amount: refundCost,
          p_description: `Refund: Delivery failure for ${type} to ${recipient}`,
          p_provider: 'Sumer Send System',
          p_tx_id: refundTxId
        });
      } catch (refundEx) {
        console.error(`[Worker] Failed to process refund for failed message ${msgId}:`, refundEx);
      }

      // Create log entry
      await supabase.from('logs').insert({
        id: `msg_${crypto.randomUUID()}`,
        user_id: userId,
        type,
        sender: 'Sumer Send API',
        recipient,
        subject: subject || '',
        body,
        status: 'failed',
        error: lastError
      });

      // Dispatch failed webhook
      await queueWebhook(userId, `${type}.failed`, {
        id: msgId,
        type,
        recipient,
        subject,
        body,
        status: 'failed',
        error: lastError,
        timestamp: new Date().toISOString()
      });

    } else {
      // Temporary failure, will be retried by BullMQ
      // Update database status back to pending and show current attempts
      const delayMs = 30000 * Math.pow(2, currentAttempt - 1); // Approximate exponential backoff time
      const retryTime = new Date(Date.now() + delayMs).toISOString();

      await supabase
        .from('message_queue')
        .update({
          status: 'retrying',
          attempts: currentAttempt,
          last_error: lastError,
          scheduled_at: retryTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', msgId);

      console.log(`[Worker] Job ${job.id} failed temporarily (Attempt ${currentAttempt}). Retrying at ${retryTime}. Error: ${lastError}`);
    }
  });

  // 2. Initialize BullMQ Webhook Worker
  webhookWorker = new Worker('webhookQueue', async (job) => {
    const { webhookJobId } = job.data;
    console.log(`[Worker] Processing webhook job ${job.id} (Job ID: ${webhookJobId})`);

    const { data: whJob, error: fetchErr } = await supabase
      .from('webhook_queue')
      .select('*')
      .eq('id', webhookJobId)
      .single();

    if (fetchErr || !whJob) {
      console.warn(`[Worker] Webhook job ${webhookJobId} not found in DB. Skipping.`);
      return;
    }

    if (whJob.status === 'completed') return;

    // Update status to processing
    await supabase.from('webhook_queue').update({ status: 'processing' }).eq('id', webhookJobId);

    const { user_id: userId, webhook_id: webhookId, url, event, payload } = whJob;
    const startTime = Date.now();
    let status = 'failed';
    let statusCode = null;
    let responseBody = '';
    let success = false;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sumer-Signature': 'sumer_wh_active',
          'User-Agent': 'SumerSend-Webhook-Dispatcher/2.0'
        },
        body: JSON.stringify({
          event,
          created: new Date().toISOString(),
          data: payload
        })
      });

      statusCode = response.status;
      responseBody = await response.text();
      
      if (response.ok) {
        status = 'success';
        success = true;
      } else {
        responseBody = `HTTP Error ${statusCode}: ${responseBody.substring(0, 150)}`;
      }
    } catch (err) {
      responseBody = err.message || 'Connection refused or timeout';
      throw err; // Throw to trigger BullMQ retry
    }

    const latency = Date.now() - startTime;

    if (success) {
      // Delete from queue table in DB (since completed)
      await supabase.from('webhook_queue').delete().eq('id', webhookJobId);

      // Save webhook log entry
      await supabase.from('webhook_logs').insert({
        id: 'whlog_' + crypto.randomUUID(),
        webhook_id: webhookId,
        user_id: userId,
        url,
        event,
        status,
        status_code: statusCode,
        response_body: responseBody.substring(0, 250),
        latency
      });
    }
  }, {
    ...redisConnectionOpts,
    concurrency: 5
  });

  // Handle webhook job failures and retries
  webhookWorker.on('failed', async (job, err) => {
    if (!job) return;
    const { webhookJobId } = job.data;

    const { data: whJob } = await supabase.from('webhook_queue').select('*').eq('id', webhookJobId).single();
    if (!whJob) return;

    const { user_id: userId, webhook_id: webhookId, url, event, max_attempts } = whJob;
    const currentAttempt = job.attemptsMade;
    const responseBody = err.message || 'Connection failed';
    const isFinalAttempt = currentAttempt >= job.opts.attempts;

    if (isFinalAttempt) {
      console.log(`[Worker] Webhook job ${job.id} failed permanently.`);
      
      // Delete from queue table and log final failure
      await supabase.from('webhook_queue').delete().eq('id', webhookJobId);

      await supabase.from('webhook_logs').insert({
        id: 'whlog_' + crypto.randomUUID(),
        webhook_id: webhookId,
        user_id: userId,
        url,
        event,
        status: 'failed',
        status_code: 500,
        response_body: `Failed permanently after ${max_attempts} attempts. Last error: ${responseBody.substring(0, 150)}`,
        latency: 0
      });
    } else {
      // Update DB with details and new schedule
      const backoffMinutes = Math.pow(currentAttempt, 2);
      const retryTime = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();

      await supabase
        .from('webhook_queue')
        .update({
          status: 'retrying',
          attempts: currentAttempt,
          last_error: responseBody.substring(0, 200),
          scheduled_at: retryTime
        })
        .eq('id', webhookJobId);

      console.log(`[Worker] Webhook job ${job.id} failed temporarily (Attempt ${currentAttempt}). Retrying at ${retryTime}.`);
    }
  });

  // 3. Initialize Realtime Subscription to sync database inserts directly to BullMQ
  try {
    realtimeChannel = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message_queue' },
        async (payload) => {
          console.log('[Worker Realtime] New message inserted. Syncing to BullMQ...');
          try {
            await queueMessageJob(payload.new.id);
          } catch (e) {
            console.error(`[Worker Realtime] Error queueing message ${payload.new.id}:`, e.message);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'message_queue' },
        async (payload) => {
          if (payload.new && payload.new.status === 'pending') {
            console.log('[Worker Realtime] Message updated to pending. Syncing to BullMQ...');
            try {
              await queueMessageJob(payload.new.id);
            } catch (e) {
              console.error(`[Worker Realtime] Error queueing message ${payload.new.id}:`, e.message);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'webhook_queue' },
        async (payload) => {
          console.log('[Worker Realtime] New webhook inserted. Syncing to BullMQ...');
          try {
            await queueWebhookJob(payload.new.id);
          } catch (e) {
            console.error(`[Worker Realtime] Error queueing webhook job ${payload.new.id}:`, e.message);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'webhook_queue' },
        async (payload) => {
          if (payload.new && payload.new.status === 'pending') {
            console.log('[Worker Realtime] Webhook updated to pending. Syncing to BullMQ...');
            try {
              await queueWebhookJob(payload.new.id);
            } catch (e) {
              console.error(`[Worker Realtime] Error queueing webhook job ${payload.new.id}:`, e.message);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Worker Realtime] Subscription status: ${status}`);
      });
  } catch (err) {
    console.error('[Worker Realtime] Failed to setup realtime subscription:', err);
  }

  // 4. Start Fallback Database Sync Loop (every 60 seconds)
  fallbackInterval = setInterval(async () => {
    try {
      // Sync messages
      const { data: pendingMessages } = await supabase
        .from('message_queue')
        .select('id')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString());

      if (pendingMessages && pendingMessages.length > 0) {
        console.log(`[Worker Fallback Sync] Syncing ${pendingMessages.length} pending messages to BullMQ...`);
        for (const msg of pendingMessages) {
          try {
            await queueMessageJob(msg.id);
          } catch (e) {
            // Silently ignore if already queued (BullMQ handles deduplication via jobId)
          }
        }
      }

      // Sync webhooks
      const { data: pendingWebhooks } = await supabase
        .from('webhook_queue')
        .select('id')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString());

      if (pendingWebhooks && pendingWebhooks.length > 0) {
        console.log(`[Worker Fallback Sync] Syncing ${pendingWebhooks.length} pending webhooks to BullMQ...`);
        for (const wh of pendingWebhooks) {
          try {
            await queueWebhookJob(wh.id);
          } catch (e) {
            // Silently ignore
          }
        }
      }
    } catch (err) {
      console.error('[Worker Fallback Sync] Error during DB sync:', err.message);
    }
  }, 60000);

  // Trigger initial runs on startup to process any pending items
  syncAllPendingOnStartup();
}

async function syncAllPendingOnStartup() {
  try {
    const { data: pendingMessages } = await supabase
      .from('message_queue')
      .select('id')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString());

    if (pendingMessages && pendingMessages.length > 0) {
      console.log(`[Worker Startup] Syncing ${pendingMessages.length} pending messages to BullMQ...`);
      for (const msg of pendingMessages) {
        await queueMessageJob(msg.id).catch(() => {});
      }
    }

    const { data: pendingWebhooks } = await supabase
      .from('webhook_queue')
      .select('id')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString());

    if (pendingWebhooks && pendingWebhooks.length > 0) {
      console.log(`[Worker Startup] Syncing ${pendingWebhooks.length} pending webhooks to BullMQ...`);
      for (const wh of pendingWebhooks) {
        await queueWebhookJob(wh.id).catch(() => {});
      }
    }
  } catch (e) {
    console.error('[Worker Startup] Error during startup sync:', e.message);
  }
}

export async function stopQueueWorker() {
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  if (messageWorker) {
    await messageWorker.close();
    messageWorker = null;
  }
  if (webhookWorker) {
    await webhookWorker.close();
    webhookWorker = null;
  }
  isWorkerRunning = false;
  console.log('[Worker] BullMQ-based background queue processor stopped.');
}

/**
 * Queue a new webhook dispatch to webhook_queue and trigger instant BullMQ queueing
 */
export async function queueWebhook(userId, event, payload) {
  try {
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId);

    if (error || !webhooks || webhooks.length === 0) return;

    // Find webhooks matching the event or wildcard '*'
    const matchingWebhooks = webhooks.filter(wh => wh.events.includes(event) || wh.events.includes('*'));

    for (const wh of matchingWebhooks) {
      const { data: newJob, error: insertErr } = await supabase
        .from('webhook_queue')
        .insert({
          user_id: userId,
          webhook_id: wh.id,
          url: wh.url,
          event,
          payload: payload
        })
        .select('id')
        .single();

      if (!insertErr && newJob) {
        // Trigger instant BullMQ execution
        await queueWebhookJob(newJob.id);
      }
    }
  } catch (err) {
    console.error('[Worker] Error queueing webhook:', err);
  }
}

/**
 * Compatibility stub for manual trigger calls in tests (processes pending directly)
 */
export async function processMessageQueue() {
  console.log('[Worker] processMessageQueue called. Running database startup sync...');
  await syncAllPendingOnStartup();
}

/**
 * Compatibility stub for manual trigger calls in tests (processes pending directly)
 */
export async function processWebhookQueue() {
  console.log('[Worker] processWebhookQueue called. Running database startup sync...');
  await syncAllPendingOnStartup();
}
