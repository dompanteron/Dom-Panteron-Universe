import type { Metadata } from "next";
import Link from "next/link";
import AdminLaunchChecklist from "@/components/admin/AdminLaunchChecklist";
import AdminPaymentStatus from "@/components/admin/AdminPaymentStatus";
import AdminOpsSnapshot from "@/components/admin/AdminOpsSnapshot";
import { fetchAdminLineOpsSnapshot } from "@/lib/admin/line-ops-stats";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin | Dom Panteron Universe"
};

async function countRows(
  table:
    | "members"
    | "raffles"
    | "collections"
    | "products"
    | "product_orders"
    | "music_releases",
  column: string,
  value?: string
) {
  const admin = createAdminClient();
  let query = admin.from(table).select(column, { count: "exact", head: true });
  if (value) {
    query = query.eq(column, value);
  }
  const { count, error } = await query;
  if (error) {
    throw error;
  }
  return count ?? 0;
}

export default async function AdminHomePage() {
  const { member } = await requireAdmin();

  let membersTotal = 0;
  let membersAdmin = 0;
  let collectionsTotal = 0;
  let collectionsActive = 0;
  let productsTotal = 0;
  let productsActive = 0;
  let ordersTotal = 0;
  let ordersPending = 0;
  let rafflesTotal = 0;
  let rafflesActive = 0;
  let musicTotal = 0;
  let musicActive = 0;
  let rafflesDraft = 0;
  let loadError: string | null = null;
  let opsSnapshot: Awaited<ReturnType<typeof fetchAdminLineOpsSnapshot>> | null = null;
  let opsError: string | null = null;

  try {
    [
      membersTotal,
      membersAdmin,
      collectionsTotal,
      collectionsActive,
      productsTotal,
      productsActive,
      ordersTotal,
      ordersPending,
      musicTotal,
      musicActive,
      rafflesTotal,
      rafflesActive,
      rafflesDraft
    ] = await Promise.all([
      countRows("members", "id"),
      countRows("members", "role", "admin"),
      countRows("collections", "id"),
      countRows("collections", "status", "active"),
      countRows("products", "id"),
      countRows("products", "status", "active"),
      countRows("product_orders", "id"),
      countRows("product_orders", "status", "pending"),
      countRows("music_releases", "id"),
      countRows("music_releases", "status", "active"),
      countRows("raffles", "id"),
      countRows("raffles", "status", "active"),
      countRows("raffles", "status", "draft")
    ]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load counts.";
  }

  try {
    opsSnapshot = await fetchAdminLineOpsSnapshot();
  } catch (error) {
    opsError = error instanceof Error ? error.message : "Could not load line ops.";
  }

  const cards = [
    {
      href: "/admin/members",
      label: "Members",
      value: membersTotal,
      detail: `${membersAdmin} admin${membersAdmin === 1 ? "" : "s"}`
    },
    {
      href: "/admin/collections",
      label: "Collections",
      value: collectionsTotal,
      detail: `${collectionsActive} active`
    },
    {
      href: "/admin/products",
      label: "Products",
      value: productsTotal,
      detail: `${productsActive} active`
    },
    {
      href: "/admin/orders",
      label: "Orders",
      value: ordersTotal,
      detail: `${ordersPending} pending`
    },
    {
      href: "/admin/music",
      label: "Music",
      value: musicTotal,
      detail: `${musicActive} active`
    },
    {
      href: "/admin/raffles",
      label: "Raffles",
      value: rafflesTotal,
      detail: `${rafflesActive} active · ${rafflesDraft} draft`
    }
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">
        Admin all
      </p>
      <h1 className="font-display text-4xl font-semibold">Control room</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Signed in as {member.full_name || member.email}. Live counts from the
        universe.
      </p>

      {loadError ? (
        <p className="mt-8 text-sm text-red-400">{loadError}</p>
      ) : null}

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-white/10 p-6 transition hover:border-panteron-violet/60"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              {card.label}
            </p>
            <p className="font-display mt-4 text-5xl text-white">{card.value}</p>
            <p className="mt-3 text-sm text-zinc-400">{card.detail}</p>
            <p className="mt-6 text-sm text-panteron-violet">Open {card.label.toLowerCase()} →</p>
          </Link>
        ))}
      </div>

      {opsError ? <p className="mt-12 text-sm text-red-400">{opsError}</p> : null}
      {opsSnapshot ? <AdminOpsSnapshot snapshot={opsSnapshot} /> : null}
      <AdminPaymentStatus />
      <AdminLaunchChecklist />
    </section>
  );
}
