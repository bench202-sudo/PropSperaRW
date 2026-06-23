-- ============================================================
-- Fix inquiries table: add missing columns + RLS insert policy
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Add all missing columns
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS buyer_name     TEXT,
  ADD COLUMN IF NOT EXISTS buyer_email    TEXT,
  ADD COLUMN IF NOT EXISTS buyer_phone    TEXT,
  ADD COLUMN IF NOT EXISTS property_title TEXT,
  ADD COLUMN IF NOT EXISTS user_id        UUID,
  ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS responded_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Migrate existing rows from old column names to new ones
UPDATE public.inquiries
SET
  buyer_name  = COALESCE(buyer_name,  name),
  buyer_email = COALESCE(buyer_email, email),
  buyer_phone = COALESCE(buyer_phone, phone)
WHERE buyer_name IS NULL;

-- Step 3: Drop ALL existing policies on the table (old names may differ)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'inquiries'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.inquiries';
  END LOOP;
END $$;

-- Step 4: Re-create clean policies

-- Anyone (including anonymous users) can submit an inquiry
CREATE POLICY "inquiries_insert_anyone"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

-- Agents can read their own inquiries
CREATE POLICY "inquiries_select_agent"
  ON public.inquiries
  FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

-- Agents can update status on their own inquiries
CREATE POLICY "inquiries_update_agent"
  ON public.inquiries
  FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

-- Admins have full access
CREATE POLICY "inquiries_all_admin"
  ON public.inquiries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );
