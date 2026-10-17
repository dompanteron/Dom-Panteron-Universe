-- ============================================
-- Dom Panteron — Collections & ready-made products
-- (CocoHawaii-style shop, no custom-made flow)
-- ============================================

-- 1) COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  reveal_at TIMESTAMPTZ,
  show_items_during_countdown BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_status ON public.collections(status);
CREATE INDEX IF NOT EXISTS idx_collections_display_order ON public.collections(display_order);

-- 2) PRODUCTS (ready-made pieces)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  main_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order);

-- 3) PRODUCT ORDERS (standard checkout records — payment wired later)
CREATE TABLE IF NOT EXISTS public.product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_orders_product ON public.product_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_member ON public.product_orders(member_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON public.product_orders(status);

-- RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- COLLECTIONS policies
DROP POLICY IF EXISTS "Read active collections" ON public.collections;
CREATE POLICY "Read active collections"
  ON public.collections FOR SELECT
  USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins manage collections" ON public.collections;
CREATE POLICY "Admins manage collections"
  ON public.collections FOR ALL
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

-- PRODUCTS policies
DROP POLICY IF EXISTS "Read active or sold products" ON public.products;
CREATE POLICY "Read active or sold products"
  ON public.products FOR SELECT
  USING (
    status IN ('active', 'sold')
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products"
  ON public.products FOR ALL
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

-- PRODUCT ORDERS policies
DROP POLICY IF EXISTS "Users read own product orders" ON public.product_orders;
CREATE POLICY "Users read own product orders"
  ON public.product_orders FOR SELECT
  USING (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users create product orders" ON public.product_orders;
CREATE POLICY "Authenticated users create product orders"
  ON public.product_orders FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      member_id IS NULL
      OR member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins manage product orders" ON public.product_orders;
CREATE POLICY "Admins manage product orders"
  ON public.product_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Grants
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT ON public.product_orders TO authenticated;

-- Seed (idempotent by slug)
INSERT INTO public.collections (id, name, slug, subtitle, description, display_order, status)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Jungle Essentials',
  'jungle-essentials',
  'Core frequency wear',
  'Everyday pieces built for presence — the first ready-made line in the universe.',
  0,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.collections (id, name, slug, subtitle, description, display_order, status)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Night Circle',
  'night-circle',
  'Limited outer layer',
  'Outer silhouettes for the after-hours signal.',
  1,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  collection_id, slug, title, subtitle, description, price, sizes, display_order, status
)
SELECT
  c.id,
  'panteron-signal-tee',
  'Panteron Signal Tee',
  'Black / violet print',
  'Heavy cotton tee with front signal mark. Ready-made — pick your size.',
  45.00,
  '["S","M","L","XL"]'::jsonb,
  0,
  'active'
FROM public.collections c
WHERE c.slug = 'jungle-essentials'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  collection_id, slug, title, subtitle, description, price, sizes, display_order, status
)
SELECT
  c.id,
  'frequency-hoodie',
  'Frequency Hoodie',
  'Deep black',
  'Oversized hoodie with subtle panteron gradient lining.',
  89.00,
  '["S","M","L","XL"]'::jsonb,
  1,
  'active'
FROM public.collections c
WHERE c.slug = 'jungle-essentials'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  collection_id, slug, title, subtitle, description, price, sizes, display_order, status
)
SELECT
  c.id,
  'night-circle-jacket',
  'Night Circle Jacket',
  'Statement outer',
  'Limited shell jacket — one-of-run styling without custom orders.',
  120.00,
  '["M","L","XL"]'::jsonb,
  0,
  'active'
FROM public.collections c
WHERE c.slug = 'night-circle'
ON CONFLICT (slug) DO NOTHING;
