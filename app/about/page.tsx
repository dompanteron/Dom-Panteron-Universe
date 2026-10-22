import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Dom Panteron Universe",
  description:
    "The mission behind Dom Panteron — clothing, music, and conscious elevation."
};

export default function AboutPage() {
  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze absolute -right-1/4 top-0 h-[60%] w-[60%] rounded-full bg-panteron-purple/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-28">
          <p className="home-rise mb-4 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            About
          </p>
          <h1 className="home-rise home-rise-delay-1 font-display max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
            Built to raise the frequency
          </h1>
          <p className="home-rise home-rise-delay-2 mt-6 max-w-2xl text-lg text-zinc-300 sm:text-xl">
            Dom Panteron Universe is a living brand where style, sound, and
            conscious power move as one — made to uplift Earth and every living
            being.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Mission
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl sm:text-4xl">
            A jungle of presence, creativity, and care
          </h2>
          <div className="mt-8 max-w-3xl space-y-5 text-lg leading-relaxed text-zinc-300">
            <p>
              We believe clothing and music are not just products — they are
              carriers of energy. What you wear and what you listen to can shift
              how you move through the world.
            </p>
            <p>
              Dom Panteron exists to fuse those forces into something wild,
              elegant, and awake: pieces and sounds that feel alive, protective,
              and free.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-3 md:gap-10 md:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
              Style
            </p>
            <h3 className="font-display mt-3 text-2xl">Wear the signal</h3>
            <p className="mt-3 text-zinc-400">
              Conscious streetwear shaped for presence — bold silhouettes,
              jungle spirit, and everyday power.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
              Sound
            </p>
            <h3 className="font-display mt-3 text-2xl">Raise the field</h3>
            <p className="mt-3 text-zinc-400">
              Music made to move body and mind — frequencies that open space,
              lift mood, and invite deeper listening.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
              Circle
            </p>
            <h3 className="font-display mt-3 text-2xl">Share the rise</h3>
            <p className="mt-3 text-zinc-400">
              Members, raffles, and drops keep the universe in motion — for
              people who want to grow with the brand, not just buy from it.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 md:py-28">
          <h2 className="font-display max-w-3xl text-3xl sm:text-4xl">
            This is only the beginning
          </h2>
          <p className="max-w-xl text-lg text-zinc-300">
            The universe is still being built. Join early, walk through the shop
            realms, listen to the music, and grow with Dom Panteron as the next
            chapters arrive.
          </p>
          <div className="flex flex-wrap gap-4">
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
            <Link
              href="/music"
              className="border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              Listen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
