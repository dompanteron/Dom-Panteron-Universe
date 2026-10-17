-- Allow authenticated users to create their own member profile after signup

GRANT SELECT, INSERT ON public.members TO authenticated;
GRANT SELECT ON public.members TO anon;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.members;
CREATE POLICY "Users can insert own profile"
  ON public.members FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.members;
CREATE POLICY "Users can update own profile"
  ON public.members FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);
