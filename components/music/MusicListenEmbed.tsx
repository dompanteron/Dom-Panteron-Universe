import { parseListenEmbed } from "@/lib/music/parse-listen-embed";

export default function MusicListenEmbed({
  listenUrl,
  title
}: {
  listenUrl: string;
  title: string;
}) {
  const embed = parseListenEmbed(listenUrl);
  if (!embed) {
    return null;
  }

  const label =
    embed.provider === "spotify"
      ? "Spotify player"
      : embed.provider === "youtube"
        ? "YouTube player"
        : "SoundCloud player";

  return (
    <div className="overflow-hidden border border-white/10 bg-panteron-black">
      <iframe
        title={`${label}: ${title}`}
        src={embed.embedUrl}
        width="100%"
        height={embed.height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="block w-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
