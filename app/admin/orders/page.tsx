import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/members";
import { formatProductPrice } from "@/lib/shop/format-price";
import { formatOrderDate } from "@/lib/shop/product-orders";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin shop orders | Dom Panteron Universe"
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_orders")
    .select(
      "id, customer_name, customer_email, size, quantity, total_price, currency, status, created_at, products(title, slug)"
    )
    .order("created_at", { ascending: false });

  const orders = data ?? [];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <h1 className="font-display text-4xl font-semibold">Shop orders</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Member checkout requests from product pages. Update status and payment notes manually
        until SumUp or PayPal is connected.
      </p>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-zinc-400">No orders yet.</p>
      ) : (
        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">When</th>
                <th className="py-4 pr-4 font-normal">Customer</th>
                <th className="py-4 pr-4 font-normal">Product</th>
                <th className="py-4 pr-4 font-normal">Total</th>
                <th className="py-4 pr-4 font-normal">Status</th>
                <th className="py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((row) => {
                const product = Array.isArray(row.products) ? row.products[0] : row.products;
                return (
                  <tr key={row.id} className="text-sm text-zinc-300">
                    <td className="py-4 pr-4 whitespace-nowrap text-zinc-500">
                      {formatOrderDate(row.created_at as string)}
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
                    <td className="py-4 pr-4">
                      {formatProductPrice(Number(row.total_price), row.currency as string)}
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
