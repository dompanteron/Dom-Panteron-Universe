-- Music releases catalog (replaces static lib/catalog/music.ts)

CREATE TABLE IF NOT EXISTS public.music_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'Single',
  phase_label TEXT NOT NULL DEFAULT 'Coming soon',
  note TEXT,
  cover_image_url TEXT,
  listen_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  release_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_music_releases_status ON public.music_releases(status);
CREATE INDEX IF NOT EXISTS idx_music_releases_display_order ON public.music_releases(display_order);

ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read active music releases" ON public.music_releases;
CREATE POLICY "Read active music releases"
  ON public.music_releases FOR SELECT
  USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins manage music releases" ON public.music_releases;
CREATE POLICY "Admins manage music releases"
  ON public.music_releases FOR ALL
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

GRANT SELECT ON public.music_releases TO anon, authenticated;
GRANT ALL ON public.music_releases TO service_role;

INSERT INTO public.music_releases (title, slug, kind, phase_label, note, display_order, status)
VALUES
  (
    'Jungle Frequency',
    'jungle-frequency',
    'Single',
    'Coming soon',
    'Opening signal of the universe',
    0,
    'active'
  ),
  (
    'Conscious Power',
    'conscious-power',
    'EP',
    'In formation',
    'Body, mind, and field in motion',
    1,
    'active'
  ),
  (
    'Night Circle',
    'night-circle-music',
    'Session',
    'Planned',
    'Live listening for members first',
    2,
    'active'
  )
ON CONFLICT (slug) DO NOTHING;
