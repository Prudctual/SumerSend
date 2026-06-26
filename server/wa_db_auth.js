import { BufferJSON, initAuthCreds } from '@whiskeysockets/baileys';
import { supabase } from './db.js';

/**
 * Custom Supabase-backed authentication state provider for Baileys
 * Optimised with In-Memory Caching and Bulk Database Upserts to prevent
 * database connection flooding during initial pair sync.
 */
export async function useSupabaseAuthState(userId) {
  if (!userId) {
    throw new Error('User ID is required for useSupabaseAuthState');
  }

  // In-Memory cache to store loaded keys to speed up reads and connection times
  const memoryCache = new Map();

  // Load all existing keys for this user on startup to populate the cache
  console.log(`[wa_db_auth] Pre-loading auth session keys from Supabase for user ${userId}...`);
  try {
    const { data: records, error } = await supabase
      .from('whatsapp_sessions')
      .select('key,value')
      .eq('user_id', userId);

    if (!error && Array.isArray(records)) {
      console.log(`[wa_db_auth] Loaded ${records.length} keys for user ${userId}`);
      for (const record of records) {
        try {
          const parsed = JSON.parse(JSON.stringify(record.value), BufferJSON.reviver);
          memoryCache.set(record.key, parsed);
        } catch (e) {
          console.error(`[wa_db_auth] Error parsing cached key ${record.key}:`, e);
        }
      }
    } else if (error) {
      console.error(`[wa_db_auth] Error pre-loading session keys:`, error);
    }
  } catch (e) {
    console.error(`[wa_db_auth] Failed to pre-load session keys:`, e);
  }

  // Read data helper (uses memory cache first)
  async function readData(key) {
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    // Fallback just in case (should not happen since we preloaded)
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .maybeSingle();

      if (error || !data) return null;
      const parsed = JSON.parse(JSON.stringify(data.value), BufferJSON.reviver);
      memoryCache.set(key, parsed);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  // Bulk write helper (upserts multiple keys in a single db transaction)
  async function writeDataBulk(items) {
    if (!items || items.length === 0) return;
    
    // Update local memory cache immediately
    for (const item of items) {
      if (item.value === null || item.value === undefined) {
        memoryCache.delete(item.key);
      } else {
        memoryCache.set(item.key, item.value);
      }
    }

    try {
      const upserts = [];
      const deletes = [];

      for (const item of items) {
        if (item.value === null || item.value === undefined) {
          deletes.push(item.key);
        } else {
          const serialized = JSON.parse(JSON.stringify(item.value, BufferJSON.replacer));
          upserts.push({
            user_id: userId,
            key: item.key,
            value: serialized
          });
        }
      }

      // Execute upserts in a single batch request
      if (upserts.length > 0) {
        const { error } = await supabase
          .from('whatsapp_sessions')
          .upsert(upserts, { onConflict: 'user_id,key' });
        if (error) {
          console.error(`[wa_db_auth] Bulk upsert error for ${upserts.length} items:`, error);
        }
      }

      // Execute deletes in a single request if needed
      if (deletes.length > 0) {
        const { error } = await supabase
          .from('whatsapp_sessions')
          .delete()
          .eq('user_id', userId)
          .in('key', deletes);
        if (error) {
          console.error(`[wa_db_auth] Bulk delete error for ${deletes.length} keys:`, error);
        }
      }
    } catch (e) {
      console.error(`[wa_db_auth] Bulk database execution error:`, e);
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
              data[id] = await readData(`${type}:${id}`);
            })
          );
          return data;
        },
        set: async (data) => {
          const itemsToSave = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              itemsToSave.push({
                key: `${category}:${id}`,
                value
              });
            }
          }
          // Save all keys in a single database roundtrip!
          await writeDataBulk(itemsToSave);
        }
      }
    },
    // Baileys calls this to persist credentials updates
    saveCreds: async () => {
      await writeDataBulk([{ key: 'creds', value: creds }]);
    }
  };
}
