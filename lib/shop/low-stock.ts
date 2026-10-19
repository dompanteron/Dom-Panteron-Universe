/** Show admin alert when tracked stock is at or below this level. */
export const LOW_STOCK_THRESHOLD = 5;

export function isTrackedStock(stockQuantity: number | null | undefined): stockQuantity is number {
  return stockQuantity != null && Number.isFinite(stockQuantity);
}

export function isLowStock(stockQuantity: number | null | undefined): boolean {
  return isTrackedStock(stockQuantity) && stockQuantity <= LOW_STOCK_THRESHOLD && stockQuantity > 0;
}

export function isOutOfStock(stockQuantity: number | null | undefined): boolean {
  return isTrackedStock(stockQuantity) && stockQuantity < 1;
}
