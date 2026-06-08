-- Reconstructed initial schema migration for PropSpera.
-- This file is built from the repository's existing Supabase migration files,
-- inferred table usage in the frontend, and explicit RPC/policy definitions.
--
-- Known explicit schema elements are preserved verbatim when available.
-- Inferred tables/columns come from frontend table access patterns.

create extension if not exists pgcrypto;

-- ──────────────────────────────────────────────────────────────────────────
-- Users / Auth-linked profiles
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  auth_id uuid unique references auth.users(id) on delete set null,
  email text not null unique,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Agent profiles
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.agents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text,
  phone text,
  company_name text,
  license_number text,
  bio text,
  years_experience int not null default 0,
  specializations text[] not null default '{}',
  verification_docs text[] not null default '{}',
  verification_status text not null default 'pending',
  avatar_url text,
  total_listings int not null default 0,
  rating numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Property listings
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid not null references public.agents(id) on delete cascade,
  title text not null,
  description text,
  property_type text not null,
  listing_type text not null,
  price numeric not null,
  currency text not null default 'RWF',
  bedrooms int,
  bathrooms int,
  area_sqm numeric,
  built_area numeric,
  location text,
  neighborhood text,
  address text,
  latitude numeric,
  longitude numeric,
  images text[] not null default '{}',
  video_url text,
  amenities text[] not null default '{}',
  furnished text,
  status text not null default 'pending',
  featured boolean not null default false,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Inquiries from buyers to agents
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  message text not null,
  property_title text,
  status text not null default 'pending',
  responded_at timestamptz,
  email_notification_sent boolean not null default false,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Favorites / saved properties
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_property_unique unique (user_id, property_id)
);

-- ──────────────────────────────────────────────────────────────────────────
-- Messaging / support messages
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Notification settings and saved search infrastructure
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.notification_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  email text not null,
  new_property_match boolean not null default true,
  inquiry_response boolean not null default true,
  price_drop boolean not null default true,
  favorite_status_change boolean not null default true,
  weekly_digest boolean not null default false,
  marketing_emails boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_preferences_user_unique unique (user_id)
);

create table if not exists public.saved_searches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}',
  is_active boolean not null default true,
  last_matched_at timestamptz,
  match_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  data jsonb not null default '{}',
  is_read boolean not null default false,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notifications (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  title text not null,
  body text,
  agent_id uuid references public.agents(id) on delete set null,
  is_read boolean not null default false,
  read_at timestamptz,
  read_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Profile activity and connected accounts
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.user_activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  description text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.connected_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null,
  provider_email text,
  connected_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Property reviews and review votes
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.property_reviews (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  user_name text not null,
  user_avatar text,
  rating int not null,
  review_text text not null,
  photos text[] not null default '{}',
  helpful_count int not null default 0,
  not_helpful_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_reviews_unique_user_per_property unique (property_id, user_id)
);

create table if not exists public.review_votes (
  id uuid default gen_random_uuid() primary key,
  review_id uuid not null references public.property_reviews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  vote_type text not null,
  created_at timestamptz not null default now(),
  constraint review_votes_unique_user_per_review unique (review_id, user_id)
);

create table if not exists public.agent_reviews (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid not null references public.agents(id) on delete cascade,
  reviewer_id uuid not null references public.users(id) on delete cascade,
  reviewer_name text not null,
  reviewer_avatar text,
  rating int not null,
  review_text text not null,
  helpful_count int not null default 0,
  not_helpful_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_reviews_unique_reviewer_per_agent unique (agent_id, reviewer_id)
);

create table if not exists public.agent_review_votes (
  id uuid default gen_random_uuid() primary key,
  review_id uuid not null references public.agent_reviews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  vote_type text not null,
  created_at timestamptz not null default now(),
  constraint agent_review_votes_unique_user_per_review unique (review_id, user_id)
);

-- ──────────────────────────────────────────────────────────────────────────
-- WhatsApp click tracking (explicitly present in repo migrations)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.whatsapp_clicks (
  id uuid default gen_random_uuid() primary key,
  property_id text not null,
  property_title text,
  agent_id text,
  clicked_at timestamptz not null default now(),
  user_identifier text,
  source text default 'web'
);

create index if not exists whatsapp_clicks_clicked_at_idx on public.whatsapp_clicks (clicked_at desc);
create index if not exists whatsapp_clicks_property_id_idx on public.whatsapp_clicks (property_id);
create index if not exists whatsapp_clicks_agent_id_idx on public.whatsapp_clicks (agent_id);

alter table public.whatsapp_clicks enable row level security;

create policy "allow_insert_whatsapp_clicks"
  on public.whatsapp_clicks for insert
  with check (true);

create policy "allow_admin_select_whatsapp_clicks"
  on public.whatsapp_clicks for select
  using (auth.role() = 'service_role' or auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────────────────
-- RLS policy fixes / admin policies from repo migrations
-- ──────────────────────────────────────────────────────────────────────────
-- Users: public profiles should be readable by anyone.
-- This matches fix_users_rls_select_policy.sql.
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

create policy "users_select_all"
  on public.users for select
  using (true);

-- Agents can be listed by admins.
create policy "Admins can read all agents"
  on public.agents
  for select
  using (
    exists (
      select 1 from public.users
      where users.auth_id = auth.uid()
        and users.role = 'admin'
    )
  );

create policy "Admins can update all agents"
  on public.agents
  for update
  using (
    exists (
      select 1 from public.users
      where users.auth_id = auth.uid()
        and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.auth_id = auth.uid()
        and users.role = 'admin'
    )
  );

-- Admin access to all properties.
create policy "Admins can read all properties"
  on public.properties
  for select
  using (
    exists (
      select 1 from public.users
      where users.auth_id = auth.uid()
        and users.role = 'admin'
    )
  );

create policy "Admins can update all properties"
  on public.properties
  for update
  using (
    exists (
      select 1 from public.users
      where users.auth_id = auth.uid()
        and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.auth_id = auth.uid()
        and users.role = 'admin'
    )
  );

-- Inquiries policies inferred from fix_imported_users.sql and fix_inquiries_schema.sql.
create policy "inquiries_insert_anyone"
  on public.inquiries for insert
  with check (true);

create policy "inquiries_select_agent"
  on public.inquiries for select
  using (
    agent_id in (
      select a.id
      from public.agents a
      join public.users u on u.id = a.user_id
      where u.auth_id = auth.uid()
    )
  );

create policy "inquiries_update_agent"
  on public.inquiries for update
  using (
    agent_id in (
      select a.id
      from public.agents a
      join public.users u on u.id = a.user_id
      where u.auth_id = auth.uid()
    )
  );

create policy "inquiries_all_admin"
  on public.inquiries for all
  using (
    exists (
      select 1 from public.users
      where auth_id = auth.uid() and role = 'admin'
    )
  );

-- Properties policies inferred from fix_imported_users.sql.
create policy "agents_insert_properties"
  on public.properties for insert
  with check (
    agent_id in (
      select a.id
      from public.agents a
      join public.users u on u.id = a.user_id
      where u.auth_id = auth.uid()
    )
  );

create policy "agents_select_own_properties"
  on public.properties for select
  using (
    status = 'approved'
    or agent_id in (
      select a.id
      from public.agents a
      join public.users u on u.id = a.user_id
      where u.auth_id = auth.uid()
    )
  );

create policy "agents_update_own_properties"
  on public.properties for update
  using (
    agent_id in (
      select a.id
      from public.agents a
      join public.users u on u.id = a.user_id
      where u.auth_id = auth.uid()
    )
  )
  with check (
    agent_id in (
      select a.id
      from public.agents a
      join public.users u on u.id = a.user_id
      where u.auth_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────────────────
-- Security-definer RPCs from repo migrations
-- ──────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_id uuid;
  v_email text;
  v_name text;
  v_profile json;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'ensure_user_profile: caller is not authenticated';
  END IF;

  SELECT
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)
  INTO v_email, v_name
  FROM auth.users au
  WHERE au.id = v_auth_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'ensure_user_profile: auth.users entry not found for uid %', v_auth_id;
  END IF;

  SELECT row_to_json(u) INTO v_profile
  FROM public.users u
  WHERE u.auth_id = v_auth_id
  LIMIT 1;

  IF v_profile IS NOT NULL THEN
    RETURN v_profile;
  END IF;

  UPDATE public.users
  SET auth_id = v_auth_id, updated_at = now()
  WHERE email = v_email
    AND auth_id IS NULL;

  SELECT row_to_json(u) INTO v_profile
  FROM public.users u
  WHERE u.auth_id = v_auth_id
  LIMIT 1;

  IF v_profile IS NOT NULL THEN
    RETURN v_profile;
  END IF;

  INSERT INTO public.users (auth_id, email, full_name, role, created_at, updated_at)
  VALUES (v_auth_id, v_email, v_name, 'buyer', now(), now());

  SELECT row_to_json(u) INTO v_profile
  FROM public.users u
  WHERE u.auth_id = v_auth_id
  LIMIT 1;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;

CREATE OR REPLACE FUNCTION public.register_agent(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_company_name text,
  p_bio text,
  p_years_experience int,
  p_specializations text[],
  p_verification_docs text[],
  p_avatar_url text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid;
BEGIN
  INSERT INTO public.agents (
    user_id, full_name, phone, company_name, bio,
    years_experience, specializations, verification_docs,
    avatar_url, verification_status, total_listings, rating,
    created_at, updated_at
  ) VALUES (
    p_user_id, p_full_name, p_phone, p_company_name, p_bio,
    p_years_experience, p_specializations, p_verification_docs,
    p_avatar_url, 'pending', 0, 0,
    now(), now()
  )
  RETURNING id INTO v_agent_id;

  UPDATE public.users SET role = 'agent', updated_at = now()
  WHERE id = p_user_id;

  RETURN v_agent_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_agent TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_property(
  p_agent_id uuid,
  p_title text,
  p_description text,
  p_property_type text,
  p_listing_type text,
  p_price numeric,
  p_currency text,
  p_bedrooms int,
  p_bathrooms int,
  p_area_sqm numeric,
  p_built_area numeric,
  p_location text,
  p_neighborhood text,
  p_address text,
  p_latitude numeric,
  p_longitude numeric,
  p_images text[],
  p_video_url text,
  p_amenities text[],
  p_furnished text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_property_id uuid;
  v_caller_agent_id uuid;
BEGIN
  SELECT id INTO v_caller_agent_id
  FROM public.agents
  WHERE id = p_agent_id
    AND user_id = auth.uid();

  IF v_caller_agent_id IS NULL THEN
    SELECT a.id INTO v_caller_agent_id
    FROM public.agents a
    JOIN public.users u ON u.id = a.user_id
    WHERE a.id = p_agent_id
      AND u.auth_id = auth.uid();
  END IF;

  IF v_caller_agent_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: caller does not own agent record %', p_agent_id;
  END IF;

  INSERT INTO public.properties (
    agent_id, title, description, property_type, listing_type,
    price, currency, bedrooms, bathrooms, area_sqm, built_area,
    location, neighborhood, address, latitude, longitude,
    images, video_url, amenities, furnished,
    status, featured, views, created_at, updated_at
  ) VALUES (
    p_agent_id, p_title, p_description, p_property_type, p_listing_type,
    p_price, p_currency, p_bedrooms, p_bathrooms, p_area_sqm, p_built_area,
    p_location, p_neighborhood, p_address, p_latitude, p_longitude,
    p_images, p_video_url, p_amenities, p_furnished,
    'pending', false, 0, now(), now()
  )
  RETURNING id INTO v_property_id;

  RETURN v_property_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_property TO authenticated;
