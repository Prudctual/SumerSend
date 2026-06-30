import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { redisClient } from './redis.js';
import { messageQueue, webhookQueue } from './queue.js';

dotenv.config();

// Prevent server auto-start in index.js
process.env.VERCEL = 'true';

// Import the express app dynamically to ensure VERCEL env var is set first
const { default: app } = await import('./index.js');

const JWT_SECRET = process.env.JWT_SECRET || 'sumer-send-default-jwt-secret-key-12345';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

test('Security Verification Suite', async (t) => {
  let server;
  let port;
  let baseUrl;

  t.before(() => {
    return new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
    });
  });

  t.after(async () => {
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
    try {
      await redisClient.disconnect();
    } catch (err) {
      // ignore
    }
    try {
      await messageQueue.close();
    } catch (err) {
      // ignore
    }
    try {
      await webhookQueue.close();
    } catch (err) {
      // ignore
    }
  });

  await t.test('1. Unauthorized DB client access is blocked by RLS / Gateway', async () => {
    // Attempting to read wallets table with invalid key
    const anonClient = createClient(SUPABASE_URL, 'invalid-key');
    const { error } = await anonClient.from('wallets').select('*');
    assert.ok(error, 'Access with invalid key should return an error');

    // Test direct REST call with no headers/invalid api key
    const res = await fetch(`${SUPABASE_URL}/rest/v1/wallets`, {
      method: 'GET',
      headers: { 'apikey': 'invalid-key' }
    });
    assert.strictEqual(res.status, 401, 'Should block unauthorized REST access');
  });

  await t.test('2. Signup validation - Missing fields are rejected', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }) // Missing password/name
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'All fields (email, password, name) are required.');
  });

  await t.test('3. Login validation - Missing fields are rejected', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }) // Missing password
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'Email and password are required.');
  });

  await t.test('4. Login validation - Wrong credentials are rejected', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrong' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'Invalid email or password.');
  });

  await t.test('5. Auth middleware - Request without token is rejected', async () => {
    const res = await fetch(`${baseUrl}/api/me`, {
      method: 'GET'
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'Unauthorized access. No session token provided.');
  });

  await t.test('6. Auth middleware - Manipulated/invalid token is rejected', async () => {
    // Generate token with wrong secret
    const badToken = jwt.sign({ userId: 'usr_keebiws3ee' }, 'wrong-secret-key-999', { expiresIn: '7d' });
    const res = await fetch(`${baseUrl}/api/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${badToken}` }
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'Session expired or token invalid.');
  });

  await t.test('7. Auth middleware - Expired token is rejected', async () => {
    // Generate expired token
    const expiredToken = jwt.sign({ userId: 'usr_keebiws3ee' }, JWT_SECRET, { expiresIn: '-10s' });
    const res = await fetch(`${baseUrl}/api/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'Session expired or token invalid.');
  });

  await t.test('8. Webhook top-up - Missing signature is rejected', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/topup/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_keebiws3ee', amount: 1000 })
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'Missing webhook signature.');
  });

  await t.test('9. Webhook top-up - Invalid signature is rejected', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/topup/webhook`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-gateway-signature': 'bad-signature'
      },
      body: JSON.stringify({ userId: 'usr_keebiws3ee', amount: 1000 })
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'Invalid webhook signature.');
  });

  await t.test('10. Webhook top-up - Duplicate transactionId check', async () => {
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Create a dummy transaction ID that we will insert
    let testTxId = `TX_TEST_DUP_${crypto.randomUUID()}`;
    
    const { error: insertError } = await serviceClient.from('transactions').insert({
      id: testTxId,
      user_id: 'usr_keebiws3ee',
      provider: 'TestProvider',
      amount: 1000,
      status: 'completed',
      description: 'Idempotency test transaction'
    });

    if (insertError) {
      console.warn('Warning: Could not insert test transaction, attempting lookup of any existing transaction ID instead.');
      const { data: existingTxs } = await serviceClient.from('transactions').select('id').limit(1);
      if (existingTxs && existingTxs.length > 0) {
        testTxId = existingTxs[0].id;
      } else {
        throw new Error('Could not setup or find a transaction ID for idempotency test: ' + insertError.message);
      }
    }

    // Construct payload containing the duplicate transaction ID
    const payload = {
      userId: 'usr_keebiws3ee',
      provider: 'TestProvider',
      amount: 1000,
      txId: testTxId
    };

    const gatewaySecret = process.env.PAYMENT_GATEWAY_SECRET || 'sumer_send_gateway_secret_key_12345';
    const signature = crypto.createHmac('sha256', gatewaySecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const res = await fetch(`${baseUrl}/api/wallet/topup/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gateway-signature': signature
      },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.error, 'Duplicate transaction ID. This transaction has already been processed.');

    // Clean up
    await serviceClient.from('transactions').delete().eq('id', testTxId);
  });
});
