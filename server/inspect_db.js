import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase credentials are not configured in server/.env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectDatabase() {
  console.log('--- Sumer Send Database Inspection ---');
  console.log(`Endpoint: ${supabaseUrl}\n`);

  try {
    // 1. Query table lists and RLS status
    console.log('1. Auditing Tables and Row-Level Security (RLS)...');
    const { data: tables, error: tablesError } = await supabase.rpc('inspect_tables_rls');

    if (tablesError) {
      // Fallback: If the RPC is not defined yet, query via direct SQL estimation or a simple table check
      console.log('   (inspect_tables_rls RPC not found, falling back to schema inspection...)');
      
      const tablesToCheck = [
        'users', 'smtp_configs', 'logs', 'wallets', 'transactions',
        'webhooks', 'webhook_logs', 'campaigns', 'templates', 'security_configs', 'api_keys'
      ];
      
      for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
          console.log(`   ❌ Table [${table}]: Error - ${error.message}`);
        } else {
          console.log(`   ✅ Table [${table}]: Active and accessible.`);
        }
      }
    } else {
      console.table(tables);
    }

    // 2. Count active records
    console.log('\n2. Auditing Active Records Count...');
    const tablesToCount = [
      'users', 'smtp_configs', 'wallets', 'transactions',
      'webhooks', 'webhook_logs', 'campaigns', 'templates', 'security_configs', 'api_keys'
    ];
    
    for (const table of tablesToCount) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`   ⚠️ Could not read count for ${table}: ${error.message}`);
      } else {
        console.log(`   📊 Table [${table.padEnd(16)}]: ${count} records.`);
      }
    }

    console.log('\n✅ Database inspection completed.');

  } catch (err) {
    console.error('❌ Inspection failed:', err.message);
  }
}

inspectDatabase();
