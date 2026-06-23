-- Allow admins to update any agent record (approve/reject/feedback)
CREATE POLICY "Admins can update all agents"
ON public.agents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
  )
);
