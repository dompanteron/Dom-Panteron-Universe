import type { Metadata } from "next";
import Link from "next/link";
import AdminRealmCreateForm from "@/components/admin/AdminRealmCreateForm";
import { fetchRealmsWithDashboardStats } from "@/lib/admin/realm-dashboard-stats";
import { adminFilterHref } from "@/lib/admin/admin-list-filters";
import { requireAdmin } from "@/lib/members";
import { realmShopPath } from "@/lib/shop/realms";

export const metadata: Metadata = {
  title: "Admin realms | Dom Panteron Universe"
};

function needsAttention(stats: {
  status: string;
  collectionsActive: number;
  activeProducts: number;
  hero_image_url: string | null;
  tagline: string | null;
}) {
  if (stats.status !== "active") {
    return false;
  }
  return (
    stats.collectionsActive === 0 ||
    !stats.tagline?.trim() ||
    (!stats.hero_image_url && stats.activeProducts === 0)
  );
}

export default async function AdminRealmsPage() {
  await requireAdmin();

  let realms: Awaited<ReturnType<typeof fetchRealmsWithDashboardStats>> = [];
  let loadError: string | null = null;

  try {
    realms = await fetchRealmsWithDashboardStats();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load realms.";
  }

  const nextDisplayOrder =
    realms.length === 0 ? 0 : Math.max(...realms.map((realm) => realm.display_order)) + 10;

  const attentionCount = realms.filter((realm) => needsAttention(realm)).length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Realms</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Control room for shop worlds. Active realms appear on{" "}
            <Link href="/shop" className="text-panteron-violet hover:text-white">
              /shop
            </Link>
            .
          </p>
          {attentionCount > 0 ? (
            <p className="mt-3 text-sm text-amber-200/90">
              {attentionCount} active realm{attentionCount === 1 ? "" : "s"} could use copy, hero, or
              a live collection.
            </p>
          ) : null}
        </div>
        <Link
          href="/shop"
          className="border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
        >
          View public shop
        </Link>
      </div>

      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <h2 className="font-display text-2xl">New realm</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Creates <code className="text-zinc-300">/shop/your-slug</code>. Start as draft, then set
          active when ready.
        </p>
        <div className="mt-6">
          <AdminRealmCreateForm nextDisplayOrder={nextDisplayOrder} />
        </div>
      </div>

      {loadError ? (
        <p className="mt-10 text-sm text-red-400">{loadError}</p>
      ) : (
        <ul className="mt-12 space-y-4">
          {realms.map((realm) => {
            const flag = needsAttention(realm);
            return (
              <li
                key={realm.id}
                className={`border p-5 sm:p-6 ${
                  flag ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-display text-xl">{realm.name}</p>
                      <span
                        className={`text-xs uppercase tracking-[0.2em] ${
                          realm.status === "active" ? "text-panteron-violet" : "text-zinc-500"
                        }`}
                      >
                        {realm.status}
                      </span>
                      {flag ? (
                        <span className="text-xs uppercase tracking-[0.15em] text-amber-200/80">
                          Needs polish
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {realmShopPath(realm.slug)} · {realm.kind} · {realm.accent}
                    </p>
                    {realm.tagline ? (
                      <p className="mt-2 text-sm text-zinc-400">{realm.tagline}</p>
                    ) : (
                      <p className="mt-2 text-sm text-zinc-600">No tagline yet</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={realm.status === "active" ? realmShopPath(realm.slug) : `/admin/realms/${realm.id}`}
                      className="border border-white/20 px-3 py-2 text-sm text-zinc-300 hover:border-panteron-violet"
                    >
                      {realm.status === "active" ? "Public hub" : "Preview edit"}
                    </Link>
                    <Link
                      href={`/admin/realms/${realm.id}`}
                      className="bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                    >
                      Edit
                    </Link>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-zinc-500">Collections</dt>
                    <dd className="mt-1 text-white">
                      {realm.collectionsActive} active / {realm.collectionsTotal}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-zinc-500">Products</dt>
                    <dd className="mt-1 text-white">{realm.activeProducts}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-zinc-500">Pending orders</dt>
                    <dd className="mt-1 text-white">{realm.pendingOrders}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-zinc-500">Active raffles</dt>
                    <dd className="mt-1 text-white">{realm.activeRaffles}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-zinc-500">Hero</dt>
                    <dd className="mt-1 text-zinc-400">{realm.hero_image_url ? "Set" : "Missing"}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-3 text-xs">
                  <Link
                    href={`/admin/collections?realm=${encodeURIComponent(realm.slug)}`}
                    className="text-panteron-violet hover:text-white"
                  >
                    Collections →
                  </Link>
                  <Link
                    href={adminFilterHref("/admin/products", { line: realm.slug })}
                    className="text-zinc-400 hover:text-white"
                  >
                    Products →
                  </Link>
                  <Link
                    href={adminFilterHref("/admin/orders", {
                      line: realm.slug,
                      status: "pending"
                    })}
                    className="text-zinc-400 hover:text-white"
                  >
                    Pending orders →
                  </Link>
                  <Link href="/admin/raffles" className="text-zinc-400 hover:text-white">
                    Raffles →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
