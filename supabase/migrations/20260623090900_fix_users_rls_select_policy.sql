-- =============================================================================
-- Fix RLS SELECT policy on public.users
--
-- Problem 1 – Infinite recursion:
--   The previous version of this file created "users_select_admin" which
--   contained a sub-SELECT FROM public.users inside a policy ON public.users.
--   Postgres has no protection against this → infinite recursion → every query
--   that touched public.users (including JOIN subqueries in the properties and
--   agents RLS policies) hung indefinitely.  This caused properties/agents to
--   never load after login.
--
-- Problem 2 – Anon reads blocked:
--   "users_select_by_auth_id" (USING auth_id = auth.uid()) returned 0 rows for
--   the anonymous supabasePublic client (auth.uid() = NULL), so agent names and
--   avatars were missing from all property/agent listings.
--
-- Fix:
--   Drop all existing SELECT policies on public.users.
--   Create a single, non-recursive policy: USING (true).
--   This allows every role (anon, authenticated) to read user profile rows,
--   which is appropriate for a public real estate platform.
--   Admins use the service-role key (via edge functions) which bypasses RLS
--   entirely — they do not need a client-side SELECT policy.
-- =============================================================================

-- Drop every variant that may exist (including the broken ones)
DROP POLICY IF EXISTS "Users can view own profile"        ON public.users;
DROP POLICY IF EXISTS "Users can see own data"            ON public.users;
DROP POLICY IF EXISTS "users_select_own"                  ON public.users;
DROP POLICY IF EXISTS "Allow individual read access"      ON public.users;
DROP POLICY IF EXISTS "users_read_own"                    ON public.users;
DROP POLICY IF EXISTS "Enable read access for users"      ON public.users;
DROP POLICY IF EXISTS "users_select_by_auth_id"           ON public.users;
DROP POLICY IF EXISTS "users_select_admin"                ON public.users;
DROP POLICY IF EXISTS "users_select_public"               ON public.users;
DROP POLICY IF EXISTS "users_select_all"                  ON public.users;

-- Single non-recursive policy: anyone can read user profiles.
-- No subquery → no recursion risk.
CREATE POLICY "users_select_all"
  ON public.users FOR SELECT
  USING (true);
