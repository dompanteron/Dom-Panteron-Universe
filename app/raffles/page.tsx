import type { Metadata } from "next";
import Link from "next/link";
import { RaffleActiveList, RaffleEndedList } from "@/components/raffles/RafflePublicList";
import {
  fetchActivePublicRaffles,
  fetchEndedPublicRaffles
} from "@/lib/raffles/fetch-public-raffles";
import { productLineHubs } from "@/lib/shop/product-lines";

export const metadata: Metadata = {
  title: "Raffles | Dom Panteron Universe",
  description: "Limited drops and member draws inside Dom Panteron Universe."
};

export default async function RafflesPage() {
  let raffles: Awaited<ReturnType<typeof fetchActivePublicRaffles>> = [];
  let pastRaffles: Awaited<ReturnType<typeof fetchEndedPublicRaffles>> = [];
  let loadError: string | null = null;

  try {
    [raffles, pastRaffles] = await Promise.all([
      fetchActivePublicRaffles(),
      fetchEndedPublicRaffles({ limit: 12 })
    ]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load raffles.";
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
            Universe-wide draws plus line-specific drops for champagne, HOME, and water. Join
            first, then claim your place when a raffle goes live.
          </p>
          <div className="home-rise home-rise-delay-3 mt-8 flex flex-wrap gap-3">
            {productLineHubs.map((hub) => (
              <Link
                key={hub.path}
                href={`${hub.path}#draws`}
                className="border border-white/20 px-4 py-2 text-sm transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                {hub.navLabel} draws
              </Link>
            ))}
          </div>
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
              <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Open circle</p>
              <h2 className="font-display mt-4 max-w-2xl text-3xl sm:text-4xl">
                No active raffles yet
              </h2>
              <p className="mt-6 max-w-xl text-lg text-zinc-300">
                When a draw goes live, it will appear here. Join the universe so you&apos;re ready
                for the next drop.
              </p>
              <Link
                href="/join"
                className="mt-8 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
              >
                Join to enter later
              </Link>
            </div>
          ) : (
            <RaffleActiveList raffles={raffles} />
          )}

          {pastRaffles.length > 0 ? (
            <div className="mt-24">
              <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Past draws</p>
              <h2 className="font-display mt-4 text-3xl sm:text-4xl">Winners in the circle</h2>
              <RaffleEndedList raffles={pastRaffles} />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
