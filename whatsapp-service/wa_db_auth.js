import { BufferJSON, initAuthCreds } from '@whiskeysockets/baileys';
import { supabase } from './db.js';

/**
 * Custom Supabase-backed authentication state provider for Baileys
 * Completely eliminates the need for filesystem writes, making it
 * compatible with ephemeral environments like Vercel Serverless.
 * 
 * @param {string} userId - The unique identifier of the user/session owner
 */
export async function useSupabaseAuthState(userId) {
  if (!userId) {
    throw new Error('User ID is required for useSupabaseAuthState');
  }

  // Read a single key from Supabase
  async function readData(key) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .maybeSingle();

      if (error) {
        console.error(`[wa_db_auth] Error reading key ${key} from database:`, error);
        return null;
      }
      if (!data) return null;

      // Use BufferJSON.reviver to deserialize base64-encoded buffers/uint8arrays correctly
      return JSON.parse(JSON.stringify(data.value), BufferJSON.reviver);
    } catch (e) {
      console.error(`[wa_db_auth] Error parsing key ${key}:`, e);
      return null;
    }
  }

  // Write or delete a key in Supabase
  async function writeData(key, value) {
    try {
      if (value === null || value === undefined) {
        const { error } = await supabase
          .from('whatsapp_sessions')
          .delete()
          .eq('user_id', userId)
          .eq('key', key);
        if (error) {
          console.error(`[wa_db_auth] Error deleting key ${key} from database:`, error);
        }
      } else {
        // Stringify using BufferJSON.replacer to serialize Buffers to base64, then parse to JSONB
        const serialized = JSON.parse(JSON.stringify(value, BufferJSON.replacer));
        const { error } = await supabase
          .from('whatsapp_sessions')
          .upsert({
            user_id: userId,
            key: key,
            value: serialized
          }, { onConflict: 'user_id,key' });
        if (error) {
          console.error(`[wa_db_auth] Error upserting key ${key} to database:`, error);
        }
      }
    } catch (e) {
      console.error(`[wa_db_auth] Error writing key ${key}:`, e);
    }
  }

  // Load or initialize credentials
  const creds = await readData('creds') || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}:${id}`);
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              tasks.push(writeData(`${category}:${id}`, value));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    // Baileys calls this to persist credentials updates
    saveCreds: async () => {
      await writeData('creds', creds);
    }
  };
}
