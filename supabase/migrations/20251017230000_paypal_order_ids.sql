ALTER TABLE public.product_orders
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_product_orders_paypal_order
  ON public.product_orders(paypal_order_id);

ALTER TABLE public.raffle_checkouts
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_raffle_checkouts_paypal_order
  ON public.raffle_checkouts(paypal_order_id);
