-- Add agent_id FK to admin_notifications so the notification panel
-- can join directly to the agents table.
ALTER TABLE public.admin_notifications
  ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL;
