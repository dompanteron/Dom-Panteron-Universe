import Link from "next/link";
import { RaffleActiveList, RaffleEndedList } from "@/components/raffles/RafflePublicList";
import {
  fetchActivePublicRaffles,
  fetchEndedPublicRaffles
} from "@/lib/raffles/fetch-public-raffles";
import { raffleLineLabel } from "@/lib/raffles/raffle-line-display";
import type { ProductLineHubConfig } from "@/lib/shop/product-lines";

export default async function LineRafflesSection({ config }: { config: ProductLineHubConfig }) {
  let active: Awaited<ReturnType<typeof fetchActivePublicRaffles>> = [];
  let ended: Awaited<ReturnType<typeof fetchEndedPublicRaffles>> = [];
  let loadError: string | null = null;

  try {
    [active, ended] = await Promise.all([
      fetchActivePublicRaffles({ productLine: config.key }),
      fetchEndedPublicRaffles({ productLine: config.key, limit: 6 })
    ]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load draws.";
  }

  if (loadError) {
    return (
      <section id="draws" className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm text-red-400">{loadError}</p>
        </div>
      </section>
    );
  }

  if (active.length === 0 && ended.length === 0) {
    return (
      <section id="draws" className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
          <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Draws</p>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">
            {raffleLineLabel(config.key)} raffles
          </h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            No draws for this line yet. Join the universe — when a {config.navLabel} raffle goes
            live, it appears here and on{" "}
            <Link href="/raffles" className="text-panteron-violet hover:text-white">
              all raffles
            </Link>
            .
          </p>
          <Link
            href="/join"
            className="mt-8 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet"
          >
            Join for drop alerts
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="draws" className="border-t border-white/10 bg-panteron-deep">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Draws</p>
            <h2 className="font-display mt-4 text-3xl sm:text-4xl">
              {config.navLabel} circle
            </h2>
            <p className="mt-3 max-w-xl text-zinc-400">
              Member raffles tied to {config.navLabel.toLowerCase()} — same account, same checkout
              flow as the rest of the universe.
            </p>
          </div>
          <Link
            href="/raffles"
            className="text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            All raffles →
          </Link>
        </div>

        {active.length > 0 ? (
          <div className="mt-12">
            <RaffleActiveList raffles={active} />
          </div>
        ) : (
          <p className="mt-12 text-zinc-500">No active draws for this line right now.</p>
        )}

        {ended.length > 0 ? (
          <div className="mt-20">
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Past draws</p>
            <h3 className="font-display mt-4 text-2xl">Recent winners</h3>
            <RaffleEndedList raffles={ended} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
