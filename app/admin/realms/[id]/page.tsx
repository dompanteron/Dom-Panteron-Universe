import type { Metadata } from "next";
import Link from "next/link";
import AdminRealmForm from "@/components/admin/AdminRealmForm";
import AdminRealmWorkspace, {
  type RealmWorkspaceCollection,
  type RealmWorkspaceProduct,
  type RealmWorkspaceRaffle
} from "@/components/admin/AdminRealmWorkspace";
import { requireAdmin } from "@/lib/members";
import { realmShopPath } from "@/lib/shop/realm-ui";
import type { RealmRow } from "@/lib/shop/types";
import { createAdminClient } from "@/lib/supabase/admin";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit realm ${id.slice(0, 8)}… | Admin` };
}

export default async function AdminRealmEditPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("realms")
    .select(
      "id, slug, name, tagline, description, hero_image_url, accent, display_order, status, kind, listen_path, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-red-400">{error?.message ?? "Realm not found."}</p>
        <Link href="/admin/realms" className="mt-6 inline-block text-panteron-violet">
          ← Realms
        </Link>
      </section>
    );
  }

  const realm = data as RealmRow;

  const [collectionsResult, rafflesResult] = await Promise.all([
    admin
      .from("collections")
      .select("*")
      .or(`realm_id.eq.${realm.id},product_line.eq.${realm.slug}`)
      .order("display_order", { ascending: true }),
    admin
      .from("raffles")
      .select(
        "id, title, subtitle, description, ticket_price, max_entries, ticket_limit_per_user, draw_date, status, product_line"
      )
      .eq("product_line", realm.slug)
      .order("draw_date", { ascending: false })
  ]);

  const collections: RealmWorkspaceCollection[] = (collectionsResult.data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    subtitle: row.subtitle as string | null,
    description: row.description as string | null,
    cover_image_url: row.cover_image_url as string | null,
    display_order: row.display_order as number,
    status: row.status as string,
    product_line: row.product_line as string | null,
    realm_id: row.realm_id as string | null,
    requires_age_confirm: Boolean(row.requires_age_confirm),
    allow_multi_quantity: row.allow_multi_quantity !== false,
    max_quantity_per_order: row.max_quantity_per_order as number,
    checkout_note: row.checkout_note as string | null,
    reveal_at: row.reveal_at as string | null,
    show_items_during_countdown: Boolean(row.show_items_during_countdown)
  }));

  const collectionIds = collections.map((collection) => collection.id);
  let products: RealmWorkspaceProduct[] = [];

  if (collectionIds.length > 0) {
    const { data: productRows } = await admin
      .from("products")
      .select("*, collections(name)")
      .in("collection_id", collectionIds)
      .order("display_order", { ascending: true });

    products = (productRows ?? []).map((row) => {
      const col = Array.isArray(row.collections) ? row.collections[0] : row.collections;
      return {
        id: row.id as string,
        collection_id: row.collection_id as string,
        slug: row.slug as string,
        title: row.title as string,
        subtitle: row.subtitle as string | null,
        description: row.description as string | null,
        price: row.price as number,
        compare_at_price: row.compare_at_price as number | null,
        currency: row.currency as string,
        sizes: row.sizes,
        images: row.images,
        main_image_url: row.main_image_url as string | null,
        display_order: row.display_order as number,
        status: row.status as string,
        attributes: row.attributes,
        stock_quantity: row.stock_quantity as number | null,
        collection_name: (col as { name?: string } | null)?.name ?? "—"
      };
    });
  }

  const raffles: RealmWorkspaceRaffle[] = (rafflesResult.data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string | null,
    description: row.description as string | null,
    ticket_price: row.ticket_price as number,
    max_entries: row.max_entries as number,
    ticket_limit_per_user: row.ticket_limit_per_user as number | null,
    draw_date: row.draw_date as string,
    status: row.status as string,
    product_line: row.product_line as string | null
  }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/admin/realms" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Realms
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{realm.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {realmShopPath(realm.slug)} · {realm.status}
          </p>
        </div>
        {realm.status === "active" ? (
          <Link
            href={realmShopPath(realm.slug)}
            className="border border-white/20 px-4 py-2 text-sm text-zinc-300 hover:border-panteron-violet"
          >
            Public hub
          </Link>
        ) : null}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">Realm settings</p>
          <div className="border border-white/10 p-6 sm:p-8">
            <AdminRealmForm realm={realm} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <AdminRealmWorkspace
            realm={realm}
            collections={collections}
            products={products}
            raffles={raffles}
          />
        </div>
      </div>
    </section>
  );
}
