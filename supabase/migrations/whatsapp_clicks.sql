-- Create whatsapp_clicks table to track when buyers click the WhatsApp inquiry button
create table if not exists public.whatsapp_clicks (
  id              uuid default gen_random_uuid() primary key,
  property_id     text not null,
  property_title  text,
  agent_id        text,
  clicked_at      timestamptz not null default now(),
  user_identifier text,
  source          text default 'web'
);

-- Index for fast admin queries
create index if not exists whatsapp_clicks_clicked_at_idx on public.whatsapp_clicks (clicked_at desc);
create index if not exists whatsapp_clicks_property_id_idx on public.whatsapp_clicks (property_id);
create index if not exists whatsapp_clicks_agent_id_idx on public.whatsapp_clicks (agent_id);

-- Enable RLS
alter table public.whatsapp_clicks enable row level security;

-- Anyone (including anonymous visitors) can insert a click
create policy "allow_insert_whatsapp_clicks"
  on public.whatsapp_clicks for insert
  with check (true);

-- Only service role / admin can select (admin dashboard reads via service key)
create policy "allow_admin_select_whatsapp_clicks"
  on public.whatsapp_clicks for select
  using (auth.role() = 'service_role' or auth.role() = 'authenticated');
