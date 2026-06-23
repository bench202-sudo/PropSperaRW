-- =============================================================================
-- Fix pre-migration users: link public.users.auth_id to auth.users.id
--
-- Problem:
--   Users migrated from Famous.ai have public.users rows with auth_id = NULL.
--   After password reset / invite, they receive a new auth.users entry (new UUID)
--   but public.users.auth_id is never updated.  This breaks every lookup that
--   uses auth_id, including:
--     - fetchAppUser(auth.uid())       → returns null → appUser = null
--     - signIn profile check           → signs the user out
--     - submit_property fallback check → RAISE EXCEPTION Unauthorized
--
--   The previous fix_imported_users.sql attempted to INSERT new public.users
--   rows (with gen_random_uuid() ids).  Because email is unique, most of those
--   inserts silently hit ON CONFLICT DO NOTHING, leaving auth_id = NULL.
--   When they did succeed they created orphan rows whose id does not match
--   agents.user_id, so the agent lookup in AddPropertyModal still failed.
--
-- Fix:
--   Step 1 – UPDATE existing rows: set auth_id = auth.users.id where the
--            emails match (safe because auth.users enforces email uniqueness).
--   Step 2 – Remove orphan rows inserted by fix_imported_users.sql that are
--            not referenced by agents.user_id and are now duplicates of the
--            row we just updated.
-- =============================================================================

-- ─── Step 1: Backfill auth_id on existing rows ───────────────────────────────
-- auth.users enforces email uniqueness, so the match is always 1-to-1.
UPDATE public.users pu
SET
  auth_id    = au.id,
  updated_at = now()
FROM auth.users au
WHERE au.email       = pu.email
  AND pu.auth_id     IS NULL
  AND (au.deleted_at IS NULL OR au.deleted_at > now());

-- ─── Step 2: Remove orphan duplicate rows ─────────────────────────────────────
-- These are rows created by fix_imported_users.sql (gen_random_uuid() id,
-- auth_id = some new UUID).  They are safe to delete when:
--   a) no agents row references them  (they were never the "real" user row)
--   b) another row with the SAME auth_id already exists (the one we fixed above)
DELETE FROM public.users pu
WHERE
  -- not referenced by any agent
  NOT EXISTS (
    SELECT 1 FROM public.agents a WHERE a.user_id = pu.id
  )
  -- a "twin" row with the same auth_id exists (the original row, now updated)
  AND EXISTS (
    SELECT 1 FROM public.users pu2
    WHERE pu2.auth_id = pu.auth_id
      AND pu2.id      <> pu.id
  );
