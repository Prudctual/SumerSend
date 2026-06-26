import crypto from 'crypto';
import { supabase } from './db.js';
import { startQueueWorker, stopQueueWorker } from './worker.js';
import { queueMessageJob, messageQueue, webhookQueue } from './queue.js';
import { redisClient } from './redis.js';

// Save original global fetch to pass through database requests to Supabase
const originalFetch = globalThis.fetch;

// Mock WhatsApp service HTTP responses
globalThis.fetch = async function (url, options) {
  const urlStr = url.toString();
  
  // Intercept WhatsApp service URLs
  if (urlStr.includes('http://localhost:3001') || urlStr.includes('whatsapp-service')) {
    console.log(`[Mock HTTP Interceptor] Intercepted WhatsApp Service request: ${urlStr}`);
    
    if (urlStr.includes('/status/')) {
      return new Response(JSON.stringify({ connected: true, qr: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (urlStr.includes('/send')) {
      const body = JSON.parse(options.body);
      const recipient = body.to;
      
      console.log(`[Mock HTTP Interceptor] Send WhatsApp message request to: ${recipient}`);
      
      // 1. Success WhatsApp number
      if (recipient.includes('9647700000000')) {
        return new Response(JSON.stringify({ result: { messageId: 'wa_msg_success_' + crypto.randomUUID() } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 2. Unregistered WhatsApp number (permanent error)
      if (recipient.includes('9647700000001')) {
        return new Response(JSON.stringify({ error: 'Number is not registered on WhatsApp' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 3. Temporary failure number
      if (recipient.includes('9647700000002')) {
        // We can simulate temporary error
        return new Response(JSON.stringify({ error: 'Connection lost' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (urlStr.includes('/initialize-all')) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Pass through all other requests (like Supabase API)
  return originalFetch.apply(this, arguments);
};

// Main test function
async function runTests() {
  console.log('====================================================');
  console.log('🚀 Starting Sumer Send Queue & Failover Integration Tests');
  console.log('====================================================');

  // 1. Fetch an existing user from the database to run the tests under
  const { data: users, error: userErr } = await supabase.from('users').select('id, email').limit(1);
  if (userErr || !users || users.length === 0) {
    console.error('❌ Failed to find an existing user in the database. Please sign up a user first.');
    process.exit(1);
  }
  
  const testUser = users[0];
  const userId = testUser.id;
  console.log(`👤 Using existing database user: ${testUser.email} (${userId})`);

  // Clear previous Redis keys for this user to start with a clean slate
  const redisKey = `wa_queue:next_available_time:${userId}`;
  await redisClient.del(redisKey);
  console.log('🧹 Cleaned Redis keys for WhatsApp Leaky Bucket.');

  // Completely obliterate the BullMQ queues to wipe out any old jobs from previous runs
  await messageQueue.obliterate({ force: true }).catch(err => console.log('Message queue obliterate note:', err.message));
  await webhookQueue.obliterate({ force: true }).catch(err => console.log('Webhook queue obliterate note:', err.message));
  console.log('🧹 Obliterated BullMQ queues.');

  // Delete any existing messages for this test user in message_queue to ensure 100% clean test environment
  await supabase.from('message_queue').delete().eq('user_id', userId);
  console.log('🧹 Cleaned database message_queue for this user.');

  // Start the background queue worker
  startQueueWorker();
  console.log('⚙️ Background queue worker started.');

  try {
    // ----------------------------------------------------
    // Test 1: WhatsApp Leaky Bucket Jitter and Rate Limiting
    // ----------------------------------------------------
    console.log('\n----------------------------------------------------');
    console.log('🧪 TEST 1: WhatsApp Leaky Bucket Jitter & Rate Limiting');
    console.log('----------------------------------------------------');

    const msgIds = [];
    const delays = [];

    for (let i = 0; i < 3; i++) {
      const msgId = crypto.randomUUID();
      // Insert WhatsApp message in DB
      await supabase.from('message_queue').insert({
        id: msgId,
        user_id: userId,
        type: 'whatsapp',
        recipient: '9647700000000', // Success mock number
        body: `Test Leaky Bucket message ${i + 1}`,
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        metadata: { priority: 'normal' }
      });

      // Queue in BullMQ and measure the assigned delay
      const job = await queueMessageJob(msgId, { priority: 'normal' });
      delays.push(job.opts.delay || 0);
      msgIds.push(msgId);
    }

    console.log(`📊 Measured Jitter Delays for 3 sequential messages:`);
    console.log(`   Message 1: ${delays[0]}ms (Expected: 0ms)`);
    console.log(`   Message 2: ${delays[1]}ms (Expected: 5000ms - 10000ms)`);
    console.log(`   Message 3: ${delays[2]}ms (Expected: 10000ms - 20000ms)`);

    if (delays[0] === 0 && delays[1] >= 5000 && delays[2] >= 10000) {
      console.log('✅ TEST 1 PASSED: Leaky Bucket correctly spaced out messages in Redis.');
    } else {
      console.log('❌ TEST 1 FAILED: Delay spacing was incorrect.');
    }

    // Wait for the worker to process these messages (around 32-35 seconds since they are delayed in Redis)
    console.log('⏳ Waiting for worker to process delayed Leaky Bucket messages (this will take ~35s)...');
    await new Promise(resolve => setTimeout(resolve, 35000));

    // Verify messages are completed in Supabase
    const { data: dbMsgs } = await supabase.from('message_queue').select('status').in('id', msgIds);
    console.log('📊 Message statuses in DB:', dbMsgs.map(m => m.status));
    
    if (dbMsgs.every(m => m.status === 'completed')) {
      console.log('✅ TEST 1.1 PASSED: All leaky bucket messages were successfully sent by the worker.');
    } else {
      console.log('❌ TEST 1.1 FAILED: Some messages did not complete.');
    }

    // ----------------------------------------------------
    // Test 2: High-Priority OTP Bypassing Delay
    // ----------------------------------------------------
    console.log('\n----------------------------------------------------');
    console.log('🧪 TEST 2: High-Priority OTP Bypassing Delay');
    console.log('----------------------------------------------------');
    
    // Set a large delay in Redis to simulate busy queue
    await redisClient.set(redisKey, (Date.now() + 60000).toString()); // 60 seconds busy
    console.log('⏳ Simulating a busy queue (next available slot in 60 seconds)...');

    const otpMsgId = crypto.randomUUID();
    await supabase.from('message_queue').insert({
      id: otpMsgId,
      user_id: userId,
      type: 'whatsapp',
      recipient: '9647700000000',
      body: 'Urgent OTP Code: 1234',
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
      metadata: { priority: 'high', isOtp: true }
    });

    const otpJob = await queueMessageJob(otpMsgId, { priority: 'high', isOtp: true });
    console.log(`📊 OTP Job Delay: ${otpJob.opts.delay || 0}ms (Expected: 0ms)`);
    console.log(`📊 OTP Job Priority: ${otpJob.opts.priority} (Expected: 1)`);

    if ((otpJob.opts.delay || 0) === 0 && otpJob.opts.priority === 1) {
      console.log('✅ TEST 2 PASSED: OTP message bypassed queue delay and was scheduled immediately with top priority.');
    } else {
      console.log('❌ TEST 2 FAILED: OTP message did not bypass the delay.');
    }

    // Wait for the OTP to process
    await new Promise(resolve => setTimeout(resolve, 5000));
    const { data: otpDbMsg } = await supabase.from('message_queue').select('status').eq('id', otpMsgId).single();
    console.log(`📊 OTP message status in DB: ${otpDbMsg.status}`);
    
    if (otpDbMsg.status === 'completed') {
      console.log('✅ TEST 2.1 PASSED: OTP message processed successfully by worker.');
    } else {
      console.log('❌ TEST 2.1 FAILED: OTP message did not process.');
    }

    // ----------------------------------------------------
    // Test 3: WhatsApp-to-SMS Failover
    // ----------------------------------------------------
    console.log('\n----------------------------------------------------');
    console.log('🧪 TEST 3: WhatsApp-to-SMS Failover');
    console.log('----------------------------------------------------');

    const failoverMsgId = crypto.randomUUID();
    
    // Charge user's wallet manually first to ensure they have enough balance (need at least 150 for WA)
    // Wallets are initialized with 50000 by default, so they definitely have enough.
    
    await supabase.from('message_queue').insert({
      id: failoverMsgId,
      user_id: userId,
      type: 'whatsapp',
      recipient: '9647700000001', // This triggers mock unregistered WhatsApp error
      body: 'Important notification. Failover test.',
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
      metadata: { failover_to_sms: true, priority: 'high' }
    });

    // Queue in BullMQ
    await queueMessageJob(failoverMsgId, { priority: 'high' });
    console.log('⚙️ Queued WhatsApp failover message. Worker will process it and encounter unregistered WhatsApp error...');

    // Wait for the failover process: WhatsApp fails -> refunds 150 -> inserts SMS -> charges 120 -> queues SMS -> SMS completes via Mock SMS
    console.log('⏳ Waiting for failover process to complete (approx 3-5s)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 1. Verify WhatsApp status is failed due to failover
    const { data: waDbMsg } = await supabase.from('message_queue').select('*').eq('id', failoverMsgId).single();
    console.log(`📊 Original WhatsApp Status: ${waDbMsg.status}`);
    console.log(`📊 WhatsApp Last Error: ${waDbMsg.last_error}`);

    // 2. Verify new SMS message is created and completed
    const { data: smsDbMsgs } = await supabase
      .from('message_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'sms')
      .order('created_at', { ascending: false });

    const failoverSms = smsDbMsgs.find(m => m.metadata && m.metadata.parent_whatsapp_id === failoverMsgId);
    
    if (waDbMsg.status === 'failed' && failoverSms) {
      console.log(`📊 Failover SMS ID: ${failoverSms.id}`);
      console.log(`📊 Failover SMS Status: ${failoverSms.status}`);
      console.log(`📊 Failover SMS Recipient: ${failoverSms.recipient}`);
      
      if (failoverSms.status === 'completed') {
        console.log('✅ TEST 3 PASSED: WhatsApp-to-SMS Failover completed successfully end-to-end.');
      } else {
        console.log('❌ TEST 3 FAILED: SMS was created but is not completed.');
      }
    } else {
      console.log('❌ TEST 3 FAILED: WhatsApp did not fail or no failover SMS was found.');
    }

  } catch (err) {
    console.error('❌ Test execution encountered an exception:', err);
  } finally {
    // ----------------------------------------------------
    // Cleanup and Shutdown
    // ----------------------------------------------------
    console.log('\n----------------------------------------------------');
    console.log('🧹 Cleaning up and stopping services...');
    console.log('----------------------------------------------------');
    
    // Stop the queue worker
    await stopQueueWorker();
    
    // Restore global fetch
    globalThis.fetch = originalFetch;
    
    // Close Redis client connection
    await redisClient.quit();
    
    console.log('🛑 All services stopped. Tests completed.');
    console.log('====================================================');
    process.exit(0);
  }
}

// Run the suite
runTests();
