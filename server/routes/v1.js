import express from 'express';
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
  triggerWebhooks
} from '../utils.js';
import { getWhatsAppStatus } from '../whatsapp.js';

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
      id: `msg_${Math.random().toString(36).substring(2, 15)}`,
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

  const msgId = `msg_${Math.random().toString(36).substring(2, 15)}`;
  const { error: queueError } = await supabase.from('message_queue').insert({
    id: msgId,
    user_id: userId,
    type: 'email',
    recipient: to,
    subject: subject,
    body: html,
    status: 'pending',
    attempts: 0,
    max_attempts: 3
  });

  if (queueError) {
    console.error('[API] Failed to queue email:', queueError);
    await refundWallet(userId, cost, `Refund: Queue failure for Email to ${to}`);
    return res.status(500).json({ error: 'Failed to queue email.' });
  }

  res.json({
    id: msgId,
    type: 'email',
    from: from || 'Sumer Send <onboarding@sumersend.com>',
    to,
    subject,
    body: html,
    status: 'queued',
    timestamp: new Date().toISOString()
  });
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
      id: `sms_${Math.random().toString(36).substring(2, 15)}`,
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

  const msgId = `sms_${Math.random().toString(36).substring(2, 15)}`;
  const { error: queueError } = await supabase.from('message_queue').insert({
    id: msgId,
    user_id: userId,
    type: 'sms',
    recipient: to,
    body,
    status: 'pending',
    attempts: 0,
    max_attempts: 3
  });

  if (queueError) {
    console.error('[API] Failed to queue SMS:', queueError);
    await refundWallet(userId, cost, `Refund: Queue failure for SMS to ${to}`);
    return res.status(500).json({ error: 'Failed to queue SMS.' });
  }

  res.json({
    id: msgId,
    type: 'sms',
    from: 'Sumer Send API',
    to,
    body,
    status: 'queued',
    timestamp: new Date().toISOString()
  });
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
  if (!waStatus.connected) {
    const failedLog = {
      id: `wa_${Math.random().toString(36).substring(2, 15)}`,
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
      id: `wa_${Math.random().toString(36).substring(2, 15)}`,
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

  const msgId = `wa_${Math.random().toString(36).substring(2, 15)}`;
  const { error: queueError } = await supabase.from('message_queue').insert({
    id: msgId,
    user_id: userId,
    type: 'whatsapp',
    recipient: to,
    body,
    status: 'pending',
    attempts: 0,
    max_attempts: 3
  });

  if (queueError) {
    console.error('[API] Failed to queue WhatsApp message:', queueError);
    await refundWallet(userId, cost, `Refund: Queue failure for WhatsApp to ${to}`);
    return res.status(500).json({ error: 'Failed to queue WhatsApp message.' });
  }

  res.json({
    id: msgId,
    type: 'whatsapp',
    from: 'Sumer Send API',
    to,
    body,
    status: 'queued',
    timestamp: new Date().toISOString()
  });
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
            metadata: { ...(existingSub.metadata || {}), ...(metadata || {}) },
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('id', subId);
        isNewSubscription = true;
      }
    } else {
      subId = `sub_${Math.random().toString(36).substring(2, 15)}`;
      await addSubscriber(userId, {
        id: subId,
        email: email,
        name: name,
        phone: phone,
        metadata: metadata || {}
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
        
        const welcomeSubject = settings.welcomeSubject;
        let welcomeBody = settings.welcomeBody;
        welcomeBody = welcomeBody.replace(/{name}/g, name || 'there').replace(/{email}/g, email);

        if (!charged) {
          const failedLog = {
            id: `msg_${Math.random().toString(36).substring(2, 15)}`,
            type: 'email',
            from: 'Sumer Send <onboarding@sumersend.com>',
            to: email,
            subject: welcomeSubject,
            body: welcomeBody,
            status: 'failed',
            error: 'Insufficient wallet balance for automatic welcome email. Please top up.',
            timestamp: new Date().toISOString()
          };
          await appendLog(userId, failedLog);
          triggerWebhooks(userId, 'email.failed', failedLog);
        } else {
          const msgId = `msg_${Math.random().toString(36).substring(2, 15)}`;
          const smtpConfig = await loadSmtpConfig(userId);
          const fromSender = smtpConfig.from || 'Sumer Send <onboarding@sumersend.com>';

          const { error: queueError } = await supabase.from('message_queue').insert({
            id: msgId,
            user_id: userId,
            type: 'email',
            recipient: email,
            subject: welcomeSubject,
            body: welcomeBody,
            status: 'pending',
            attempts: 0,
            max_attempts: 3
          });

          if (queueError) {
            console.error('[API] Failed to queue welcome email:', queueError);
            await refundWallet(userId, cost, `Refund: Queue failure for Welcome Email to ${email}`);
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
