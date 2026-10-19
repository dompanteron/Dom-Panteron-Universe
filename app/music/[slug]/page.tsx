import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MusicListenEmbed from "@/components/music/MusicListenEmbed";
import { parseListenEmbed } from "@/lib/music/parse-listen-embed";
import { getMusicReleaseBySlug } from "@/lib/music/releases";
import { buildShareMetadata } from "@/lib/site-metadata";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const release = await getMusicReleaseBySlug(params.slug);

  if (!release) {
    return { title: "Release | Dom Panteron Universe" };
  }

  return buildShareMetadata({
    title: `${release.title} | Music`,
    description: release.note ?? `${release.kind} · ${release.phase_label}`,
    path: `/music/${release.slug}`,
    imageUrl: release.cover_image_url
  });
}

export default async function MusicReleasePage({ params }: Props) {
  const release = await getMusicReleaseBySlug(params.slug);

  if (!release) {
    notFound();
  }

  const listenUrl = release.listen_url?.trim();
  const hasEmbed = listenUrl ? Boolean(parseListenEmbed(listenUrl)) : false;

  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-24 sm:pt-28">
          <Link
            href="/music"
            className="text-sm text-zinc-400 transition hover:text-panteron-violet"
          >
            ← All music
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.35em] text-panteron-violet">
            {release.kind}
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">{release.title}</h1>
          <p className="mt-3 text-lg text-panteron-violet">{release.phase_label}</p>
          {release.note ? <p className="mt-6 text-lg text-zinc-300">{release.note}</p> : null}

          {release.cover_image_url ? (
            <div className="mt-10 border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={release.cover_image_url}
                alt=""
                className="aspect-square w-full max-w-md object-cover"
              />
            </div>
          ) : null}

          {hasEmbed && listenUrl ? (
            <div className="mt-10">
              <MusicListenEmbed listenUrl={listenUrl} title={release.title} />
            </div>
          ) : null}

          {listenUrl ? (
            <a
              href={listenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet"
            >
              Listen on streaming platform →
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
