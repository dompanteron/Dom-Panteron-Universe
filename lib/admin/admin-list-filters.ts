import type { ProductOrderStatus } from "@/lib/shop/product-orders";
import { PRODUCT_ORDER_STATUSES } from "@/lib/shop/product-orders";
import { isProductLine, PRODUCT_LINE_VALUES, type ProductLine } from "@/lib/shop/product-lines";

export type AdminLineFilter = ProductLine | "all";

export type AdminOrderStatusFilter = ProductOrderStatus | "all";

export function parseAdminLineFilter(value: string | undefined): AdminLineFilter {
  if (!value || value === "all") {
    return "all";
  }
  if (isProductLine(value)) {
    return value;
  }
  return "all";
}

export function parseAdminOrderStatusFilter(value: string | undefined): AdminOrderStatusFilter {
  if (!value || value === "all") {
    return "all";
  }
  if ((PRODUCT_ORDER_STATUSES as readonly string[]).includes(value)) {
    return value as ProductOrderStatus;
  }
  return "all";
}

export function adminFilterHref(
  basePath: string,
  filters: { line?: AdminLineFilter; status?: AdminOrderStatusFilter }
): string {
  const params = new URLSearchParams();
  if (filters.line && filters.line !== "all") {
    params.set("line", filters.line);
  }
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export const adminLineFilterOptions = [
  { value: "all" as const, label: "All lines" },
  ...PRODUCT_LINE_VALUES.map((line) => ({ value: line, label: line }))
];

export const adminOrderStatusFilterOptions = [
  { value: "all" as const, label: "All statuses" },
  ...PRODUCT_ORDER_STATUSES.map((status) => ({ value: status, label: status }))
];
