import type { Metadata } from "next";
import Link from "next/link";
import { clothingCategories } from "@/lib/catalog/clothing";

export const metadata: Metadata = {
  title: "Clothing | Dom Panteron Universe",
  description:
    "Conscious streetwear from Dom Panteron — jungle-born style for presence and power."
};

export default function ClothingPage() {
  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze absolute -left-1/4 bottom-0 h-[55%] w-[55%] rounded-full bg-panteron-violet/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-28">
          <p className="home-rise mb-4 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            Clothing
          </p>
          <h1 className="home-rise home-rise-delay-1 font-display max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
            Wear the jungle frequency
          </h1>
          <p className="home-rise home-rise-delay-2 mt-6 max-w-2xl text-lg text-zinc-300 sm:text-xl">
            Conscious streetwear shaped for presence, power, and play. The
            lookbook is opening — first drops land here.
          </p>
          <div className="home-rise home-rise-delay-3 mt-8">
            <Link
              href="/join"
              className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
            >
              Get drop alerts
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Categories
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-3xl sm:text-4xl">
            A wardrobe in formation
          </h2>

          <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {clothingCategories.map((category) => (
              <li
                key={category.name}
                className="grid gap-3 py-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] sm:items-baseline sm:gap-8"
              >
                <h3 className="font-display text-2xl text-white">
                  {category.name}
                </h3>
                <p className="text-lg text-zinc-300">{category.line}</p>
                <p className="text-sm text-zinc-500 sm:text-right">
                  {category.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Coming soon
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl sm:text-4xl">
            Product imagery and shop flow arrive next
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-zinc-300">
            This page is ready for real pieces — photos, sizes, and checkout
            will plug in without changing the vibe. Until then, join the
            universe for early access.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="bg-white px-6 py-3 text-sm font-medium text-panteron-black transition hover:bg-panteron-violet hover:text-white"
            >
              Join the universe
            </Link>
            <Link
              href="/music"
              className="border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              Explore music
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
