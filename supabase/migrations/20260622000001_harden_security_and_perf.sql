-- =========================================================================
-- Sumer Send (Rafidain Send) Database Security & Performance Hardening Migration
-- This migration updates RLS policies to close anonymous data leaks and
-- optimizes RLS queries using the ((select auth.uid())::text) cached subquery pattern.
-- =========================================================================

-- 1. Users Table Policy Hardening
DROP POLICY IF EXISTS "Allow read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow update access to own user profile" ON public.users;
CREATE POLICY "Allow read access to users" ON public.users FOR SELECT USING ((select auth.uid())::text = id);
CREATE POLICY "Allow update access to own user profile" ON public.users FOR UPDATE USING ((select auth.uid())::text = id);

-- 2. SMTP Configs Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own SMTP config" ON public.smtp_configs;
CREATE POLICY "Allow all access to own SMTP config" ON public.smtp_configs FOR ALL USING ((select auth.uid())::text = user_id);

-- 3. Logs Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own logs" ON public.logs;
CREATE POLICY "Allow all access to own logs" ON public.logs FOR ALL USING ((select auth.uid())::text = user_id);

-- 4. Wallets Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own wallet" ON public.wallets;
CREATE POLICY "Allow all access to own wallet" ON public.wallets FOR ALL USING ((select auth.uid())::text = user_id);

-- 5. Transactions Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own transactions" ON public.transactions;
CREATE POLICY "Allow all access to own transactions" ON public.transactions FOR ALL USING ((select auth.uid())::text = user_id);

-- 6. Webhooks Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own webhooks" ON public.webhooks;
CREATE POLICY "Allow all access to own webhooks" ON public.webhooks FOR ALL USING ((select auth.uid())::text = user_id);

-- 7. Webhook Logs Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own webhook logs" ON public.webhook_logs;
CREATE POLICY "Allow all access to own webhook logs" ON public.webhook_logs FOR ALL USING ((select auth.uid())::text = user_id);

-- 8. Campaigns Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own campaigns" ON public.campaigns;
CREATE POLICY "Allow all access to own campaigns" ON public.campaigns FOR ALL USING ((select auth.uid())::text = user_id);

-- 9. Templates Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own templates" ON public.templates;
CREATE POLICY "Allow all access to own templates" ON public.templates FOR ALL USING ((select auth.uid())::text = user_id);

-- 10. Security Configs Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own security config" ON public.security_configs;
CREATE POLICY "Allow all access to own security config" ON public.security_configs FOR ALL USING ((select auth.uid())::text = user_id);

-- 11. API Keys Table Policy Hardening
DROP POLICY IF EXISTS "Allow all access to own API keys" ON public.api_keys;
CREATE POLICY "Allow all access to own API keys" ON public.api_keys FOR ALL USING ((select auth.uid())::text = user_id);
