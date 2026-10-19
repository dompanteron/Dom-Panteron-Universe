import Link from "next/link";
import { productLineHubs } from "@/lib/shop/product-lines";

export default function HomePage() {
  return (
    <main className="text-white">
      <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-end overflow-hidden bg-panteron-black">
        <div
          aria-hidden
          className="absolute inset-0 bg-panteron-gradient"
        />
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
            Clothing and music fused to uplift the frequency of Earth and every
            living being.
          </p>
          <div className="home-rise home-rise-delay-3 mt-8 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
            >
              Join the universe
            </Link>
            <Link
              href="/collections"
              className="border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              Explore collections
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Shop</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">Three lines, one universe</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Champagne, HOME, and water bottles each have their own door — same membership and
            checkout as fashion.
          </p>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {productLineHubs.map((hub) => (
              <Link key={hub.path} href={hub.path} className="group block border border-white/10 p-6 transition hover:border-panteron-violet/40">
                <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
                  {hub.eyebrow}
                </p>
                <h3 className="font-display mt-3 text-xl transition group-hover:text-panteron-violet sm:text-2xl">
                  {hub.navLabel}
                </h3>
                <p className="mt-3 text-sm text-zinc-400">{hub.lead}</p>
                <span className="mt-5 inline-block text-sm text-zinc-300 transition group-hover:text-panteron-violet">
                  Enter {hub.navLabel.toLowerCase()} →
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/collections"
            className="mt-10 inline-block text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            View all collections including fashion →
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-3 md:gap-10 md:py-28">
          <Link href="/collections" className="group block">
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
              Fashion
            </p>
            <h2 className="font-display mt-3 text-2xl transition group-hover:text-panteron-violet sm:text-3xl">
              Wear the jungle frequency
            </h2>
            <p className="mt-3 text-zinc-400">
              Ready-made drops shaped for presence, power, and play.
            </p>
            <span className="mt-5 inline-block text-sm text-zinc-300 transition group-hover:text-panteron-violet">
              View collections →
            </span>
          </Link>

          <Link href="/music" className="group block">
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
              Music
            </p>
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
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
              Raffles
            </p>
            <h2 className="font-display mt-3 text-2xl transition group-hover:text-panteron-violet sm:text-3xl">
              Step into the circle
            </h2>
            <p className="mt-3 text-zinc-400">
              Limited drops and member draws for those inside the universe.
            </p>
            <span className="mt-5 inline-block text-sm text-zinc-300 transition group-hover:text-panteron-violet">
              View raffles →
            </span>
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 bg-panteron-deep">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(178,102,255,0.22),transparent_65%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Membership
          </p>
          <h2 className="font-display max-w-3xl text-3xl sm:text-4xl md:text-5xl">
            Join the universe
          </h2>
          <p className="max-w-xl text-lg text-zinc-300">
            Create your place in Dom Panteron — early access, raffles, and the
            next wave of style and sound.
          </p>
          <Link
            href="/join"
            className="bg-white px-6 py-3 text-sm font-medium text-panteron-black transition hover:bg-panteron-violet hover:text-white"
          >
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
