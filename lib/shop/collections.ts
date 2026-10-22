import type { ProductLine, ProductLineHubKey } from "@/lib/shop/product-lines";
import type { CollectionRow, ProductRow, RealmRow } from "@/lib/shop/types";
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
      product_line,
      realm_id,
      requires_age_confirm,
      allow_multi_quantity,
      max_quantity_per_order,
      checkout_note,
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
        attributes,
        stock_quantity,
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

export async function getActiveCollectionsByProductLine(
  line: ProductLineHubKey
): Promise<CollectionWithProducts[]> {
  return getActiveCollectionsByRealmSlug(line);
}

export async function getActiveCollectionsByRealmSlug(
  slug: ProductLine | string
): Promise<CollectionWithProducts[]> {
  const all = await getActiveCollectionsWithProducts();
  return all
    .filter((collection) => collection.product_line === slug)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getActiveCollectionsForRealm(
  realm: Pick<RealmRow, "id" | "slug">
): Promise<CollectionWithProducts[]> {
  const all = await getActiveCollectionsWithProducts();
  return all
    .filter(
      (collection) =>
        collection.realm_id === realm.id || collection.product_line === realm.slug
    )
    .sort((a, b) => a.display_order - b.display_order);
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
  product_line,
  realm_id,
  requires_age_confirm,
  allow_multi_quantity,
  max_quantity_per_order,
  checkout_note,
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
    attributes,
    stock_quantity,
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
