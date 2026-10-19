-- Per-collection checkout rules and optional product stock (e.g. water bottles).

ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS requires_age_confirm BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_multi_quantity BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_quantity_per_order INT NOT NULL DEFAULT 10
    CHECK (max_quantity_per_order >= 1 AND max_quantity_per_order <= 99),
  ADD COLUMN IF NOT EXISTS checkout_note TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity INT
    CHECK (stock_quantity IS NULL OR stock_quantity >= 0);

ALTER TABLE public.product_orders
  ADD COLUMN IF NOT EXISTS buyer_age_confirmed BOOLEAN;

UPDATE public.collections
SET
  allow_multi_quantity = false,
  max_quantity_per_order = 1
WHERE product_line = 'fashion';

UPDATE public.collections
SET
  requires_age_confirm = true,
  allow_multi_quantity = true,
  max_quantity_per_order = 6
WHERE product_line = 'champagne';

UPDATE public.collections
SET
  allow_multi_quantity = true,
  max_quantity_per_order = 5,
  checkout_note = 'HOME pieces may ship in separate parcels. We will confirm delivery timing after payment.'
WHERE product_line = 'home';

UPDATE public.collections
SET
  allow_multi_quantity = true,
  max_quantity_per_order = 20
WHERE product_line = 'water';
