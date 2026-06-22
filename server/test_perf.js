import fetch from 'node-fetch'; // fallback or global if node matches
import { performance } from 'perf_hooks';

const BACKEND_URL = 'https://sumersend-backend.onrender.com';

async function auditPerformance() {
  console.log('======================================================');
  console.log('     SUMER SEND LIVE API PERFORMANCE AUDIT REPORT     ');
  console.log('======================================================');
  console.log(`Backend Server: ${BACKEND_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const results = {};
  const testEmail = `perf_test_${Math.random().toString(36).substring(2, 8)}@gmail.com`;
  const testPassword = 'Password123!';
  const testName = 'Performance Audit User';
  let jwtToken = '';
  let userId = '';

  try {
    // 1. Connection Ping
    console.log('1. Pinging health endpoint...');
    const t0 = performance.now();
    const pingRes = await fetch(`${BACKEND_URL}/health`);
    const t1 = performance.now();
    results.pingLatency = t1 - t0;
    console.log(`   Status: ${pingRes.status} ${pingRes.statusText}`);
    console.log(`   Ping Latency: ${results.pingLatency.toFixed(2)} ms`);

    // 2. User Registration Latency
    console.log('\n2. Testing User Registration Latency (includes Bcrypt hashing & DB Trigger provisioning)...');
    const t2 = performance.now();
    const regRes = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword, name: testName })
    });
    const t3 = performance.now();
    results.registrationLatency = t3 - t2;
    const regData = await regRes.json();
    console.log(`   Status: ${regRes.status}`);
    console.log(`   Registration Latency: ${results.registrationLatency.toFixed(2)} ms`);
    
    if (regRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    
    jwtToken = regData.token;
    userId = regData.user.id;
    console.log(`   User successfully created (ID: ${userId})`);

    // 3. User Login Latency
    console.log('\n3. Testing User Login Latency (includes getUserByEmail & Bcrypt verification)...');
    const t4 = performance.now();
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const t5 = performance.now();
    results.loginLatency = t5 - t4;
    const loginData = await loginRes.json();
    console.log(`   Status: ${loginRes.status}`);
    console.log(`   Login Latency: ${results.loginLatency.toFixed(2)} ms`);
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    // 4. Authenticated API Retrieval Latency (Logs, Wallet, API Keys)
    console.log('\n4. Testing Authenticated Dashboard Data Fetching Latency...');
    
    // Logs fetch
    const t6 = performance.now();
    const logsRes = await fetch(`${BACKEND_URL}/api/logs`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const t7 = performance.now();
    results.logsLatency = t7 - t6;
    console.log(`   Fetch Logs Latency: ${results.logsLatency.toFixed(2)} ms (Status: ${logsRes.status})`);

    // Wallet fetch
    const t8 = performance.now();
    const walletRes = await fetch(`${BACKEND_URL}/api/wallet`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const t9 = performance.now();
    results.walletLatency = t9 - t8;
    console.log(`   Fetch Wallet Latency: ${results.walletLatency.toFixed(2)} ms (Status: ${walletRes.status})`);

    // API Keys fetch
    const t10 = performance.now();
    const keysRes = await fetch(`${BACKEND_URL}/api/apikeys`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const t11 = performance.now();
    results.keysLatency = t11 - t10;
    console.log(`   Fetch API Keys Latency: ${results.keysLatency.toFixed(2)} ms (Status: ${keysRes.status})`);

    // 4b. Unified Dashboard Bootstrap Fetch Latency
    console.log('\n4b. Testing Unified Dashboard Bootstrap Fetch Latency...');
    const tBootstrap0 = performance.now();
    const bootstrapRes = await fetch(`${BACKEND_URL}/api/bootstrap`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const tBootstrap1 = performance.now();
    results.bootstrapLatency = tBootstrap1 - tBootstrap0;
    const bootstrapData = await bootstrapRes.json();
    console.log(`   Unified Bootstrap Latency: ${results.bootstrapLatency.toFixed(2)} ms (Status: ${bootstrapRes.status})`);
    console.log(`   Retrieved Data Keys: ${Object.keys(bootstrapData).join(', ')}`);


    // 5. Concurrency Load Test (Concurrent Wallet Charging)
    console.log('\n5. Executing Concurrent Wallet Charging (5 parallel transactions)...');
    const chargePayloads = Array.from({ length: 5 }, (_, i) => ({
      to: '07801234567',
      body: `Test broadcast payload concurrency ${i}`
    }));

    // Generate an API key to run public endpoints
    const createKeyRes = await fetch(`${BACKEND_URL}/api/apikeys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Benchmark Key', scope: 'full' })
    });
    const keyData = await createKeyRes.json();
    const apiKey = keyData.key;
    
    const t12 = performance.now();
    const concurrencyPromises = chargePayloads.map(payload => 
      fetch(`${BACKEND_URL}/v1/sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).then(res => res.status)
    );

    const statuses = await Promise.all(concurrencyPromises);
    const t13 = performance.now();
    results.concurrencyTime = t13 - t12;
    results.averageConcurrencyLatency = results.concurrencyTime / 5;
    
    console.log(`   Finished 5 transactions in: ${results.concurrencyTime.toFixed(2)} ms`);
    console.log(`   Average transaction latency under load: ${results.averageConcurrencyLatency.toFixed(2)} ms`);
    console.log(`   Transaction Statuses: [${statuses.join(', ')}]`);

    // 5b. Testing API Key Cache Hit Latency
    console.log('\n5b. Testing API Key Cache Hit Latency...');
    const tKey1_0 = performance.now();
    const keyRes1 = await fetch(`${BACKEND_URL}/v1/sms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to: '07801234567', body: 'First key call (Cache Miss)' })
    });
    const tKey1_1 = performance.now();
    const latencyKey1 = tKey1_1 - tKey1_0;
    console.log(`   First call (Cache Miss) Latency: ${latencyKey1.toFixed(2)} ms (Status: ${keyRes1.status})`);

    const tKey2_0 = performance.now();
    const keyRes2 = await fetch(`${BACKEND_URL}/v1/sms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to: '07801234567', body: 'Second key call (Cache Hit)' })
    });
    const tKey2_1 = performance.now();
    const latencyKey2 = tKey2_1 - tKey2_0;
    results.cacheHitLatency = latencyKey2;
    results.cacheMissLatency = latencyKey1;
    console.log(`   Second call (Cache Hit) Latency: ${latencyKey2.toFixed(2)} ms (Status: ${keyRes2.status})`);
    console.log(`   Speedup Factor from In-Memory Caching: ${(latencyKey1 / latencyKey2).toFixed(1)}x faster!`);

    // 6. Final Clean up
    console.log('\n6. Cleaning up test records from database...');
    
  } catch (err) {
    console.error('❌ Benchmark error:', err.message);
  }

  console.log('\n======================================================');
  console.log('               PERFORMANCE BENCHMARK SUMMARY          ');
  console.log('======================================================');
  console.log(`Health Ping Latency       : ${results.pingLatency ? results.pingLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`User Signup (Heavy Hashing): ${results.registrationLatency ? results.registrationLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`User Login (Sync Check)   : ${results.loginLatency ? results.loginLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`Fetch Logs (DB Query)     : ${results.logsLatency ? results.logsLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`Fetch Wallet (Balance check): ${results.walletLatency ? results.walletLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`Unified Bootstrap Fetch   : ${results.bootstrapLatency ? results.bootstrapLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`Load Concurrency Time (5x) : ${results.concurrencyTime ? results.concurrencyTime.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`Avg Transaction Latency   : ${results.averageConcurrencyLatency ? results.averageConcurrencyLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`API Key Cache Miss Latency: ${results.cacheMissLatency ? results.cacheMissLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`API Key Cache Hit Latency : ${results.cacheHitLatency ? results.cacheHitLatency.toFixed(2) + ' ms' : 'N/A'}`);
  console.log(`Cache Speedup Factor      : ${results.cacheMissLatency && results.cacheHitLatency ? (results.cacheMissLatency / results.cacheHitLatency).toFixed(1) + 'x' : 'N/A'}`);
  console.log('======================================================\n');
  
  return { userId, testEmail };
}

auditPerformance().then(async ({ userId, testEmail }) => {
  if (userId) {
    // Import database and delete user locally to clean up database
    const db = await import('./db.js');
    await db.supabase.from('users').delete().eq('id', userId);
    console.log(`🧹 Cleanup: Test user ${testEmail} removed from Supabase.`);
  }
});
