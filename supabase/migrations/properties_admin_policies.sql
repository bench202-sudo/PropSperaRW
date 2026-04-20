-- Allow admins to read ALL properties regardless of status
CREATE POLICY "Admins can read all properties"
ON public.properties
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
  )
);

-- Allow admins to update any property (approve/reject/hide etc.)
CREATE POLICY "Admins can update all properties"
ON public.properties
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
