-- =============================================================================
-- Fix imported users: their public.users.id = OLD auth UUID, but
-- auth.uid() is now a NEW UUID.  agents.user_id references users.id, so
-- any RLS policy that checks  agents.user_id = auth.uid()  breaks.
--
-- Step 1: Update agents.user_id to use auth_id (= auth.uid()) so RLS works.
-- Step 2: Add a properties INSERT policy that is auth_id-aware.
-- Step 3: Ensure every user in auth.users has a matching public.users row.
--
-- Run in Supabase Dashboard → SQL Editor
-- =============================================================================

-- ─── Step 1: Fix agents.user_id for imported users ───────────────────────────
-- For any agent whose user_id == public.users.id but public.users.auth_id is
-- a DIFFERENT uuid (i.e. an imported user), update user_id → auth_id so that
-- agents.user_id = auth.uid() as expected by RLS policies.
UPDATE public.agents AS a
SET    user_id    = u.auth_id,
       updated_at = now()
FROM   public.users AS u
WHERE  a.user_id = u.id          -- agent currently linked to this user row
  AND  u.auth_id IS NOT NULL     -- user has a new auth UUID stored
  AND  u.id::text <> u.auth_id::text;  -- old id ≠ new auth_id  → imported user

-- ─── Step 2: Fix public.users.id for imported users ──────────────────────────
-- Some policies check  users.id = auth.uid()  directly (e.g. inquiries admin).
-- We cannot alter the PK while FKs exist, so we instead make those policies
-- use auth_id instead.  The policies below replace the existing ones.

-- Drop old inquiries admin policy that used users.id = auth.uid()
DROP POLICY IF EXISTS "inquiries_all_admin"        ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_agent"     ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_update_agent"     ON public.inquiries;

-- Re-create using auth_id / updated agents.user_id
CREATE POLICY "inquiries_insert_anyone"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "inquiries_select_agent"
  ON public.inquiries FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "inquiries_update_agent"
  ON public.inquiries FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "inquiries_all_admin"
  ON public.inquiries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- ─── Step 3: Ensure every auth.users entry has a public.users row ────────────
-- Imported users whose auth_id doesn't exist in public.users yet won't be
-- able to sign in. This inserts minimal placeholder rows so they can log in.
INSERT INTO public.users (id, auth_id, email, full_name, role, created_at, updated_at)
SELECT
  gen_random_uuid(),           -- new app-level id
  au.id,                       -- auth_id = auth.users.id (the new UUID)
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'agent',
  now(),
  now()
FROM auth.users AS au
WHERE au.id NOT IN (
  SELECT auth_id FROM public.users WHERE auth_id IS NOT NULL
)
ON CONFLICT DO NOTHING;
