"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminImageUpload from "@/components/admin/AdminImageUpload";

export type MusicReleaseFormValues = {
  id?: string;
  title: string;
  slug: string;
  kind: string;
  phase_label: string;
  note: string | null;
  cover_image_url: string | null;
  listen_url: string | null;
  display_order: number;
  status: string;
  release_date: string | null;
};

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminMusicReleaseForm({
  release
}: {
  release?: MusicReleaseFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(release?.id);
  const [title, setTitle] = useState(release?.title ?? "");
  const [slug, setSlug] = useState(release?.slug ?? "");
  const [kind, setKind] = useState(release?.kind ?? "Single");
  const [phaseLabel, setPhaseLabel] = useState(release?.phase_label ?? "Coming soon");
  const [note, setNote] = useState(release?.note ?? "");
  const [coverUrl, setCoverUrl] = useState(release?.cover_image_url ?? "");
  const [listenUrl, setListenUrl] = useState(release?.listen_url ?? "");
  const [displayOrder, setDisplayOrder] = useState(String(release?.display_order ?? 0));
  const [status, setStatus] = useState(release?.status ?? "draft");
  const [releaseDate, setReleaseDate] = useState(release?.release_date ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const payload = {
      title,
      slug,
      kind,
      phase_label: phaseLabel,
      note,
      cover_image_url: coverUrl,
      listen_url: listenUrl,
      display_order: displayOrder,
      status,
      release_date: releaseDate || null
    };

    try {
      const response = await fetch(
        isEdit ? `/api/admin/music-releases/${release?.id}` : "/api/admin/music-releases",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not save release");
      }

      setMessage(isEdit ? "Release saved." : "Release created.");
      router.refresh();
      if (!isEdit) {
        setTitle("");
        setSlug("");
        setKind("Single");
        setPhaseLabel("Coming soon");
        setNote("");
        setCoverUrl("");
        setListenUrl("");
        setDisplayOrder("0");
        setStatus("draft");
        setReleaseDate("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save release");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Title</span>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Slug</span>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Kind</span>
        <input value={kind} onChange={(e) => setKind(e.target.value)} className={fieldClass} placeholder="Single, EP, Album…" />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Phase label (public)</span>
        <input value={phaseLabel} onChange={(e) => setPhaseLabel(e.target.value)} className={fieldClass} placeholder="Coming soon, Out now…" />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Display order</span>
        <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className={fieldClass} />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Note</span>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={fieldClass} />
      </label>
      <AdminImageUpload
        label="Cover art"
        folder="music"
        value={coverUrl}
        onChange={setCoverUrl}
      />
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Listen URL</span>
        <input
          value={listenUrl}
          onChange={(e) => setListenUrl(e.target.value)}
          className={fieldClass}
          placeholder="https://open.spotify.com/track/… or YouTube / SoundCloud"
        />
        <span className="mt-2 block text-xs text-zinc-500">
          Spotify, YouTube, and SoundCloud URLs embed on the public music page.
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Release date (optional)</span>
        <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Visibility</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClass} bg-panteron-black`}>
          <option value="draft">draft</option>
          <option value="active">active</option>
        </select>
      </label>
      <div className="md:col-span-2">
        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mb-4 text-sm text-panteron-violet">{message}</p> : null}
        <button type="submit" disabled={busy} className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet disabled:opacity-60">
          {busy ? "Saving…" : isEdit ? "Save release" : "Create release"}
        </button>
      </div>
    </form>
  );
}
