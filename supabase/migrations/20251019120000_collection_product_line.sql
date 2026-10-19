-- Product line groups collections (champagne, home, water) without separate shops.

ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS product_line TEXT
  CHECK (product_line IS NULL OR product_line IN ('fashion', 'champagne', 'home', 'water'));

CREATE INDEX IF NOT EXISTS idx_collections_product_line
  ON public.collections(product_line)
  WHERE product_line IS NOT NULL;

UPDATE public.collections
SET product_line = 'fashion'
WHERE product_line IS NULL;

INSERT INTO public.collections (id, name, slug, subtitle, description, display_order, status, product_line)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Dom Panteron Champagne',
  'champagne',
  'Celebrate with conscious sparkle',
  'Limited champagne selections from the universe — for milestones, circles, and the nights that matter.',
  10,
  'active',
  'champagne'
)
ON CONFLICT (slug) DO UPDATE SET
  product_line = EXCLUDED.product_line,
  subtitle = COALESCE(public.collections.subtitle, EXCLUDED.subtitle),
  description = COALESCE(public.collections.description, EXCLUDED.description);

INSERT INTO public.collections (id, name, slug, subtitle, description, display_order, status, product_line)
VALUES (
  'd4e5f6a7-b8c9-0123-def0-234567890123',
  'HOME by Dom Panteron',
  'home',
  'Objects for the space you live in',
  'Home pieces shaped with the same frequency as the clothing — calm, bold, and built to stay.',
  11,
  'active',
  'home'
)
ON CONFLICT (slug) DO UPDATE SET
  product_line = EXCLUDED.product_line,
  subtitle = COALESCE(public.collections.subtitle, EXCLUDED.subtitle),
  description = COALESCE(public.collections.description, EXCLUDED.description);

INSERT INTO public.collections (id, name, slug, subtitle, description, display_order, status, product_line)
VALUES (
  'e5f6a7b8-c9d0-1234-ef01-345678901234',
  'Water Bottles',
  'water-bottles',
  'Hydrate the signal',
  'Reusable bottles carrying the panteron mark — for studio, jungle, and everyday flow.',
  12,
  'active',
  'water'
)
ON CONFLICT (slug) DO UPDATE SET
  product_line = EXCLUDED.product_line,
  subtitle = COALESCE(public.collections.subtitle, EXCLUDED.subtitle),
  description = COALESCE(public.collections.description, EXCLUDED.description);
