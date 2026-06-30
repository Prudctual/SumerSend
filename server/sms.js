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

  if (provider === 'httpsms') {
    if (!apiKey) {
      throw new Error('httpSMS API Key is missing.');
    }
    if (!senderId) {
      throw new Error('httpSMS Sender ID (From Phone Number) is missing.');
    }

    // Helper to format phone number to E.164 (+964...)
    const formatE164 = (phone) => {
      if (!phone) return '';
      let cleaned = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, hyphens, parentheses
      if (cleaned.startsWith('+')) return cleaned;
      if (cleaned.startsWith('00')) return '+' + cleaned.substring(2);
      if (cleaned.startsWith('07')) return '+964' + cleaned.substring(1);
      if (cleaned.startsWith('7') && cleaned.length === 10) return '+964' + cleaned;
      if (cleaned.startsWith('964')) return '+' + cleaned;
      return '+' + cleaned;
    };

    const formattedFrom = formatE164(senderId);
    const formattedTo = formatE164(recipient);

    console.log(`[SMS Service] Sending via httpSMS: from="${formattedFrom}" to="${formattedTo}" message="${message}"`);

    // Default to the official httpSMS API URL if apiSecret is not specified (e.g. for self-hosting)
    const baseUrl = apiSecret ? apiSecret.replace(/\/$/, '') : 'https://api.httpsms.com';
    const gatewayUrl = `${baseUrl}/v1/messages/send`;

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message,
        from: formattedFrom,
        to: formattedTo
      })
    });

    const resData = await response.json();
    if (!response.ok) {
      const details = resData.errors ? JSON.stringify(resData.errors) : (resData.message || JSON.stringify(resData));
      throw new Error(`httpSMS API Error (Status: ${response.status}): ${details}`);
    }

    return { success: true, provider: 'httpsms', messageId: resData.data?.id || resData.id || 'httpsms_sent' };
  }

  if (provider === 'otpiq') {
    if (!apiKey) {
      throw new Error('OTPIQ API Key is missing.');
    }

    // Helper to format phone number to OTPIQ format: 9647XXXXXXXX (no '+' sign)
    const formatOtpiqPhone = (phone) => {
      if (!phone) return '';
      let cleaned = phone.replace(/[\s\-\(\)\+]/g, ''); // Remove spaces, hyphens, parentheses, and plus sign
      if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
      if (cleaned.startsWith('07')) cleaned = '964' + cleaned.substring(1);
      if (cleaned.startsWith('7') && cleaned.length === 10) cleaned = '964' + cleaned;
      return cleaned;
    };

    const formattedTo = formatOtpiqPhone(recipient);

    console.log(`[SMS Service] Sending via OTPIQ: to="${formattedTo}" message="${message}" senderId="${senderId || 'default'}"`);

    const response = await fetch('https://api.otpiq.com/api/sms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: formattedTo,
        smsType: 'custom',
        customMessage: message,
        senderId: senderId || undefined,
        provider: 'sms'
      })
    });

    const resData = await response.json();
    if (!response.ok) {
      const details = resData.errors ? JSON.stringify(resData.errors) : (resData.message || JSON.stringify(resData));
      throw new Error(`OTPIQ API Error (Status: ${response.status}): ${details}`);
    }

    return { success: true, provider: 'otpiq', messageId: resData.smsId || resData.id || 'otpiq_sent' };
  }

  throw new Error(`Unsupported SMS provider: ${provider}`);
}
