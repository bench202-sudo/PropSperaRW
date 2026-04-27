-- =============================================================================
-- Fix imported users: their public.users.id = OLD app UUID, but
-- auth.uid() returns a NEW UUID after re-import.
--
-- Strategy: leave agents.user_id (FK → users.id) UNTOUCHED.
-- Instead, rewrite all RLS policies to resolve the calling user via
-- users.auth_id = auth.uid(), then join to agents.user_id = users.id.
-- The submit_property SECURITY DEFINER RPC already uses this pattern.
--
-- Run in Supabase Dashboard → SQL Editor
-- =============================================================================

-- ─── Step 1: Backfill missing public.users rows ───────────────────────────────
-- Any auth.users entry with no matching public.users.auth_id row will cause
-- fetchAppUser to return null, leaving appUser = null and blocking all actions.
INSERT INTO public.users (id, auth_id, email, full_name, role, created_at, updated_at)
SELECT
  gen_random_uuid(),
  au.id,
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

-- ─── Step 2: Fix inquiries RLS policies ──────────────────────────────────────
-- Old policies compared agents.user_id = auth.uid() directly, which breaks for
-- imported users (auth.uid() is their NEW UUID; agents.user_id holds OLD UUID).
-- New policies resolve via: users.auth_id = auth.uid() → users.id → agents.user_id

DROP POLICY IF EXISTS "inquiries_all_admin"    ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_agent" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_update_agent" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_insert_anyone" ON public.inquiries;

-- Anyone can submit an inquiry (buyers are anonymous or signed-in)
CREATE POLICY "inquiries_insert_anyone"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- Agents see their own inquiries — resolved through auth_id
CREATE POLICY "inquiries_select_agent"
  ON public.inquiries FOR SELECT
  USING (
    agent_id IN (
      SELECT a.id
      FROM   public.agents a
      JOIN   public.users  u ON u.id = a.user_id
      WHERE  u.auth_id = auth.uid()
    )
  );

-- Agents update status on their own inquiries
CREATE POLICY "inquiries_update_agent"
  ON public.inquiries FOR UPDATE
  USING (
    agent_id IN (
      SELECT a.id
      FROM   public.agents a
      JOIN   public.users  u ON u.id = a.user_id
      WHERE  u.auth_id = auth.uid()
    )
  );

-- Admins have full access
CREATE POLICY "inquiries_all_admin"
  ON public.inquiries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- ─── Step 3: Fix properties RLS policies ─────────────────────────────────────
-- Agents need to INSERT and SELECT their own properties.
-- Drop any existing agent-facing property policies and recreate auth_id-aware ones.

DROP POLICY IF EXISTS "Agents can insert properties"       ON public.properties;
DROP POLICY IF EXISTS "Agents can select own properties"   ON public.properties;
DROP POLICY IF EXISTS "Agents can update own properties"   ON public.properties;
DROP POLICY IF EXISTS "agents_insert_properties"           ON public.properties;
DROP POLICY IF EXISTS "agents_select_own_properties"       ON public.properties;
DROP POLICY IF EXISTS "agents_update_own_properties"       ON public.properties;

-- Agents can insert listings for themselves
CREATE POLICY "agents_insert_properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT a.id
      FROM   public.agents a
      JOIN   public.users  u ON u.id = a.user_id
      WHERE  u.auth_id = auth.uid()
    )
  );

-- Agents can read all approved/public properties + their own pending ones
CREATE POLICY "agents_select_own_properties"
  ON public.properties FOR SELECT
  USING (
    status = 'approved'
    OR agent_id IN (
      SELECT a.id
      FROM   public.agents a
      JOIN   public.users  u ON u.id = a.user_id
      WHERE  u.auth_id = auth.uid()
    )
  );

-- Agents can update their own listings
CREATE POLICY "agents_update_own_properties"
  ON public.properties FOR UPDATE
  USING (
    agent_id IN (
      SELECT a.id
      FROM   public.agents a
      JOIN   public.users  u ON u.id = a.user_id
      WHERE  u.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    agent_id IN (
      SELECT a.id
      FROM   public.agents a
      JOIN   public.users  u ON u.id = a.user_id
      WHERE  u.auth_id = auth.uid()
    )
  );
