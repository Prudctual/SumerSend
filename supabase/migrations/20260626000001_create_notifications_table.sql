CREATE TABLE IF NOT EXISTS public.notifications (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    type text NOT NULL DEFAULT 'info',
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Allow all access to own notifications" ON public.notifications;
CREATE POLICY "Allow all access to own notifications" ON public.notifications FOR ALL USING ((select auth.uid())::text = user_id);
