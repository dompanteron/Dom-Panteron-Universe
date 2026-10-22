-- Realms: customer-facing worlds (Champagne, HOME, Water, Fashion, Art, Jewelry, Music…)
-- Collections stay as drops inside a realm; same checkout engine.

CREATE TABLE IF NOT EXISTS public.realms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  hero_image_url TEXT,
  accent TEXT NOT NULL DEFAULT 'violet'
    CHECK (accent IN ('violet', 'gold', 'emerald', 'rose', 'ice', 'amber')),
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  kind TEXT NOT NULL DEFAULT 'commerce' CHECK (kind IN ('commerce', 'music', 'mixed')),
  listen_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_realms_status ON public.realms(status);
CREATE INDEX IF NOT EXISTS idx_realms_display_order ON public.realms(display_order);

ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS realm_id UUID REFERENCES public.realms(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_collections_realm ON public.collections(realm_id);

-- Expand product_line / raffle tags for new realms (drop old check if present)
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_product_line_check;
ALTER TABLE public.collections
  ADD CONSTRAINT collections_product_line_check
  CHECK (product_line IS NULL OR product_line IN (
    'fashion', 'champagne', 'home', 'water', 'art', 'jewelry', 'music'
  ));

ALTER TABLE public.raffles DROP CONSTRAINT IF EXISTS raffles_product_line_check;
ALTER TABLE public.raffles
  ADD CONSTRAINT raffles_product_line_check
  CHECK (product_line IS NULL OR product_line IN (
    'fashion', 'champagne', 'home', 'water', 'art', 'jewelry', 'music'
  ));

INSERT INTO public.realms (id, slug, name, tagline, description, display_order, status, kind, accent, listen_path)
VALUES
  (
    'f1a10001-0001-4001-8001-000000000001',
    'fashion',
    'Fashion',
    'Wear the jungle frequency',
    'Ready-made clothing and drops — presence, power, and play.',
    0,
    'active',
    'commerce',
    'violet',
    NULL
  ),
  (
    'f1a10001-0001-4001-8001-000000000002',
    'champagne',
    'Champagne',
    'Raise a glass to the frequency',
    'Limited bottles for celebrations, launches, and the inner circle.',
    10,
    'active',
    'commerce',
    'gold',
    NULL
  ),
  (
    'f1a10001-0001-4001-8001-000000000003',
    'home',
    'HOME',
    'Live inside the jungle mood',
    'Objects and accents for the space you return to after the night.',
    11,
    'active',
    'commerce',
    'amber',
    NULL
  ),
  (
    'f1a10001-0001-4001-8001-000000000004',
    'water',
    'Water',
    'Carry the signal with you',
    'Reusable bottles for daily rhythm — studio, travel, and everything between.',
    12,
    'active',
    'commerce',
    'ice',
    NULL
  ),
  (
    'f1a10001-0001-4001-8001-000000000005',
    'art',
    'Art',
    'Visual frequency',
    'Pieces and prints from the Dom Panteron universe — collect the signal.',
    20,
    'active',
    'commerce',
    'rose',
    NULL
  ),
  (
    'f1a10001-0001-4001-8001-000000000006',
    'jewelry',
    'Jewelry',
    'Adorn the circle',
    'Marks of belonging — subtle power for everyday and ceremony.',
    21,
    'active',
    'commerce',
    'gold',
    NULL
  ),
  (
    'f1a10001-0001-4001-8001-000000000007',
    'music',
    'Music',
    'Sound that raises the signal',
    'Releases and frequencies — listen deep, wear the merch when it drops.',
    30,
    'active',
    'music',
    'violet',
    '/music'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = COALESCE(public.realms.tagline, EXCLUDED.tagline),
  description = COALESCE(public.realms.description, EXCLUDED.description),
  status = EXCLUDED.status,
  kind = EXCLUDED.kind,
  accent = EXCLUDED.accent,
  listen_path = COALESCE(public.realms.listen_path, EXCLUDED.listen_path);

UPDATE public.collections c
SET realm_id = r.id,
    product_line = r.slug
FROM public.realms r
WHERE c.product_line = r.slug;

UPDATE public.collections c
SET realm_id = r.id,
    product_line = 'fashion'
FROM public.realms r
WHERE r.slug = 'fashion'
  AND c.realm_id IS NULL
  AND (c.product_line IS NULL OR c.product_line = 'fashion');

ALTER TABLE public.realms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read active realms" ON public.realms;
CREATE POLICY "Read active realms"
  ON public.realms FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admins manage realms" ON public.realms;
CREATE POLICY "Admins manage realms"
  ON public.realms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = auth.uid() AND m.role = 'admin'
    )
  );

GRANT SELECT ON public.realms TO anon, authenticated;
