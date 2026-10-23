import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminRaffleDrawPanel from "@/components/admin/AdminRaffleDrawPanel";
import AdminRaffleForm from "@/components/AdminRaffleForm";
import { fetchAdminRealmOptions } from "@/lib/admin/admin-realm-options";
import { requireAdmin } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Edit raffle | Dom Panteron Universe"
};

export default async function AdminEditRafflePage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const realms = await fetchAdminRealmOptions();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("raffles")
    .select(
      "id, title, subtitle, description, ticket_price, max_entries, ticket_limit_per_user, total_entries, draw_date, status, product_line, winner_number, winner_initials, winner_display_name"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">
        Admin
      </p>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Edit raffle</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Update copy, price, cap, draw date, and whether this draw is public.
          </p>
        </div>
        <Link
          href="/admin/raffles"
          className="border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
        >
          Back to raffles
        </Link>
      </div>

      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <AdminRaffleForm raffle={data} realms={realms} />
        <AdminRaffleDrawPanel
          raffleId={data.id}
          totalEntries={Number(data.total_entries)}
          winnerNumber={data.winner_number}
          winnerInitials={data.winner_initials}
          winnerDisplayName={data.winner_display_name}
        />
      </div>
    </section>
  );
}
