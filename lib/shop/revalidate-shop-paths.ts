import { revalidatePath } from "next/cache";
import { productLineHubs } from "@/lib/shop/product-lines";

export function revalidateShopPaths(collectionSlug?: string) {
  revalidatePath("/collections");
  if (collectionSlug) {
    revalidatePath(`/collections/${collectionSlug}`);
  }
  for (const hub of productLineHubs) {
    revalidatePath(hub.path);
  }
}
