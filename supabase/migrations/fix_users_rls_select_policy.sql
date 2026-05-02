-- =============================================================================
-- Fix RLS SELECT policy on public.users
--
-- Problem:
--   The existing SELECT policy (if any) uses `id = auth.uid()`.
--   After migration, users.id = OLD UUID but auth.uid() = NEW UUID.
--   So the policy blocks every SELECT for pre-migration users, causing
--   fetchAppUser() to return null and triggering unintended sign-outs.
--
-- Fix:
--   Drop any SELECT policies that use the old `id` pattern.
--   Create one that uses `auth_id = auth.uid()` (the correct post-migration
--   pattern) and a second for admins (checked via a subquery on auth_id).
-- =============================================================================

-- Drop every possible variant of the SELECT policy that might exist
DROP POLICY IF EXISTS "Users can view own profile"        ON public.users;
DROP POLICY IF EXISTS "Users can see own data"            ON public.users;
DROP POLICY IF EXISTS "users_select_own"                  ON public.users;
DROP POLICY IF EXISTS "Allow individual read access"      ON public.users;
DROP POLICY IF EXISTS "users_read_own"                    ON public.users;
DROP POLICY IF EXISTS "Enable read access for users"      ON public.users;
DROP POLICY IF EXISTS "users_select_by_auth_id"           ON public.users;
DROP POLICY IF EXISTS "users_select_admin"                ON public.users;

-- Users can read their own row (matched by auth_id, not legacy id)
CREATE POLICY "users_select_by_auth_id"
  ON public.users FOR SELECT
  USING (auth_id = auth.uid());

-- Admins can read all user rows
-- (avoids recursive policy by using a direct subselect on auth_id only)
CREATE POLICY "users_select_admin"
  ON public.users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT u.auth_id FROM public.users u
      WHERE u.role = 'admin' AND u.auth_id IS NOT NULL
    )
  );
