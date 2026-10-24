import Link from "next/link";
import RealmCard from "@/components/shop/RealmCard";
import { getActiveRealms } from "@/lib/shop/realms";
import { buildShareMetadata } from "@/lib/site-metadata";

export const metadata = buildShareMetadata({
  title: "Shop | Dom Panteron Universe",
  description:
    "Seven realms — fashion, champagne, home, water, art, jewelry, and music — one checkout across the universe.",
  path: "/shop"
});

export default async function ShopRealmsPage() {
  let realms: Awaited<ReturnType<typeof getActiveRealms>> = [];
  let loadError: string | null = null;

  try {
    realms = await getActiveRealms();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load realms.";
  }

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze absolute -left-1/4 top-0 h-[60%] w-[60%] rounded-full bg-panteron-purple/25 blur-3xl"
        />
        <div
          aria-hidden
          className="home-haze-delayed absolute -right-1/4 bottom-0 h-[50%] w-[50%] rounded-full bg-panteron-violet/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <p className="home-rise text-xs uppercase tracking-[0.4em] text-panteron-violet">
            Realms
          </p>
          <h1 className="home-rise home-rise-delay-1 font-display mt-5 text-4xl font-semibold sm:text-5xl md:text-6xl">
            Choose your door
          </h1>
          <p className="home-rise home-rise-delay-2 mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
            Each realm is its own mood — same membership, same checkout, one jungle of style and
            sound.
          </p>
          <Link
            href="/collections"
            className="home-rise home-rise-delay-3 mt-10 inline-block text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            Browse all collections →
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          {loadError ? (
            <p className="text-center text-sm text-red-400">{loadError}</p>
          ) : realms.length === 0 ? (
            <div className="text-center">
              <p className="text-zinc-400">
                No active realms in the database yet. After you run Supabase migrations, seeded
                realms appear here automatically — or set realms to{" "}
                <span className="text-zinc-300">active</span> under Admin → Realms.
              </p>
              <Link
                href="/collections"
                className="mt-6 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet"
              >
                All collections
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {realms.map((realm, index) => (
                <RealmCard key={realm.id} realm={realm} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
