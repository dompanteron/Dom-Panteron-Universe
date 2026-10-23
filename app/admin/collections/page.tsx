import type { Metadata } from "next";
import Link from "next/link";
import AdminCollectionForm from "@/components/admin/AdminCollectionForm";
import { requireAdmin } from "@/lib/members";
import { raffleLineLabel } from "@/lib/raffles/raffle-line-display";
import type { ProductLine } from "@/lib/shop/product-lines";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin collections | Dom Panteron Universe"
};

export default async function AdminCollectionsPage({
  searchParams
}: {
  searchParams: { realm?: string };
}) {
  await requireAdmin();
  const realmSlug = searchParams.realm?.trim() || null;
  const admin = createAdminClient();
  const [collectionsResult, realmsResult] = await Promise.all([
    admin
      .from("collections")
      .select("id, name, slug, status, display_order, product_line, realm_id")
      .order("display_order", { ascending: true }),
    admin.from("realms").select("id, slug, name").order("display_order", { ascending: true })
  ]);

  const { data, error } = collectionsResult;
  const allCollections = data ?? [];
  const realms = realmsResult.data ?? [];
  const realmRow = realmSlug ? realms.find((realm) => realm.slug === realmSlug) : null;
  const collections = realmSlug
    ? allCollections.filter(
        (row) =>
          row.product_line === realmSlug ||
          (realmRow?.id && row.realm_id === realmRow.id)
      )
    : allCollections;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Collections</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Manage shop collections shown on the public collections page.
            {realmSlug ? (
              <>
                {" "}
                Filtered to realm{" "}
                <span className="text-panteron-violet">{realmRow?.name ?? realmSlug}</span>.{" "}
                <Link href="/admin/collections" className="text-zinc-400 hover:text-white">
                  Clear filter
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <Link
          href="/collections"
          className="border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
        >
          View public page
        </Link>
      </div>

      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <h2 className="font-display text-2xl">New collection</h2>
        <div className="mt-6">
          <AdminCollectionForm realms={realms} />
        </div>
      </div>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : collections.length === 0 ? (
        <p className="mt-10 text-zinc-400">No collections yet.</p>
      ) : (
        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[40rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">Name</th>
                <th className="py-4 pr-4 font-normal">Slug</th>
                <th className="py-4 pr-4 font-normal">Realm</th>
                <th className="py-4 pr-4 font-normal">Status</th>
                <th className="py-4 pr-4 font-normal">Order</th>
                <th className="py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {collections.map((row) => (
                <tr key={row.id} className="text-sm text-zinc-300">
                  <td className="py-4 pr-4 font-display text-xl text-white">{row.name}</td>
                  <td className="py-4 pr-4">{row.slug}</td>
                  <td className="py-4 pr-4 text-zinc-400">
                    {raffleLineLabel((row.product_line as ProductLine | null) ?? "fashion")}
                  </td>
                  <td className="py-4 pr-4 text-panteron-violet">{row.status}</td>
                  <td className="py-4 pr-4">{row.display_order}</td>
                  <td className="py-4">
                    <Link href={`/admin/collections/${row.id}`} className="text-panteron-violet hover:text-white">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
