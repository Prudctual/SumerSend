import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ WARNING: Supabase credentials are not fully configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.');
}

// Initialize Supabase Client with service role key to bypass RLS policies on the backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// =========================================================================
// 1. User Database Helper Methods
// =========================================================================

export async function loadUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error loading users:', error);
    return [];
  }
  return data.map(u => ({
    id: u.id,
    email: u.email,
    passwordHash: u.password_hash,
    name: u.name,
    createdAt: u.created_at
  }));
}

export async function saveUsers(users) {
  if (!Array.isArray(users) || users.length === 0) return true;
  const dbUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    password_hash: u.passwordHash,
    name: u.name,
    created_at: u.createdAt
  }));
  const { error } = await supabase.from('users').upsert(dbUsers);
  if (error) {
    console.error('Error saving users:', error);
    return false;
  }
  return true;
}

export async function addUser(user) {
  const { error } = await supabase.from('users').insert({
    id: user.id,
    email: user.email,
    password_hash: user.passwordHash,
    name: user.name,
    created_at: user.createdAt
  });
  if (error) {
    console.error('Error adding user:', error);
    throw error;
  }
  return true;
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    passwordHash: data.password_hash,
    name: data.name,
    createdAt: data.created_at
  };
}

export async function getUserById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    passwordHash: data.password_hash,
    name: data.name,
    createdAt: data.created_at
  };
}


// =========================================================================
// 2. Logs Database Helper Methods
// =========================================================================

export async function loadLogs(userId) {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  if (error) {
    console.error(`Error loading logs for user ${userId}:`, error);
    return [];
  }
  return data.map(l => ({
    id: l.id,
    type: l.type,
    from: l.sender,
    to: l.recipient,
    subject: l.subject,
    body: l.body,
    status: l.status,
    error: l.error,
    timestamp: l.timestamp
  }));
}

export async function saveLogs(userId, logs) {
  if (Array.isArray(logs) && logs.length === 0) {
    // Standard request to clear all user logs
    const { error } = await supabase.from('logs').delete().eq('user_id', userId);
    if (error) {
      console.error(`Error clearing logs for user ${userId}:`, error);
      return false;
    }
    return true;
  }

  if (Array.isArray(logs) && logs.length > 0) {
    const dbLogs = logs.map(l => ({
      id: l.id,
      user_id: userId,
      type: l.type,
      sender: l.from,
      recipient: l.to,
      subject: l.subject,
      body: l.body,
      status: l.status,
      error: l.error,
      timestamp: l.timestamp
    }));
    const { error } = await supabase.from('logs').upsert(dbLogs);
    if (error) {
      console.error(`Error saving logs for user ${userId}:`, error);
      return false;
    }
  }
  return true;
}

export async function appendLog(userId, logEntry) {
  const { error } = await supabase.from('logs').insert({
    id: logEntry.id,
    user_id: userId,
    type: logEntry.type,
    sender: logEntry.from,
    recipient: logEntry.to,
    subject: logEntry.subject,
    body: logEntry.body,
    status: logEntry.status,
    error: logEntry.error,
    timestamp: logEntry.timestamp
  });
  if (error) {
    console.error(`Error appending log for user ${userId}:`, error);
  }
}

// =========================================================================
// 3. SMTP Config Database Helper Methods
// =========================================================================

export async function loadSmtpConfig(userId) {
  const { data, error } = await supabase
    .from('smtp_configs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'Sumer Send <onboarding@sumersend.com>'
    };
  }

  return {
    host: data.host || '',
    port: data.port || 587,
    secure: !!data.secure,
    user: data.username || '',
    pass: data.password || '',
    from: data.sender || 'Sumer Send <onboarding@sumersend.com>'
  };
}

export async function saveSmtpConfig(userId, config) {
  const { error } = await supabase.from('smtp_configs').upsert({
    user_id: userId,
    host: config.host,
    port: config.port,
    secure: config.secure,
    username: config.user,
    password: config.pass,
    sender: config.from,
    updated_at: new Date().toISOString()
  });
  if (error) {
    console.error(`Error saving SMTP config for user ${userId}:`, error);
    return false;
  }
  return true;
}

// =========================================================================
// 3.5. SMS Config Database Helper Methods
// =========================================================================

export async function loadSmsConfig(userId) {
  const { data, error } = await supabase
    .from('sms_configs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      provider: 'mock',
      apiKey: '',
      apiSecret: '',
      senderId: 'SumerSend'
    };
  }

  return {
    provider: data.provider || 'mock',
    apiKey: data.api_key || '',
    apiSecret: data.api_secret || '',
    senderId: data.sender_id || 'SumerSend'
  };
}

export async function saveSmsConfig(userId, config) {
  const { error } = await supabase.from('sms_configs').upsert({
    user_id: userId,
    provider: config.provider,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    sender_id: config.senderId,
    updated_at: new Date().toISOString()
  });
  if (error) {
    console.error(`Error saving SMS config for user ${userId}:`, error);
    return false;
  }
  return true;
}

// =========================================================================
// 4. Wallet Database Helper Methods (Ref: lock- atomic operations)
// =========================================================================

export async function loadWallet(userId) {
  let balance = 50000;
  const { data: walletData, error: walletError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (!walletError && walletData) {
    balance = parseFloat(walletData.balance);
  } else {
    // If wallet doesn't exist, create it (safe fallback for older/legacy users)
    await supabase.from('wallets').upsert({ user_id: userId, balance: 50000 });
  }

  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const transactions = txError || !txData ? [] : txData.map(t => ({
    id: t.id,
    provider: t.provider,
    amount: parseFloat(t.amount),
    status: t.status,
    date: t.created_at,
    description: t.description
  }));

  return { balance, transactions };
}

export async function saveWallet(userId, wallet) {
  const { error: walletError } = await supabase.from('wallets').upsert({
    user_id: userId,
    balance: wallet.balance
  });
  if (walletError) {
    console.error(`Error saving wallet balance for user ${userId}:`, walletError);
    return false;
  }

  if (Array.isArray(wallet.transactions) && wallet.transactions.length > 0) {
    const dbTxs = wallet.transactions.map(t => ({
      id: t.id,
      user_id: userId,
      provider: t.provider,
      amount: t.amount,
      status: t.status,
      description: t.description,
      created_at: t.date
    }));
    const { error: txError } = await supabase.from('transactions').upsert(dbTxs);
    if (txError) {
      console.error(`Error saving transactions for user ${userId}:`, txError);
      return false;
    }
  }
  return true;
}

export async function chargeWallet(userId, amount, description, provider = 'Usage') {
  const txId = 'TX' + Math.floor(100000 + Math.random() * 900000).toString();
  
  // Call the atomic postgres function to deduct balance and log transaction under row-lock
  const { data, error } = await supabase.rpc('charge_wallet_atomic', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_provider: provider,
    p_tx_id: txId
  });

  if (error) {
    console.error(`Error executing charge_wallet_atomic RPC for user ${userId}:`, error);
    return false;
  }
  return !!data;
}

export async function refundWallet(userId, amount, description, provider = 'Usage') {
  const txId = 'TX_REF' + Math.floor(100000 + Math.random() * 900000).toString();
  
  // Call the atomic postgres function to refund balance and log transaction under row-lock
  const { data, error } = await supabase.rpc('refund_wallet_atomic', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_provider: provider,
    p_tx_id: txId
  });

  if (error) {
    console.error(`Error executing refund_wallet_atomic RPC for user ${userId}:`, error);
    return false;
  }
  return !!data;
}

export async function bootstrapUserData(userId) {
  const [logs, walletData, apiKeys, webhooks, securityConfig, smtpConfig] = await Promise.all([
    loadLogs(userId),
    loadWallet(userId),
    loadApiKeys(userId),
    loadWebhooks(userId),
    loadSecurityConfig(userId),
    loadSmtpConfig(userId)
  ]);

  return {
    logs,
    wallet: walletData,
    apiKeys,
    webhooks,
    securityConfig,
    smtpConfig
  };
}


// =========================================================================
// 5. Webhook Database Helper Methods
// =========================================================================

export async function loadWebhooks(userId) {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`Error loading webhooks for user ${userId}:`, error);
    return [];
  }
  return data.map(w => ({
    id: w.id,
    url: w.url,
    events: w.events,
    secret: w.secret,
    createdAt: w.created_at
  }));
}

export async function saveWebhooks(userId, webhooks) {
  if (!Array.isArray(webhooks)) return false;

  const remainingIds = webhooks.map(w => w.id).filter(Boolean);

  if (remainingIds.length === 0) {
    const { error: delError } = await supabase.from('webhooks').delete().eq('user_id', userId);
    if (delError) {
      console.error(`Error deleting all webhooks for user ${userId}:`, delError);
      return false;
    }
  } else {
    const { error: delError } = await supabase
      .from('webhooks')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', `(${remainingIds.map(id => `'${id}'`).join(',')})`);
    if (delError) {
      console.error(`Error deleting removed webhooks for user ${userId}:`, delError);
      return false;
    }
  }

  if (webhooks.length > 0) {
    const dbWebhooks = webhooks.map(w => ({
      id: w.id || Math.random().toString(36).substring(2, 15),
      user_id: userId,
      url: w.url,
      events: w.events,
      secret: w.secret,
      created_at: w.createdAt || new Date().toISOString()
    }));
    const { error: upsError } = await supabase.from('webhooks').upsert(dbWebhooks);
    if (upsError) {
      console.error(`Error saving webhooks for user ${userId}:`, upsError);
      return false;
    }
  }
  return true;
}

export async function loadWebhookLogs(userId) {
  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    console.error(`Error loading webhook logs for user ${userId}:`, error);
    return [];
  }
  return data.map(wl => ({
    id: wl.id,
    webhookId: wl.webhook_id,
    url: wl.url,
    event: wl.event,
    status: wl.status,
    statusCode: wl.status_code,
    responseBody: wl.response_body,
    latency: wl.latency,
    timestamp: wl.timestamp
  }));
}

export async function saveWebhookLogs(userId, logs) {
  if (!Array.isArray(logs) || logs.length === 0) return true;
  const dbLogs = logs.map(wl => ({
    id: wl.id,
    webhook_id: wl.webhookId,
    user_id: userId,
    url: wl.url,
    event: wl.event,
    status: wl.status,
    status_code: wl.statusCode,
    response_body: wl.responseBody,
    latency: wl.latency,
    timestamp: wl.timestamp
  }));
  const { error } = await supabase.from('webhook_logs').upsert(dbLogs);
  if (error) {
    console.error(`Error saving webhook logs for user ${userId}:`, error);
    return false;
  }
  return true;
}

// =========================================================================
// 6. Campaign Database Helper Methods
// =========================================================================

export async function loadCampaigns(userId) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error loading campaigns for user ${userId}:`, error);
    return [];
  }
  return data.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    subject: c.subject,
    body: c.body,
    recipientsCount: c.recipients_count,
    successCount: c.success_count,
    failedCount: c.failed_count,
    totalCost: parseFloat(c.total_cost),
    timestamp: c.created_at,
    recipients: c.recipients
  }));
}

export async function saveCampaigns(userId, campaigns) {
  if (!Array.isArray(campaigns)) return false;

  const remainingIds = campaigns.map(c => c.id).filter(Boolean);

  if (remainingIds.length === 0) {
    const { error: delError } = await supabase.from('campaigns').delete().eq('user_id', userId);
    if (delError) {
      console.error(`Error deleting all campaigns for user ${userId}:`, delError);
      return false;
    }
  } else {
    const { error: delError } = await supabase
      .from('campaigns')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', `(${remainingIds.map(id => `'${id}'`).join(',')})`);
    if (delError) {
      console.error(`Error deleting removed campaigns for user ${userId}:`, delError);
      return false;
    }
  }

  if (campaigns.length > 0) {
    const dbCampaigns = campaigns.map(c => ({
      id: c.id,
      user_id: userId,
      name: c.name,
      type: c.type,
      status: c.status,
      subject: c.subject,
      body: c.body,
      recipients_count: c.recipientsCount,
      success_count: c.successCount,
      failed_count: c.failedCount,
      total_cost: c.totalCost,
      recipients: c.recipients,
      created_at: c.timestamp || new Date().toISOString()
    }));
    const { error: upsError } = await supabase.from('campaigns').upsert(dbCampaigns);
    if (upsError) {
      console.error(`Error saving campaigns for user ${userId}:`, upsError);
      return false;
    }
  }
  return true;
}

// =========================================================================
// 7. Template Database Helper Methods
// =========================================================================

export async function loadTemplates(userId) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`Error loading templates for user ${userId}:`, error);
    return [];
  }
  return data.map(t => ({
    id: t.id,
    nameAr: t.name_ar,
    nameEn: t.name_en,
    descAr: t.desc_ar,
    descEn: t.desc_en,
    subjectAr: t.subject_ar,
    subjectEn: t.subject_en,
    body: t.body,
    icon: t.icon,
    variables: t.variables,
    type: t.type
  }));
}

export async function saveTemplates(userId, templates) {
  if (!Array.isArray(templates)) return false;

  const remainingIds = templates.map(t => t.id).filter(Boolean);

  if (remainingIds.length === 0) {
    const { error: delError } = await supabase.from('templates').delete().eq('user_id', userId);
    if (delError) {
      console.error(`Error deleting all templates for user ${userId}:`, delError);
      return false;
    }
  } else {
    const { error: delError } = await supabase
      .from('templates')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', `(${remainingIds.map(id => `'${id}'`).join(',')})`);
    if (delError) {
      console.error(`Error deleting removed templates for user ${userId}:`, delError);
      return false;
    }
  }

  if (templates.length > 0) {
    const dbTemplates = templates.map(t => ({
      id: t.id,
      user_id: userId,
      name_ar: t.nameAr,
      name_en: t.nameEn,
      desc_ar: t.descAr,
      desc_en: t.descEn,
      subject_ar: t.subjectAr,
      subject_en: t.subjectEn,
      body: t.body,
      icon: t.icon,
      variables: t.variables,
      type: t.type
    }));
    const { error: upsError } = await supabase.from('templates').upsert(dbTemplates);
    if (upsError) {
      console.error(`Error saving templates for user ${userId}:`, upsError);
      return false;
    }
  }
  return true;
}

// =========================================================================
// 8. Security Database Helper Methods
// =========================================================================

export async function loadSecurityConfig(userId) {
  const { data, error } = await supabase
    .from('security_configs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      phone: '',
      verified: false,
      requireCampaign2FA: false,
      requireApiKey2FA: false
    };
  }
  return {
    phone: data.phone || '',
    verified: !!data.verified,
    requireCampaign2FA: !!data.require_campaign_2fa,
    requireApiKey2FA: !!data.require_apikey_2fa
  };
}

export async function saveSecurityConfig(userId, config) {
  const { error } = await supabase.from('security_configs').upsert({
    user_id: userId,
    phone: config.phone,
    verified: config.verified,
    require_campaign_2fa: config.requireCampaign2FA,
    require_apikey_2fa: config.requireApiKey2FA
  });
  if (error) {
    console.error(`Error saving security config for user ${userId}:`, error);
    return false;
  }
  return true;
}

// =========================================================================
// 9. API Key Database Helper Methods
// =========================================================================

export async function loadApiKeys(userId) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`Error loading API keys for user ${userId}:`, error);
    return [];
  }
  return data.map(k => ({
    id: k.id,
    name: k.name,
    key: k.key,
    scope: k.scope,
    createdAt: k.created_at
  }));
}

export async function saveApiKeys(userId, keys) {
  if (!Array.isArray(keys)) return false;

  const remainingIds = keys.map(k => k.id).filter(Boolean);

  if (remainingIds.length === 0) {
    const { error: delError } = await supabase.from('api_keys').delete().eq('user_id', userId);
    if (delError) {
      console.error(`Error deleting all API keys for user ${userId}:`, delError);
      return false;
    }
  } else {
    const { error: delError } = await supabase
      .from('api_keys')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', `(${remainingIds.map(id => `'${id}'`).join(',')})`);
    if (delError) {
      console.error(`Error deleting removed API keys for user ${userId}:`, delError);
      return false;
    }
  }

  if (keys.length > 0) {
    const dbKeys = keys.map(k => ({
      id: k.id,
      user_id: userId,
      name: k.name,
      key: k.key,
      scope: k.scope,
      created_at: k.createdAt
    }));
    const { error: upsError } = await supabase.from('api_keys').upsert(dbKeys);
    if (upsError) {
      console.error(`Error saving API keys for user ${userId}:`, upsError);
      return false;
    }
  }
  return true;
}

export async function findUserByApiKey(apiKey) {
  if (!apiKey) return null;
  const { data, error } = await supabase
    .from('api_keys')
    .select('*, users(*)')
    .eq('key', apiKey)
    .maybeSingle();

  if (error || !data || !data.users) return null;

  const user = {
    id: data.users.id,
    email: data.users.email,
    passwordHash: data.users.password_hash,
    name: data.users.name,
    createdAt: data.users.created_at
  };

  const key = {
    id: data.id,
    name: data.name,
    key: data.key,
    scope: data.scope,
    createdAt: data.created_at
  };

  return { user, key };
}

// =========================================================================
// 12. Subscribers Database Helper Methods
// =========================================================================

export async function loadSubscribers(userId) {
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error loading subscribers for user ${userId}:`, error);
    return [];
  }
  return data.map(s => ({
    id: s.id,
    email: s.email,
    name: s.name,
    status: s.status,
    phone: s.phone || '',
    metadata: s.metadata || {},
    createdAt: s.created_at,
    updatedAt: s.updated_at
  }));
}

export async function addSubscriber(userId, subscriber) {
  const { error } = await supabase.from('subscribers').upsert({
    id: subscriber.id || `sub_${Math.random().toString(36).substring(2, 15)}`,
    user_id: userId,
    email: subscriber.email.toLowerCase().trim(),
    name: subscriber.name,
    status: subscriber.status || 'active',
    phone: subscriber.phone || null,
    metadata: subscriber.metadata || {},
    created_at: subscriber.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error(`Error adding subscriber for user ${userId}:`, error);
    throw error;
  }
  return true;
}

export async function updateSubscriberStatus(userId, id, status) {
  const { error } = await supabase
    .from('subscribers')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id);

  if (error) {
    console.error(`Error updating subscriber ${id} for user ${userId}:`, error);
    return false;
  }
  return true;
}

export async function deleteSubscriber(userId, id) {
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);

  if (error) {
    console.error(`Error deleting subscriber ${id} for user ${userId}:`, error);
    return false;
  }
  return true;
}

export async function deleteSubscribersBulk(userId, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return true;
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('user_id', userId)
    .in('id', ids);

  if (error) {
    console.error(`Error bulk deleting subscribers for user ${userId}:`, error);
    return false;
  }
  return true;
}


export async function loadSubscriberSettings(userId) {
  const { data, error } = await supabase
    .from('subscriber_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error(`Error loading subscriber settings for user ${userId}:`, error);
  }

  if (!data) {
    return {
      welcomeEnabled: false,
      welcomeSubject: 'Welcome to our newsletter!',
      welcomeBody: 'Hello {name},\n\nThank you for subscribing to our newsletter!\n\nBest regards.'
    };
  }

  return {
    welcomeEnabled: !!data.welcome_enabled,
    welcomeSubject: data.welcome_subject || 'Welcome to our newsletter!',
    welcomeBody: data.welcome_body || 'Hello {name},\n\nThank you for subscribing to our newsletter!\n\nBest regards.'
  };
}

export async function saveSubscriberSettings(userId, settings) {
  const { error } = await supabase.from('subscriber_settings').upsert({
    user_id: userId,
    welcome_enabled: settings.welcomeEnabled,
    welcome_subject: settings.welcomeSubject,
    welcome_body: settings.welcomeBody,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error(`Error saving subscriber settings for user ${userId}:`, error);
    return false;
  }
  return true;
}

export async function bulkAddSubscribers(userId, subscribers) {
  if (!Array.isArray(subscribers) || subscribers.length === 0) return true;
  
  const dbSubscribers = subscribers.map(s => ({
    id: s.id || `sub_${Math.random().toString(36).substring(2, 15)}`,
    user_id: userId,
    email: s.email.toLowerCase().trim(),
    name: s.name || null,
    status: s.status || 'active',
    phone: s.phone || null,
    metadata: s.metadata || {},
    created_at: s.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  // Chunk upsert into batches of 1000 to prevent gateway timeouts/limitations
  const chunkSize = 1000;
  for (let i = 0; i < dbSubscribers.length; i += chunkSize) {
    const chunk = dbSubscribers.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('subscribers')
      .upsert(chunk, { onConflict: 'user_id, email' });

    if (error) {
      console.error(`Error bulk adding subscribers chunk for user ${userId}:`, error);
      throw error;
    }
  }
  return true;
}

export async function appendLogsBulk(userId, logEntries) {
  if (!Array.isArray(logEntries) || logEntries.length === 0) return true;

  const dbLogs = logEntries.map(l => ({
    id: l.id || `msg_${Math.random().toString(36).substring(2, 15)}`,
    user_id: userId,
    type: l.type,
    sender: l.from,
    recipient: l.to,
    subject: l.subject,
    body: l.body,
    status: l.status,
    error: l.error,
    timestamp: l.timestamp || new Date().toISOString()
  }));

  const chunkSize = 1000;
  for (let i = 0; i < dbLogs.length; i += chunkSize) {
    const chunk = dbLogs.slice(i, i + chunkSize);
    const { error } = await supabase.from('logs').insert(chunk);
    if (error) {
      console.error(`Error bulk inserting logs for user ${userId}:`, error);
      throw error;
    }
  }
  return true;
}



