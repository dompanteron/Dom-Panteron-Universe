import type { Metadata } from "next";
import Link from "next/link";
import { musicReleases } from "@/lib/catalog/music";

export const metadata: Metadata = {
  title: "Music | Dom Panteron Universe",
  description:
    "Sound that raises the frequency — releases and listening space from Dom Panteron."
};

export default function MusicPage() {
  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze-delayed absolute -right-1/4 top-0 h-[60%] w-[60%] rounded-full bg-panteron-purple/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-28">
          <p className="home-rise mb-4 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            Music
          </p>
          <h1 className="home-rise home-rise-delay-1 font-display max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
            Sound that raises the signal
          </h1>
          <p className="home-rise home-rise-delay-2 mt-6 max-w-2xl text-lg text-zinc-300 sm:text-xl">
            Releases made to move body, mind, and field. The listening space is
            opening — first tracks land here.
          </p>
          <div className="home-rise home-rise-delay-3 mt-8">
            <Link
              href="/join"
              className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
            >
              Hear it first
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-black">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Releases
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-3xl sm:text-4xl">
            The catalog in formation
          </h2>

          <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {musicReleases.map((release) => (
              <li
                key={release.title}
                className="grid gap-3 py-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-6"
              >
                <h3 className="font-display text-2xl text-white">
                  {release.title}
                </h3>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                  {release.kind}
                </p>
                <p className="text-sm text-panteron-violet">{release.status}</p>
                <p className="text-zinc-400 sm:text-right">{release.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">
            Listen
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl sm:text-4xl">
            Player and streaming links come next
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-zinc-300">
            This page is ready for embeds, previews, and release pages. Until
            the first drop goes live, join for early listening access.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="bg-white px-6 py-3 text-sm font-medium text-panteron-black transition hover:bg-panteron-violet hover:text-white"
            >
              Join the universe
            </Link>
            <Link
              href="/clothing"
              className="border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:border-panteron-violet hover:text-panteron-violet"
            >
              Explore clothing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
