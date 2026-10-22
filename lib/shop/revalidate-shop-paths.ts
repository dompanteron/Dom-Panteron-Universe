import { revalidatePath } from "next/cache";
import { PRODUCT_LINE_VALUES } from "@/lib/shop/product-lines";
import { realmShopPath } from "@/lib/shop/realm-ui";

export function revalidateShopPaths(collectionSlug?: string) {
  revalidatePath("/collections");
  revalidatePath("/shop");
  if (collectionSlug) {
    revalidatePath(`/collections/${collectionSlug}`);
  }
  for (const line of PRODUCT_LINE_VALUES) {
    revalidatePath(realmShopPath(line));
  }
}
