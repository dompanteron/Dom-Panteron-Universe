import Link from "next/link";
import MusicListenEmbed from "@/components/music/MusicListenEmbed";
import { parseListenEmbed } from "@/lib/music/parse-listen-embed";
import type { MusicReleaseRow } from "@/lib/music/types";

export default function ReleaseListenCard({ release }: { release: MusicReleaseRow }) {
  const listenUrl = release.listen_url?.trim();
  if (!listenUrl || !parseListenEmbed(listenUrl)) {
    return null;
  }

  return (
    <article className="border border-white/10 bg-panteron-deep p-6">
      <div className="flex flex-wrap items-start gap-4">
        {release.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={release.cover_image_url}
            alt=""
            className="h-20 w-20 shrink-0 border border-white/10 object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{release.kind}</p>
          <h3 className="font-display mt-1 text-2xl text-white">
            <Link href={`/music/${release.slug}`} className="transition hover:text-panteron-violet">
              {release.title}
            </Link>
          </h3>
          {release.phase_label ? (
            <p className="mt-1 text-sm text-panteron-violet">{release.phase_label}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <MusicListenEmbed listenUrl={listenUrl} title={release.title} />
      </div>

      <a
        href={listenUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm text-zinc-400 transition hover:text-panteron-violet"
      >
        Open in {parseListenEmbed(listenUrl)?.provider ?? "app"} →
      </a>
    </article>
  );
}
