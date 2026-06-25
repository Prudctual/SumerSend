import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';

export async function connectToWhatsApp(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      throw new Error(`WhatsApp service returned status ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[WhatsApp Client] Error in connectToWhatsApp for user ${userId}:`, err.message);
    return null;
  }
}

export async function getWhatsAppStatus(userId) {
  if (!userId) return { connected: false, qr: null };
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/status/${userId}`);
    if (!res.ok) {
      throw new Error(`WhatsApp service returned status ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[WhatsApp Client] Error getting WhatsApp status for user ${userId}:`, err.message);
    return { connected: false, qr: null };
  }
}

export async function sendWhatsAppMessage(userId, to, body) {
  if (!userId) throw new Error('User ID is required for WhatsApp dispatch.');
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, to, body })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || `WhatsApp service returned status ${res.status}`);
    }
    return data.result;
  } catch (err) {
    console.error(`[WhatsApp Client] Failed to send WhatsApp message for user ${userId}:`, err.message);
    throw err;
  }
}

export async function logoutWhatsApp(userId) {
  if (!userId) return;
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      throw new Error(`WhatsApp service returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`[WhatsApp Client] Error logging out WhatsApp for user ${userId}:`, err.message);
    return null;
  }
}

export async function initializeAllWhatsAppConnections() {
  try {
    const res = await fetch(`${WHATSAPP_SERVICE_URL}/initialize-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`WhatsApp service returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('[WhatsApp Client] Failed to initialize all WhatsApp connections:', err.message);
    return null;
  }
}
