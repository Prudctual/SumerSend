import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { 
  getWhatsAppStatus, 
  sendWhatsAppMessage, 
  logoutWhatsApp, 
  connectToWhatsApp, 
  initializeAllWhatsAppConnections 
} from './whatsapp.js';
import { authRouter, authMiddleware } from './auth.js';
import {
  loadLogs,
  saveLogs,
  appendLog,
  loadSmtpConfig,
  saveSmtpConfig,
  loadWallet,
  saveWallet,
  chargeWallet,
  loadWebhooks,
  saveWebhooks,
  loadWebhookLogs,
  saveWebhookLogs,
  loadCampaigns,
  saveCampaigns,
  loadTemplates,
  saveTemplates,
  loadSecurityConfig,
  saveSecurityConfig,
  loadApiKeys,
  saveApiKeys,
  findUserByApiKey,
  refundWallet,
  bootstrapUserData
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function createTransporter(config) {
  if (!config.host || !config.user || !config.pass) {
    return null;
  }
  return nodemailer.createTransport({
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
}

// Webhook trigger isolated by user
async function triggerWebhooks(userId, eventType, payload) {
  try {
    const webhooks = await loadWebhooks(userId);
    const matchingWebhooks = webhooks.filter(wh => wh.events.includes(eventType) || wh.events.includes('*'));
    
    for (const wh of matchingWebhooks) {
      (async () => {
        const startTime = Date.now();
        let status = 'failed';
        let statusCode = null;
        let responseBody = '';
        let latency = 0;
        
        try {
          const response = await fetch(wh.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sumer-Signature': wh.secret || 'whsec_default',
              'User-Agent': 'SumerSend-Webhook-Dispatcher/1.0'
            },
            body: JSON.stringify({
              event: eventType,
              created: new Date().toISOString(),
              data: payload
            })
          });
          
          statusCode = response.status;
          latency = Date.now() - startTime;
          responseBody = await response.text();
          
          if (response.ok) {
            status = 'success';
          }
        } catch (err) {
          latency = Date.now() - startTime;
          responseBody = err.message || 'Connection refused or timeout';
        }
        
        const logs = await loadWebhookLogs(userId);
        logs.unshift({
          id: 'whlog_' + Math.random().toString(36).substring(2, 15),
          webhookId: wh.id,
          url: wh.url,
          event: eventType,
          status,
          statusCode,
          responseBody: responseBody.substring(0, 250),
          latency,
          timestamp: new Date().toISOString()
        });
        await saveWebhookLogs(userId, logs.slice(0, 100));
      })().catch(e => console.error(`Error in webhook post task for user ${userId}:`, e));
    }
  } catch (err) {
    console.error(`Error triggering webhooks for user ${userId}:`, err);
  }
}

// OTP Session Storage Map (User ID -> OTP Details)
const activeSecurityOTPs = {};

// ----------------------------------------------------
// Public Authentication Routes
// ----------------------------------------------------
app.use('/api/auth', authRouter);

// Health check (public)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    region: 'Baghdad (Iraq)',
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// Secure Dashboard APIs (Require Session JWT)
// ----------------------------------------------------
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path === '/health') {
    return next();
  }
  return authMiddleware(req, res, next);
});

// GET /api/apikeys
app.get('/api/apikeys', async (req, res) => {
  try {
    const keys = await loadApiKeys(req.user.id);
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load API keys.' });
  }
});

// POST /api/apikeys
app.post('/api/apikeys', async (req, res) => {
  const { name, scope } = req.body;
  const userId = req.user.id;
  
  try {
    const keys = await loadApiKeys(userId);
    
    const randomHex = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const generatedKey = `sm_${scope === 'full' ? 'live' : 'send'}_${randomHex}`;

    const newKey = {
      id: Date.now().toString(),
      name: name || 'API Key',
      key: generatedKey,
      scope: scope || 'full',
      createdAt: new Date().toISOString()
    };

    keys.push(newKey);
    await saveApiKeys(userId, keys);
    res.json(newKey);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create API key.' });
  }
});

// DELETE /api/apikeys/:id
app.delete('/api/apikeys/:id', async (req, res) => {
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
app.get('/api/smtp/config', async (req, res) => {
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
app.post('/api/smtp/config', async (req, res) => {
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
app.post('/api/smtp/test', async (req, res) => {
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
      id: `test_${Math.random().toString(36).substring(2, 15)}`,
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
      id: `test_${Math.random().toString(36).substring(2, 15)}`,
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

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await loadLogs(req.user.id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load logs.' });
  }
});

// DELETE /api/logs
app.delete('/api/logs', async (req, res) => {
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
app.get('/api/bootstrap', async (req, res) => {
  try {
    const data = await bootstrapUserData(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(`Bootstrap error for user ${req.user.id}:`, err);
    res.status(500).json({ error: 'Failed to bootstrap dashboard data.' });
  }
});

// GET /api/wallet
app.get('/api/wallet', async (req, res) => {
  try {
    const wallet = await loadWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load wallet info.' });
  }
});

// POST /api/wallet/topup
app.post('/api/wallet/topup', async (req, res) => {
  const { provider, amount, phoneNumber } = req.body;
  if (!provider || !amount || !phoneNumber) {
    return res.status(400).json({ error: 'Missing required top-up parameters.' });
  }
  
  const userId = req.user.id;
  try {
    const wallet = await loadWallet(userId);
    const topUpAmount = parseInt(amount);
    wallet.balance += topUpAmount;
    
    const newTx = {
      id: 'TX' + Math.floor(100000 + Math.random() * 900000).toString(),
      provider,
      amount: topUpAmount,
      status: 'completed',
      date: new Date().toISOString(),
      description: `Wallet top-up via ${provider} (${phoneNumber})`
    };
    wallet.transactions.unshift(newTx);
    await saveWallet(userId, wallet);
    
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform wallet top-up.' });
  }
});

// GET /api/webhooks
app.get('/api/webhooks', async (req, res) => {
  try {
    const webhooks = await loadWebhooks(req.user.id);
    res.json(webhooks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load webhooks.' });
  }
});

// POST /api/webhooks
app.post('/api/webhooks', async (req, res) => {
  const { id, url, events, secret } = req.body;
  if (!url || !events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'url and events (array) are required.' });
  }
  
  const userId = req.user.id;
  try {
    const webhooks = await loadWebhooks(userId);
    let updatedWebhook;
    
    if (id) {
      const idx = webhooks.findIndex(w => w.id === id);
      if (idx !== -1) {
        webhooks[idx] = {
          ...webhooks[idx],
          url,
          events,
          secret: secret || webhooks[idx].secret
        };
        updatedWebhook = webhooks[idx];
      } else {
        return res.status(404).json({ error: 'Webhook not found.' });
      }
    } else {
      updatedWebhook = {
        id: Math.random().toString(36).substring(2, 15),
        url,
        events,
        secret: secret || 'whsec_' + Math.random().toString(36).substring(2, 18),
        createdAt: new Date().toISOString()
      };
      webhooks.push(updatedWebhook);
    }
    
    await saveWebhooks(userId, webhooks);
    res.json(updatedWebhook);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save webhook.' });
  }
});

// DELETE /api/webhooks/:id
app.delete('/api/webhooks/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const webhooks = await loadWebhooks(userId);
    const filtered = webhooks.filter(w => w.id !== req.params.id);
    if (filtered.length === webhooks.length) {
      return res.status(404).json({ error: 'Webhook not found.' });
    }
    await saveWebhooks(userId, filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete webhook.' });
  }
});

// GET /api/webhooks/logs
app.get('/api/webhooks/logs', async (req, res) => {
  try {
    const logs = await loadWebhookLogs(req.user.id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load webhook logs.' });
  }
});

// GET /api/campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await loadCampaigns(req.user.id);
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load campaigns.' });
  }
});

// POST /api/campaigns
app.post('/api/campaigns', async (req, res) => {
  const { name, type, subject, body, recipients, totalCost } = req.body;
  const userId = req.user.id;
  
  try {
    const campaigns = await loadCampaigns(userId);
    
    const newCampaign = {
      id: 'camp_' + Math.floor(100000 + Math.random() * 900000).toString(),
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
    
    campaigns.push(newCampaign);
    await saveCampaigns(userId, campaigns);
    res.json(newCampaign);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign.' });
  }
});

// POST /api/campaigns/:id/status
app.post('/api/campaigns/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, successCount, failedCount, totalCost, recipients } = req.body;
  const userId = req.user.id;
  
  try {
    const campaigns = await loadCampaigns(userId);
    
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    
    if (status) campaigns[index].status = status;
    if (successCount !== undefined) campaigns[index].successCount = successCount;
    if (failedCount !== undefined) campaigns[index].failedCount = failedCount;
    if (totalCost !== undefined) campaigns[index].totalCost = totalCost;
    if (recipients) campaigns[index].recipients = recipients;
    
    await saveCampaigns(userId, campaigns);
    res.json(campaigns[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update campaign status.' });
  }
});

// DELETE /api/campaigns/:id
app.delete('/api/campaigns/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const campaigns = await loadCampaigns(userId);
    const filtered = campaigns.filter(c => c.id !== req.params.id);
    if (filtered.length === campaigns.length) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    await saveCampaigns(userId, filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign.' });
  }
});

// GET /api/templates/custom
app.get('/api/templates/custom', async (req, res) => {
  try {
    const templates = await loadTemplates(req.user.id);
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load custom templates.' });
  }
});

// POST /api/templates/custom
app.post('/api/templates/custom', async (req, res) => {
  const { id, nameAr, nameEn, descAr, descEn, subjectAr, subjectEn, body, icon, variables, type } = req.body;
  const userId = req.user.id;
  
  try {
    const templates = await loadTemplates(userId);
    
    if (id) {
      const idx = templates.findIndex(t => t.id === id);
      if (idx !== -1) {
        templates[idx] = {
          ...templates[idx],
          nameAr: nameAr || templates[idx].nameAr,
          nameEn: nameEn || templates[idx].nameEn,
          descAr: descAr !== undefined ? descAr : templates[idx].descAr,
          descEn: descEn !== undefined ? descEn : templates[idx].descEn,
          subjectAr: subjectAr !== undefined ? subjectAr : templates[idx].subjectAr,
          subjectEn: subjectEn !== undefined ? subjectEn : templates[idx].subjectEn,
          body: body !== undefined ? body : templates[idx].body,
          icon: icon || templates[idx].icon,
          variables: variables || templates[idx].variables,
          type: type || templates[idx].type
        };
        await saveTemplates(userId, templates);
        return res.json(templates[idx]);
      }
    }

    const newTemplate = {
      id: id || 'temp_cust_' + Math.floor(100000 + Math.random() * 900000).toString(),
      nameAr: nameAr || 'قالب مخصص',
      nameEn: nameEn || 'Custom Template',
      descAr: descAr || '',
      descEn: descEn || '',
      subjectAr: subjectAr || '',
      subjectEn: subjectEn || '',
      body: body || '',
      icon: icon || '📝',
      variables: variables || [],
      type: type || 'sms'
    };
    
    templates.push(newTemplate);
    await saveTemplates(userId, templates);
    res.json(newTemplate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save template.' });
  }
});

// DELETE /api/templates/custom/:id
app.delete('/api/templates/custom/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const templates = await loadTemplates(userId);
    const filtered = templates.filter(t => t.id !== req.params.id);
    if (filtered.length === templates.length) {
      return res.status(404).json({ error: 'Template not found.' });
    }
    await saveTemplates(userId, filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete template.' });
  }
});

// GET /api/security/config
app.get('/api/security/config', async (req, res) => {
  try {
    const config = await loadSecurityConfig(req.user.id);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load security config.' });
  }
});

// POST /api/security/config
app.post('/api/security/config', async (req, res) => {
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
app.post('/api/security/verify-phone', async (req, res) => {
  const { phone } = req.body;
  const userId = req.user.id;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  
  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    activeSecurityOTPs[userId] = {
      phone,
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    console.log(`Security OTP generated for user ${userId} (${phone}): ${otpCode}`);

    const securityLog = {
      id: `sms_${Math.random().toString(36).substring(2, 15)}`,
      type: 'sms',
      from: 'Sumer Send Security',
      to: phone,
      body: `رمز التحقق الخاص بك لتأمين حساب سومر سيند هو: ${otpCode}. لا تشارك هذا الرمز مع أي شخص.`,
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, securityLog);
    triggerWebhooks(userId, 'sms.delivered', securityLog);
    
    res.json({ success: true, otp: otpCode, log: securityLog });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate phone verification.' });
  }
});

// POST /api/security/confirm-otp
app.post('/api/security/confirm-otp', async (req, res) => {
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

// WhatsApp endpoints per-user
app.get('/api/whatsapp/status', (req, res) => {
  res.json(getWhatsAppStatus(req.user.id));
});

app.post('/api/whatsapp/logout', async (req, res) => {
  await logoutWhatsApp(req.user.id);
  res.json({ success: true });
});


// ----------------------------------------------------
// Protected /v1/ Public APIs (Authenticate via API keys)
// ----------------------------------------------------

// Middleware for public APIs
// Simple in-memory API key cache with TTL (15 seconds) to boost throughput and avoid database read load on concurrent bursts
const apiKeyCache = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds

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

// Input validation regex helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

// Basrah & general Iraqi phone prefix: Optional (+964, 00964, 0) followed by 75, 77, 78, 79 then 8 digits
const IRAQI_PHONE_REGEX = /^(?:\+964|00964|0)?7[5789]\d{8}$/;
function isValidIraqiPhone(phone) {
  return IRAQI_PHONE_REGEX.test(phone);
}

// POST /v1/emails
app.post('/v1/emails', publicApiAuth, async (req, res) => {
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

  let config;
  let transporter;
  try {
    config = await loadSmtpConfig(userId);
    transporter = createTransporter(config);
  } catch (err) {
    console.error('SMTP Config error:', err);
  }
  
  if (!transporter) {
    // Refund the user since sending didn't proceed
    await refundWallet(userId, cost, `Refund: SMTP not configured for Email to ${to}`);
    
    const failedLog = {
      id: `msg_${Math.random().toString(36).substring(2, 15)}`,
      type: 'email',
      from: from || (config && config.from) || 'onboarding@sumersend.com',
      to,
      subject,
      body: html,
      status: 'failed',
      error: 'SMTP settings are not configured on the server.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, failedLog);
    triggerWebhooks(userId, 'email.failed', failedLog);
    return res.status(500).json({
      error: {
        message: 'SMTP settings are not configured on the server. Please setup SMTP in settings.',
        type: 'server_configuration_error'
      }
    });
  }
  
  try {
    const info = await transporter.sendMail({
      from: from || config.from,
      to,
      subject,
      html
    });
    
    console.log(`Email delivered to ${to} for user ${userId}. Message ID: ${info.messageId}`);
    
    const successLog = {
      id: `msg_${Math.random().toString(36).substring(2, 15)}`,
      type: 'email',
      from: from || config.from,
      to,
      subject,
      body: html,
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, successLog);
    triggerWebhooks(userId, 'email.delivered', successLog);
    res.json(successLog);
  } catch (error) {
    console.error('Email delivery failed:', error);
    
    // Refund the user
    await refundWallet(userId, cost, `Refund: Delivery failure for Email to ${to}`);
    
    const failedLog = {
      id: `msg_${Math.random().toString(36).substring(2, 15)}`,
      type: 'email',
      from: from || 'onboarding@sumersend.com',
      to,
      subject,
      body: html,
      status: 'failed',
      error: error.message || 'SMTP delivery failure.',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, failedLog);
    triggerWebhooks(userId, 'email.failed', failedLog);
    
    res.status(500).json({
      error: {
        message: error.message || 'SMTP delivery failure.',
        type: 'provider_delivery_error'
      }
    });
  }
});

// POST /v1/sms
app.post('/v1/sms', publicApiAuth, async (req, res) => {
  const { to, body } = req.body;
  const userId = req.apiKeyOwner.id;
  
  if (!to || !body) {
    return res.status(400).json({ error: 'to and body parameters are required.' });
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

  try {
    console.log(`SMS Simulated dispatch to ${to} for user ${userId}: ${body}`);
    
    const logEntry = {
      id: `sms_${Math.random().toString(36).substring(2, 15)}`,
      type: 'sms',
      from: 'Sumer Send API',
      to,
      body,
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, logEntry);
    triggerWebhooks(userId, 'sms.delivered', logEntry);
    res.json(logEntry);
  } catch (err) {
    // Refund user on unexpected error
    await refundWallet(userId, cost, `Refund: Delivery execution failure for SMS to ${to}`);
    res.status(500).json({ error: 'SMS sending execution failed.' });
  }
});

// POST /v1/whatsapp
app.post('/v1/whatsapp', publicApiAuth, async (req, res) => {
  const { to, body } = req.body;
  const userId = req.apiKeyOwner.id;
  
  if (!to || !body) {
    return res.status(400).json({ error: 'to and body parameters are required.' });
  }

  if (!isValidIraqiPhone(to)) {
    return res.status(400).json({ error: 'Invalid recipient phone number format. Must be a valid Iraqi mobile number.' });
  }

  const waStatus = getWhatsAppStatus(userId);
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

  try {
    await sendWhatsAppMessage(userId, to, body);
    console.log(`WhatsApp Actual dispatch to ${to} for user ${userId}: ${body}`);
    
    const logEntry = {
      id: `wa_${Math.random().toString(36).substring(2, 15)}`,
      type: 'whatsapp',
      from: 'Sumer Send API',
      to,
      body,
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, logEntry);
    triggerWebhooks(userId, 'whatsapp.delivered', logEntry);
    res.json(logEntry);
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    
    // Refund user
    await refundWallet(userId, cost, `Refund: Delivery failure for WhatsApp to ${to}`);

    const failedLog = {
      id: `wa_${Math.random().toString(36).substring(2, 15)}`,
      type: 'whatsapp',
      from: 'Sumer Send API',
      to,
      body,
      status: 'failed',
      error: error.message || 'WhatsApp sending failed',
      timestamp: new Date().toISOString()
    };
    await appendLog(userId, failedLog);
    triggerWebhooks(userId, 'whatsapp.failed', failedLog);
    return res.status(500).json({ error: 'WhatsApp sending failed' });
  }
});


// Start server and initialize all sockets if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Sumer Send Server running on port ${PORT}`);
    initializeAllWhatsAppConnections();

    // Keep-alive / Self-ping routine to prevent Render containers from idling/sleeping
    const selfPingUrl = process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${PORT}`;
    console.log(`Keep-alive self-pinging configured for: ${selfPingUrl}`);
    setInterval(async () => {
      try {
        const res = await fetch(`${selfPingUrl}/health`);
        console.log(`[Keep-Alive] Pinged health endpoint: ${res.status} ${res.statusText}`);
      } catch (err) {
        console.warn(`[Keep-Alive] Ping failed:`, err.message);
      }
    }, 10 * 60 * 1000); // every 10 minutes (Render timeout is 15 minutes)
  });
}

export default app;
