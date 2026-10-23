import { revalidatePath } from "next/cache";
import { realmShopPath } from "@/lib/shop/realm-ui";
import { createAdminClient } from "@/lib/supabase/admin";

export function revalidateShopPaths(collectionSlug?: string, extraRealmSlugs?: string[]) {
  revalidatePath("/collections");
  revalidatePath("/shop");
  if (collectionSlug) {
    revalidatePath(`/collections/${collectionSlug}`);
  }
  const slugs = new Set(extraRealmSlugs ?? []);
  for (const slug of slugs) {
    revalidatePath(realmShopPath(slug));
  }
}

export async function revalidateAllRealmShopPaths(collectionSlug?: string) {
  revalidateShopPaths(collectionSlug);
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("realms").select("slug");
    for (const row of data ?? []) {
      revalidatePath(realmShopPath(row.slug as string));
    }
  } catch {
    // Host may lack service role during local static analysis; /shop still revalidated.
  }
}
