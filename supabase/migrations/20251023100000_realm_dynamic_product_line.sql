-- Collections and raffles: product_line must match a realm slug (FK — Postgres disallows subqueries in CHECK).

ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_product_line_check;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_product_line_realm_fk;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_product_line_realm_slug_fkey;

ALTER TABLE public.raffles DROP CONSTRAINT IF EXISTS raffles_product_line_check;
ALTER TABLE public.raffles DROP CONSTRAINT IF EXISTS raffles_product_line_realm_fk;
ALTER TABLE public.raffles DROP CONSTRAINT IF EXISTS raffles_product_line_realm_slug_fkey;

ALTER TABLE public.collections
  ADD CONSTRAINT collections_product_line_realm_slug_fkey
  FOREIGN KEY (product_line) REFERENCES public.realms (slug)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

ALTER TABLE public.raffles
  ADD CONSTRAINT raffles_product_line_realm_slug_fkey
  FOREIGN KEY (product_line) REFERENCES public.realms (slug)
  ON UPDATE CASCADE
  ON DELETE SET NULL;
