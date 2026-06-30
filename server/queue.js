import { Queue } from 'bullmq';
import { redisConnectionOpts, redisClient } from './redis.js';
import { supabase } from './db.js';

// Define BullMQ Queues
export const messageQueue = new Queue('messageQueue', {
  ...redisConnectionOpts,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 } // Keep failed jobs for 24 hours for debugging
  }
});

export const webhookQueue = new Queue('webhookQueue', {
  ...redisConnectionOpts,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 }
  }
});

/**
 * Calculates the required delay (in ms) for WhatsApp messages under a Leaky Bucket model per user.
 * This guarantees a random 5-10 seconds interval between messages to mimic human behavior (anti-ban).
 * 
 * @param {string} userId - The ID of the user.
 * @param {boolean} isOtp - True if the message is high priority (OTP), which bypasses immediate delay.
 * @returns {Promise<number>} - Delay in milliseconds.
 */
export async function calculateWhatsAppDelay(userId, isOtp = false) {
  const now = Date.now();
  const redisKey = `wa_queue:next_available_time:${userId}`;
  const jitter = Math.floor(Math.random() * 5001) + 5000; // 5000ms to 10000ms

  const luaScript = `
    local next_time = tonumber(redis.call('GET', KEYS[1])) or 0
    local now = tonumber(ARGV[1])
    local jitter = tonumber(ARGV[2])
    local is_otp = ARGV[3] == 'true'

    if is_otp then
      local new_next = math.max(next_time, now) + jitter
      redis.call('SET', KEYS[1], tostring(new_next))
      return 0
    end

    if next_time < now then
      local new_next = now + jitter
      redis.call('SET', KEYS[1], tostring(new_next))
      return 0
    else
      local delay = next_time - now
      local new_next = next_time + jitter
      redis.call('SET', KEYS[1], tostring(new_next))
      return delay
    end
  `;

  try {
    const delay = await redisClient.eval(luaScript, {
      keys: [redisKey],
      arguments: [now.toString(), jitter.toString(), isOtp.toString()]
    });
    return parseInt(delay, 10);
  } catch (err) {
    console.error(`[Queue] Error calculating WhatsApp delay for user ${userId}:`, err.message);
    return 0; // Fallback to immediate sending if Redis fails
  }
}

/**
 * Pushes a message to the BullMQ queue.
 * 
 * @param {string} msgId - The database message UUID.
 * @param {Object} opts - Custom queuing options.
 * @param {string} [opts.priority] - 'high' | 'normal' | 'low'. Map to BullMQ priority.
 * @param {boolean} [opts.isOtp] - If true, treats as OTP (bypasses immediate WhatsApp delay).
 * @returns {Promise<Object>} - The created BullMQ Job.
 */
export async function queueMessageJob(msgId, opts = {}) {
  try {
    // 1. Fetch message metadata from database
    const { data: msg, error } = await supabase
      .from('message_queue')
      .select('user_id, type, metadata')
      .eq('id', msgId)
      .single();
      
    if (error || !msg) {
      throw new Error(error ? error.message : 'Message not found in database.');
    }

    const { user_id: userId, type, metadata = {} } = msg;
    
    // 2. Determine Priority (BullMQ: lower number = higher priority)
    // Default mappings: High (1), Normal (2), Low (3)
    let priorityNum = 2; // Default normal
    const priorityStr = opts.priority || metadata.priority || 'normal';
    
    if (priorityStr === 'high' || opts.isOtp || metadata.isOtp) {
      priorityNum = 1;
    } else if (priorityStr === 'low') {
      priorityNum = 3;
    }

    // 3. Determine WhatsApp Jitter Delay
    let delay = 0;
    const isOtp = !!(opts.isOtp || metadata.isOtp || priorityStr === 'high');
    if (type === 'whatsapp') {
      delay = await calculateWhatsAppDelay(userId, isOtp);
    }

    // 4. Add to BullMQ
    const jobName = `${type}_job_${msgId}`;
    const job = await messageQueue.add(jobName, { msgId }, {
      jobId: msgId, // Enable deduplication
      priority: priorityNum,
      delay: delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 30000 // Start retry at 30 seconds
      }
    });

    console.log(`[Queue] Queued message job ${job.id} for message ${msgId} (Type: ${type}, Priority: ${priorityNum}, Delay: ${delay}ms).`);
    return job;
  } catch (err) {
    console.error(`[Queue] Failed to queue message job ${msgId}:`, err.message);
    throw err;
  }
}

/**
 * Pushes a webhook to the BullMQ queue.
 * 
 * @param {string} jobId - The database webhook job UUID.
 * @returns {Promise<Object>} - The created BullMQ Job.
 */
export async function queueWebhookJob(jobId) {
  try {
    const jobName = `webhook_job_${jobId}`;
    const job = await webhookQueue.add(jobName, { webhookJobId: jobId }, {
      jobId: jobId, // Enable deduplication
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60000 // Reschedule attempts^2 minutes (exponential backoff start at 60s)
      }
    });
    
    console.log(`[Queue] Queued webhook job ${job.id} for webhook job ${jobId}.`);
    return job;
  } catch (err) {
    console.error(`[Queue] Failed to queue webhook job ${jobId}:`, err.message);
    throw err;
  }
}
