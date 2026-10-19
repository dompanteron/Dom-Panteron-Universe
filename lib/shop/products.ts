import type { CollectionRow, ProductRow } from "@/lib/shop/types";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type ProductWithCollection = ProductRow & {
  collection: Pick<
    CollectionRow,
    | "id"
    | "name"
    | "slug"
    | "status"
    | "product_line"
    | "requires_age_confirm"
    | "allow_multi_quantity"
    | "max_quantity_per_order"
    | "checkout_note"
    | "reveal_at"
    | "show_items_during_countdown"
  > | null;
};

export function parseProductSizes(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function parseProductImages(
  product: Pick<ProductRow, "main_image_url" | "images">
): string[] {
  const urls: string[] = [];
  if (product.main_image_url?.trim()) {
    urls.push(product.main_image_url.trim());
  }
  for (const url of product.images ?? []) {
    if (typeof url === "string" && url.trim() && !urls.includes(url.trim())) {
      urls.push(url.trim());
    }
  }
  return urls;
}

export async function getProductBySlug(slug: string): Promise<ProductWithCollection | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
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
      created_at,
      collections (
        id,
        name,
        slug,
        status,
        product_line,
        requires_age_confirm,
        allow_multi_quantity,
        max_quantity_per_order,
        checkout_note,
        reveal_at,
        show_items_during_countdown
      )
    `
    )
    .eq("slug", slug)
    .in("status", ["active", "sold"])
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ProductRow & {
    collections: ProductWithCollection["collection"] | ProductWithCollection["collection"][];
  };

  const collection = Array.isArray(row.collections) ? row.collections[0] : row.collections;

  if (!collection || collection.status !== "active") {
    return null;
  }

  const { collections: _collections, ...product } = row;

  return {
    ...product,
    collection
  };
}
