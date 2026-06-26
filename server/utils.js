import nodemailer from 'nodemailer';
import { loadWebhooks, saveWebhookLogs, loadWebhookLogs } from './db.js';

export function createTransporter(config) {
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
    maxMessages: 100,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
}

export async function triggerWebhooks(userId, eventType, payload) {
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
              'X-Sumer-Signature': wh.secret || 'sumer_wh_default',
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

export const activeSecurityOTPs = {};

export const apiKeyCache = new Map();
export const CACHE_TTL_MS = 15000;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

export const IRAQI_PHONE_REGEX = /^(?:\+964|00964|0)?7[5789]\d{8}$/;
export function isValidIraqiPhone(phone) {
  return IRAQI_PHONE_REGEX.test(phone);
}

export function compileWelcomeMessage(body, name, email) {
  if (!body) return '';
  const fallbackNameAr = 'مشتركنا الكريم';
  const fallbackNameEn = 'Valued Subscriber';
  
  let subName = name && name.trim() ? name.trim() : fallbackNameAr;
  const lowerSub = subName.toLowerCase();
  const defaultPlaceholders = [
    'عضو رائع', 'valued member', 'أحمد علي', 'ahmed ali',
    'مستخدمنا العزيز', 'valued user', 'عميلنا المميز', 'valued customer',
    'عميلنا العزيز', 'قارئنا الكريم', 'valued reader', 'مستلم', 'recipient'
  ];
  if (!subName || defaultPlaceholders.includes(lowerSub)) {
    subName = fallbackNameAr;
  }
  
  const subNameEn = name && name.trim() && !defaultPlaceholders.includes(name.trim().toLowerCase()) ? name.trim() : fallbackNameEn;
  
  return body
    .replace(/\{\{user_name\}\}/g, subName)
    .replace(/\{\{customer_name\}\}/g, subName)
    .replace(/\{\{name\}\}/g, subName)
    .replace(/\{\{username\}\}/g, subName)
    .replace(/\{\{recipient_name\}\}/g, subName)
    .replace(/\{\{reader_name\}\}/g, subName)
    .replace(/\{\{friend_name\}\}/g, subName)
    .replace(/\{\{member_name\}\}/g, subName)
    .replace(/\{\{client_name\}\}/g, subName)
    .replace(/\{\{subscriber_name\}\}/g, subName)
    .replace(/\{user_name\}/g, subName)
    .replace(/\{customer_name\}/g, subName)
    .replace(/\{name\}/g, subName)
    .replace(/\{username\}/g, subName)
    .replace(/\{recipient_name\}/g, subName)
    .replace(/\{reader_name\}/g, subName)
    .replace(/\{friend_name\}/g, subName)
    .replace(/\{member_name\}/g, subName)
    .replace(/\{client_name\}/g, subName)
    .replace(/\{subscriber_name\}/g, subName)
    .replace(/عضو رائع/g, subName)
    .replace(/Valued Member/g, subNameEn)
    .replace(/\{\{email\}\}/g, email || '')
    .replace(/\{email\}/g, email || '');
}
