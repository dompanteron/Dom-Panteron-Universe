import type { CollectionRow, ProductRow } from "@/lib/shop/types";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type CollectionWithProducts = CollectionRow & {
  products: ProductRow[];
};

export async function getActiveCollectionsWithProducts(): Promise<CollectionWithProducts[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("collections")
    .select(
      `
      id,
      name,
      slug,
      subtitle,
      description,
      cover_image_url,
      display_order,
      status,
      reveal_at,
      show_items_during_countdown,
      created_at,
      products (
        id,
        collection_id,
        slug,
        title,
        subtitle,
        description,
        price,
        compare_at_price,
        currency,
        sizes,
        images,
        main_image_url,
        display_order,
        status,
        created_at
      )
    `
    )
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as (CollectionRow & { products: ProductRow[] | null })[];

  return rows.map((row) => ({
    ...row,
    products: (row.products ?? [])
      .filter((product) => product.status === "active")
      .sort((a, b) => a.display_order - b.display_order)
  }));
}

const collectionSelect = `
  id,
  name,
  slug,
  subtitle,
  description,
  cover_image_url,
  display_order,
  status,
  reveal_at,
  show_items_during_countdown,
  created_at,
  products (
    id,
    collection_id,
    slug,
    title,
    subtitle,
    description,
    price,
    compare_at_price,
    currency,
    sizes,
    images,
    main_image_url,
    display_order,
    status,
    created_at
  )
`;

export async function getCollectionBySlug(
  slug: string
): Promise<CollectionWithProducts | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("collections")
    .select(collectionSelect)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as CollectionRow & { products: ProductRow[] | null };

  return {
    ...row,
    products: (row.products ?? [])
      .filter((product) => product.status === "active" || product.status === "sold")
      .sort((a, b) => a.display_order - b.display_order)
  };
}
