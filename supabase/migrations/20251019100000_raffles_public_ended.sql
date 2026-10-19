-- Allow members and visitors to read ended raffles (winners on public pages)

DROP POLICY IF EXISTS "Read raffles" ON public.raffles;
CREATE POLICY "Read raffles"
  ON public.raffles FOR SELECT
  USING (
    status IN ('active', 'ended')
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );
