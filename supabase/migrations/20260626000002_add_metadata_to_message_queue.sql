-- Add metadata column to message_queue table
ALTER TABLE public.message_queue ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
