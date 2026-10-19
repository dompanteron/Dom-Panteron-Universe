-- Optional structured specs per product (volume, material, etc.) by line.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS attributes JSONB NOT NULL DEFAULT '{}'::jsonb;
