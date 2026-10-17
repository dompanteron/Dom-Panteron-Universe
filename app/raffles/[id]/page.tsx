import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RaffleEnterPanel from "@/components/RaffleEnterPanel";
import { ensureCurrentMember } from "@/lib/members";
import { getPaymentOptionsForUi } from "@/lib/payments/payment-providers";
import { sumMemberRaffleEntries } from "@/lib/raffle-entries";
import { formatRaffleDrawDate, type PublicRaffle } from "@/lib/raffles";
import { buildShareMetadata } from "@/lib/site-metadata";
import { createClient as createServerClient } from "@/lib/supabase/server";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("raffles")
    .select("title, subtitle")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    return { title: "Raffle | Dom Panteron Universe" };
  }

  return buildShareMetadata({
    title: `${data.title} | Raffles`,
    description: data.subtitle,
    path: `/raffles/${params.id}`
  });
}

export default async function RaffleDetailPage({ params }: Props) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("raffles")
    .select(
      "id, title, subtitle, description, ticket_price, max_entries, total_entries, ticket_limit_per_user, draw_date, status"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const raffle = data as PublicRaffle;
  const { member } = await ensureCurrentMember();
  const spotsLeft = Math.max(0, raffle.max_entries - raffle.total_entries);
  const isFull = spotsLeft === 0;
  const paymentOptions = getPaymentOptionsForUi();
  const paymentsEnabled = paymentOptions.any;

  let yourEntries = 0;
  if (member) {
    try {
      yourEntries = await sumMemberRaffleEntries(raffle.id, member.id);
    } catch {
      yourEntries = 0;
    }
  }

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-24 sm:pb-20 sm:pt-28">
          <Link
            href="/raffles"
            className="text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            ← All raffles
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            Active draw
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
            {raffle.title}
          </h1>
          {raffle.subtitle ? (
            <p className="mt-6 max-w-2xl text-xl text-zinc-300">{raffle.subtitle}</p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:py-28">
          <div>
            {raffle.description ? (
              <p className="text-lg leading-relaxed text-zinc-300">{raffle.description}</p>
            ) : (
              <p className="text-lg text-zinc-500">More details coming soon.</p>
            )}
          </div>

          <aside className="border border-white/10 p-6">
            <dl className="space-y-5 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Draw</dt>
                <dd className="mt-1 text-lg text-white">
                  {formatRaffleDrawDate(raffle.draw_date, true)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Entry price
                </dt>
                <dd className="mt-1 text-lg text-white">
                  {Number(raffle.ticket_price).toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Spots</dt>
                <dd className="mt-1 text-lg text-white">
                  {raffle.total_entries}/{raffle.max_entries} filled
                  {!isFull ? (
                    <span className="block text-sm text-zinc-400">{spotsLeft} left</span>
                  ) : (
                    <span className="block text-sm text-panteron-violet">Full</span>
                  )}
                </dd>
              </div>
              {raffle.ticket_limit_per_user != null ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Per member
                  </dt>
                  <dd className="mt-1 text-lg text-white">
                    Up to {raffle.ticket_limit_per_user} entries
                  </dd>
                </div>
              ) : null}
            </dl>

            <RaffleEnterPanel
              raffleId={raffle.id}
              ticketPrice={Number(raffle.ticket_price)}
              spotsLeft={spotsLeft}
              yourEntries={yourEntries}
              ticketLimitPerUser={raffle.ticket_limit_per_user}
              isFull={isFull}
              signedIn={Boolean(member)}
              paymentsEnabled={paymentsEnabled}
              paymentSumup={paymentOptions.sumup}
              paymentPaypal={paymentOptions.paypal}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
