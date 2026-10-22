import Link from "next/link";
import { REALM_ACCENT_CLASSES, realmShopPath } from "@/lib/shop/realms";
import type { RealmRow } from "@/lib/shop/types";

export default function RealmCard({
  realm,
  index = 0
}: {
  realm: RealmRow;
  index?: number;
}) {
  const accent = REALM_ACCENT_CLASSES[realm.accent];
  const delayClass =
    index === 0
      ? ""
      : index === 1
        ? "home-rise-delay-1"
        : index === 2
          ? "home-rise-delay-2"
          : "home-rise-delay-3";

  return (
    <Link
      href={realmShopPath(realm.slug)}
      className={`home-rise ${delayClass} group relative block overflow-hidden border border-white/10 bg-panteron-black/40 p-8 transition duration-500 ${accent.border}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl transition-opacity duration-500 opacity-60 group-hover:opacity-100 ${accent.glow}`}
      />
      <div className="relative z-10">
        <p className={`text-xs uppercase tracking-[0.35em] ${accent.text}`}>{realm.name}</p>
        <h3 className="font-display mt-4 text-2xl transition group-hover:translate-x-0.5 sm:text-3xl">
          {realm.tagline ?? realm.name}
        </h3>
        {realm.description ? (
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">{realm.description}</p>
        ) : null}
        <span
          className={`mt-8 inline-flex items-center gap-2 text-sm text-zinc-300 transition group-hover:gap-3 ${accent.text}`}
        >
          Enter realm
          <span aria-hidden className="transition group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
