import type { Metadata } from "next";
import Link from "next/link";
import { AdminOrderFiltersBar } from "@/components/admin/AdminFilterBar";
import {
  buildAdminLineFilterOptions,
  fetchAdminRealmOptions,
  realmLabelForSlug,
  realmSlugSet
} from "@/lib/admin/admin-realm-options";
import {
  parseAdminLineFilter,
  parseAdminOrderStatusFilter
} from "@/lib/admin/admin-list-filters";
import { requireAdmin } from "@/lib/members";
import { formatProductPrice } from "@/lib/shop/format-price";
import { formatOrderDate } from "@/lib/shop/product-orders";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin shop orders | Dom Panteron Universe"
};

type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  size: string;
  quantity: number;
  total_price: number;
  currency: string;
  status: string;
  created_at: string;
  products: unknown;
};

function orderProductLine(products: unknown, validSlugs: Set<string>): string | null {
  if (!products || typeof products !== "object") {
    return null;
  }
  const product = Array.isArray(products) ? products[0] : products;
  if (!product || typeof product !== "object") {
    return null;
  }
  const collections = (product as { collections?: unknown }).collections;
  const collection = Array.isArray(collections) ? collections[0] : collections;
  if (!collection || typeof collection !== "object") {
    return null;
  }
  const line = (collection as { product_line?: string | null }).product_line;
  if (line && validSlugs.has(line)) {
    return line;
  }
  return null;
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: { line?: string; status?: string };
}) {
  await requireAdmin();
  const realms = await fetchAdminRealmOptions();
  const validSlugs = realmSlugSet(realms);
  const lineFilter = parseAdminLineFilter(
    searchParams.line,
    realms.map((realm) => realm.slug)
  );
  const statusFilter = parseAdminOrderStatusFilter(searchParams.status);
  const lineOptions = buildAdminLineFilterOptions(realms);

  const admin = createAdminClient();
  let query = admin
    .from("product_orders")
    .select(
      "id, customer_name, customer_email, size, quantity, total_price, currency, status, created_at, products(title, slug, collections(name, product_line))"
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  let orders = (data ?? []) as OrderRow[];
  if (lineFilter !== "all") {
    orders = orders.filter(
      (row) => (orderProductLine(row.products, validSlugs) ?? "fashion") === lineFilter
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <h1 className="font-display text-4xl font-semibold">Shop orders</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Filter by product line or status. Fulfill paid orders and mark inventory from each product
        line.
      </p>

      <AdminOrderFiltersBar
        basePath="/admin/orders"
        currentLine={lineFilter}
        currentStatus={statusFilter}
        lineOptions={lineOptions}
      />

      <p className="mt-6 text-sm text-zinc-500">
        Showing {orders.length} order{orders.length === 1 ? "" : "s"}
        {lineFilter !== "all" ? ` · ${realmLabelForSlug(lineFilter, realms)}` : ""}
        {statusFilter !== "all" ? ` · ${statusFilter}` : ""}
      </p>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-zinc-400">No orders match these filters.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[56rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">When</th>
                <th className="py-4 pr-4 font-normal">Customer</th>
                <th className="py-4 pr-4 font-normal">Product</th>
                <th className="py-4 pr-4 font-normal">Realm</th>
                <th className="py-4 pr-4 font-normal">Total</th>
                <th className="py-4 pr-4 font-normal">Status</th>
                <th className="py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((row) => {
                const product = Array.isArray(row.products) ? row.products[0] : row.products;
                const line = orderProductLine(row.products, validSlugs);
                return (
                  <tr key={row.id} className="text-sm text-zinc-300">
                    <td className="py-4 pr-4 whitespace-nowrap text-zinc-500">
                      {formatOrderDate(row.created_at)}
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-white">{row.customer_name}</p>
                      <p className="text-zinc-500">{row.customer_email}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <p>{product?.title ?? "—"}</p>
                      <p className="text-zinc-500">
                        {row.size} × {row.quantity}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-zinc-400">
                      {realmLabelForSlug(line ?? "fashion", realms)}
                    </td>
                    <td className="py-4 pr-4">
                      {formatProductPrice(Number(row.total_price), row.currency)}
                    </td>
                    <td className="py-4 pr-4 text-panteron-violet">{row.status}</td>
                    <td className="py-4">
                      <Link
                        href={`/admin/orders/${row.id}`}
                        className="text-panteron-violet hover:text-white"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
