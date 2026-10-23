import type { ProductOrderStatus } from "@/lib/shop/product-orders";
import { PRODUCT_ORDER_STATUSES } from "@/lib/shop/product-orders";

export type AdminLineFilter = "all" | string;

export type AdminOrderStatusFilter = ProductOrderStatus | "all";

export function parseAdminLineFilter(
  value: string | undefined,
  validRealmSlugs: readonly string[]
): AdminLineFilter {
  if (!value || value === "all") {
    return "all";
  }
  if (validRealmSlugs.includes(value)) {
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

export const adminOrderStatusFilterOptions = [
  { value: "all" as const, label: "All statuses" },
  ...PRODUCT_ORDER_STATUSES.map((status) => ({ value: status, label: status }))
];
