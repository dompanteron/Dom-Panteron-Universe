-- Tag raffles to a product line (champagne, home, water, fashion) or leave null for universe-wide draws.

ALTER TABLE public.raffles
  ADD COLUMN IF NOT EXISTS product_line TEXT
  CHECK (product_line IS NULL OR product_line IN ('fashion', 'champagne', 'home', 'water'));

CREATE INDEX IF NOT EXISTS idx_raffles_product_line
  ON public.raffles(product_line)
  WHERE product_line IS NOT NULL;
