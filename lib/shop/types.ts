import type { ProductLine } from "@/lib/shop/product-lines";

export type RealmAccent = "violet" | "gold" | "emerald" | "rose" | "ice" | "amber";

export type RealmKind = "commerce" | "music" | "mixed";

export type RealmRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  accent: RealmAccent;
  display_order: number;
  status: string;
  kind: RealmKind;
  listen_path: string | null;
  created_at: string;
};

export type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  display_order: number;
  status: string;
  product_line: ProductLine | null;
  realm_id: string | null;
  requires_age_confirm: boolean;
  allow_multi_quantity: boolean;
  max_quantity_per_order: number;
  checkout_note: string | null;
  reveal_at: string | null;
  show_items_during_countdown: boolean;
  created_at: string;
};

export type ProductRow = {
  id: string;
  collection_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  sizes: string[];
  images: string[];
  main_image_url: string | null;
  display_order: number;
  status: string;
  attributes: Record<string, string>;
  stock_quantity: number | null;
  created_at: string;
};

export type ProductOrderRow = {
  id: string;
  product_id: string;
  member_id: string | null;
  customer_name: string;
  customer_email: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  status: string;
  payment_reference: string | null;
  created_at: string;
};
