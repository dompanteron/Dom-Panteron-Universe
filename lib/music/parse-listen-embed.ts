export type ListenEmbed = {
  provider: "spotify" | "youtube" | "soundcloud";
  embedUrl: string;
  height: number;
};

const SPOTIFY_TYPES = new Set(["track", "album", "playlist", "episode", "show"]);

export function parseListenEmbed(listenUrl: string | null | undefined): ListenEmbed | null {
  const raw = listenUrl?.trim();
  if (!raw) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "open.spotify.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const type = parts[0];
    const id = parts[1];
    if (!type || !id || !SPOTIFY_TYPES.has(type)) {
      return null;
    }

    const height = type === "track" || type === "episode" ? 152 : 352;
    return {
      provider: "spotify",
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`,
      height
    };
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const videoId =
      url.searchParams.get("v") ||
      (url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : null) ||
      (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : null);

    if (!videoId) {
      return null;
    }

    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      height: 315
    };
  }

  if (host === "youtu.be") {
    const videoId = url.pathname.split("/").filter(Boolean)[0];
    if (!videoId) {
      return null;
    }

    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      height: 315
    };
  }

  if (host === "soundcloud.com" || host === "on.soundcloud.com") {
    return {
      provider: "soundcloud",
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&color=%23b266ff&auto_play=false&hide_related=true&show_comments=false`,
      height: 166
    };
  }

  return null;
}
