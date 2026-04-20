-- Allow admins to read ALL agents regardless of verification_status
CREATE POLICY "Admins can read all agents"
ON public.agents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
  )
);
