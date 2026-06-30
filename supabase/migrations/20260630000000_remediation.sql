-- =========================================================================
-- Sumer Send Security Remediation Migration
-- 1. Restrict public access to 'wallets' and 'transactions' tables to SELECT-only
-- 2. Restrict 'security_configs' table to SELECT-only (users cannot modify verification state)
-- 3. Restrict message_queue, webhook_queue, and logs tables to SELECT-only
-- 4. Implement missing 'topup_wallet_atomic' database function
-- =========================================================================

-- 1. Restrict Wallets Table Policy to SELECT-only for owning user
DROP POLICY IF EXISTS "Allow all access to own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Allow read access to own wallet" ON public.wallets;
CREATE POLICY "Allow read access to own wallet" ON public.wallets
  FOR SELECT USING ((select auth.uid())::text = user_id);

-- 2. Restrict Transactions Table Policy to SELECT-only for owning user
DROP POLICY IF EXISTS "Allow all access to own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow read access to own transactions" ON public.transactions;
CREATE POLICY "Allow read access to own transactions" ON public.transactions
  FOR SELECT USING ((select auth.uid())::text = user_id);

-- 3. Restrict Security Configs Table Policy to SELECT-only for owning user
DROP POLICY IF EXISTS "Allow all access to own security config" ON public.security_configs;
DROP POLICY IF EXISTS "Allow read access to own security config" ON public.security_configs;
CREATE POLICY "Allow read access to own security config" ON public.security_configs
  FOR SELECT USING ((select auth.uid())::text = user_id);

-- 4. Restrict Message Queue Table Policy to SELECT-only for owning user
DROP POLICY IF EXISTS "Allow all access to own message queue" ON public.message_queue;
DROP POLICY IF EXISTS "Allow read access to own message queue" ON public.message_queue;
CREATE POLICY "Allow read access to own message queue" ON public.message_queue
  FOR SELECT USING ((select auth.uid())::text = user_id);

-- 5. Restrict Webhook Queue Table Policy to SELECT-only for owning user
DROP POLICY IF EXISTS "Allow all access to own webhook queue" ON public.webhook_queue;
DROP POLICY IF EXISTS "Allow read access to own webhook queue" ON public.webhook_queue;
CREATE POLICY "Allow read access to own webhook queue" ON public.webhook_queue
  FOR SELECT USING ((select auth.uid())::text = user_id);

-- 6. Restrict Logs Table Policy to SELECT-only for owning user
DROP POLICY IF EXISTS "Allow all access to own logs" ON public.logs;
DROP POLICY IF EXISTS "Allow read access to own logs" ON public.logs;
CREATE POLICY "Allow read access to own logs" ON public.logs
  FOR SELECT USING ((select auth.uid())::text = user_id);

-- 7. Implement topup_wallet_atomic function
CREATE OR REPLACE FUNCTION public.topup_wallet_atomic(
  p_user_id text,
  p_amount numeric,
  p_description text,
  p_provider text,
  p_tx_id text
) RETURNS boolean AS $$
BEGIN
  -- Check for duplicate transaction ID to enforce idempotency
  IF EXISTS (SELECT 1 FROM public.transactions WHERE id = p_tx_id) THEN
    RETURN false;
  END IF;

  -- Lock the user's wallet row for update to prevent concurrent modification race conditions
  PERFORM balance FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

  -- Add the top-up amount to balance
  UPDATE public.wallets
  SET balance = balance + p_amount
  WHERE user_id = p_user_id;

  -- Record the transaction log
  INSERT INTO public.transactions (id, user_id, provider, amount, status, description)
  VALUES (p_tx_id, p_user_id, p_provider, p_amount, 'completed', p_description);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke public execution permissions
REVOKE EXECUTE ON FUNCTION public.topup_wallet_atomic(text, numeric, text, text, text) FROM PUBLIC;

-- Grant execution permissions only to service_role (used by Express backend)
GRANT EXECUTE ON FUNCTION public.topup_wallet_atomic(text, numeric, text, text, text) TO service_role;
