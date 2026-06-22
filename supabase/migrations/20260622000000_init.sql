-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create SMTP configurations table
CREATE TABLE IF NOT EXISTS public.smtp_configs (
    user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    host text,
    port integer,
    secure boolean DEFAULT false,
    username text,
    password text,
    sender text,
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on smtp_configs
ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;

-- Create logs table
CREATE TABLE IF NOT EXISTS public.logs (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    sender text,
    recipient text,
    subject text,
    body text,
    status text NOT NULL,
    error text,
    timestamp timestamptz DEFAULT now()
);

-- Enable RLS on logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    balance numeric NOT NULL DEFAULT 50000
);

-- Enable RLS on wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    provider text NOT NULL,
    amount numeric NOT NULL,
    status text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    url text NOT NULL,
    events text[] NOT NULL,
    secret text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on webhooks
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id text PRIMARY KEY,
    webhook_id text REFERENCES public.webhooks(id) ON DELETE CASCADE,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    url text NOT NULL,
    event text NOT NULL,
    status text NOT NULL,
    status_code integer,
    response_body text,
    latency integer,
    timestamp timestamptz DEFAULT now()
);

-- Enable RLS on webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    subject text,
    body text,
    recipients_count integer NOT NULL DEFAULT 0,
    success_count integer NOT NULL DEFAULT 0,
    failed_count integer NOT NULL DEFAULT 0,
    total_cost numeric NOT NULL DEFAULT 0,
    recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create templates table
CREATE TABLE IF NOT EXISTS public.templates (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    name_ar text,
    name_en text,
    desc_ar text,
    desc_en text,
    subject_ar text,
    subject_en text,
    body text,
    icon text,
    variables jsonb DEFAULT '[]'::jsonb,
    type text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create security_configs table
CREATE TABLE IF NOT EXISTS public.security_configs (
    user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    phone text,
    verified boolean DEFAULT false,
    require_campaign_2fa boolean DEFAULT false,
    require_apikey_2fa boolean DEFAULT false
);

-- Enable RLS on security_configs
ALTER TABLE public.security_configs ENABLE ROW LEVEL SECURITY;

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id text PRIMARY KEY,
    user_id text REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    key text UNIQUE NOT NULL,
    scope text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- Performance Indexes (Ref: query-missing-indexes & schema-partial-indexes)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(key);

-- =========================================================================
-- Row Level Security (RLS) Policies (Ref: security-rls)
-- =========================================================================

-- Users table policies
DROP POLICY IF EXISTS "Allow read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow update access to own user profile" ON public.users;
DROP POLICY IF EXISTS "Allow insert access to users" ON public.users;
CREATE POLICY "Allow read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow update access to own user profile" ON public.users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Allow insert access to users" ON public.users FOR INSERT WITH CHECK (true);

-- SMTP Configs policies
DROP POLICY IF EXISTS "Allow all access to own SMTP config" ON public.smtp_configs;
CREATE POLICY "Allow all access to own SMTP config" ON public.smtp_configs FOR ALL USING (auth.uid()::text = user_id);

-- Logs policies
DROP POLICY IF EXISTS "Allow all access to own logs" ON public.logs;
CREATE POLICY "Allow all access to own logs" ON public.logs FOR ALL USING (auth.uid()::text = user_id);

-- Wallets policies
DROP POLICY IF EXISTS "Allow all access to own wallet" ON public.wallets;
CREATE POLICY "Allow all access to own wallet" ON public.wallets FOR ALL USING (auth.uid()::text = user_id);

-- Transactions policies
DROP POLICY IF EXISTS "Allow all access to own transactions" ON public.transactions;
CREATE POLICY "Allow all access to own transactions" ON public.transactions FOR ALL USING (auth.uid()::text = user_id);

-- Webhooks policies
DROP POLICY IF EXISTS "Allow all access to own webhooks" ON public.webhooks;
CREATE POLICY "Allow all access to own webhooks" ON public.webhooks FOR ALL USING (auth.uid()::text = user_id);

-- Webhook Logs policies
DROP POLICY IF EXISTS "Allow all access to own webhook logs" ON public.webhook_logs;
CREATE POLICY "Allow all access to own webhook logs" ON public.webhook_logs FOR ALL USING (auth.uid()::text = user_id);

-- Campaigns policies
DROP POLICY IF EXISTS "Allow all access to own campaigns" ON public.campaigns;
CREATE POLICY "Allow all access to own campaigns" ON public.campaigns FOR ALL USING (auth.uid()::text = user_id);

-- Templates policies
DROP POLICY IF EXISTS "Allow all access to own templates" ON public.templates;
CREATE POLICY "Allow all access to own templates" ON public.templates FOR ALL USING (auth.uid()::text = user_id);

-- Security Configs policies
DROP POLICY IF EXISTS "Allow all access to own security config" ON public.security_configs;
CREATE POLICY "Allow all access to own security config" ON public.security_configs FOR ALL USING (auth.uid()::text = user_id);

-- API Keys policies
DROP POLICY IF EXISTS "Allow all access to own API keys" ON public.api_keys;
CREATE POLICY "Allow all access to own API keys" ON public.api_keys FOR ALL USING (auth.uid()::text = user_id);

-- =========================================================================
-- Triggers for Automatic Profile Provisioning
-- =========================================================================

-- Function to initialize user settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert default SMTP config
  INSERT INTO public.smtp_configs (user_id, host, port, secure, username, password, sender)
  VALUES (NEW.id, '', 587, false, '', '', 'Sumer Send <onboarding@sumersend.com>');

  -- Insert default wallet with welcome balance
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 50000);

  -- Insert default wallet welcome transaction
  INSERT INTO public.transactions (id, user_id, provider, amount, status, description)
  VALUES ('TX_WELCOME_' || NEW.id, NEW.id, 'Sumer Send', 50000, 'completed', 'Welcome bonus balance');

  -- Insert default security config
  INSERT INTO public.security_configs (user_id, phone, verified, require_campaign_2fa, require_apikey_2fa)
  VALUES (NEW.id, '', false, false, false);

  -- Insert default API key
  INSERT INTO public.api_keys (id, user_id, name, key, scope)
  VALUES (
    NEW.id || '_key_1',
    NEW.id,
    'Main Application Key',
    'sm_live_' || md5(random()::text || clock_timestamp()::text),
    'full'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on user insertion
CREATE OR REPLACE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- Atomic Wallet Charging Function (Ref: lock- concurrency prevention)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.charge_wallet_atomic(
  p_user_id text,
  p_amount numeric,
  p_description text,
  p_provider text,
  p_tx_id text
) RETURNS boolean AS $$
DECLARE
  v_balance numeric;
BEGIN
  -- Lock the user's wallet row for update to prevent concurrent modification race conditions
  SELECT balance INTO v_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Verify balance sufficiency
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN false;
  END IF;

  -- Deduct the charged amount from balance
  UPDATE public.wallets
  SET balance = balance - p_amount
  WHERE user_id = p_user_id;

  -- Record the transaction log
  INSERT INTO public.transactions (id, user_id, provider, amount, status, description)
  VALUES (p_tx_id, p_user_id, p_provider, p_amount, 'completed', p_description);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- Atomic Wallet Refunding Function (Ref: lock- concurrency prevention)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.refund_wallet_atomic(
  p_user_id text,
  p_amount numeric,
  p_description text,
  p_provider text,
  p_tx_id text
) RETURNS boolean AS $$
BEGIN
  -- Lock the user's wallet row for update to prevent concurrent modification race conditions
  PERFORM balance FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

  -- Add the refunded amount back to balance
  UPDATE public.wallets
  SET balance = balance + p_amount
  WHERE user_id = p_user_id;

  -- Record the refund transaction log (amount is negative to indicate refund)
  INSERT INTO public.transactions (id, user_id, provider, amount, status, description)
  VALUES (p_tx_id, p_user_id, p_provider, -p_amount, 'completed', p_description);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


