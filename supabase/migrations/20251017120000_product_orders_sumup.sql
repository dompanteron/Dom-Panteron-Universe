ALTER TABLE public.product_orders
  ADD COLUMN IF NOT EXISTS sumup_checkout_id TEXT;

CREATE INDEX IF NOT EXISTS idx_product_orders_sumup_checkout
  ON public.product_orders(sumup_checkout_id);
