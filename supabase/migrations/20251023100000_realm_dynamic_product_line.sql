-- Collections and raffles: product_line must match a realm slug (any realm you add in admin).

ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_product_line_check;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_product_line_realm_fk;

ALTER TABLE public.collections
  ADD CONSTRAINT collections_product_line_realm_fk
  CHECK (
    product_line IS NULL
    OR EXISTS (SELECT 1 FROM public.realms r WHERE r.slug = product_line)
  );

ALTER TABLE public.raffles DROP CONSTRAINT IF EXISTS raffles_product_line_check;
ALTER TABLE public.raffles DROP CONSTRAINT IF EXISTS raffles_product_line_realm_fk;

ALTER TABLE public.raffles
  ADD CONSTRAINT raffles_product_line_realm_fk
  CHECK (
    product_line IS NULL
    OR EXISTS (SELECT 1 FROM public.realms r WHERE r.slug = product_line)
  );
