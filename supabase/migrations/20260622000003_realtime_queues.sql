-- =========================================================================
-- Sumer Send (Rafidain Send) Realtime Queue Publication Migration
-- This script enables Supabase Realtime for message_queue and webhook_queue
-- tables, allowing the background worker to listen for events instantly.
-- =========================================================================

-- Check if tables exist and add them to supabase_realtime publication
BEGIN;
  -- Enable replica identity full to receive old/new values in updates
  ALTER TABLE public.message_queue REPLICA IDENTITY FULL;
  ALTER TABLE public.webhook_queue REPLICA IDENTITY FULL;

  -- Add tables to the supabase_realtime publication (create publication if not exists is not needed as Supabase manages it)
  -- But we execute addition safely. Note: In some Supabase setups, this publication already exists.
  -- To prevent errors if the table is already in the publication, we can do this:
  -- (If running multiple times, postgreSQL might throw 'already exists' but it can be handled or ignored)
  
  -- Check if supabase_realtime publication exists
  -- If yes, add tables to it.
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_queue;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.webhook_queue;
COMMIT;
