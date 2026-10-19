import type { Metadata } from "next";
import Link from "next/link";
import { AdminLineFilterBar } from "@/components/admin/AdminFilterBar";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { parseAdminLineFilter } from "@/lib/admin/admin-list-filters";
import { raffleLineLabel } from "@/lib/raffles/raffle-line-display";
import { requireAdmin } from "@/lib/members";
import type { ProductLine } from "@/lib/shop/product-lines";
import { PRODUCT_LINE_VALUES } from "@/lib/shop/product-lines";
import { formatProductPrice } from "@/lib/shop/format-price";
import { isLowStock, isOutOfStock, isTrackedStock } from "@/lib/shop/low-stock";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin products | Dom Panteron Universe"
};

function productLineFromCollection(collections: unknown): ProductLine | null {
  const col = Array.isArray(collections) ? collections[0] : collections;
  if (!col || typeof col !== "object") {
    return null;
  }
  const line = (col as { product_line?: string | null }).product_line;
  if (line && (PRODUCT_LINE_VALUES as readonly string[]).includes(line)) {
    return line as ProductLine;
  }
  return null;
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: { line?: string };
}) {
  await requireAdmin();
  const lineFilter = parseAdminLineFilter(searchParams.line);

  const admin = createAdminClient();

  const [{ data: collections }, { data: products, error }] = await Promise.all([
    admin.from("collections").select("id, name, product_line").order("display_order", { ascending: true }),
    admin
      .from("products")
      .select(
        "id, title, slug, price, currency, status, display_order, stock_quantity, collections(name, slug, product_line)"
      )
      .order("display_order", { ascending: true })
  ]);

  const collectionOptions = (collections ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    product_line: c.product_line
  }));

  let rows = products ?? [];
  if (lineFilter !== "all") {
    rows = rows.filter(
      (row) => (productLineFromCollection(row.collections) ?? "fashion") === lineFilter
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <h1 className="font-display text-4xl font-semibold">Products</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Ready-made pieces assigned to collections. Stock tracking powers water-bottle inventory.
      </p>

      <AdminLineFilterBar basePath="/admin/products" currentLine={lineFilter} />

      <p className="mt-6 text-sm text-zinc-500">
        Showing {rows.length} product{rows.length === 1 ? "" : "s"}
        {lineFilter !== "all" ? ` · ${raffleLineLabel(lineFilter)}` : ""}
      </p>

      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <h2 className="font-display text-2xl">New product</h2>
        <div className="mt-6">
          <AdminProductForm collections={collectionOptions} />
        </div>
      </div>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-zinc-400">No products match this filter.</p>
      ) : (
        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">Title</th>
                <th className="py-4 pr-4 font-normal">Collection</th>
                <th className="py-4 pr-4 font-normal">Line</th>
                <th className="py-4 pr-4 font-normal">Stock</th>
                <th className="py-4 pr-4 font-normal">Price</th>
                <th className="py-4 pr-4 font-normal">Status</th>
                <th className="py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((row) => {
                const col = Array.isArray(row.collections) ? row.collections[0] : row.collections;
                const line = productLineFromCollection(row.collections);
                const stock = row.stock_quantity as number | null;
                let stockLabel = "One-of-one";
                let stockClass = "text-zinc-500";
                if (isTrackedStock(stock)) {
                  stockLabel = String(stock);
                  if (isOutOfStock(stock)) {
                    stockClass = "text-red-400";
                    stockLabel = "0";
                  } else if (isLowStock(stock)) {
                    stockClass = "text-amber-300";
                  } else {
                    stockClass = "text-zinc-300";
                  }
                }

                return (
                  <tr key={row.id} className="text-sm text-zinc-300">
                    <td className="py-4 pr-4">
                      <p className="font-display text-lg text-white">{row.title}</p>
                      <p className="text-zinc-500">{row.slug}</p>
                    </td>
                    <td className="py-4 pr-4">{col?.name ?? "—"}</td>
                    <td className="py-4 pr-4">{raffleLineLabel(line ?? "fashion")}</td>
                    <td className={`py-4 pr-4 ${stockClass}`}>{stockLabel}</td>
                    <td className="py-4 pr-4">
                      {formatProductPrice(Number(row.price), row.currency)}
                    </td>
                    <td className="py-4 pr-4 text-panteron-violet">{row.status}</td>
                    <td className="py-4">
                      <Link href={`/admin/products/${row.id}`} className="text-panteron-violet hover:text-white">
                        Edit
                      </Link>
                      {row.status === "active" ? (
                        <>
                          {" · "}
                          <Link href={`/products/${row.slug}`} className="text-zinc-400 hover:text-white">
                            View
                          </Link>
                        </>
                      ) : null}
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
