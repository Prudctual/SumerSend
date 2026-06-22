import { supabase } from './db.js';
import { processMessageQueue } from './worker.js';

async function runTest() {
  const userId = 'usr_keebiws3ee'; // Existing user in DB
  console.log(`[Test] Running queue worker verification for user: ${userId}`);

  // 1. Fetch current wallet balance
  const { data: wallet, error: walletErr } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (walletErr || !wallet) {
    console.error('[Test] Failed to load wallet for test user:', walletErr);
    process.exit(1);
  }

  const initialBalance = parseFloat(wallet.balance);
  console.log(`[Test] Initial Wallet Balance: ${initialBalance} IQD`);

  // Costs
  const emailCost = 10;
  const smsCost = 120;
  const waCost = 150;
  const totalCost = emailCost + smsCost + waCost;

  // 2. Perform atomic charges to simulate API routes charging
  console.log('[Test] Charging wallet for simulated requests...');
  const tx1 = `test_tx_email_${Math.random().toString(36).substring(2, 8)}`;
  const tx2 = `test_tx_sms_${Math.random().toString(36).substring(2, 8)}`;
  const tx3 = `test_tx_wa_${Math.random().toString(36).substring(2, 8)}`;

  const { data: chargeEmail } = await supabase.rpc('charge_wallet_atomic', {
    p_user_id: userId,
    p_amount: emailCost,
    p_description: 'Simulated Email Charge',
    p_provider: 'Sumer Send API',
    p_tx_id: tx1
  });

  const { data: chargeSms } = await supabase.rpc('charge_wallet_atomic', {
    p_user_id: userId,
    p_amount: smsCost,
    p_description: 'Simulated SMS Charge',
    p_provider: 'Sumer Send API',
    p_tx_id: tx2
  });

  const { data: chargeWa } = await supabase.rpc('charge_wallet_atomic', {
    p_user_id: userId,
    p_amount: waCost,
    p_description: 'Simulated WhatsApp Charge',
    p_provider: 'Sumer Send API',
    p_tx_id: tx3
  });

  console.log(`[Test] Wallet charged: Email=${chargeEmail}, SMS=${chargeSms}, WA=${chargeWa}`);

  // Fetch balance after charges
  const { data: walletCharged } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();
  console.log(`[Test] Wallet Balance after charges: ${walletCharged.balance} IQD`);

  // 3. Clear any existing queue items to avoid noise
  await supabase.from('message_queue').delete().eq('user_id', userId);

  // 4. Insert queue items
  console.log('[Test] Inserting queue items...');
  
  const { data: emailMsg } = await supabase.from('message_queue').insert({
    user_id: userId,
    type: 'email',
    recipient: 'test_receiver@example.com',
    subject: 'Verification Test Email',
    body: '<p>Testing Sumer Send background queue worker stability.</p>',
    status: 'pending',
    attempts: 0,
    max_attempts: 1 // fail fast for testing
  }).select().single();

  const { data: smsMsg } = await supabase.from('message_queue').insert({
    user_id: userId,
    type: 'sms',
    recipient: '07700000000',
    body: 'Verification Test SMS',
    status: 'pending',
    attempts: 0,
    max_attempts: 1
  }).select().single();

  // WhatsApp will fail because WhatsApp socket connection is not opened
  const { data: waMsg } = await supabase.from('message_queue').insert({
    user_id: userId,
    type: 'whatsapp',
    recipient: '07700000000',
    body: 'Verification Test WhatsApp',
    status: 'pending',
    attempts: 0,
    max_attempts: 1 // fail on first attempt to trigger refund flow immediately
  }).select().single();

  console.log('[Test] Queue items inserted successfully.');

  // 5. Run the message queue processor
  console.log('[Test] Executing processMessageQueue()...');
  await processMessageQueue();

  // 6. Verify database updates
  console.log('[Test] Verifying processing results...');
  
  // Wait a moment for async DB operations to finish
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { data: queueResult } = await supabase
    .from('message_queue')
    .select('id, type, status, attempts, last_error')
    .eq('user_id', userId);

  console.log('[Test] Final Queue Status:');
  console.table(queueResult);

  // Verify wallet refunds for failed messages (WhatsApp should have failed and refunded waCost = 150)
  const { data: walletFinal } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();
  const finalBalance = parseFloat(walletFinal.balance);
  console.log(`[Test] Final Wallet Balance: ${finalBalance} IQD`);
  
  let expectedBalance = parseFloat(walletCharged.balance);
  queueResult.forEach(m => {
    if (m.status === 'failed') {
      if (m.type === 'email') expectedBalance += emailCost;
      if (m.type === 'sms') expectedBalance += smsCost;
      if (m.type === 'whatsapp') expectedBalance += waCost;
    }
  });
  console.log(`[Test] Expected Wallet Balance: ${expectedBalance} IQD`);

  if (Math.abs(finalBalance - expectedBalance) < 0.01) {
    console.log('[Test] SUCCESS: Wallet balance and refund logic verified perfectly!');
  } else {
    console.error('[Test] FAILURE: Wallet balance does not match expected refund calculations.');
  }

  // Cleanup test queue items
  await supabase.from('message_queue').delete().eq('user_id', userId);
}

runTest().catch(console.error);
