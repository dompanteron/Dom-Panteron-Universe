import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/members";
import { realmShopPath } from "@/lib/shop/realms";
import type { RealmRow } from "@/lib/shop/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin realms | Dom Panteron Universe"
};

export default async function AdminRealmsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("realms")
    .select(
      "id, slug, name, tagline, status, accent, display_order, kind, listen_path, description, hero_image_url, created_at"
    )
    .order("display_order", { ascending: true });

  const realms = (data ?? []) as RealmRow[];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">Admin</p>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Realms</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Customer-facing shop worlds. Active realms appear on{" "}
            <Link href="/shop" className="text-panteron-violet hover:text-white">
              /shop
            </Link>{" "}
            and in the header menu.
          </p>
        </div>
        <Link
          href="/shop"
          className="border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
        >
          View public shop
        </Link>
      </div>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : (
        <ul className="mt-12 divide-y divide-white/10 border border-white/10">
          {realms.map((realm) => (
            <li key={realm.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display text-xl">{realm.name}</p>
                <p className="text-sm text-zinc-500">
                  /{realm.slug} · {realm.status} · {realm.accent}
                </p>
                {realm.tagline ? (
                  <p className="mt-1 text-sm text-zinc-400">{realm.tagline}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={realmShopPath(realm.slug)}
                  className="border border-white/20 px-3 py-2 text-sm text-zinc-300 hover:border-panteron-violet"
                >
                  Public hub
                </Link>
                <Link
                  href={`/admin/realms/${realm.id}`}
                  className="bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
