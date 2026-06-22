import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const testUserId = 'usr_trigger_test_' + Math.random().toString(36).substring(2, 8);
  const testEmail = `${testUserId}@gmail.com`;
  console.log(`Directly inserting user to test trigger: ${testEmail}`);

  const { error } = await supabase.from('users').insert({
    id: testUserId,
    email: testEmail,
    password_hash: 'hash',
    name: 'Trigger Test User'
  });

  if (error) {
    console.error('❌ Database Error:', error);
  } else {
    console.log('✅ INSERT SUCCESSFUL! No trigger errors.');
    // Clean up
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('✅ Cleanup successful.');
  }
}

run();
