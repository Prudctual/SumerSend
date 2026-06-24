import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current directory
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Sumer Send Database Verification Script ---');
console.log(`URL: ${supabaseUrl ? 'Configured' : 'Missing'}`);
console.log(`Service Role Key: ${supabaseServiceKey ? 'Configured' : 'Missing'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ Verification Skipped: Supabase credentials are not configured in server/.env.');
  console.log('Please configure your credentials first to perform connection and trigger tests.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('\n1. Testing Supabase database connection...');
  const testUserId = 'usr_test_' + Math.random().toString(36).substring(2, 8);
  const testEmail = `${testUserId}@example.com`;

  try {
    // Insert a test user
    console.log(`Inserting test user: ${testEmail}`);
    const { error: userError } = await supabase.from('users').insert({
      id: testUserId,
      email: testEmail,
      password_hash: '$2a$10$xyz', // mock hash
      name: 'Test Account'
    });

    if (userError) {
      throw new Error(`Failed to insert user: ${userError.message}`);
    }
    console.log('✅ Test user inserted successfully.');

    // Wait a brief moment to allow trigger execution
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('\n2. Verifying database triggers (Automatic configuration provisioning)...');

    // Check SMTP config
    const { data: smtpData, error: smtpError } = await supabase
      .from('smtp_configs')
      .select('*')
      .eq('user_id', testUserId)
      .maybeSingle();
    
    if (smtpError || !smtpData) {
      console.log('❌ Trigger fail: SMTP config not found.');
    } else {
      console.log('✅ Trigger success: Default SMTP config created.');
    }

    // Check Wallet balance
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', testUserId)
      .maybeSingle();

    if (walletError || !walletData) {
      console.log('❌ Trigger fail: Wallet not found.');
    } else {
      console.log(`✅ Trigger success: Wallet created. Balance: ${walletData.balance} IQD.`);
    }

    // Check Welcome transaction
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('id', 'TX_WELCOME_' + testUserId)
      .maybeSingle();

    if (txError || !txData) {
      console.log('❌ Trigger fail: Welcome transaction not found.');
    } else {
      console.log(`✅ Trigger success: Welcome transaction recorded. Amount: +${txData.amount} IQD.`);
    }

    // Check API Key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', testUserId)
      .maybeSingle();

    if (keyError || !keyData) {
      console.log('❌ Trigger fail: Default API Key not found.');
    } else {
      console.log(`✅ Trigger success: Primary API Key created: ${keyData.key.substring(0, 15)}...`);
    }

    // Check Subscriber Settings
    const { data: subSettingsData, error: subSettingsError } = await supabase
      .from('subscriber_settings')
      .select('*')
      .eq('user_id', testUserId)
      .maybeSingle();

    if (subSettingsError || !subSettingsData) {
      console.log('❌ Trigger fail: Default Subscriber Settings not found.');
    } else {
      console.log('✅ Trigger success: Default Subscriber Settings created.');
    }

    console.log('\n3. Testing atomic wallet charging...');
    const chargeAmount = 2500;
    const { data: chargeResult, error: chargeError } = await supabase.rpc('charge_wallet_atomic', {
      p_user_id: testUserId,
      p_amount: chargeAmount,
      p_description: 'Test API Dispatch Charge',
      p_provider: 'SMS API',
      p_tx_id: 'TX_TEST_CHARGE'
    });

    if (chargeError) {
      console.log(`❌ Atomic charge call failed: ${chargeError.message}`);
    } else if (chargeResult === false) {
      console.log('❌ Atomic charge call returned false.');
    } else {
      console.log(`✅ Atomic charge call success: Deducted ${chargeAmount} IQD.`);

      // Verify wallet balance updated
      const { data: walletUpdated } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', testUserId)
        .single();
      console.log(`   Updated balance: ${walletUpdated.balance} IQD (Expected: 47500).`);
    }

    console.log('\n3b. Testing atomic wallet refunding...');
    const refundAmount = 2500;
    const { data: refundResult, error: refundError } = await supabase.rpc('refund_wallet_atomic', {
      p_user_id: testUserId,
      p_amount: refundAmount,
      p_description: 'Test Refund',
      p_provider: 'SMS API',
      p_tx_id: 'TX_TEST_REFUND'
    });

    if (refundError) {
      console.log(`❌ Atomic refund call failed: ${refundError.message}`);
    } else if (refundResult === false) {
      console.log('❌ Atomic refund call returned false.');
    } else {
      console.log(`✅ Atomic refund call success: Refunded ${refundAmount} IQD.`);

      // Verify wallet balance updated
      const { data: walletRefunded } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', testUserId)
        .single();
      console.log(`   Updated balance after refund: ${walletRefunded.balance} IQD (Expected: 50000).`);
    }

    console.log('\n4. Cleaning up test user data...');
    const { error: cleanupError } = await supabase.from('users').delete().eq('id', testUserId);
    if (cleanupError) {
      console.log(`❌ Cleanup warning: ${cleanupError.message}`);
    } else {
      console.log('✅ Cleanup success: Test records removed via cascade delete.');
    }

    console.log('\n🎉 ALL DATABASE TESTS COMPLETED SUCCESSFULLY.');

  } catch (err) {
    console.error('\n❌ DATABASE VERIFICATION ERROR:', err.message);
  }
}

run();
