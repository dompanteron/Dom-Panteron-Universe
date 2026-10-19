import { raffleLineLabel } from "@/lib/raffles/raffle-line-display";
import { isLowStock } from "@/lib/shop/low-stock";
import { PRODUCT_LINE_VALUES, type ProductLine } from "@/lib/shop/product-lines";
import { createAdminClient } from "@/lib/supabase/admin";

export type LowStockProductRow = {
  id: string;
  title: string;
  slug: string;
  stock_quantity: number;
  product_line: ProductLine | null;
};

export type LineOpsRow = {
  line: ProductLine;
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

function collectionLine(raw: unknown): ProductLine | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const line = (raw as { product_line?: string | null }).product_line;
  if (line && (PRODUCT_LINE_VALUES as readonly string[]).includes(line)) {
    return line as ProductLine;
  }
  return null;
}

function productLineFromRow(products: unknown): ProductLine | null {
  if (!products || typeof products !== "object") {
    return null;
  }
  const product = Array.isArray(products) ? products[0] : products;
  if (!product || typeof product !== "object") {
    return null;
  }
  const collections = (product as { collections?: unknown }).collections;
  const collection = Array.isArray(collections) ? collections[0] : collections;
  return collectionLine(collection);
}

export async function fetchAdminLineOpsSnapshot(): Promise<AdminLineOpsSnapshot> {
  const admin = createAdminClient();

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

  const lineMap = new Map<ProductLine, LineOpsRow>();
  for (const line of PRODUCT_LINE_VALUES) {
    lineMap.set(line, {
      line,
      label: raffleLineLabel(line),
      activeProducts: 0,
      pendingOrders: 0,
      lowStock: 0,
      activeRaffles: 0
    });
  }

  const lowStockProducts: LowStockProductRow[] = [];

  for (const row of productsResult.data ?? []) {
    const line = productLineFromRow(row) ?? "fashion";
    const bucket = lineMap.get(line);
    if (bucket) {
      bucket.activeProducts += 1;
    }
    const stock = row.stock_quantity as number | null;
    if (isLowStock(stock)) {
      if (bucket) {
        bucket.lowStock += 1;
      }
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
    const line = productLineFromRow(row.products) ?? "fashion";
    const bucket = lineMap.get(line);
    if (bucket) {
      bucket.pendingOrders += 1;
    }
  }

  for (const row of rafflesResult.data ?? []) {
    const line = collectionLine({ product_line: row.product_line }) ?? null;
    if (!line) {
      continue;
    }
    const bucket = lineMap.get(line);
    if (bucket) {
      bucket.activeRaffles += 1;
    }
  }

  return {
    lines: PRODUCT_LINE_VALUES.map((line) => lineMap.get(line)!),
    lowStockProducts: lowStockProducts.slice(0, 8),
    totalPendingOrders: ordersResult.data?.length ?? 0
  };
}
