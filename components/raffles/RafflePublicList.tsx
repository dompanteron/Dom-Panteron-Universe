import Link from "next/link";
import { formatRaffleDrawDate, type PublicRaffle } from "@/lib/raffles";
import { raffleLineHref, raffleLineLabel } from "@/lib/raffles/raffle-line-display";

export function RaffleActiveList({ raffles }: { raffles: PublicRaffle[] }) {
  if (raffles.length === 0) {
    return null;
  }

  return (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {raffles.map((raffle) => (
        <li
          key={raffle.id}
          className="grid gap-4 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.25em] text-panteron-violet">Active</p>
              <Link
                href={raffleLineHref(raffle.product_line ?? null)}
                className="text-xs uppercase tracking-[0.2em] text-zinc-500 transition hover:text-panteron-violet"
              >
                {raffleLineLabel(raffle.product_line ?? null)}
              </Link>
            </div>
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
            <p className="text-sm text-zinc-400">Draw {formatRaffleDrawDate(raffle.draw_date)}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {Number(raffle.ticket_price).toFixed(2)} / entry · {raffle.total_entries}/
              {raffle.max_entries} filled
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
  );
}

export function RaffleEndedList({ raffles }: { raffles: PublicRaffle[] }) {
  if (raffles.length === 0) {
    return null;
  }

  return (
    <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
      {raffles.map((raffle) => (
        <li
          key={raffle.id}
          className="grid gap-4 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Ended</p>
              <Link
                href={raffleLineHref(raffle.product_line ?? null)}
                className="text-xs uppercase tracking-[0.2em] text-zinc-500 transition hover:text-panteron-violet"
              >
                {raffleLineLabel(raffle.product_line ?? null)}
              </Link>
            </div>
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
            <p className="text-sm text-zinc-400">Draw {formatRaffleDrawDate(raffle.draw_date)}</p>
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
  );
}
