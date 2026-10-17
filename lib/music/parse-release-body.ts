import { slugify } from "@/lib/shop/slug";

export function parseMusicReleaseBody(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  if (!title) {
    return { ok: false as const, error: "Title is required." };
  }

  const slug = String(body.slug ?? "").trim() || slugify(title);
  const status = String(body.status ?? "draft");
  if (status !== "draft" && status !== "active") {
    return { ok: false as const, error: "Invalid status." };
  }

  const releaseDateRaw = String(body.release_date ?? "").trim();
  let release_date: string | null = null;
  if (releaseDateRaw) {
    const parsed = Date.parse(releaseDateRaw);
    if (Number.isNaN(parsed)) {
      return { ok: false as const, error: "Invalid release date." };
    }
    release_date = new Date(releaseDateRaw).toISOString().slice(0, 10);
  }

  return {
    ok: true as const,
    data: {
      title,
      slug,
      kind: String(body.kind ?? "Single").trim() || "Single",
      phase_label: String(body.phase_label ?? "Coming soon").trim() || "Coming soon",
      note: String(body.note ?? "").trim() || null,
      cover_image_url: String(body.cover_image_url ?? "").trim() || null,
      listen_url: String(body.listen_url ?? "").trim() || null,
      display_order: Number(body.display_order ?? 0),
      status,
      release_date
    }
  };
}

export function revalidateMusicPaths() {
  return ["/music", "/admin/music", "/admin"] as const;
}
