-- Pending SumUp payments before raffle entries are recorded

CREATE TABLE IF NOT EXISTS public.raffle_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  sumup_checkout_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raffle_checkouts_raffle ON public.raffle_checkouts(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_checkouts_member ON public.raffle_checkouts(member_id);
CREATE INDEX IF NOT EXISTS idx_raffle_checkouts_sumup ON public.raffle_checkouts(sumup_checkout_id);
CREATE INDEX IF NOT EXISTS idx_raffle_checkouts_status ON public.raffle_checkouts(status);

ALTER TABLE public.raffle_checkouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own raffle checkouts" ON public.raffle_checkouts;
CREATE POLICY "Users read own raffle checkouts"
  ON public.raffle_checkouts FOR SELECT
  USING (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins manage raffle checkouts" ON public.raffle_checkouts;
CREATE POLICY "Admins manage raffle checkouts"
  ON public.raffle_checkouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );

GRANT SELECT ON public.raffle_checkouts TO authenticated;
GRANT ALL ON public.raffle_checkouts TO service_role;
