-- 1. WhatsApp session storage table
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
    id serial PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    key text NOT NULL,
    value jsonb NOT NULL,
    UNIQUE(user_id, key)
);
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to own WhatsApp sessions" ON public.whatsapp_sessions;
CREATE POLICY "Allow all access to own WhatsApp sessions" ON public.whatsapp_sessions FOR ALL USING ((select auth.uid())::text = user_id);
CREATE INDEX IF NOT EXISTS idx_wa_sessions_user_key ON public.whatsapp_sessions(user_id, key);

-- 2. SMS Configurations table
CREATE TABLE IF NOT EXISTS public.sms_configs (
    user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    provider text NOT NULL DEFAULT 'mock', -- 'mock', 'twilio', 'zain', 'asiacell'
    api_key text,
    api_secret text,
    sender_id text,
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.sms_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to own SMS config" ON public.sms_configs;
CREATE POLICY "Allow all access to own SMS config" ON public.sms_configs FOR ALL USING ((select auth.uid())::text = user_id);

-- 3. Message Queue table
CREATE TABLE IF NOT EXISTS public.message_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'email', 'sms', 'whatsapp'
    recipient text NOT NULL,
    subject text,
    body text,
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    last_error text,
    scheduled_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to own message queue" ON public.message_queue;
CREATE POLICY "Allow all access to own message queue" ON public.message_queue FOR ALL USING ((select auth.uid())::text = user_id);
CREATE INDEX IF NOT EXISTS idx_msg_queue_status_sched ON public.message_queue(status, scheduled_at);

-- 4. Webhook Queue table
CREATE TABLE IF NOT EXISTS public.webhook_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    webhook_id text REFERENCES public.webhooks(id) ON DELETE CASCADE,
    url text NOT NULL,
    event text NOT NULL,
    payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 5,
    last_error text,
    scheduled_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.webhook_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to own webhook queue" ON public.webhook_queue;
CREATE POLICY "Allow all access to own webhook queue" ON public.webhook_queue FOR ALL USING ((select auth.uid())::text = user_id);
CREATE INDEX IF NOT EXISTS idx_wh_queue_status_sched ON public.webhook_queue(status, scheduled_at);
