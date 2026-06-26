-- Add phone and metadata fields to public.subscribers table
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
