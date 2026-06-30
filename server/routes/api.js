import express from 'express';
import crypto from 'crypto';
import dns from 'dns';
import { 
  getWhatsAppStatus, 
  logoutWhatsApp 
} from '../whatsapp.js';
import { sendSmsMessage } from '../sms.js';
import {
  loadLogs,
  saveLogs,
  appendLog,
  loadSmtpConfig,
  saveSmtpConfig,
  loadSmsConfig,
  saveSmsConfig,
  loadWallet,
  saveWallet,
  loadWebhooks,
  saveWebhooks,
  loadWebhookLogs,
  loadCampaigns,
  saveCampaigns,
  loadTemplates,
  saveTemplates,
  loadSecurityConfig,
  saveSecurityConfig,
  loadApiKeys,
  saveApiKeys,
  bootstrapUserData,
  supabase,
  loadSubscribers,
  addSubscriber,
  updateSubscriberStatus,
  deleteSubscriber,
  deleteSubscribersBulk,
  loadSubscriberSettings,
  saveSubscriberSettings,
  bulkAddSubscribers,
  appendLogsBulk,
  refundWallet,
  chargeWallet,
  topupWallet,
  loadNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  addCampaign,
  updateCampaign,
  deleteCampaign,
  addTemplate,
  deleteTemplate,
  upsertTemplate,
  addWebhook,
  deleteWebhook,
  upsertWebhook
} from '../db.js';
import {
  createTransporter,
  triggerWebhooks,
  activeSecurityOTPs,
  isValidEmail,
  compileWelcomeMessage
} from '../utils.js';
import { queueMessageJob } from '../queue.js';

const apiRouter = express.Router();

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// GET /api/apikeys
apiRouter.get('/apikeys', async (req, res) => {
  try {
    const keys = await loadApiKeys(req.user.id);
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load API keys.' });
  }
});

// POST /api/apikeys
apiRouter.post('/apikeys', async (req, res) => {
  const { name, scope } = req.body;
  const userId = req.user.id;
  const keyScope = scope || 'full';
  
  try {
    const keys = await loadApiKeys(userId);
    
    const randomHex = crypto.randomBytes(32).toString('hex');
    const generatedKey = `sm_${keyScope === 'full' ? 'live' : 'send'}_${randomHex}`;
    
    // Hash key & mask it
    const hashedKey = crypto.createHash('sha256').update(generatedKey).digest('hex');
    const maskedKey = `sm_${keyScope === 'full' ? 'live' : 'send'}_${generatedKey.slice(8, 12)}...${generatedKey.slice(-6)}`;
    const storedKeyValue = `${hashedKey}:${maskedKey}`;

    const newKey = {
      id: Date.now().toString(),
      name: name || 'API Key',
      key: storedKeyValue,
      scope: keyScope,
      createdAt: new Date().toISOString()
    };

    keys.push(newKey);
    await saveApiKeys(userId, keys);
    
    // Return plaintext key to user once
    res.json({
      ...newKey,
      key: generatedKey
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create API key.' });
  }
});

// DELETE /api/apikeys/:id
apiRouter.delete('/apikeys/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const keys = await loadApiKeys(userId);
    const filtered = keys.filter(k => k.id !== req.params.id);
    await saveApiKeys(userId, filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete API key.' });
  }
});

// GET /api/smtp/config
apiRouter.get('/smtp/config', async (req, res) => {
  try {
    const config = await loadSmtpConfig(req.user.id);
    res.json({
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      from: config.from,
      hasPassword: !!config.pass
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load SMTP configuration.' });
  }
});

// POST /api/smtp/config
apiRouter.post('/smtp/config', async (req, res) => {
  const { host, port, secure, user, pass, from } = req.body;
  const userId = req.user.id;
  
  try {
    const current = await loadSmtpConfig(userId);
    
    const updated = {
      host: host || current.host,
      port: parseInt(port) || current.port,
      secure: secure === undefined ? current.secure : !!secure,
      user: user || current.user,
      pass: pass === undefined ? current.pass : pass,
      from: from || current.from
    };
    
    if (await saveSmtpConfig(userId, updated)) {
      res.json({ success: true, message: 'Configuration saved successfully.' });
    } else {
      res.status(500).json({ error: 'Failed to save configuration.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error saving SMTP configuration.' });
  }
});

// POST /api/smtp/test
apiRouter.post('/smtp/test', async (req, res) => {
  const { host, port, secure, user, pass, from, testRecipient } = req.body;
  const userId = req.user.id;
  
  if (!testRecipient) {
    return res.status(400).json({ error: 'Recipient email is required for testing.' });
  }
  
  const testConfig = {
    host,
    port: parseInt(port),
    secure: !!secure,
    user,
    pass,
    from
  };
  
  const transporter = createTransporter(testConfig);
  if (!transporter) {
    return res.status(400).json({ error: 'Invalid SMTP configuration details.' });
  }
  
  try {
    const info = await transporter.sendMail({
      from: from || `Sumer Send Test <${user}>`,
      to: testRecipient,
      subject: 'Sumer Send - SMTP Connection Test Success! 🚀',
      text: 'Congratulations! Your SMTP settings are correctly configured.',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; text-align: right; direction: rtl;">
          <h2 style="color: #0070f3;">تم تفعيل خادم الإرسال بنجاح! 🚀</h2>
          <p>تهانينا! حسابك الآن جاهز تماماً لبث الإشعارات وتوصيل المعاملات البرمجية.</p>
        </div>
      `
    });
    
    const testLog = {
      id: `test_${crypto.randomUUID()}`,
      type: 'email',
      from: from || `Sumer Send Test <${user}>`,
      to: testRecipient,
      subject: 'Sumer Send - SMTP Connection Test Success! 🚀',
      body: 'Congratulations! Your SMTP settings are correctly configured.',
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, testLog);
    triggerWebhooks(userId, 'email.delivered', testLog);

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('SMTP test failed:', error);
    
    const testLog = {
      id: `test_${crypto.randomUUID()}`,
      type: 'email',
      from: from || `Sumer Send Test <${user}>`,
      to: testRecipient,
      subject: 'Sumer Send - SMTP Connection Test Failed ❌',
      body: `SMTP Connection Test failed: ${error.message}`,
      status: 'failed',
      error: error.message || 'SMTP connection failed.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, testLog);
    triggerWebhooks(userId, 'email.failed', testLog);

    res.status(500).json({ error: error.message || 'SMTP Connection failed.' });
  }
});

// GET /api/sms/config
apiRouter.get('/sms/config', async (req, res) => {
  try {
    const config = await loadSmsConfig(req.user.id);

    // If the provider is otpiq, fetch live info and sender IDs from OTPIQ API
    if (config.provider === 'otpiq' && config.apiKey) {
      try {
        const [infoRes, senderIdsRes] = await Promise.all([
          fetch('https://api.otpiq.com/api/info', {
            headers: { 'Authorization': `Bearer ${config.apiKey}` }
          }).then(r => r.ok ? r.json() : null),
          fetch('https://api.otpiq.com/api/sender-ids', {
            headers: { 'Authorization': `Bearer ${config.apiKey}` }
          }).then(r => r.ok ? r.json() : null)
        ]);

        if (infoRes) {
          config.otpiqInfo = infoRes; // { projectName, credit }
        }
        if (senderIdsRes && senderIdsRes.success) {
          config.otpiqSenderIds = senderIdsRes.data; // array of { _id, senderId, status }
        }
      } catch (otpiqErr) {
        console.error('Failed to fetch live OTPIQ metadata:', otpiqErr.message);
      }
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load SMS configuration.' });
  }
});

// POST /api/sms/config
apiRouter.post('/sms/config', async (req, res) => {
  const { provider, apiKey, apiSecret, senderId } = req.body;
  const userId = req.user.id;

  try {
    const saveSuccess = await saveSmsConfig(userId, { provider, apiKey, apiSecret, senderId });
    if (saveSuccess) {
      const responsePayload = { success: true, message: 'SMS Configuration saved successfully.' };

      if (provider === 'otpiq' && apiKey) {
        try {
          const [infoRes, senderIdsRes] = await Promise.all([
            fetch('https://api.otpiq.com/api/info', {
              headers: { 'Authorization': `Bearer ${apiKey}` }
            }).then(r => r.ok ? r.json() : null),
            fetch('https://api.otpiq.com/api/sender-ids', {
              headers: { 'Authorization': `Bearer ${apiKey}` }
            }).then(r => r.ok ? r.json() : null)
          ]);

          if (infoRes) {
            responsePayload.otpiqInfo = infoRes;
          }
          if (senderIdsRes && senderIdsRes.success) {
            responsePayload.otpiqSenderIds = senderIdsRes.data;
          }
        } catch (otpiqErr) {
          console.error('Failed to fetch live OTPIQ metadata after save:', otpiqErr.message);
        }
      }

      res.json(responsePayload);
    } else {
      res.status(500).json({ error: 'Failed to save SMS configuration.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error saving SMS configuration.' });
  }
});

// POST /api/sms/test
apiRouter.post('/sms/test', async (req, res) => {
  const { provider, apiKey, apiSecret, senderId, testRecipient } = req.body;
  const userId = req.user.id;

  if (!testRecipient) {
    return res.status(400).json({ error: 'Recipient phone number is required for testing.' });
  }

  try {
    // Save settings first so sendSmsMessage picks them up correctly from database
    await saveSmsConfig(userId, { provider, apiKey, apiSecret, senderId });

    console.log(`[SMS Test API] Launching test via ${provider} to ${testRecipient}`);
    const result = await sendSmsMessage(userId, testRecipient, 'Sumer Send - SMS Gateway Test Success! 🚀');

    const testLog = {
      id: `test_sms_${crypto.randomUUID()}`,
      type: 'sms',
      from: senderId || 'SumerSend',
      to: testRecipient,
      subject: 'SMS Gateway Test',
      body: 'Sumer Send - SMS Gateway Test Success! 🚀',
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, testLog);
    triggerWebhooks(userId, 'sms.delivered', testLog);

    res.json({ success: true, messageId: result.messageId || 'httpsms_sent' });
  } catch (error) {
    console.error('SMS test failed:', error);

    const testLog = {
      id: `test_sms_${crypto.randomUUID()}`,
      type: 'sms',
      from: senderId || 'SumerSend',
      to: testRecipient,
      subject: 'SMS Gateway Test Failed ❌',
      body: `SMS Test failed: ${error.message}`,
      status: 'failed',
      error: error.message || 'SMS dispatch failed.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, testLog);
    triggerWebhooks(userId, 'sms.failed', testLog);

    res.status(500).json({ error: error.message || 'SMS connection failed.' });
  }
});

// GET /api/logs
apiRouter.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;
    const logs = await loadLogs(req.user.id, limit, offset);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load logs.' });
  }
});

// DELETE /api/logs
apiRouter.delete('/logs', async (req, res) => {
  try {
    if (await saveLogs(req.user.id, [])) {
      res.json({ success: true, message: 'Logs cleared successfully.' });
    } else {
      res.status(500).json({ error: 'Failed to clear logs.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error clearing logs.' });
  }
});

// GET /api/bootstrap
apiRouter.get('/bootstrap', async (req, res) => {
  try {
    const data = await bootstrapUserData(req.user.id);
    if (data.apiKeys && Array.isArray(data.apiKeys)) {
      data.apiKeys = data.apiKeys.map(k => {
        const parts = k.key.split(':');
        const displayKey = parts[1] || k.key;
        return {
          ...k,
          key: displayKey
        };
      });
    }
    res.json(data);
  } catch (err) {
    console.error(`Bootstrap error for user ${req.user.id}:`, err);
    res.status(500).json({ error: 'Failed to bootstrap dashboard data.' });
  }
});

// GET /api/wallet
apiRouter.get('/wallet', async (req, res) => {
  try {
    const wallet = await loadWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load wallet info.' });
  }
});

// POST /api/wallet/topup/webhook
apiRouter.post('/wallet/topup/webhook', async (req, res) => {
  const signature = req.headers['x-gateway-signature'];
  const payload = req.body;
  
  if (!signature) {
    return res.status(401).json({ error: 'Missing webhook signature.' });
  }

  if (!process.env.PAYMENT_GATEWAY_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error("FATAL ERROR: PAYMENT_GATEWAY_SECRET is not defined in production!");
      return res.status(500).json({ error: 'Gateway configuration error.' });
    } else {
      console.warn("⚠️ WARNING: PAYMENT_GATEWAY_SECRET is not defined. Using development fallback key.");
    }
  }
  const gatewaySecret = process.env.PAYMENT_GATEWAY_SECRET || 'sumer_send_gateway_secret_key_12345';
  const expectedSignature = crypto.createHmac('sha256', gatewaySecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  const { userId, provider, amount, phoneNumber, txId, transactionId } = payload;
  if (!userId || !provider || amount === undefined) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }
  
  const webhookTxId = txId || transactionId;
  if (!webhookTxId) {
    return res.status(400).json({ error: 'Missing transaction identifier (txId).' });
  }
  
  try {
    // Check if transaction ID already exists in transactions table
    const { data: existingTx, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', webhookTxId)
      .maybeSingle();

    if (txError) {
      console.error('Error checking for duplicate transaction:', txError);
      return res.status(500).json({ error: 'Failed to verify transaction uniqueness.' });
    }

    if (existingTx) {
      return res.status(409).json({ error: 'Duplicate transaction ID. This transaction has already been processed.' });
    }

    const topUpAmount = parseInt(amount);
    const description = `Secure wallet top-up via ${provider} (${phoneNumber || 'Gateway'})`;
    
    // Perform secure atomic wallet top-up using postgres row locks and webhook transaction ID for idempotency
    const success = await topupWallet(userId, topUpAmount, description, provider, webhookTxId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to perform secure wallet top-up. The transaction may be a duplicate or already processed.' });
    }
    
    const wallet = await loadWallet(userId);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform secure wallet top-up.' });
  }
});

// GET /api/webhooks
apiRouter.get('/webhooks', async (req, res) => {
  try {
    const webhooks = await loadWebhooks(req.user.id);
    res.json(webhooks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load webhooks.' });
  }
});

// POST /api/webhooks
apiRouter.post('/webhooks', async (req, res) => {
  const { id, url, events, secret } = req.body;
  if (!url || !events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'url and events (array) are required.' });
  }
  
  const userId = req.user.id;
  try {
    let webhook;
    if (id) {
      // For updates, we first verify it exists by checking with loadWebhooks or doing a direct check.
      const webhooks = await loadWebhooks(userId);
      const existing = webhooks.find(w => w.id === id);
      if (!existing) {
        return res.status(404).json({ error: 'Webhook not found.' });
      }
      webhook = {
        id,
        url,
        events: events || ['*'],
        secret: secret || existing.secret,
        createdAt: existing.createdAt
      };
    } else {
      webhook = {
        id: crypto.randomUUID(),
        url,
        events: events || ['*'],
        secret: secret || 'sumer_wh_' + crypto.randomBytes(12).toString('hex'),
        createdAt: new Date().toISOString()
      };
    }
    
    await upsertWebhook(userId, webhook);
    res.json(webhook);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save webhook.' });
  }
});

// DELETE /api/webhooks/:id
apiRouter.delete('/webhooks/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const success = await deleteWebhook(userId, req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Webhook not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete webhook.' });
  }
});

// GET /api/webhooks/logs
apiRouter.get('/webhooks/logs', async (req, res) => {
  try {
    const logs = await loadWebhookLogs(req.user.id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load webhook logs.' });
  }
});

// GET /api/campaigns
apiRouter.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await loadCampaigns(req.user.id);
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load campaigns.' });
  }
});

// POST /api/campaigns
apiRouter.post('/campaigns', async (req, res) => {
  const { name, type, subject, body, recipients, totalCost } = req.body;
  const userId = req.user.id;
  
  try {
    const newCampaign = {
      id: 'camp_' + crypto.randomUUID(),
      name: name || 'Untitled Campaign',
      type: type || 'sms',
      status: 'draft',
      subject: subject || '',
      body: body || '',
      recipientsCount: recipients ? recipients.length : 0,
      successCount: 0,
      failedCount: 0,
      totalCost: totalCost || 0,
      timestamp: new Date().toISOString(),
      recipients: recipients || []
    };
    
    await addCampaign(userId, newCampaign);
    res.json(newCampaign);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign.' });
  }
});

// POST /api/campaigns/:id/status
apiRouter.post('/campaigns/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, successCount, failedCount, totalCost, recipients } = req.body;
  const userId = req.user.id;
  
  try {
    const campaigns = await loadCampaigns(userId);
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    
    const oldStatus = campaign.status;
    const updates = { status, successCount, failedCount, totalCost, recipients };
    
    await updateCampaign(userId, id, updates);

    // Trigger notification if status transitioned
    if (status && status !== oldStatus) {
      if (status === 'completed' || status === 'sent') {
        const succ = successCount !== undefined ? successCount : campaign.successCount || 0;
        const fail = failedCount !== undefined ? failedCount : campaign.failedCount || 0;
        await addNotification(
          userId,
          `اكتمال إرسال حملة: ${campaign.name}`,
          `تم الانتهاء من إرسال الحملة بنجاح. الناجحة: ${succ}، الفاشلة: ${fail}.`,
          'success'
        );
      } else if (status === 'failed') {
        await addNotification(
          userId,
          `فشل إرسال حملة: ${campaign.name}`,
          'حدث خطأ غير متوقع أدى إلى فشل الحملة بالكامل.',
          'error'
        );
      }
    }

    res.json({ ...campaign, ...updates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campaign status.' });
  }
});

function personalizeCampaignMessage(text, recipient, lang = 'ar') {
  if (!text) return '';
  let result = text;

  // Replaces placeholders like {{name}} or {name} with recipient name/variables
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}|\{\s*([a-zA-Z0-9_]+)\s*\}/g;
  result = result.replace(regex, (match, p1, p2) => {
    const tag = p1 || p2;
    const tagLower = tag.toLowerCase();

    // 1. Direct field match or variables
    let val = recipient[tag] || recipient.variables?.[tag] || recipient.variables?.[tagLower];

    const isNameTag = (t) => {
      const tagLower = t.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const nameTags = [
        'name', 'username', 'user_name', 'customer_name', 'customername',
        'recipient_name', 'recipientname', 'reader_name', 'readername', 'friend_name',
        'friendname', 'member_name', 'membername', 'client_name', 'clientname',
        'subscriber_name', 'subscribername', 'user'
      ];
      return nameTags.includes(tagLower) || tagLower.endsWith('name');
    };

    if (val === undefined) {
      if (isNameTag(tag)) {
        val = recipient.name;
      } else if (tagLower === 'email') {
        val = recipient.email || recipient.to || '';
      } else if (tagLower === 'phone') {
        val = recipient.phone || recipient.to || '';
      }
    }

    if (val === undefined || val === null) {
      val = '';
    }

    if (isNameTag(tag)) {
      const trimmedName = String(val).trim();
      const defaultPlaceholders = [
        'عضو رائع', 'valued member', 'أحمد علي', 'ahmed ali',
        'مستخدمنا العزيز', 'valued user', 'عميلنا المميز', 'valued customer',
        'عميلنا العزيز', 'قارئنا الكريم', 'valued reader', 'مستلم', 'recipient',
        'شريكنا العزيز', 'valued partner', 'أحمد', 'ahmed'
      ];
      if (!trimmedName || defaultPlaceholders.includes(trimmedName.toLowerCase())) {
        val = lang === 'ar' ? 'مشتركنا الكريم' : 'Valued Subscriber';
      }
    }

    return String(val);
  });

  return result;
}

// POST /api/campaigns/:id/send
apiRouter.post('/campaigns/:id/send', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const campaigns = await loadCampaigns(userId);
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return res.status(400).json({ error: 'Campaign has already been sent.' });
    }

    const recipients = campaign.recipients || [];
    if (recipients.length === 0) {
      return res.status(400).json({ error: 'Campaign has no recipients.' });
    }

    // Charge wallet
    const costPerMsg = campaign.type === 'email' ? 10 : (campaign.type === 'whatsapp' ? 15 : 20);
    const totalCampaignCost = recipients.length * costPerMsg;
    const charged = await chargeWallet(userId, totalCampaignCost, `Campaign: ${campaign.name}`);
    if (!charged) {
      return res.status(402).json({ error: 'Insufficient wallet balance.' });
    }

    // Set campaign status to sending
    await updateCampaign(userId, id, { status: 'sending', totalCost: totalCampaignCost });

    // Process recipients
    let successes = 0;
    let failures = 0;

    for (const r of recipients) {
      if (!r.to) {
        failures++;
        continue;
      }

      const personalizedBody = personalizeCampaignMessage(campaign.body, r);
      const personalizedSubject = campaign.type === 'email' ? personalizeCampaignMessage(campaign.subject, r) : '';

      const msgId = `msg_${crypto.randomUUID()}`;
      const { error: insertError } = await supabase
        .from('message_queue')
        .insert({
          id: msgId,
          user_id: userId,
          type: campaign.type,
          recipient: r.to,
          subject: personalizedSubject,
          body: personalizedBody,
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
          scheduled_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!insertError) {
        try {
          await queueMessageJob(msgId);
          successes++;
        } catch (err) {
          console.error(`Failed to queue BullMQ job for msg ${msgId}:`, err);
          failures++;
        }
      } else {
        console.error(`Failed to insert msg ${msgId} in DB:`, insertError);
        failures++;
      }
    }

    // Update campaign to completed/sent status
    await updateCampaign(userId, id, {
      status: 'sent',
      successCount: successes,
      failedCount: failures,
      totalCost: totalCampaignCost
    });

    // Add notification
    await addNotification(
      userId,
      `اكتمال إرسال حملة: ${campaign.name}`,
      `تم الانتهاء من إرسال الحملة بنجاح. الناجحة: ${successes}، الفاشلة: ${failures}.`,
      'success'
    );

    res.json({ success: true, successes, failures });
  } catch (err) {
    console.error('Failed to dispatch campaign:', err);
    res.status(500).json({ error: 'Failed to dispatch campaign.' });
  }
});

// DELETE /api/campaigns/:id
apiRouter.delete('/campaigns/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const success = await deleteCampaign(userId, req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign.' });
  }
});

// GET /api/templates/custom
apiRouter.get('/templates/custom', async (req, res) => {
  try {
    const templates = await loadTemplates(req.user.id);
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load custom templates.' });
  }
});

// POST /api/templates/custom
apiRouter.post('/templates/custom', async (req, res) => {
  const { id, nameAr, nameEn, descAr, descEn, subjectAr, subjectEn, body, icon, variables, type } = req.body;
  const userId = req.user.id;
  
  try {
    let template;
    if (id) {
      const templates = await loadTemplates(userId);
      const existing = templates.find(t => t.id === id);
      if (!existing) {
        return res.status(404).json({ error: 'Template not found.' });
      }
      template = {
        id,
        nameAr: nameAr || existing.nameAr,
        nameEn: nameEn || existing.nameEn,
        descAr: descAr !== undefined ? descAr : existing.descAr,
        descEn: descEn !== undefined ? descEn : existing.descEn,
        subjectAr: subjectAr !== undefined ? subjectAr : existing.subjectAr,
        subjectEn: subjectEn !== undefined ? subjectEn : existing.subjectEn,
        body: body !== undefined ? body : existing.body,
        icon: icon || existing.icon,
        variables: variables || existing.variables,
        type: type || existing.type,
        createdAt: existing.createdAt
      };
    } else {
      template = {
        id: 'temp_cust_' + crypto.randomUUID(),
        nameAr: nameAr || 'قالب مخصص',
        nameEn: nameEn || 'Custom Template',
        descAr: descAr || '',
        descEn: descEn || '',
        subjectAr: subjectAr || '',
        subjectEn: subjectEn || '',
        body: body || '',
        icon: icon || '📝',
        variables: variables || [],
        type: type || 'sms',
        createdAt: new Date().toISOString()
      };
    }
    
    await upsertTemplate(userId, template);
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save template.' });
  }
});

// DELETE /api/templates/custom/:id
apiRouter.delete('/templates/custom/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const success = await deleteTemplate(userId, req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Template not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete template.' });
  }
});

// GET /api/security/config
apiRouter.get('/security/config', async (req, res) => {
  try {
    const config = await loadSecurityConfig(req.user.id);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load security config.' });
  }
});

// POST /api/security/config
apiRouter.post('/security/config', async (req, res) => {
  const userId = req.user.id;
  try {
    const current = await loadSecurityConfig(userId);
    const updated = {
      ...current,
      phone: req.body.phone !== undefined ? req.body.phone : current.phone,
      verified: req.body.verified !== undefined ? req.body.verified : current.verified,
      requireCampaign2FA: req.body.requireCampaign2FA !== undefined ? req.body.requireCampaign2FA : current.requireCampaign2FA,
      requireApiKey2FA: req.body.requireApiKey2FA !== undefined ? req.body.requireApiKey2FA : current.requireApiKey2FA
    };
    await saveSecurityConfig(userId, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save security config.' });
  }
});

// POST /api/security/verify-phone
apiRouter.post('/security/verify-phone', async (req, res) => {
  const { phone } = req.body;
  const userId = req.user.id;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  
  try {
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    activeSecurityOTPs[userId] = {
      phone,
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    console.log(`Security OTP generated for user ${userId} (${phone}): ${otpCode}`);

    const securityLog = {
      id: `sms_${crypto.randomUUID()}`,
      type: 'sms',
      from: 'Sumer Send Security',
      to: phone,
      body: `رمز التحقق الخاص بك لتأمين حساب سومر سيند هو: ${otpCode}. لا تشارك هذا الرمز مع أي شخص.`,
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    
    // Call SMS Service to dispatch the OTP message (logs to console if provider is mock)
    sendSmsMessage(userId, phone, securityLog.body).catch(smsErr => {
      console.error(`[Security] Failed to dispatch verification SMS to ${phone}:`, smsErr.message);
    });

    const sanitizedLog = { ...securityLog, body: 'تم إرسال رمز التحقق بنجاح.' };
    
    const responsePayload = {
      success: true,
      log: sanitizedLog
    };
    
    // In development mode, return the OTP code to allow mock notifications or testing in UI
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.otp = otpCode;
    }
    
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate phone verification.' });
  }
});

// POST /api/security/confirm-otp
apiRouter.post('/security/confirm-otp', async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;
  if (!otp) {
    return res.status(400).json({ error: 'OTP is required.' });
  }

  const session = activeSecurityOTPs[userId];
  if (!session) {
    return res.status(400).json({ error: 'No active verification session. Request a new code.' });
  }

  if (Date.now() > session.expiresAt) {
    delete activeSecurityOTPs[userId];
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  if (session.code === otp) {
    try {
      const current = await loadSecurityConfig(userId);
      current.phone = session.phone;
      current.verified = true;
      await saveSecurityConfig(userId, current);
      delete activeSecurityOTPs[userId];
      return res.json({ success: true, config: current });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update security settings.' });
    }
  }

  res.status(400).json({ error: 'Invalid OTP code. Please try again.' });
});

// GET /api/whatsapp/status
apiRouter.get('/whatsapp/status', async (req, res) => {
  try {
    const status = await getWhatsAppStatus(req.user.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/whatsapp/logout
apiRouter.post('/whatsapp/logout', async (req, res) => {
  await logoutWhatsApp(req.user.id);
  res.json({ success: true });
});

// =========================================================================
// Notifications Router Endpoints
// =========================================================================

// GET /api/notifications
apiRouter.get('/notifications', async (req, res) => {
  try {
    const list = await loadNotifications(req.user.id);
    res.json(list);
  } catch (err) {
    console.error('Failed to load notifications:', err);
    res.status(500).json({ error: 'Failed to load notifications.' });
  }
});

// PUT /api/notifications/:id/read
apiRouter.put('/notifications/:id/read', async (req, res) => {
  try {
    const success = await markNotificationAsRead(req.user.id, req.params.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to mark notification as read.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update notification read status:', err);
    res.status(500).json({ error: 'Failed to update notification read status.' });
  }
});

// PUT /api/notifications/read-all
apiRouter.put('/notifications/read-all', async (req, res) => {
  try {
    const success = await markAllNotificationsAsRead(req.user.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to mark all notifications as read.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to mark all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
});

// DELETE /api/notifications/:id
apiRouter.delete('/notifications/:id', async (req, res) => {
  try {
    const success = await deleteNotification(req.user.id, req.params.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to delete notification.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete notification:', err);
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
});

// DELETE /api/notifications
apiRouter.delete('/notifications', async (req, res) => {
  try {
    const success = await deleteAllNotifications(req.user.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to delete all notifications.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete all notifications:', err);
    res.status(500).json({ error: 'Failed to delete all notifications.' });
  }
});

// GET /api/subscribers
apiRouter.get('/subscribers', async (req, res) => {
  try {
    const list = await loadSubscribers(req.user.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subscribers.' });
  }
});

// POST /api/subscribers
apiRouter.post('/subscribers', async (req, res) => {
  const { email, name, phone, metadata } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  try {
    const { data: existingSub } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingSub) {
      return res.status(400).json({ error: 'Subscriber with this email is already registered.' });
    }

    const sub = {
      id: `sub_${crypto.randomUUID()}`,
      email,
      name: name ? escapeHtml(name) : '',
      phone: phone || null,
      metadata: { source: 'manual', ...(metadata || {}) },
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await addSubscriber(req.user.id, sub);
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add subscriber.' });
  }
});

// PUT /api/subscribers/:id/status
apiRouter.put('/subscribers/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status || !['active', 'unsubscribed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be active or unsubscribed.' });
  }

  try {
    const success = await updateSubscriberStatus(req.user.id, req.params.id, status);
    if (!success) {
      return res.status(400).json({ error: 'Failed to update subscriber status.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subscriber status.' });
  }
});

// DELETE /api/subscribers/bulk
apiRouter.delete('/subscribers/bulk', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No subscriber IDs provided.' });
  }
  try {
    const success = await deleteSubscribersBulk(req.user.id, ids);
    if (!success) {
      return res.status(400).json({ error: 'Failed to bulk delete subscribers.' });
    }
    res.json({ success: true, deletedCount: ids.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk delete subscribers.' });
  }
});

// DELETE /api/subscribers/:id
apiRouter.delete('/subscribers/:id', async (req, res) => {
  try {
    const success = await deleteSubscriber(req.user.id, req.params.id);
    if (!success) {
      return res.status(400).json({ error: 'Failed to delete subscriber.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subscriber.' });
  }
});

// GET /api/subscribers/settings
apiRouter.get('/subscribers/settings', async (req, res) => {
  try {
    const settings = await loadSubscriberSettings(req.user.id);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subscriber settings.' });
  }
});

// POST /api/subscribers/settings
apiRouter.post('/subscribers/settings', async (req, res) => {
  const { welcomeEnabled, welcomeSubject, welcomeBody, welcomeTemplateId } = req.body;
  try {
    const success = await saveSubscriberSettings(req.user.id, {
      welcomeEnabled: !!welcomeEnabled,
      welcomeSubject: welcomeSubject || 'Welcome to our newsletter!',
      welcomeBody: welcomeBody || 'Hello {name},\n\nThank you for subscribing!\n\nBest regards.',
      welcomeTemplateId: welcomeTemplateId || ''
    });
    if (!success) {
      return res.status(400).json({ error: 'Failed to save settings.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings.' });
  }
});

// POST /api/subscribers/bulk
apiRouter.post('/subscribers/bulk', async (req, res) => {
  const { subscribers, sendWelcome } = req.body;
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return res.status(400).json({ error: 'No subscribers provided. Must be an array.' });
  }

  const userId = req.user.id;

  try {
    const validSubs = [];
    const seenEmails = new Set();

    for (const s of subscribers) {
      if (!s.email) continue;
      const normalizedEmail = String(s.email).toLowerCase().trim();
      if (!isValidEmail(normalizedEmail)) continue;
      if (seenEmails.has(normalizedEmail)) continue;

      seenEmails.add(normalizedEmail);
      validSubs.push({
        id: `sub_${crypto.randomUUID()}`,
        email: normalizedEmail,
        name: s.name ? escapeHtml(String(s.name).trim()) : null,
        phone: s.phone ? String(s.phone).trim() : null,
        metadata: { source: 'import', ...(s.metadata || {}) },
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    if (validSubs.length === 0) {
      return res.status(400).json({ error: 'No valid subscribers with correct email formats were provided.' });
    }

    // Perform bulk upsert
    await bulkAddSubscribers(userId, validSubs);

    // Queue welcome emails if selected and enabled
    let welcomeQueuedCount = 0;
    let walletShortage = false;

    if (sendWelcome) {
      const settings = await loadSubscriberSettings(userId);
      if (settings.welcomeEnabled) {
        const smtpConfig = await loadSmtpConfig(userId);
        const fromSender = smtpConfig.from || 'Sumer Send <onboarding@sumersend.com>';
        const welcomeSubject = settings.welcomeSubject;
        const welcomeBodyTemplate = settings.welcomeBody;
        const costPerEmail = 10;

        // Check wallet balance
        const wallet = await loadWallet(userId);
        const currentBalance = wallet ? wallet.balance : 0;
        const totalCostRequired = validSubs.length * costPerEmail;

        let subsToWelcome = [];
        let subsToFail = [];

        if (currentBalance >= totalCostRequired) {
          subsToWelcome = validSubs;
          welcomeQueuedCount = validSubs.length;
        } else {
          walletShortage = true;
          const affordableCount = Math.floor(currentBalance / costPerEmail);
          subsToWelcome = validSubs.slice(0, affordableCount);
          subsToFail = validSubs.slice(affordableCount);
          welcomeQueuedCount = affordableCount;
        }

        // 1. Charge wallet in a single transaction if any are welcome-eligible
        if (subsToWelcome.length > 0) {
          const totalChargeAmount = subsToWelcome.length * costPerEmail;
          const charged = await chargeWallet(userId, totalChargeAmount, `Bulk Welcome Emails charge for ${subsToWelcome.length} subscribers`);
          
          if (charged) {
            const queueItems = subsToWelcome.map(sub => {
              const compiledBody = compileWelcomeMessage(welcomeBodyTemplate, sub.name, sub.email);
              const compiledSubject = compileWelcomeMessage(welcomeSubject, sub.name, sub.email);
              return {
                id: crypto.randomUUID(),
                user_id: userId,
                type: 'email',
                recipient: sub.email,
                subject: compiledSubject,
                body: compiledBody,
                status: 'pending',
                attempts: 0,
                max_attempts: 3
              };
            });

            // Insert in chunks of 1000 to keep it extremely reliable
            const chunkSize = 1000;
            for (let i = 0; i < queueItems.length; i += chunkSize) {
              const chunk = queueItems.slice(i, i + chunkSize);
              const { error: queueError } = await supabase.from('message_queue').insert(chunk);
              if (queueError) {
                console.error('[API] Failed to batch queue welcome emails chunk:', queueError);
                const chunkRefund = chunk.length * costPerEmail;
                await refundWallet(userId, chunkRefund, `Refund: Bulk Queue failure for chunk of ${chunk.length}`);
                welcomeQueuedCount -= chunk.length;
              }
            }
          } else {
            // Fallback if charge failed (should not happen since we checked balance)
            walletShortage = true;
            subsToFail = validSubs;
            welcomeQueuedCount = 0;
          }
        }

        // 2. Log failed welcome emails in a single batch insert
        if (subsToFail.length > 0) {
          const failedLogs = subsToFail.map(sub => {
            const compiledBody = compileWelcomeMessage(welcomeBodyTemplate, sub.name, sub.email);
            const compiledSubject = compileWelcomeMessage(welcomeSubject, sub.name, sub.email);
            return {
              id: `msg_${crypto.randomUUID()}`,
              type: 'email',
              from: fromSender,
              to: sub.email,
              subject: compiledSubject,
              body: compiledBody,
              status: 'failed',
              error: 'Insufficient wallet balance for automatic welcome email. Please top up.',
              timestamp: new Date().toISOString()
            };
          });

          await appendLogsBulk(userId, failedLogs);

          // Trigger webhooks for failed logs (async in background)
          failedLogs.forEach(failedLog => {
            triggerWebhooks(userId, 'email.failed', failedLog);
          });
        }
      }
    }

    // Trigger notification
    let importBody = `تم استيراد ${validSubs.length} مشترك بنجاح.`;
    let importType = 'success';
    if (sendWelcome && walletShortage) {
      importBody += ` تنبيه: لم يتم إرسال رسائل ترحيب لـ ${subsToFail.length} مشترك بسبب نقص رصيد المحفظة.`;
      importType = 'warning';
    }
    await addNotification(userId, 'اكتمال استيراد المشتركين', importBody, importType);

    res.json({
      success: true,
      importedCount: validSubs.length,
      welcomeQueuedCount,
      walletShortage,
      message: `Successfully imported ${validSubs.length} subscribers.`
    });

  } catch (err) {
    console.error('Bulk import API error:', err);
    res.status(500).json({ error: 'Failed to bulk import subscribers.' });
  }
});

// =========================================================================
// Public Subscriber Opt-In and Profile Routes
// =========================================================================

// Rate limiter for public join requests (to prevent spam)
import rateLimit from 'express-rate-limit';
const publicJoinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 submissions per window
  message: { error: 'Too many subscription attempts. Please try again later.' }
});

// GET /api/public/users/:userId/profile -> Public route to load owner's name/branding
apiRouter.get('/public/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ error: 'Publisher not found.' });
    }

    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// POST /api/public/subscribers/join/:userId -> Public opt-in endpoint
apiRouter.post('/public/subscribers/join/:userId', publicJoinLimiter, async (req, res) => {
  const { userId } = req.params;
  const { email, name, phone, metadata } = req.body;
  const sanitizedName = name ? escapeHtml(name) : '';

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  try {
    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ error: 'Publisher not found.' });
    }

    // 1. Check if subscriber already exists
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
            name: sanitizedName || existingSub.name,
            phone: phone || existingSub.phone,
            metadata: { source: 'hosted_page', ...(existingSub.metadata || {}), ...(metadata || {}) },
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
        name: sanitizedName,
        phone: phone,
        metadata: { source: 'hosted_page', ...(metadata || {}) }
      });
      isNewSubscription = true;
    }

    // Trigger webhook notification
    triggerWebhooks(userId, 'subscriber.subscribed', {
      id: subId,
      email: email.toLowerCase().trim(),
      name: sanitizedName || '',
      phone: phone || '',
      status: 'active',
      timestamp: new Date().toISOString()
    });

    // 2. Queue Welcome Email if enabled
    if (isNewSubscription) {
      const settings = await loadSubscriberSettings(userId);
      if (settings.welcomeEnabled) {
        const cost = 10;
        const charged = await chargeWallet(userId, cost, `Welcome Email to ${email}`);
        
        const compiledSubject = compileWelcomeMessage(settings.welcomeSubject, sanitizedName, email);
        const compiledBody = compileWelcomeMessage(settings.welcomeBody, sanitizedName, email);

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
          const useQueue = process.env.USE_QUEUE !== 'false' && !process.env.VERCEL;

          if (!useQueue) {
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
              const unsubscribeUrl = `${baseUrl}/api/public/subscribers/unsubscribe/${userId}?email=${encodeURIComponent(email)}`;
              
              await transporter.sendMail({
                from: fromSender,
                to: email,
                subject: compiledSubject || 'Welcome',
                html: compiledBody,
                text: htmlToText(compiledBody),
                headers: {
                  'List-Unsubscribe': `<${unsubscribeUrl}>`,
                  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
                }
              });
              
              const deliveredLog = {
                id: `msg_${crypto.randomUUID()}`,
                type: 'email',
                sender: fromSender,
                recipient: email,
                subject: compiledSubject || '',
                body: compiledBody,
                status: 'delivered',
                timestamp: new Date().toISOString()
              };
              await appendLog(userId, deliveredLog);
              triggerWebhooks(userId, 'email.delivered', deliveredLog);

              await supabase.from('message_queue').insert({
                id: msgId,
                user_id: userId,
                type: 'email',
                recipient: email,
                subject: compiledSubject,
                body: compiledBody,
                status: 'completed',
                attempts: 1,
                max_attempts: 3,
                metadata: { priority: 'normal', direct_send: true }
              });

            } catch (sendErr) {
              console.error('[API] Direct send welcome email failed:', sendErr);
              await refundWallet(userId, cost, `Refund: Welcome Email delivery failure to ${email}`);
              
              const failedLog = {
                id: `msg_${crypto.randomUUID()}`,
                type: 'email',
                sender: smtpConfig?.from || 'Sumer Send <onboarding@sumersend.com>',
                recipient: email,
                subject: compiledSubject,
                body: compiledBody,
                status: 'failed',
                error: sendErr.message || 'Delivery failed',
                timestamp: new Date().toISOString()
              };
              await appendLog(userId, failedLog);
              triggerWebhooks(userId, 'email.failed', failedLog);

              await supabase.from('message_queue').insert({
                id: msgId,
                user_id: userId,
                type: 'email',
                recipient: email,
                subject: compiledSubject,
                body: compiledBody,
                status: 'failed',
                attempts: 1,
                max_attempts: 3,
                last_error: sendErr.message,
                metadata: { priority: 'normal', direct_send: true }
              });
            }
          } else {
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
              await queueMessageJob(msgId, { priority: 'normal' }).catch(err => console.error(`[API] Failed to push welcome email to BullMQ:`, err.message));
            }
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
        name: name || '',
        phone: phone || ''
      }
    });

  } catch (err) {
    console.error('Public subscription opt-in error:', err);
    res.status(500).json({ error: 'Failed to complete subscription request.' });
  }
});

// POST /api/smtp/dns-check
apiRouter.post('/smtp/dns-check', async (req, res) => {
  const { host, user, from } = req.body;
  
  if (!from && !user) {
    return res.status(400).json({ error: 'Sender email or authenticated user email is required.' });
  }

  // Extract domain from sender address
  const emailToExtract = from || user;
  const match = emailToExtract.match(/<([^>]+)>/) || [null, emailToExtract];
  const emailAddress = match[1] ? match[1].trim() : emailToExtract.trim();
  const domain = emailAddress.split('@')[1];

  if (!domain) {
    return res.status(400).json({ error: 'Invalid sender email domain.' });
  }

  const result = {
    domain,
    alignment: { status: 'pass', message: 'Domain alignment matches authentication user.' },
    mx: { status: 'fail', message: 'No MX records found.' },
    spf: { status: 'fail', message: 'No SPF record found.' },
    dmarc: { status: 'fail', message: 'No DMARC record found.' }
  };

  // 1. Check Alignment
  if (user && from) {
    const userMatch = user.match(/<([^>]+)>/) || [null, user];
    const userEmail = userMatch[1] ? userMatch[1].trim() : user.trim();
    const userDomain = userEmail.split('@')[1];
    
    if (userDomain && domain.toLowerCase() !== userDomain.toLowerCase()) {
      result.alignment = {
        status: 'warning',
        message: `From domain (${domain}) differs from SMTP authentication user domain (${userDomain}). Spam filters might penalize this.`
      };
    }
  }

  const dnsPromises = dns.promises;

  // 2. Check MX Records
  try {
    const mxRecords = await dnsPromises.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      result.mx = {
        status: 'pass',
        message: `MX records verified. Found ${mxRecords.length} mail servers.`
      };
    }
  } catch (err) {
    result.mx = {
      status: 'fail',
      message: `Failed to resolve MX records: ${err.message}. Without MX records, some spam filters reject emails.`
    };
  }

  // 3. Check SPF Records
  try {
    const txtRecords = await dnsPromises.resolveTxt(domain);
    const spfRecord = txtRecords.flat().find(record => record.startsWith('v=spf1'));
    if (spfRecord) {
      result.spf = {
        status: 'pass',
        record: spfRecord,
        message: 'SPF record is present and active.'
      };
    } else {
      result.spf = {
        status: 'fail',
        message: 'Missing SPF (Sender Policy Framework) record. Emails from this domain will likely end up in spam folders.'
      };
    }
  } catch (err) {
    result.spf = {
      status: 'fail',
      message: `Failed to query SPF: ${err.message}. Add SPF record to authorize your mail servers.`
    };
  }

  // 4. Check DMARC Records
  try {
    const dmarcRecords = await dnsPromises.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = dmarcRecords.flat().find(record => record.startsWith('v=DMARC1'));
    if (dmarcRecord) {
      result.dmarc = {
        status: 'pass',
        record: dmarcRecord,
        message: 'DMARC record is present and active.'
      };
    } else {
      result.dmarc = {
        status: 'warning',
        message: 'Missing DMARC record. Highly recommended to protect your domain and boost deliverability.'
      };
    }
  } catch (err) {
    result.dmarc = {
      status: 'warning',
      message: `No DMARC record found at _dmarc.${domain}: ${err.message}. Recommended to add a DMARC policy.`
    };
  }

  res.json(result);
});

// GET /api/public/subscribers/unsubscribe/:userId
apiRouter.get('/public/subscribers/unsubscribe/:userId', async (req, res) => {
  const { userId } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).send(`
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 50px auto; text-align: center; padding: 30px; border: 1px solid #e4e4e7; border-radius: 12px; direction: rtl;">
        <h2 style="color: #ef4444;">خطأ / Error</h2>
        <p>البريد الإلكتروني للمستلم مطلوب. / Email address is required.</p>
      </div>
    `);
  }

  try {
    // Look up subscriber
    const { data: sub, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error || !sub) {
      return res.status(404).send(`
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 50px auto; text-align: center; padding: 30px; border: 1px solid #e4e4e7; border-radius: 12px; direction: rtl;">
          <h2 style="color: #ef4444;">لم يتم العثور / Not Found</h2>
          <p>المستلم غير مسجل في هذه القائمة. / Subscriber not found.</p>
        </div>
      `);
    }

    // Update status to unsubscribed
    await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', sub.id);

    // Trigger webhook notification
    triggerWebhooks(userId, 'subscriber.unsubscribed', {
      id: sub.id,
      email: sub.email,
      name: sub.name || '',
      phone: sub.phone || '',
      status: 'unsubscribed',
      timestamp: new Date().toISOString()
    });

    // Render beautiful HTML page matching SumerSend styling
    res.send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إلغاء الاشتراك | SumerSend</title>
        <style>
          :root {
            --bg: #09090b;
            --card: #18181b;
            --border: #27272a;
            --text: #fafafa;
            --text-muted: #a1a1aa;
            --primary: #3b82f6;
          }
          body {
            background-color: var(--bg);
            color: var(--text);
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background-color: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 40px 30px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          h1 {
            font-size: 22px;
            margin-bottom: 12px;
            color: var(--text);
          }
          p {
            color: var(--text-muted);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .success-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: rgba(59, 130, 246, 0.1);
            color: var(--primary);
            font-size: 32px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="success-icon">✓</div>
          <h1>تم إلغاء الاشتراك بنجاح</h1>
          <p>لقد تم إلغاء اشتراك البريد الإلكتروني <strong>${sub.email}</strong> بنجاح. لن تتلقى أي رسائل بريدية إضافية من هذا المرسل.</p>
          <p style="font-size: 13px; color: var(--text-muted); direction: ltr; margin-top: 15px;">
            Subscription for <strong>${sub.email}</strong> has been cancelled. You will no longer receive campaigns from this publisher.
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).send(`
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 50px auto; text-align: center; padding: 30px; border: 1px solid #e4e4e7; border-radius: 12px; direction: rtl;">
        <h2 style="color: #ef4444;">خطأ في النظام / Server Error</h2>
        <p>حدث خطأ غير متوقع أثناء معالجة طلب إلغاء الاشتراك. يرجى المحاولة لاحقاً.</p>
      </div>
    `);
  }
});

export { apiRouter };
