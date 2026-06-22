import nodemailer from 'nodemailer';
import { supabase } from './db.js';
import { sendWhatsAppMessage } from './whatsapp.js';
import { sendSmsMessage } from './sms.js';

// Cache of NodeMailer transporters
const transporters = {};

function createTransporter(config) {
  if (!config.host || !config.user || !config.pass) {
    return null;
  }
  const cacheKey = `${config.host}:${config.port}:${config.user}`;
  if (transporters[cacheKey]) {
    return transporters[cacheKey];
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

  transporters[cacheKey] = transporter;
  return transporter;
}

// Queue Worker configuration
let isWorkerRunning = false;
let workerInterval = null;

export function startQueueWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  console.log('[Worker] Background queue processor started.');
  
  workerInterval = setInterval(async () => {
    try {
      await processMessageQueue();
      await processWebhookQueue();
    } catch (err) {
      console.error('[Worker] Error in queue polling cycle:', err);
    }
  }, 5000); // Poll every 5 seconds
}

export function stopQueueWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }
  isWorkerRunning = false;
  console.log('[Worker] Background queue processor stopped.');
}

/**
 * Process a batch of queued messages
 */
export async function processMessageQueue() {
  // Fetch up to 5 pending messages using the concurrent-safe PostgreSQL RPC function
  const { data: messages, error } = await supabase.rpc('pull_queued_messages', { p_limit: 5 });
  
  if (error) {
    console.error('[Worker] Error fetching queued messages:', error);
    return;
  }

  if (!messages || messages.length === 0) return;

  console.log(`[Worker] Processing ${messages.length} messages...`);

  for (const msg of messages) {
    const { id, user_id: userId, type, recipient, subject, body, attempts, max_attempts } = msg;
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
          pass: smtpConfig.password
        });

        if (!transporter) {
          throw new Error('Could not create SMTP transporter. Invalid config.');
        }

        await transporter.sendMail({
          from: smtpConfig.sender || `Sumer Send <onboarding@sumersend.com>`,
          to: recipient,
          subject: subject || 'No Subject',
          html: body
        });
        success = true;

      } else if (type === 'sms') {
        await sendSmsMessage(userId, recipient, body);
        success = true;

      } else if (type === 'whatsapp') {
        await sendWhatsAppMessage(userId, recipient, body);
        success = true;

        // Anti-ban throttling: Shift all other pending WhatsApp messages for this user forward in time
        // Generates a random interval between 5 to 10 seconds to mimic human typing/delay
        const delaySeconds = Math.floor(Math.random() * 6) + 5; 
        const nextScheduledTime = new Date(Date.now() + delaySeconds * 1000).toISOString();
        
        await supabase
          .from('message_queue')
          .update({ scheduled_at: nextScheduledTime })
          .eq('user_id', userId)
          .eq('type', 'whatsapp')
          .eq('status', 'pending');
        
        console.log(`[Worker] WhatsApp message sent. Throttled subsequent user ${userId} messages by ${delaySeconds}s.`);
      }
    } catch (err) {
      lastError = err.message || 'Unknown processing error';
      console.error(`[Worker] Failed to process message ${id} (Type: ${type}, Attempt: ${attempts + 1}):`, lastError);
    }

    if (success) {
      // Mark as completed
      await supabase
        .from('message_queue')
        .update({ status: 'completed', attempts: attempts + 1, updated_at: new Date().toISOString() })
        .eq('id', id);

      // Create log entry in logs table
      await supabase.from('logs').insert({
        id: `msg_${Math.random().toString(36).substring(2, 15)}`,
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
        id,
        type,
        recipient,
        subject,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });

    } else {
      const nextAttempt = attempts + 1;
      const isPermanentFailure = nextAttempt >= max_attempts;

      if (isPermanentFailure) {
        // Mark as failed permanently
        await supabase
          .from('message_queue')
          .update({
            status: 'failed',
            attempts: nextAttempt,
            last_error: lastError,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        // Refund wallet atomic deduction
        const refundCost = type === 'email' ? 10 : (type === 'sms' ? 120 : 150);
        const txId = `TX_REF_${Math.random().toString(36).substring(2, 15)}`;
        
        try {
          const { data: refundSuccess, error: refundError } = await supabase.rpc('refund_wallet_atomic', {
            p_user_id: userId,
            p_amount: refundCost,
            p_description: `Refund: Delivery failure for ${type} to ${recipient}`,
            p_provider: 'Sumer Send System',
            p_tx_id: txId
          });
          if (refundError || !refundSuccess) {
            console.error(`[Worker] Failed to process refund for failed message ${id}:`, refundError);
          }
        } catch (refundEx) {
          console.error(`[Worker] Exception during wallet refund for ${id}:`, refundEx);
        }

        // Create log entry in logs table
        await supabase.from('logs').insert({
          id: `msg_${Math.random().toString(36).substring(2, 15)}`,
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
          id,
          type,
          recipient,
          subject,
          body,
          status: 'failed',
          error: lastError,
          timestamp: new Date().toISOString()
        });

      } else {
        // Retry later (schedule 30 seconds * nextAttempt in the future)
        const delaySeconds = 30 * nextAttempt;
        const retryTime = new Date(Date.now() + delaySeconds * 1000).toISOString();
        
        await supabase
          .from('message_queue')
          .update({
            status: 'pending',
            attempts: nextAttempt,
            last_error: lastError,
            scheduled_at: retryTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      }
    }
  }
}

/**
 * Queue a new webhook dispatch to webhook_queue
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
      await supabase.from('webhook_queue').insert({
        user_id: userId,
        webhook_id: wh.id,
        url: wh.url,
        event,
        payload
      });
    }
  } catch (err) {
    console.error('[Worker] Error queuing webhook:', err);
  }
}

/**
 * Process a batch of queued webhooks
 */
export async function processWebhookQueue() {
  const { data: webhooks, error } = await supabase.rpc('pull_queued_webhooks', { p_limit: 5 });

  if (error) {
    console.error('[Worker] Error fetching queued webhooks:', error);
    return;
  }

  if (!webhooks || webhooks.length === 0) return;

  for (const job of webhooks) {
    const { id, user_id: userId, webhook_id: webhookId, url, event, payload, attempts, max_attempts } = job;
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
          'X-Sumer-Signature': 'whsec_active',
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
    }

    const latency = Date.now() - startTime;

    if (success) {
      // Complete webhook job
      await supabase.from('webhook_queue').delete().eq('id', id);

      // Save webhook log entry
      await supabase.from('webhook_logs').insert({
        id: 'whlog_' + Math.random().toString(36).substring(2, 15),
        webhook_id: webhookId,
        user_id: userId,
        url,
        event,
        status,
        status_code: statusCode,
        response_body: responseBody.substring(0, 250),
        latency
      });
    } else {
      const nextAttempt = attempts + 1;
      const isPermanentFailure = nextAttempt >= max_attempts;

      if (isPermanentFailure) {
        // Delete from queue and log final failure
        await supabase.from('webhook_queue').delete().eq('id', id);

        await supabase.from('webhook_logs').insert({
          id: 'whlog_' + Math.random().toString(36).substring(2, 15),
          webhook_id: webhookId,
          user_id: userId,
          url,
          event,
          status: 'failed',
          status_code: statusCode,
          response_body: `Failed permanently after ${max_attempts} attempts. Last error: ${responseBody.substring(0, 150)}`,
          latency
        });
      } else {
        // Exponential backoff reschedule: attempts^2 minutes
        const backoffMinutes = Math.pow(nextAttempt, 2);
        const retryTime = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();

        await supabase
          .from('webhook_queue')
          .update({
            status: 'pending',
            attempts: nextAttempt,
            last_error: responseBody.substring(0, 200),
            scheduled_at: retryTime
          })
          .eq('id', id);
      }
    }
  }
}
