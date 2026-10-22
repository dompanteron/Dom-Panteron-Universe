import Link from "next/link";
import { realmEmptyContent } from "@/lib/shop/realm-content";
import { REALM_ACCENT_CLASSES } from "@/lib/shop/realm-ui";
import type { RealmRow } from "@/lib/shop/types";

export default function RealmEmptyState({ realm }: { realm: RealmRow }) {
  const accent = REALM_ACCENT_CLASSES[realm.accent];
  const copy = realmEmptyContent(realm);
  const listenHref = realm.listen_path?.trim() || "/music";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 py-20 text-center md:py-28">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-40 ${accent.glow}`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
      />
      <div className="relative z-10 mx-auto max-w-lg px-6">
        <p className={`text-xs uppercase tracking-[0.4em] ${accent.text}`}>Coming soon</p>
        <h2 className="font-display mt-6 text-3xl sm:text-4xl">{copy.headline}</h2>
        <p className="mt-5 text-lg leading-relaxed text-zinc-300">{copy.body}</p>
        <p className="mt-4 text-sm text-zinc-500">{copy.hint}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {realm.kind === "music" || realm.slug === "music" ? (
            <Link
              href={listenHref}
              className="inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet"
            >
              Listen now →
            </Link>
          ) : null}
          <Link
            href="/join"
            className="inline-block border border-white/25 px-6 py-3 text-sm font-medium transition hover:border-panteron-violet hover:text-panteron-violet"
          >
            Join for alerts
          </Link>
          <Link
            href="/shop"
            className="inline-block border border-white/10 px-6 py-3 text-sm text-zinc-400 transition hover:text-white"
          >
            Other realms
          </Link>
        </div>
      </div>
    </div>
  );
}
