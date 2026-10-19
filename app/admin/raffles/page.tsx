import type { Metadata } from "next";
import Link from "next/link";
import AdminRaffleForm from "@/components/AdminRaffleForm";
import { requireAdmin } from "@/lib/members";
import { raffleLineLabel } from "@/lib/raffles/raffle-line-display";
import type { ProductLine } from "@/lib/shop/product-lines";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin raffles | Dom Panteron Universe"
};

type AdminRaffle = {
  id: string;
  title: string;
  subtitle: string | null;
  ticket_price: number;
  max_entries: number;
  total_entries: number;
  draw_date: string;
  status: string;
  product_line: ProductLine | null;
};

function formatDrawDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminRafflesPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("raffles")
    .select(
      "id, title, subtitle, ticket_price, max_entries, total_entries, draw_date, status, product_line"
    )
    .order("draw_date", { ascending: false });

  const raffles = (data ?? []) as AdminRaffle[];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-panteron-violet">
        Admin
      </p>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Raffles</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Create draws, then edit status to active when they should appear on
            the public raffles page.
          </p>
        </div>
        <Link
          href="/raffles"
          className="border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
        >
          View public page
        </Link>
      </div>

      <div className="mt-12 border border-white/10 p-6 sm:p-8">
        <h2 className="font-display text-2xl">New raffle</h2>
        <div className="mt-6">
          <AdminRaffleForm />
        </div>
      </div>

      {error ? (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      ) : raffles.length === 0 ? (
        <p className="mt-10 text-zinc-400">No raffles yet. Create the first one above.</p>
      ) : (
        <div className="mt-12 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[48rem] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-4 pr-4 font-normal">Title</th>
                <th className="py-4 pr-4 font-normal">Status</th>
                <th className="py-4 pr-4 font-normal">Draw</th>
                <th className="py-4 pr-4 font-normal">Price</th>
                <th className="py-4 pr-4 font-normal">Entries</th>
                <th className="py-4 font-normal"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {raffles.map((raffle) => (
                <tr key={raffle.id} className="text-sm">
                  <td className="py-5 pr-4">
                    <p className="font-display text-xl text-white">{raffle.title}</p>
                    {raffle.subtitle ? (
                      <p className="mt-1 text-zinc-500">{raffle.subtitle}</p>
                    ) : null}
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-zinc-600">
                      {raffleLineLabel(raffle.product_line)}
                    </p>
                  </td>
                  <td
                    className={`py-5 pr-4 ${
                      raffle.status === "active"
                        ? "text-panteron-violet"
                        : "text-zinc-400"
                    }`}
                  >
                    {raffle.status}
                  </td>
                  <td className="py-5 pr-4 text-zinc-300">
                    {formatDrawDate(raffle.draw_date)}
                  </td>
                  <td className="py-5 pr-4 text-zinc-300">
                    {Number(raffle.ticket_price).toFixed(2)}
                  </td>
                  <td className="py-5 pr-4 text-zinc-400">
                    {raffle.total_entries}/{raffle.max_entries}
                  </td>
                  <td className="py-5">
                    <Link
                      href={`/admin/raffles/${raffle.id}`}
                      className="text-sm text-panteron-violet transition hover:text-white"
                    >
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
