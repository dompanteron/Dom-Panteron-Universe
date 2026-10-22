import Link from "next/link";
import ReleaseListenCard from "@/components/music/ReleaseListenCard";
import { parseListenEmbed } from "@/lib/music/parse-listen-embed";
import { getActiveMusicReleases } from "@/lib/music/releases";

export default async function RealmMusicSpotlight({
  listenPath
}: {
  listenPath?: string | null;
}) {
  const musicHref = listenPath?.trim() || "/music";
  let releases: Awaited<ReturnType<typeof getActiveMusicReleases>> = [];
  try {
    releases = await getActiveMusicReleases();
  } catch {
    releases = [];
  }

  const listenReleases = releases
    .filter((release) => release.listen_url && parseListenEmbed(release.listen_url))
    .slice(0, 3);

  if (listenReleases.length === 0) {
    return (
      <section className="border-t border-white/10 bg-panteron-deep">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
          <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Listen</p>
          <p className="mt-4 text-zinc-400">Releases are being tuned — check the music page soon.</p>
          <Link
            href={musicHref}
            className="mt-6 inline-block text-sm text-panteron-violet hover:text-white"
          >
            Open music →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-white/10 bg-panteron-deep">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Listen now</p>
            <h2 className="font-display mt-4 text-3xl sm:text-4xl">Press play in the realm</h2>
            <p className="mt-3 max-w-xl text-zinc-400">
              Streaming embeds from active releases — merch and drops still checkout here when they
              land.
            </p>
          </div>
          <Link
            href={musicHref}
            className="text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            Full music page →
          </Link>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {listenReleases.map((release) => (
            <ReleaseListenCard key={release.id} release={release} />
          ))}
        </div>
      </div>
    </section>
  );
}
