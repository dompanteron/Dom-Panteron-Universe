import type { RealmRow } from "@/lib/shop/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type RealmDashboardStats = {
  collectionsTotal: number;
  collectionsActive: number;
  activeProducts: number;
  pendingOrders: number;
  activeRaffles: number;
};

export type RealmWithDashboardStats = RealmRow & RealmDashboardStats;

function realmKeyFromCollection(
  collection: { realm_id?: string | null; product_line?: string | null } | null | undefined,
  slugById: Map<string, string>
): string | null {
  if (!collection) {
    return null;
  }
  if (collection.realm_id && slugById.has(collection.realm_id)) {
    return collection.realm_id;
  }
  return null;
}

function realmKeyFromSlug(slug: string | null | undefined, slugToId: Map<string, string>): string | null {
  if (!slug) {
    return null;
  }
  return slugToId.get(slug) ?? null;
}

export async function fetchRealmsWithDashboardStats(): Promise<RealmWithDashboardStats[]> {
  const admin = createAdminClient();

  const { data: realmRows, error: realmError } = await admin
    .from("realms")
    .select(
      "id, slug, name, tagline, description, hero_image_url, accent, display_order, status, kind, listen_path, created_at"
    )
    .order("display_order", { ascending: true });

  if (realmError) {
    throw new Error(realmError.message);
  }

  const realms = (realmRows ?? []) as RealmRow[];
  const slugToId = new Map(realms.map((realm) => [realm.slug, realm.id]));
  const slugById = new Map(realms.map((realm) => [realm.id, realm.slug]));

  const statsById = new Map<string, RealmDashboardStats>();
  for (const realm of realms) {
    statsById.set(realm.id, {
      collectionsTotal: 0,
      collectionsActive: 0,
      activeProducts: 0,
      pendingOrders: 0,
      activeRaffles: 0
    });
  }

  function bump(realmId: string | null, field: keyof RealmDashboardStats) {
    if (!realmId || !statsById.has(realmId)) {
      return;
    }
    const row = statsById.get(realmId)!;
    row[field] += 1;
  }

  const [collectionsResult, productsResult, ordersResult, rafflesResult] = await Promise.all([
    admin.from("collections").select("id, realm_id, product_line, status"),
    admin
      .from("products")
      .select("id, status, collections(realm_id, product_line)")
      .eq("status", "active"),
    admin
      .from("product_orders")
      .select("id, status, products(collections(realm_id, product_line))")
      .eq("status", "pending"),
    admin.from("raffles").select("id, product_line, status").eq("status", "active")
  ]);

  for (const row of collectionsResult.data ?? []) {
    let realmId = row.realm_id as string | null;
    if (!realmId) {
      realmId = realmKeyFromSlug(row.product_line as string | null, slugToId);
    }
    bump(realmId, "collectionsTotal");
    if (row.status === "active") {
      bump(realmId, "collectionsActive");
    }
  }

  for (const row of productsResult.data ?? []) {
    const collections = row.collections;
    const collection = Array.isArray(collections) ? collections[0] : collections;
    let realmId = realmKeyFromCollection(
      collection as { realm_id?: string | null; product_line?: string | null },
      slugById
    );
    if (!realmId && collection && typeof collection === "object") {
      realmId = realmKeyFromSlug(
        (collection as { product_line?: string | null }).product_line,
        slugToId
      );
    }
    bump(realmId, "activeProducts");
  }

  for (const row of ordersResult.data ?? []) {
    const products = row.products;
    const product = Array.isArray(products) ? products[0] : products;
    if (!product || typeof product !== "object") {
      continue;
    }
    const collections = (product as { collections?: unknown }).collections;
    const collection = Array.isArray(collections) ? collections[0] : collections;
    let realmId = realmKeyFromCollection(
      collection as { realm_id?: string | null; product_line?: string | null },
      slugById
    );
    if (!realmId && collection && typeof collection === "object") {
      realmId = realmKeyFromSlug(
        (collection as { product_line?: string | null }).product_line,
        slugToId
      );
    }
    bump(realmId, "pendingOrders");
  }

  for (const row of rafflesResult.data ?? []) {
    const realmId = realmKeyFromSlug(row.product_line as string | null, slugToId);
    bump(realmId, "activeRaffles");
  }

  return realms.map((realm) => ({
    ...realm,
    ...(statsById.get(realm.id) ?? {
      collectionsTotal: 0,
      collectionsActive: 0,
      activeProducts: 0,
      pendingOrders: 0,
      activeRaffles: 0
    })
  }));
}
