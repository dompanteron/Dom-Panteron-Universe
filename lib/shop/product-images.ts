import type { ProductRow } from "@/lib/shop/types";

export function productImageUrl(product: Pick<ProductRow, "main_image_url" | "images">) {
  if (product.main_image_url?.trim()) {
    return product.main_image_url.trim();
  }
  const fromGallery = product.images?.find((url) => url?.trim());
  return fromGallery?.trim() || null;
}
