import express from 'express';
import { 
  getWhatsAppStatus, 
  logoutWhatsApp 
} from '../whatsapp.js';
import {
  loadLogs,
  saveLogs,
  appendLog,
  loadSmtpConfig,
  saveSmtpConfig,
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
  chargeWallet
} from '../db.js';
import {
  createTransporter,
  triggerWebhooks,
  activeSecurityOTPs,
  isValidEmail
} from '../utils.js';

const apiRouter = express.Router();

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
apiRouter.get('/logs', async (req, res) => {
  try {
    const logs = await loadLogs(req.user.id);
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

// POST /api/wallet/topup
apiRouter.post('/wallet/topup', async (req, res) => {
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
        secret: secret || 'sumer_wh_' + Math.random().toString(36).substring(2, 18),
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
apiRouter.delete('/webhooks/:id', async (req, res) => {
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
apiRouter.post('/campaigns/:id/status', async (req, res) => {
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
apiRouter.delete('/campaigns/:id', async (req, res) => {
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
apiRouter.delete('/templates/custom/:id', async (req, res) => {
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
      id: `sub_${Math.random().toString(36).substring(2, 15)}`,
      email,
      name,
      phone: phone || null,
      metadata: metadata || {},
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
  const { welcomeEnabled, welcomeSubject, welcomeBody } = req.body;
  try {
    const success = await saveSubscriberSettings(req.user.id, {
      welcomeEnabled: !!welcomeEnabled,
      welcomeSubject: welcomeSubject || 'Welcome to our newsletter!',
      welcomeBody: welcomeBody || 'Hello {name},\n\nThank you for subscribing!\n\nBest regards.'
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
        id: `sub_${Math.random().toString(36).substring(2, 15)}`,
        email: normalizedEmail,
        name: s.name ? String(s.name).trim() : null,
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
            // Build queue items
            const queueItems = subsToWelcome.map(sub => {
              const welcomeBody = welcomeBodyTemplate.replace(/{name}/g, sub.name || 'there').replace(/{email}/g, sub.email);
              return {
                id: `msg_${Math.random().toString(36).substring(2, 15)}`,
                user_id: userId,
                type: 'email',
                recipient: sub.email,
                subject: welcomeSubject,
                body: welcomeBody,
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
            const welcomeBody = welcomeBodyTemplate.replace(/{name}/g, sub.name || 'there').replace(/{email}/g, sub.email);
            return {
              id: `msg_${Math.random().toString(36).substring(2, 15)}`,
              type: 'email',
              from: fromSender,
              to: sub.email,
              subject: welcomeSubject,
              body: welcomeBody,
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

    // 2. Queue Welcome Email if enabled
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
        name: name || '',
        phone: phone || ''
      }
    });

  } catch (err) {
    console.error('Public subscription opt-in error:', err);
    res.status(500).json({ error: 'Failed to complete subscription request.' });
  }
});

export { apiRouter };
