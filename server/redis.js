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

// Parse connection details for BullMQ (which uses ioredis internally)
// We can pass the URL string directly, or parse it to host/port if needed.
// BullMQ connection option accepts a Redis URL string or an object.
export const redisConnectionOpts = {
  connection: {
    url: redisUrl
  }
};
