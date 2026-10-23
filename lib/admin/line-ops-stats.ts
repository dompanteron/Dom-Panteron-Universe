import { fetchAdminRealmOptions, realmLabelForSlug } from "@/lib/admin/admin-realm-options";
import { isLowStock } from "@/lib/shop/low-stock";
import { createAdminClient } from "@/lib/supabase/admin";

export type LowStockProductRow = {
  id: string;
  title: string;
  slug: string;
  stock_quantity: number;
  product_line: string | null;
};

export type LineOpsRow = {
  line: string;
  label: string;
  activeProducts: number;
  pendingOrders: number;
  lowStock: number;
  activeRaffles: number;
};

export type AdminLineOpsSnapshot = {
  lines: LineOpsRow[];
  lowStockProducts: LowStockProductRow[];
  totalPendingOrders: number;
};

function collectionLine(raw: unknown, validSlugs: Set<string>): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const line = (raw as { product_line?: string | null }).product_line;
  if (line && validSlugs.has(line)) {
    return line;
  }
  return null;
}

function productLineFromRow(products: unknown, validSlugs: Set<string>): string | null {
  if (!products || typeof products !== "object") {
    return null;
  }
  const product = Array.isArray(products) ? products[0] : products;
  if (!product || typeof product !== "object") {
    return null;
  }
  const collections = (product as { collections?: unknown }).collections;
  const collection = Array.isArray(collections) ? collections[0] : collections;
  return collectionLine(collection, validSlugs);
}

export async function fetchAdminLineOpsSnapshot(): Promise<AdminLineOpsSnapshot> {
  const admin = createAdminClient();
  const realms = await fetchAdminRealmOptions();
  const validSlugs = new Set(realms.map((realm) => realm.slug));

  const [productsResult, ordersResult, rafflesResult] = await Promise.all([
    admin
      .from("products")
      .select("id, title, slug, status, stock_quantity, collections(product_line)")
      .eq("status", "active"),
    admin
      .from("product_orders")
      .select("id, status, products(collections(product_line))")
      .eq("status", "pending"),
    admin.from("raffles").select("id, status, product_line").eq("status", "active")
  ]);

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }
  if (ordersResult.error) {
    throw new Error(ordersResult.error.message);
  }
  if (rafflesResult.error) {
    throw new Error(rafflesResult.error.message);
  }

  const lineMap = new Map<string, LineOpsRow>();
  for (const realm of realms) {
    lineMap.set(realm.slug, {
      line: realm.slug,
      label: realm.name,
      activeProducts: 0,
      pendingOrders: 0,
      lowStock: 0,
      activeRaffles: 0
    });
  }

  const lowStockProducts: LowStockProductRow[] = [];

  for (const row of productsResult.data ?? []) {
    const line = productLineFromRow(row, validSlugs) ?? "fashion";
    if (!lineMap.has(line)) {
      lineMap.set(line, {
        line,
        label: realmLabelForSlug(line, realms),
        activeProducts: 0,
        pendingOrders: 0,
        lowStock: 0,
        activeRaffles: 0
      });
    }
    const bucket = lineMap.get(line)!;
    bucket.activeProducts += 1;

    const stock = row.stock_quantity as number | null;
    if (isLowStock(stock)) {
      bucket.lowStock += 1;
      lowStockProducts.push({
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
        stock_quantity: stock as number,
        product_line: line
      });
    }
  }

  lowStockProducts.sort((a, b) => a.stock_quantity - b.stock_quantity);

  for (const row of ordersResult.data ?? []) {
    const line = productLineFromRow(row.products, validSlugs) ?? "fashion";
    const bucket = lineMap.get(line);
    if (bucket) {
      bucket.pendingOrders += 1;
    }
  }

  for (const row of rafflesResult.data ?? []) {
    const line = collectionLine({ product_line: row.product_line }, validSlugs);
    if (!line) {
      continue;
    }
    const bucket = lineMap.get(line);
    if (bucket) {
      bucket.activeRaffles += 1;
    }
  }

  const lines = realms.map((realm) => lineMap.get(realm.slug)!);

  return {
    lines,
    lowStockProducts: lowStockProducts.slice(0, 8),
    totalPendingOrders: ordersResult.data?.length ?? 0
  };
}
