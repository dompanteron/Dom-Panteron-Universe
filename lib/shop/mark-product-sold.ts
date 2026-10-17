import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/** One-of-one pieces: mark sold after payment or when admin fulfills. */
export async function markProductSoldForOrder(productId: string) {
  const admin = createAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .update({ status: "sold" })
    .eq("id", productId)
    .eq("status", "active")
    .select("slug, collection_id")
    .maybeSingle();

  if (error || !product) {
    return { marked: false as const };
  }

  revalidatePath("/collections");
  revalidatePath(`/products/${product.slug}`);

  if (product.collection_id) {
    const { data: collection } = await admin
      .from("collections")
      .select("slug")
      .eq("id", product.collection_id)
      .maybeSingle();

    if (collection?.slug) {
      revalidatePath(`/collections/${collection.slug}`);
    }
  }

  return { marked: true as const, slug: product.slug };
}
