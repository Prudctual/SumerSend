import { supabase } from './db.js';

/**
 * Dispatches an SMS using the configured SMS gateway.
 * Supports Twilio, Zain/Asiacell (bulk SMS protocols), and a mock provider.
 * 
 * @param {string} userId - User ID of the config owner
 * @param {string} recipient - Phone number in Iraqi or international format
 * @param {string} message - Message body
 */
export async function sendSmsMessage(userId, recipient, message) {
  // Fetch SMS configuration for the user
  const { data: config, error } = await supabase
    .from('sms_configs')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load SMS config: ${error.message}`);
  }

  // Default to mock if not configured
  const provider = config ? config.provider : 'mock';
  const apiKey = config ? config.api_key : '';
  const apiSecret = config ? config.api_secret : '';
  const senderId = config ? config.sender_id : 'SumerSend';

  console.log(`[SMS Service] Sending SMS via provider [${provider}] to ${recipient}`);

  if (provider === 'mock') {
    // Simulated SMS send (useful for local development and testing)
    console.log(`[SMS Mock] Simulated dispatch to ${recipient}: ${message}`);
    return { success: true, provider: 'mock', messageId: `mock_${Math.random().toString(36).substring(2, 12)}` };
  }

  if (provider === 'twilio') {
    if (!apiKey || !apiSecret) {
      throw new Error('Twilio credentials (Account SID and Auth Token) are missing.');
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${apiKey}/Messages.json`;
    const authString = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const params = new URLSearchParams({
      To: recipient,
      From: senderId || '+1234567890', // Default Twilio fallback number
      Body: message
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(`Twilio API Error: ${resData.message || response.statusText}`);
    }

    return { success: true, provider: 'twilio', messageId: resData.sid };
  }

  if (provider === 'zain' || provider === 'asiacell') {
    if (!apiKey || !apiSecret) {
      throw new Error(`${provider} credentials (Username/Password) are missing.`);
    }

    // Standard regional bulk SMS Gateway API format (HTTP POST)
    // Customize endpoint according to the telecom provider specifications
    const gatewayUrl = provider === 'zain' 
      ? 'https://api.zainsms.com/send' 
      : 'https://api.asiacellsms.com/send';

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: apiKey,
        password: apiSecret,
        sender: senderId,
        mobile: recipient,
        message: message,
        encoding: 'utf-8'
      })
    });

    const resText = await response.text();
    if (!response.ok) {
      throw new Error(`${provider} API Error (Status: ${response.status}): ${resText}`);
    }

    return { success: true, provider, response: resText };
  }

  throw new Error(`Unsupported SMS provider: ${provider}`);
}
