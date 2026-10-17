import type { Metadata } from "next";
import Link from "next/link";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatProductPrice } from "@/lib/shop/format-price";

export const metadata: Metadata = {
  title: "Admin products | Dom Panteron Universe"
};

export default async function AdminProductsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: collections }, { data: products, error }] = await Promise.all([
    admin.from("collections").select("id, name").order("display_order", { ascending: true }),
    admin
      .from("products")
      .select("id, title, slug, price, currency, status, display_order, collections(name, slug)")
      .order("display_order", { ascending: true })
  ]);

  const collectionOptions = (collections ?? []).map((c) => ({ id: c.id, name: c.name }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <h1 className="font-display text-4xl font-semibold">Products</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Ready-made pieces assigned to collections. Upload images in the form or paste URLs.
      </p>

      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <h2 className="font-display text-2xl">New product</h2>
        <div className="mt-6">
          <AdminProductForm collections={collectionOptions} />
        </div>
      </div>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : !products?.length ? (
        <p className="mt-10 text-zinc-400">No products yet.</p>
      ) : (
        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[48rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">Title</th>
                <th className="py-4 pr-4 font-normal">Collection</th>
                <th className="py-4 pr-4 font-normal">Price</th>
                <th className="py-4 pr-4 font-normal">Status</th>
                <th className="py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((row) => {
                const col = Array.isArray(row.collections) ? row.collections[0] : row.collections;
                return (
                  <tr key={row.id} className="text-sm text-zinc-300">
                    <td className="py-4 pr-4">
                      <p className="font-display text-lg text-white">{row.title}</p>
                      <p className="text-zinc-500">{row.slug}</p>
                    </td>
                    <td className="py-4 pr-4">{col?.name ?? "—"}</td>
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
