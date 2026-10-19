import { revalidatePath } from "next/cache";
import { revalidateShopPaths } from "@/lib/shop/revalidate-shop-paths";
import { createAdminClient } from "@/lib/supabase/admin";

/** After payment or admin fulfill: one-of-one sold, or decrement stock. */
export async function applyProductInventoryForOrder(productId: string, quantity: number) {
  const admin = createAdminClient();
  const qty = Math.max(1, Math.floor(quantity));

  const { data: product, error } = await admin
    .from("products")
    .select("id, slug, collection_id, stock_quantity, status")
    .eq("id", productId)
    .maybeSingle();

  if (error || !product || product.status !== "active") {
    return { applied: false as const };
  }

  if (product.stock_quantity == null) {
    const { data: updated, error: soldError } = await admin
      .from("products")
      .update({ status: "sold" })
      .eq("id", productId)
      .eq("status", "active")
      .select("slug, collection_id")
      .maybeSingle();

    if (soldError || !updated) {
      return { applied: false as const };
    }

    await revalidateProductPaths(updated.slug, updated.collection_id);
    return { applied: true as const, slug: updated.slug };
  }

  const nextStock = product.stock_quantity - qty;
  const payload =
    nextStock <= 0
      ? { stock_quantity: 0, status: "sold" as const }
      : { stock_quantity: nextStock };

  const { data: updated, error: updateError } = await admin
    .from("products")
    .update(payload)
    .eq("id", productId)
    .eq("status", "active")
    .select("slug, collection_id")
    .maybeSingle();

  if (updateError || !updated) {
    return { applied: false as const };
  }

  await revalidateProductPaths(updated.slug, updated.collection_id);
  return { applied: true as const, slug: updated.slug };
}

async function revalidateProductPaths(slug: string, collectionId: string | null) {
  revalidatePath("/collections");
  revalidatePath(`/products/${slug}`);

  if (!collectionId) {
    return;
  }

  const admin = createAdminClient();
  const { data: collection } = await admin
    .from("collections")
    .select("slug")
    .eq("id", collectionId)
    .maybeSingle();

  if (collection?.slug) {
    revalidateShopPaths(collection.slug);
  }
}
