import type { Metadata } from "next";
import Link from "next/link";
import { formatRaffleDrawDate, type PublicRaffle } from "@/lib/raffles";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Raffles | Dom Panteron Universe",
  description:
    "Limited drops and member draws inside Dom Panteron Universe."
};

export default async function RafflesPage() {
  let raffles: PublicRaffle[] = [];
  let pastRaffles: PublicRaffle[] = [];
  let loadError: string | null = null;

  try {
    const supabase = await createServerClient();
    const [activeResult, endedResult] = await Promise.all([
      supabase
        .from("raffles")
        .select(
          "id, title, subtitle, description, ticket_price, max_entries, total_entries, draw_date, status"
        )
        .eq("status", "active")
        .order("draw_date", { ascending: true }),
      supabase
        .from("raffles")
        .select(
          "id, title, subtitle, description, ticket_price, max_entries, total_entries, draw_date, status, winner_number, winner_initials, winner_display_name"
        )
        .eq("status", "ended")
        .order("draw_date", { ascending: false })
        .limit(12)
    ]);

    if (activeResult.error) {
      loadError = activeResult.error.message;
    } else {
      raffles = (activeResult.data ?? []) as PublicRaffle[];
    }

    if (!endedResult.error) {
      pastRaffles = (endedResult.data ?? []) as PublicRaffle[];
    }
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load raffles.";
  }

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze-delayed absolute -right-1/4 bottom-0 h-[50%] w-[50%] rounded-full bg-panteron-violet/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-24 sm:pb-20 sm:pt-28">
          <p className="home-rise mb-4 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            Raffles
          </p>
          <h1 className="home-rise home-rise-delay-1 font-display max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
            Step into the circle
          </h1>
          <p className="home-rise home-rise-delay-2 mt-6 max-w-2xl text-lg text-zinc-300 sm:text-xl">
            Limited draws for members of the universe. Join first, then claim
            your place when a raffle goes live.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          {loadError ? (
            <div>
              <p className="text-sm text-red-400">Couldn&apos;t load raffles right now.</p>
              <p className="mt-2 text-zinc-500">{loadError}</p>
            </div>
          ) : raffles.length === 0 ? (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
                Open circle
              </p>
              <h2 className="font-display mt-4 max-w-2xl text-3xl sm:text-4xl">
                No active raffles yet
              </h2>
              <p className="mt-6 max-w-xl text-lg text-zinc-300">
                When a draw goes live, it will appear here. Join the universe so
                you’re ready for the next drop.
              </p>
              <Link
                href="/join"
                className="mt-8 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
              >
                Join to enter later
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {raffles.map((raffle) => (
                <li
                  key={raffle.id}
                  className="grid gap-4 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-panteron-violet">
                      Active
                    </p>
                    <h2 className="font-display mt-3 text-3xl">
                      <Link
                        href={`/raffles/${raffle.id}`}
                        className="transition hover:text-panteron-violet"
                      >
                        {raffle.title}
                      </Link>
                    </h2>
                    {raffle.subtitle ? (
                      <p className="mt-2 text-lg text-zinc-300">{raffle.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm text-zinc-400">
                      Draw {formatRaffleDrawDate(raffle.draw_date)}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      {Number(raffle.ticket_price).toFixed(2)} / entry ·{" "}
                      {raffle.total_entries}/{raffle.max_entries} filled
                    </p>
                    <Link
                      href={`/raffles/${raffle.id}`}
                      className="mt-5 inline-block border border-white/25 px-5 py-2.5 text-sm text-white transition hover:border-panteron-violet hover:text-panteron-violet"
                    >
                      View draw →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pastRaffles.length > 0 ? (
            <div className="mt-24">
              <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Past draws</p>
              <h2 className="font-display mt-4 text-3xl sm:text-4xl">Winners in the circle</h2>
              <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
                {pastRaffles.map((raffle) => (
                  <li
                    key={raffle.id}
                    className="grid gap-4 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Ended</p>
                      <h2 className="font-display mt-3 text-3xl">
                        <Link
                          href={`/raffles/${raffle.id}`}
                          className="transition hover:text-panteron-violet"
                        >
                          {raffle.title}
                        </Link>
                      </h2>
                      {raffle.winner_display_name ? (
                        <p className="mt-2 text-lg text-panteron-violet">
                          Winner · {raffle.winner_display_name}
                          {raffle.winner_number != null ? (
                            <span className="text-zinc-400"> · ticket #{raffle.winner_number}</span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                    <div className="md:text-right">
                      <p className="text-sm text-zinc-400">
                        Draw {formatRaffleDrawDate(raffle.draw_date)}
                      </p>
                      <Link
                        href={`/raffles/${raffle.id}`}
                        className="mt-5 inline-block text-sm text-zinc-300 transition hover:text-panteron-violet"
                      >
                        View results →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
