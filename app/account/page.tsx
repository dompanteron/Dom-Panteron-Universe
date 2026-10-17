import type { Metadata } from "next";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import { getMemberProductOrders } from "@/lib/member-orders";
import { getMemberTickets } from "@/lib/member-tickets";
import { requireMember } from "@/lib/members";
import { formatRaffleDrawDate } from "@/lib/raffles";
import { formatProductPrice } from "@/lib/shop/format-price";
import { formatOrderDate } from "@/lib/shop/product-orders";

export const metadata: Metadata = {
  title: "Account | Dom Panteron Universe"
};

export default async function AccountPage() {
  const { member } = await requireMember();

  let tickets: Awaited<ReturnType<typeof getMemberTickets>> = [];
  let ticketsError: string | null = null;
  let shopOrders: Awaited<ReturnType<typeof getMemberProductOrders>> = [];
  let ordersError: string | null = null;

  try {
    tickets = await getMemberTickets(member.id);
  } catch (error) {
    ticketsError = error instanceof Error ? error.message : "Could not load tickets.";
  }

  try {
    shopOrders = await getMemberProductOrders(member.id);
  } catch (error) {
    ordersError = error instanceof Error ? error.message : "Could not load shop orders.";
  }

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-24 sm:pb-20 sm:pt-28">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            Account
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-semibold sm:text-5xl">
            {member.full_name || "Your place in the universe"}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-zinc-300">{member.email}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-zinc-500">
            Role · {member.role}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/collections"
              className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
            >
              Shop collections
            </Link>
            <Link
              href="/raffles"
              className="border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              Browse raffles
            </Link>
            <SignOutButton />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Your tickets
          </p>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">Raffle entries</h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            Draws you have entered. Confirmation email sends when Resend is configured.
          </p>

          {ticketsError ? (
            <p className="mt-10 text-sm text-red-400">{ticketsError}</p>
          ) : tickets.length === 0 ? (
            <div className="mt-10">
              <p className="text-zinc-400">No entries yet.</p>
              <Link
                href="/raffles"
                className="mt-6 inline-block border border-white/25 px-5 py-2.5 text-sm text-white transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                Find a draw →
              </Link>
            </div>
          ) : (
            <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
              {tickets.map((ticket) => (
                <li
                  key={ticket.raffleId}
                  className="grid gap-4 py-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {ticket.status}
                    </p>
                    <h3 className="font-display mt-2 text-2xl text-white">{ticket.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      Draw {formatRaffleDrawDate(ticket.drawDate, true)}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-lg text-panteron-violet">
                      {ticket.yourEntries} entr{ticket.yourEntries === 1 ? "y" : "ies"}
                    </p>
                    {ticket.status === "active" ? (
                      <Link
                        href={`/raffles/${ticket.raffleId}`}
                        className="mt-3 inline-block text-sm text-zinc-300 transition hover:text-white"
                      >
                        View draw →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Your orders
          </p>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">Shop</h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            Pieces you requested from the collections. Payment is confirmed by the team until
            checkout goes live.
          </p>

          {ordersError ? (
            <p className="mt-10 text-sm text-red-400">{ordersError}</p>
          ) : shopOrders.length === 0 ? (
            <div className="mt-10">
              <p className="text-zinc-400">No shop orders yet.</p>
              <Link
                href="/collections"
                className="mt-6 inline-block border border-white/25 px-5 py-2.5 text-sm text-white transition hover:border-panteron-violet hover:text-panteron-violet"
              >
                Explore collections →
              </Link>
            </div>
          ) : (
            <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
              {shopOrders.map((order) => (
                <li
                  key={order.orderId}
                  className="grid gap-4 py-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {order.status}
                    </p>
                    <h3 className="font-display mt-2 text-2xl text-white">{order.productTitle}</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      {order.size} · qty {order.quantity} · {formatOrderDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-lg text-panteron-violet">
                      {formatProductPrice(order.totalPrice, order.currency)}
                    </p>
                    <Link
                      href={`/products/${order.productSlug}`}
                      className="mt-3 inline-block text-sm text-zinc-300 transition hover:text-white"
                    >
                      View product →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
