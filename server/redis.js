import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Initialize the official Node Redis client for general key-value operations
export const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.error('[Redis Client] Connection Error:', err));
redisClient.on('connect', () => console.log('[Redis Client] Connected successfully.'));

// Self-executing connection
redisClient.connect().catch((err) => {
  console.error('[Redis Client] Failed to connect to Redis on startup:', err.message);
});

// Parse connection details for BullMQ (which uses ioredis internally).
// ioredis does NOT accept { url: '...' } — it needs host/port/password/tls as separate fields,
// or the URL passed directly as a string to the constructor.
// We parse the Redis URL to extract individual connection parameters for ioredis compatibility.
function parseRedisUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const opts = {
      host: parsed.hostname || '127.0.0.1',
      port: parseInt(parsed.port, 10) || 6379,
    };
    if (parsed.password) {
      opts.password = decodeURIComponent(parsed.password);
    }
    if (parsed.username && parsed.username !== 'default') {
      opts.username = decodeURIComponent(parsed.username);
    }
    // Support rediss:// (TLS) connections used by managed Redis providers (Upstash, Redis Cloud, etc.)
    if (parsed.protocol === 'rediss:') {
      opts.tls = {};
    }
    return opts;
  } catch (e) {
    console.error('[Redis] Failed to parse REDIS_URL, using localhost defaults:', e.message);
    return { host: '127.0.0.1', port: 6379 };
  }
}

export const redisConnectionOpts = {
  connection: parseRedisUrl(redisUrl)
};
