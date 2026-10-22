import Link from "next/link";
import RealmCard from "@/components/shop/RealmCard";
import { getActiveRealms } from "@/lib/shop/realms";

export default async function HomePage() {
  let realms: Awaited<ReturnType<typeof getActiveRealms>> = [];
  try {
    realms = await getActiveRealms();
  } catch {
    realms = [];
  }

  const featuredRealms = realms.filter((r) =>
    ["champagne", "home", "water"].includes(r.slug)
  );

  return (
    <main className="text-white">
      <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-end overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full bg-panteron-purple/20 blur-3xl"
        />
        <div
          aria-hidden
          className="home-haze-delayed absolute -right-1/4 bottom-0 h-[55%] w-[55%] rounded-full bg-panteron-violet/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-28 sm:pb-24 sm:pt-32">
          <p className="home-rise mb-4 font-display text-2xl tracking-wide text-panteron-violet sm:text-3xl md:text-4xl">
            Dom Panteron
          </p>
          <h1 className="home-rise home-rise-delay-1 font-display max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
            A Jungle of Style, Sound, and Conscious Power
          </h1>
          <p className="home-rise home-rise-delay-2 mt-5 max-w-xl text-lg text-zinc-300 sm:text-xl">
            Clothing and music fused to uplift the frequency of Earth and every living being.
          </p>
          <div className="home-rise home-rise-delay-3 mt-8 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
            >
              Join the universe
            </Link>
            <Link
              href="/shop"
              className="border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              Enter the shop
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Realms</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">Seven doors, one checkout</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Fashion, champagne, HOME, water, art, jewelry, and music — each realm has its own
            mood. Same membership everywhere.
          </p>
          {featuredRealms.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {featuredRealms.map((realm, index) => (
                <RealmCard key={realm.id} realm={realm} index={index} />
              ))}
            </div>
          ) : null}
          <Link
            href="/shop"
            className="mt-10 inline-block text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            Explore all realms →
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-3 md:gap-10 md:py-28">
          <Link href="/shop/fashion" className="group block">
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Fashion</p>
            <h2 className="font-display mt-3 text-2xl transition group-hover:text-panteron-violet sm:text-3xl">
              Wear the jungle frequency
            </h2>
            <p className="mt-3 text-zinc-400">
              Ready-made drops shaped for presence, power, and play.
            </p>
            <span className="mt-5 inline-block text-sm text-zinc-300 transition group-hover:text-panteron-violet">
              View fashion →
            </span>
          </Link>

          <Link href="/music" className="group block">
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Music</p>
            <h2 className="font-display mt-3 text-2xl transition group-hover:text-panteron-violet sm:text-3xl">
              Sound that raises the signal
            </h2>
            <p className="mt-3 text-zinc-400">
              Releases and frequencies made to move body, mind, and field.
            </p>
            <span className="mt-5 inline-block text-sm text-zinc-300 transition group-hover:text-panteron-violet">
              Enter music →
            </span>
          </Link>

          <Link href="/raffles" className="group block">
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Raffles</p>
            <h2 className="font-display mt-3 text-2xl transition group-hover:text-panteron-violet sm:text-3xl">
              Step into the circle
            </h2>
            <p className="mt-3 text-zinc-400">
              Member draws for rare pieces, bottles, and universe moments.
            </p>
            <span className="mt-5 inline-block text-sm text-zinc-300 transition group-hover:text-panteron-violet">
              View raffles →
            </span>
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h2 className="font-display text-3xl sm:text-4xl">Ready to raise your frequency?</h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Join once — shop every realm, enter draws, and stay close to the next drop.
          </p>
          <Link
            href="/join"
            className="mt-8 inline-block bg-panteron-purple px-8 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
          >
            Join the universe
          </Link>
        </div>
      </section>
    </main>
  );
}
