import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  findUserByApiKey,
  chargeWallet,
  appendLog,
  supabase,
  refundWallet,
  loadSubscriberSettings,
  loadSmtpConfig,
  loadWallet,
  addSubscriber,
  appendLogsBulk,
  bulkAddSubscribers
} from '../db.js';
import {
  apiKeyCache,
  CACHE_TTL_MS,
  isValidEmail,
  isValidIraqiPhone,
  triggerWebhooks,
  createTransporter,
  compileWelcomeMessage,
  htmlToText
} from '../utils.js';
import { getWhatsAppStatus, sendWhatsAppMessage } from '../whatsapp.js';
import { sendSmsMessage } from '../sms.js';
import { queueMessageJob } from '../queue.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sumer-send-default-jwt-secret-key-12345';
const v1Router = express.Router();


// Middleware for public APIs
async function publicApiAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: {
        message: 'Missing or invalid API key. Must be Bearer sm_live_... or sm_send_...',
        type: 'invalid_client_error'
      }
    });
  }

  const apiKey = authHeader.split(' ')[1];
  
  // Try checking JWT token if it doesn't look like a standard api key prefix
  if (!apiKey.startsWith('sm_live_') && !apiKey.startsWith('sm_send_') && apiKey.includes('.')) {
    try {
      const decoded = jwt.verify(apiKey, JWT_SECRET);
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .maybeSingle();

      if (userErr || !user) {
        return res.status(401).json({ 
          error: {
            message: 'User account no longer exists or session token invalid.',
            type: 'invalid_client_error'
          }
        });
      }

      req.apiKeyOwner = {
        id: user.id,
        email: user.email,
        name: user.name
      };
      req.apiKeyObj = {
        id: 'session_key',
        name: 'Dashboard Session',
        scope: 'full'
      };
      return next();
    } catch (err) {
      return res.status(401).json({ 
        error: {
          message: 'Invalid API key or session token.',
          type: 'invalid_client_error'
        }
      });
    }
  }

  // Check cache first
  const cached = apiKeyCache.get(apiKey);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    req.apiKeyOwner = cached.user;
    req.apiKeyObj = cached.key;
    return next();
  }

  try {
    const authResult = await findUserByApiKey(apiKey);
    
    if (!authResult) {
      return res.status(401).json({ 
        error: {
          message: 'Invalid API key. Unauthorized application request.',
          type: 'invalid_client_error'
        }
      });
    }

    // Cache the authentication result
    apiKeyCache.set(apiKey, {
      user: authResult.user,
      key: authResult.key,
      timestamp: now
    });

    req.apiKeyOwner = authResult.user;
    req.apiKeyObj = authResult.key;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication processing error.' });
  }
}

// POST /v1/emails
v1Router.post('/emails', publicApiAuth, async (req, res) => {
  const { from, to, subject, html } = req.body;
  const userId = req.apiKeyOwner.id;
  
  if (!to || !subject || !html) {
    return res.status(400).json({
      error: {
        message: 'Missing required parameters. to, subject, and html are mandatory.',
        type: 'invalid_request_error'
      }
    });
  }

  if (!isValidEmail(to)) {
    return res.status(400).json({
      error: {
        message: 'Invalid recipient email address format.',
        type: 'invalid_request_error'
      }
    });
  }
  
  const cost = 10;
  
  // 1. Charge wallet atomically first
  const charged = await chargeWallet(userId, cost, `Email to ${to}`);
  if (!charged) {
    const failedLog = {
      id: `msg_${crypto.randomUUID()}`,
      type: 'email',
      from: from || 'onboarding@sumersend.com',
      to,
      subject,
      body: html,
      status: 'failed',
      error: 'Insufficient wallet balance. Please top up.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, failedLog);
    triggerWebhooks(userId, 'email.failed', failedLog);
    return res.status(402).json({
      error: {
        message: 'Insufficient wallet balance. Please top up your wallet.',
        type: 'insufficient_funds_error'
      }
    });
  }

  const priority = req.body.priority || 'normal';
  const msgId = crypto.randomUUID();
  const { error: queueError } = await supabase.from('message_queue').insert({
    id: msgId,
    user_id: userId,
    type: 'email',
    recipient: to,
    subject: subject,
    body: html,
    status: 'pending',
    attempts: 0,
    max_attempts: 3,
    metadata: { priority }
  });

  if (queueError) {
    console.error('[API] Failed to queue email:', queueError);
    await refundWallet(userId, cost, `Refund: Queue failure for Email to ${to}`);
    return res.status(500).json({ error: 'Failed to queue email.' });
  }

  const useQueue = process.env.USE_QUEUE !== 'false' && !process.env.VERCEL;
  if (!useQueue) {
    try {
      const smtpConfig = await loadSmtpConfig(userId);
      if (!smtpConfig || !smtpConfig.host) {
        throw new Error('SMTP configurations are not set for this user.');
      }
      
      const transporter = createTransporter({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.user,
        pass: smtpConfig.pass
      });
      
      if (!transporter) {
        throw new Error('Could not create SMTP transporter. Invalid config.');
      }
      
      const fromSender = smtpConfig.from || `Sumer Send <${smtpConfig.user}>`;
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.APP_URL || 'http://127.0.0.1:3000');
      const unsubscribeUrl = `${baseUrl}/api/public/subscribers/unsubscribe/${userId}?email=${encodeURIComponent(to)}`;
      
      await transporter.sendMail({
        from: fromSender,
        to: to,
        subject: subject || 'No Subject',
        html: html,
        text: htmlToText(html),
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      });
      
      await supabase
        .from('message_queue')
        .update({ 
          status: 'completed', 
          attempts: 1, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', msgId);
      
      const deliveredLog = {
        id: `msg_${crypto.randomUUID()}`,
        type: 'email',
        sender: fromSender,
        recipient: to,
        subject: subject || '',
        body: html,
        status: 'delivered',
        timestamp: new Date().toISOString()
      };
      await appendLog(userId, deliveredLog);
      
      triggerWebhooks(userId, 'email.delivered', {
        id: msgId,
        type: 'email',
        recipient: to,
        subject,
        body: html,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
      
      return res.json({
        id: msgId,
        type: 'email',
        from: fromSender,
        to,
        subject,
        body: html,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
    } catch (sendErr) {
      console.error('[API] Direct send email failed:', sendErr);
      
      await supabase
        .from('message_queue')
        .update({ 
          status: 'failed', 
          attempts: 1, 
          last_error: sendErr.message,
          updated_at: new Date().toISOString() 
        })
        .eq('id', msgId);
        
      await refundWallet(userId, cost, `Refund: Delivery failure for Email to ${to}`);
      
      const failedLog = {
        id: `msg_${crypto.randomUUID()}`,
        type: 'email',
        sender: from || 'Sumer Send <onboarding@sumersend.com>',
        recipient: to,
        subject,
        body: html,
        status: 'failed',
        error: sendErr.message || 'Delivery failed',
        timestamp: new Date().toISOString()
      };
      await appendLog(userId, failedLog);
      triggerWebhooks(userId, 'email.failed', failedLog);
      
      return res.status(500).json({ error: sendErr.message || 'Failed to send email.' });
    }
  } else {
    try {
      // Wrap queue attempt with a timeout to prevent hanging when Redis is unreachable.
      const queueWithTimeout = Promise.race([
        queueMessageJob(msgId, { priority }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('BullMQ queue timeout (5s). Redis may be unreachable.')), 5000))
      ]);
      await queueWithTimeout;
      return res.json({
        id: msgId,
        type: 'email',
        from: from || 'Sumer Send <onboarding@sumersend.com>',
        to,
        subject,
        body: html,
        status: 'queued',
        timestamp: new Date().toISOString()
      });
    } catch (queueErr) {
      console.warn(`[API] Failed to queue email to BullMQ: ${queueErr.message}. Falling back to direct SMTP dispatch...`);
      try {
        if (!smtpConfig || !smtpConfig.host) {
          throw new Error('SMTP configurations are not set for this user.');
        }
        
        const transporter = createTransporter({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.user,
          pass: smtpConfig.pass
        });
        
        if (!transporter) {
          throw new Error('Could not create SMTP transporter. Invalid config.');
        }
        
        const fromSender = smtpConfig.from || `Sumer Send <${smtpConfig.user}>`;
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.APP_URL || 'http://127.0.0.1:3000');
        const unsubscribeUrl = `${baseUrl}/api/public/subscribers/unsubscribe/${userId}?email=${encodeURIComponent(to)}`;
        
        await transporter.sendMail({
          from: fromSender,
          to,
          subject: subject || 'No Subject',
          html,
          text: htmlToText(html),
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          }
        });
        
        await supabase
          .from('message_queue')
          .update({ 
            status: 'completed', 
            attempts: 1, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', msgId);
          
        const deliveredLog = {
          id: `msg_${crypto.randomUUID()}`,
          type: 'email',
          sender: fromSender,
          recipient: to,
          subject: subject || '',
          body: html,
          status: 'delivered',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, deliveredLog);
        triggerWebhooks(userId, 'email.delivered', deliveredLog);
        
        return res.json({
          id: msgId,
          type: 'email',
          from: fromSender,
          to,
          subject,
          body: html,
          status: 'delivered',
          timestamp: new Date().toISOString()
        });
      } catch (sendErr) {
        console.error('[API Fallback] Direct send email failed:', sendErr);
        await supabase
          .from('message_queue')
          .update({ 
            status: 'failed', 
            attempts: 1, 
            last_error: `Email Delivery Failed (Queue & Fallback): ${sendErr.message}`,
            updated_at: new Date().toISOString() 
          })
          .eq('id', msgId);
          
        await refundWallet(userId, cost, `Refund: Fallback delivery failure for Email to ${to}`);
        
        const failedLog = {
          id: `msg_${crypto.randomUUID()}`,
          type: 'email',
          sender: smtpConfig?.from || 'Sumer Send <onboarding@sumersend.com>',
          recipient: to,
          subject,
          body: html,
          status: 'failed',
          error: sendErr.message || 'Delivery failed',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, failedLog);
        triggerWebhooks(userId, 'email.failed', failedLog);
        return res.status(500).json({ error: sendErr.message || 'Failed to send email.' });
      }
    }
  }
});

// POST /v1/sms
v1Router.post('/sms', publicApiAuth, async (req, res) => {
  const { to, body } = req.body;
  const userId = req.apiKeyOwner.id;
  
  if (!to || !body) {
    return res.status(400).json({ error: 'to and body are required.' });
  }

  if (!isValidIraqiPhone(to)) {
    return res.status(400).json({ error: 'Invalid recipient phone number format. Must be a valid Iraqi mobile number.' });
  }

  const cost = 120;
  
  // 1. Charge wallet atomically first
  const charged = await chargeWallet(userId, cost, `SMS to ${to}`);
  if (!charged) {
    const failedLog = {
      id: `sms_${crypto.randomUUID()}`,
      type: 'sms',
      from: 'Sumer Send API',
      to,
      body,
      status: 'failed',
      error: 'Insufficient wallet balance. Please top up.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, failedLog);
    triggerWebhooks(userId, 'sms.failed', failedLog);
    return res.status(402).json({
      error: {
        message: 'Insufficient wallet balance. Please top up your wallet.',
        type: 'insufficient_funds_error'
      }
    });
  }

  const priority = req.body.priority || 'normal';
  const msgId = crypto.randomUUID();
  const { error: queueError } = await supabase.from('message_queue').insert({
    id: msgId,
    user_id: userId,
    type: 'sms',
    recipient: to,
    body,
    status: 'pending',
    attempts: 0,
    max_attempts: 3,
    metadata: { priority }
  });

  if (queueError) {
    console.error('[API] Failed to queue SMS:', queueError);
    await refundWallet(userId, cost, `Refund: Queue failure for SMS to ${to}`);
    return res.status(500).json({ error: 'Failed to queue SMS.' });
  }

  const useQueue = process.env.USE_QUEUE !== 'false';
  if (!useQueue) {
    try {
      await sendSmsMessage(userId, to, body);
      
      await supabase
        .from('message_queue')
        .update({ 
          status: 'completed', 
          attempts: 1, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', msgId);
        
      const deliveredLog = {
        id: `sms_${crypto.randomUUID()}`,
        type: 'sms',
        sender: 'Sumer Send API',
        recipient: to,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      };
      await appendLog(userId, deliveredLog);
      
      triggerWebhooks(userId, 'sms.delivered', {
        id: msgId,
        type: 'sms',
        recipient: to,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
      
      return res.json({
        id: msgId,
        type: 'sms',
        from: 'Sumer Send API',
        to,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
    } catch (sendErr) {
      console.error('[API] Direct send SMS failed:', sendErr);
      
      await supabase
        .from('message_queue')
        .update({ 
          status: 'failed', 
          attempts: 1, 
          last_error: sendErr.message,
          updated_at: new Date().toISOString() 
        })
        .eq('id', msgId);
        
      await refundWallet(userId, cost, `Refund: Delivery failure for SMS to ${to}`);
      
      const failedLog = {
        id: `sms_${crypto.randomUUID()}`,
        type: 'sms',
        sender: 'Sumer Send API',
        recipient: to,
        body,
        status: 'failed',
        error: sendErr.message || 'Delivery failed',
        timestamp: new Date().toISOString()
      };
      await appendLog(userId, failedLog);
      triggerWebhooks(userId, 'sms.failed', failedLog);
      
      return res.status(500).json({ error: sendErr.message || 'Failed to send SMS.' });
    }
  } else {
    try {
      // Wrap queue attempt with a timeout to prevent hanging when Redis is unreachable.
      const queueWithTimeout = Promise.race([
        queueMessageJob(msgId, { priority }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('BullMQ queue timeout (5s). Redis may be unreachable.')), 5000))
      ]);
      await queueWithTimeout;
      return res.json({
        id: msgId,
        type: 'sms',
        from: 'Sumer Send API',
        to,
        body,
        status: 'queued',
        timestamp: new Date().toISOString()
      });
    } catch (queueErr) {
      console.warn(`[API] Failed to queue SMS to BullMQ: ${queueErr.message}. Falling back to direct dispatch...`);
      try {
        await sendSmsMessage(userId, to, body);
        await supabase
          .from('message_queue')
          .update({ 
            status: 'completed', 
            attempts: 1, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', msgId);
          
        const deliveredLog = {
          id: `sms_${crypto.randomUUID()}`,
          type: 'sms',
          sender: 'Sumer Send API',
          recipient: to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, deliveredLog);
        triggerWebhooks(userId, 'sms.delivered', {
          id: msgId,
          type: 'sms',
          recipient: to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        });
        
        return res.json({
          id: msgId,
          type: 'sms',
          from: 'Sumer Send API',
          to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        });
      } catch (sendErr) {
        console.error('[API Fallback] Direct send SMS failed:', sendErr);
        await supabase
          .from('message_queue')
          .update({ 
            status: 'failed', 
            attempts: 1, 
            last_error: `SMS Delivery Failed (Queue & Fallback): ${sendErr.message}`,
            updated_at: new Date().toISOString() 
          })
          .eq('id', msgId);
          
        await refundWallet(userId, cost, `Refund: Fallback delivery failure for SMS to ${to}`);
        
        const failedLog = {
          id: `sms_${crypto.randomUUID()}`,
          type: 'sms',
          sender: 'Sumer Send API',
          recipient: to,
          body,
          status: 'failed',
          error: sendErr.message || 'Delivery failed',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, failedLog);
        triggerWebhooks(userId, 'sms.failed', failedLog);
        return res.status(500).json({ error: sendErr.message || 'Failed to send SMS.' });
      }
    }
  }
});

// POST /v1/whatsapp
v1Router.post('/whatsapp', publicApiAuth, async (req, res) => {
  const { to, body } = req.body;
  const userId = req.apiKeyOwner.id;
  
  if (!to || !body) {
    return res.status(400).json({ error: 'to and body are required.' });
  }

  if (!isValidIraqiPhone(to)) {
    return res.status(400).json({ error: 'Invalid recipient phone number format. Must be a valid Iraqi mobile number.' });
  }

  const waStatus = await getWhatsAppStatus(userId);
  const failoverToSms = !!(req.body.failover_to_sms || req.body.failover);
  const priority = req.body.priority || 'normal';
  const isOtp = !!(req.body.isOtp || req.body.otp);

  if (!waStatus.connected && !failoverToSms) {
    const failedLog = {
      id: `wa_${crypto.randomUUID()}`,
      type: 'whatsapp',
      from: 'Sumer Send API',
      to,
      body,
      status: 'failed',
      error: 'WhatsApp dispatcher is not connected.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, failedLog);
    triggerWebhooks(userId, 'whatsapp.failed', failedLog);
    return res.status(400).json({ error: 'WhatsApp dispatcher is not connected. Setup connection in dashboard.' });
  }

  const cost = 150;
  
  // 1. Charge wallet atomically first
  const charged = await chargeWallet(userId, cost, `WhatsApp to ${to}`);
  if (!charged) {
    const failedLog = {
      id: `wa_${crypto.randomUUID()}`,
      type: 'whatsapp',
      from: 'Sumer Send API',
      to,
      body,
      status: 'failed',
      error: 'Insufficient wallet balance. Please top up.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, failedLog);
    triggerWebhooks(userId, 'whatsapp.failed', failedLog);
    return res.status(402).json({
      error: {
        message: 'Insufficient wallet balance. Please top up your wallet.',
        type: 'insufficient_funds_error'
      }
    });
  }

  const msgId = crypto.randomUUID();
  const { error: queueError } = await supabase.from('message_queue').insert({
    id: msgId,
    user_id: userId,
    type: 'whatsapp',
    recipient: to,
    body,
    status: 'pending',
    attempts: 0,
    max_attempts: 3,
    metadata: {
      failover_to_sms: failoverToSms,
      priority,
      isOtp
    }
  });

  if (queueError) {
    console.error('[API] Failed to queue WhatsApp message:', queueError);
    await refundWallet(userId, cost, `Refund: Queue failure for WhatsApp to ${to}`);
    return res.status(500).json({ error: 'Failed to queue WhatsApp message.' });
  }

  const useQueue = process.env.USE_QUEUE !== 'false';
  if (!useQueue) {
    if (!waStatus.connected && failoverToSms) {
      console.log(`[API Failover] WhatsApp not connected, failing over to SMS directly...`);
      await supabase
        .from('message_queue')
        .update({
          status: 'failed',
          attempts: 1,
          last_error: 'WhatsApp dispatcher is not connected. Setup connection in dashboard. Failed over to SMS.',
          updated_at: new Date().toISOString()
        })
        .eq('id', msgId);
      
      await refundWallet(userId, cost, `Refund: WhatsApp to ${to} failed (WhatsApp not connected, failover).`);
      
      const smsMsgId = crypto.randomUUID();
      const smsCost = 120;
      const chargedSms = await chargeWallet(userId, smsCost, `SMS Failover to ${to}`);
      if (!chargedSms) {
        const failedWaLog = {
          id: `wa_${crypto.randomUUID()}`,
          type: 'whatsapp',
          from: 'Sumer Send API',
          to,
          body,
          status: 'failed',
          error: 'WhatsApp dispatcher is not connected. Failover to SMS failed due to insufficient funds.',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, failedWaLog);
        triggerWebhooks(userId, 'whatsapp.failed', failedWaLog);
        return res.status(400).json({ error: 'WhatsApp dispatcher is not connected. Failover to SMS failed due to insufficient funds.' });
      }
      
      await supabase.from('message_queue').insert({
        id: smsMsgId,
        user_id: userId,
        type: 'sms',
        recipient: to,
        body,
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        metadata: { parent_whatsapp_id: msgId, is_failover: true }
      });
      
      try {
        await sendSmsMessage(userId, to, body);
        await supabase
          .from('message_queue')
          .update({ 
            status: 'completed', 
            attempts: 1, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', smsMsgId);
          
        const deliveredLog = {
          id: `sms_${crypto.randomUUID()}`,
          type: 'sms',
          sender: 'Sumer Send API (Failover)',
          recipient: to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, deliveredLog);
        triggerWebhooks(userId, 'sms.delivered', {
          id: smsMsgId,
          type: 'sms',
          recipient: to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        });
        return res.json({
          id: smsMsgId,
          type: 'sms',
          from: 'Sumer Send API (Failover)',
          to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString(),
          failover_from: msgId
        });
      } catch (smsErr) {
        console.error('[API Failover] SMS direct send failed:', smsErr);
        await supabase
          .from('message_queue')
          .update({ 
            status: 'failed', 
            attempts: 1, 
            last_error: smsErr.message,
            updated_at: new Date().toISOString() 
          })
          .eq('id', smsMsgId);
          
        await refundWallet(userId, smsCost, `Refund: Failover SMS delivery failure to ${to}`);
        
        const failedSmsLog = {
          id: `sms_${crypto.randomUUID()}`,
          type: 'sms',
          sender: 'Sumer Send API (Failover)',
          recipient: to,
          body,
          status: 'failed',
          error: smsErr.message || 'Delivery failed',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, failedSmsLog);
        triggerWebhooks(userId, 'sms.failed', failedSmsLog);
        return res.status(500).json({ error: `WhatsApp not connected. Failover SMS failed: ${smsErr.message}` });
      }
    }
    
    try {
      await sendWhatsAppMessage(userId, to, body);
      
      await supabase
        .from('message_queue')
        .update({ 
          status: 'completed', 
          attempts: 1, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', msgId);
        
      const deliveredLog = {
        id: `wa_${crypto.randomUUID()}`,
        type: 'whatsapp',
        sender: 'Sumer Send API',
        recipient: to,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      };
      await appendLog(userId, deliveredLog);
      triggerWebhooks(userId, 'whatsapp.delivered', {
        id: msgId,
        type: 'whatsapp',
        recipient: to,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
      return res.json({
        id: msgId,
        type: 'whatsapp',
        from: 'Sumer Send API',
        to,
        body,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });
    } catch (waErr) {
      console.error('[API] Direct send WhatsApp failed:', waErr);
      
      if (failoverToSms) {
        console.log(`[API Failover] WhatsApp direct send failed. Failing over to SMS...`);
        
        await supabase
          .from('message_queue')
          .update({
            status: 'failed',
            attempts: 1,
            last_error: `WhatsApp Delivery Failed: ${waErr.message}. Automatically failed over to SMS.`,
            updated_at: new Date().toISOString()
          })
          .eq('id', msgId);
          
        await refundWallet(userId, cost, `Refund: WhatsApp direct send failed (failover).`);
        
        const smsMsgId = crypto.randomUUID();
        const smsCost = 120;
        const chargedSms = await chargeWallet(userId, smsCost, `SMS Failover to ${to}`);
        if (!chargedSms) {
          const failedWaLog = {
            id: `wa_${crypto.randomUUID()}`,
            type: 'whatsapp',
            from: 'Sumer Send API',
            to,
            body,
            status: 'failed',
            error: `WhatsApp Delivery Failed: ${waErr.message}. Failover SMS failed due to insufficient funds.`,
            timestamp: new Date().toISOString()
          };
          await appendLog(userId, failedWaLog);
          triggerWebhooks(userId, 'whatsapp.failed', failedWaLog);
          return res.status(500).json({ error: `WhatsApp send failed: ${waErr.message}. SMS Failover failed due to insufficient funds.` });
        }
        
        await supabase.from('message_queue').insert({
          id: smsMsgId,
          user_id: userId,
          type: 'sms',
          recipient: to,
          body,
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
          metadata: { parent_whatsapp_id: msgId, is_failover: true }
        });
        
        try {
          await sendSmsMessage(userId, to, body);
          await supabase
            .from('message_queue')
            .update({ 
              status: 'completed', 
              attempts: 1, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', smsMsgId);
            
          const deliveredLog = {
            id: `sms_${crypto.randomUUID()}`,
            type: 'sms',
            sender: 'Sumer Send API (Failover)',
            recipient: to,
            body,
            status: 'delivered',
            timestamp: new Date().toISOString()
          };
          await appendLog(userId, deliveredLog);
          triggerWebhooks(userId, 'sms.delivered', {
            id: smsMsgId,
            type: 'sms',
            recipient: to,
            body,
            status: 'delivered',
            timestamp: new Date().toISOString()
          });
          return res.json({
            id: smsMsgId,
            type: 'sms',
            from: 'Sumer Send API (Failover)',
            to,
            body,
            status: 'delivered',
            timestamp: new Date().toISOString(),
            failover_from: msgId
          });
        } catch (smsErr) {
          console.error('[API Failover] SMS direct send failed:', smsErr);
          await supabase
            .from('message_queue')
            .update({ 
              status: 'failed', 
              attempts: 1, 
              last_error: smsErr.message,
              updated_at: new Date().toISOString() 
            })
            .eq('id', smsMsgId);
            
          await refundWallet(userId, smsCost, `Refund: Failover SMS delivery failure to ${to}`);
          
          const failedSmsLog = {
            id: `sms_${crypto.randomUUID()}`,
            type: 'sms',
            sender: 'Sumer Send API (Failover)',
            recipient: to,
            body,
            status: 'failed',
            error: smsErr.message || 'Delivery failed',
            timestamp: new Date().toISOString()
          };
          await appendLog(userId, failedSmsLog);
          triggerWebhooks(userId, 'sms.failed', failedSmsLog);
          return res.status(500).json({ error: `WhatsApp send failed: ${waErr.message}. SMS Failover failed: ${smsErr.message}` });
        }
      } else {
        await supabase
          .from('message_queue')
          .update({ 
            status: 'failed', 
            attempts: 1, 
            last_error: waErr.message,
            updated_at: new Date().toISOString() 
          })
          .eq('id', msgId);
          
        await refundWallet(userId, cost, `Refund: Delivery failure for WhatsApp to ${to}`);
        
        const failedWaLog = {
          id: `wa_${crypto.randomUUID()}`,
          type: 'whatsapp',
          sender: 'Sumer Send API',
          recipient: to,
          body,
          status: 'failed',
          error: waErr.message || 'Delivery failed',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, failedWaLog);
        triggerWebhooks(userId, 'whatsapp.failed', failedWaLog);
        return res.status(500).json({ error: waErr.message || 'Failed to send WhatsApp message.' });
      }
    }
  } else {
    try {
      // Wrap queue attempt with a timeout to prevent hanging when Redis is unreachable.
      // If BullMQ fails to queue within 5 seconds, fall back to direct WhatsApp dispatch.
      const queueWithTimeout = Promise.race([
        queueMessageJob(msgId, { priority, isOtp }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('BullMQ queue timeout (5s). Redis may be unreachable.')), 5000))
      ]);
      await queueWithTimeout;
      return res.json({
        id: msgId,
        type: 'whatsapp',
        from: 'Sumer Send API',
        to,
        body,
        status: 'queued',
        timestamp: new Date().toISOString()
      });
    } catch (queueErr) {
      console.warn(`[API] Failed to queue WhatsApp message to BullMQ: ${queueErr.message}. Falling back to direct dispatch...`);
      
      try {
        await sendWhatsAppMessage(userId, to, body);
        
        await supabase
          .from('message_queue')
          .update({ 
            status: 'completed', 
            attempts: 1, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', msgId);
          
        const deliveredLog = {
          id: `wa_${crypto.randomUUID()}`,
          type: 'whatsapp',
          sender: 'Sumer Send API',
          recipient: to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        };
        await appendLog(userId, deliveredLog);
        triggerWebhooks(userId, 'whatsapp.delivered', {
          id: msgId,
          type: 'whatsapp',
          recipient: to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        });
        
        return res.json({
          id: msgId,
          type: 'whatsapp',
          from: 'Sumer Send API',
          to,
          body,
          status: 'delivered',
          timestamp: new Date().toISOString()
        });
      } catch (waErr) {
        console.error('[API Fallback] Direct send WhatsApp failed:', waErr);
        
        if (failoverToSms) {
          console.log(`[API Fallback Failover] WhatsApp direct send failed. Failing over to SMS...`);
          
          await supabase
            .from('message_queue')
            .update({
              status: 'failed',
              attempts: 1,
              last_error: `WhatsApp Delivery Failed (Queue & Fallback): ${waErr.message}. Automatically failed over to SMS.`,
              updated_at: new Date().toISOString()
            })
            .eq('id', msgId);
            
          await refundWallet(userId, cost, `Refund: WhatsApp direct send failed (fallback failover).`);
          
          const smsMsgId = crypto.randomUUID();
          const smsCost = 120;
          const chargedSms = await chargeWallet(userId, smsCost, `SMS Failover to ${to}`);
          if (!chargedSms) {
            const failedWaLog = {
              id: `wa_${crypto.randomUUID()}`,
              type: 'whatsapp',
              from: 'Sumer Send API',
              to,
              body,
              status: 'failed',
              error: `WhatsApp Delivery Failed (Fallback): ${waErr.message}. Failover SMS failed due to insufficient funds.`,
              timestamp: new Date().toISOString()
            };
            await appendLog(userId, failedWaLog);
            triggerWebhooks(userId, 'whatsapp.failed', failedWaLog);
            return res.status(500).json({ error: `WhatsApp send failed (fallback): ${waErr.message}. SMS Failover failed due to insufficient funds.` });
          }
          
          await supabase.from('message_queue').insert({
            id: smsMsgId,
            user_id: userId,
            type: 'sms',
            recipient: to,
            body,
            status: 'pending',
            attempts: 0,
            max_attempts: 3,
            metadata: { parent_whatsapp_id: msgId, is_failover: true }
          });
          
          try {
            await sendSmsMessage(userId, to, body);
            await supabase
              .from('message_queue')
              .update({ 
                status: 'completed', 
                attempts: 1, 
                updated_at: new Date().toISOString() 
              })
              .eq('id', smsMsgId);
              
            const deliveredLog = {
              id: `sms_${crypto.randomUUID()}`,
              type: 'sms',
              sender: 'Sumer Send API (Failover)',
              recipient: to,
              body,
              status: 'delivered',
              timestamp: new Date().toISOString()
            };
            await appendLog(userId, deliveredLog);
            triggerWebhooks(userId, 'sms.delivered', {
              id: smsMsgId,
              type: 'sms',
              recipient: to,
              body,
              status: 'delivered',
              timestamp: new Date().toISOString()
            });
            
            return res.json({
              id: smsMsgId,
              type: 'sms',
              from: 'Sumer Send API (Failover)',
              to,
              body,
              status: 'delivered',
              timestamp: new Date().toISOString(),
              failover_from: msgId
            });
          } catch (smsErr) {
            console.error('[API Fallback Failover] SMS direct send failed:', smsErr);
            await supabase
              .from('message_queue')
              .update({ 
                status: 'failed', 
                attempts: 1, 
                last_error: smsErr.message,
                updated_at: new Date().toISOString() 
              })
              .eq('id', smsMsgId);
              
            await refundWallet(userId, smsCost, `Refund: Failover SMS delivery failure to ${to}`);
            
            const failedSmsLog = {
              id: `sms_${crypto.randomUUID()}`,
              type: 'sms',
              sender: 'Sumer Send API (Failover)',
              recipient: to,
              body,
              status: 'failed',
              error: smsErr.message || 'Delivery failed',
              timestamp: new Date().toISOString()
            };
            await appendLog(userId, failedSmsLog);
            triggerWebhooks(userId, 'sms.failed', failedSmsLog);
            return res.status(500).json({ error: `WhatsApp send failed (fallback): ${waErr.message}. SMS Failover failed: ${smsErr.message}` });
          }
        } else {
          await supabase
            .from('message_queue')
            .update({ 
              status: 'failed', 
              attempts: 1, 
              last_error: waErr.message,
              updated_at: new Date().toISOString() 
            })
            .eq('id', msgId);
            
          await refundWallet(userId, cost, `Refund: Delivery failure for WhatsApp to ${to}`);
          
          const failedWaLog = {
            id: `wa_${crypto.randomUUID()}`,
            type: 'whatsapp',
            sender: 'Sumer Send API',
            recipient: to,
            body,
            status: 'failed',
            error: waErr.message || 'Delivery failed',
            timestamp: new Date().toISOString()
          };
          await appendLog(userId, failedWaLog);
          triggerWebhooks(userId, 'whatsapp.failed', failedWaLog);
          return res.status(500).json({ error: waErr.message || 'Failed to send WhatsApp message.' });
        }
      }
    }
  }
});

// POST /v1/subscribers/subscribe (Public Opt-In API)
v1Router.post('/subscribers/subscribe', async (req, res) => {
  let apiKey = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.split(' ')[1];
  } else if (req.query.apiKey) {
    apiKey = req.query.apiKey;
  } else if (req.body.apiKey) {
    apiKey = req.body.apiKey;
  }

  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: 'Missing API key. Provide apiKey via Authorization Bearer header, query string, or body.',
        type: 'invalid_client_error'
      }
    });
  }

  // Find user by API key
  let user;
  try {
    const authResult = await findUserByApiKey(apiKey);
    if (!authResult) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key.',
          type: 'invalid_client_error'
        }
      });
    }
    user = authResult.user;
  } catch (err) {
    return res.status(500).json({ error: 'Authentication processing error.' });
  }

  const { email, name, phone, metadata } = req.body;
  if (!email) {
    return res.status(400).json({
      error: {
        message: 'Email address is required.',
        type: 'invalid_request_error'
      }
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: {
        message: 'Invalid email address format.',
        type: 'invalid_request_error'
      }
    });
  }

  const userId = user.id;

  try {
    // 1. Check if subscriber already exists for this user
    const { data: existingSub, error: checkError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (checkError) throw checkError;

    let subId = '';
    let isNewSubscription = false;

    if (existingSub) {
      subId = existingSub.id;
      if (existingSub.status !== 'active') {
        // Reactivate subscription
        await supabase
          .from('subscribers')
          .update({
            status: 'active',
            name: name || existingSub.name,
            phone: phone || existingSub.phone,
            metadata: { source: 'api', ...(existingSub.metadata || {}), ...(metadata || {}) },
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('id', subId);
        isNewSubscription = true;
      }
    } else {
      subId = `sub_${crypto.randomUUID()}`;
      await addSubscriber(userId, {
        id: subId,
        email: email,
        name: name,
        phone: phone,
        metadata: { source: 'api', ...(metadata || {}) }
      });
      isNewSubscription = true;
    }

    // Trigger webhook notification
    triggerWebhooks(userId, 'subscriber.subscribed', {
      id: subId,
      email: email.toLowerCase().trim(),
      name: name || '',
      phone: phone || '',
      status: 'active',
      timestamp: new Date().toISOString()
    });

    // 2. Queue Welcome Email if enabled and it's a new subscription
    if (isNewSubscription) {
      const settings = await loadSubscriberSettings(userId);
      if (settings.welcomeEnabled) {
        const cost = 10;
        const charged = await chargeWallet(userId, cost, `Welcome Email to ${email}`);
        
        const compiledSubject = compileWelcomeMessage(settings.welcomeSubject, name, email);
        const compiledBody = compileWelcomeMessage(settings.welcomeBody, name, email);

        if (!charged) {
          const failedLog = {
            id: `msg_${crypto.randomUUID()}`,
            type: 'email',
            from: 'Sumer Send <onboarding@sumersend.com>',
            to: email,
            subject: compiledSubject,
            body: compiledBody,
            status: 'failed',
            error: 'Insufficient wallet balance for automatic welcome email. Please top up.',
            timestamp: new Date().toISOString()
          };
          await appendLog(userId, failedLog);
          triggerWebhooks(userId, 'email.failed', failedLog);
        } else {
          const msgId = crypto.randomUUID();
          const smtpConfig = await loadSmtpConfig(userId);
          const fromSender = smtpConfig.from || 'Sumer Send <onboarding@sumersend.com>';

          const { error: queueError } = await supabase.from('message_queue').insert({
            id: msgId,
            user_id: userId,
            type: 'email',
            recipient: email,
            subject: compiledSubject,
            body: compiledBody,
            status: 'pending',
            attempts: 0,
            max_attempts: 3,
            metadata: { priority: 'normal' }
          });

          if (queueError) {
            console.error('[API] Failed to queue welcome email:', queueError);
            await refundWallet(userId, cost, `Refund: Queue failure for Welcome Email to ${email}`);
          } else {
            // Push to BullMQ immediately
            await queueMessageJob(msgId, { priority: 'normal' }).catch(err => console.error(`[API] Failed to push welcome email to BullMQ:`, err.message));
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Subscribed successfully.',
      subscriber: {
        id: subId,
        email: email.toLowerCase().trim(),
        name: name || ''
      }
    });

  } catch (err) {
    console.error('Subscription public API error:', err);
    res.status(500).json({ error: 'Failed to complete subscription request.' });
  }
});

export { v1Router };
