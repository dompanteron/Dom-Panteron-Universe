import type { ProductRow } from "@/lib/shop/types";

export function isProductAvailableForPurchase(
  product: Pick<ProductRow, "status" | "stock_quantity">
): boolean {
  if (product.status !== "active") {
    return false;
  }
  if (product.stock_quantity != null && product.stock_quantity < 1) {
    return false;
  }
  return true;
}
