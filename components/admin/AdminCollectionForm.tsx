"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { toDatetimeLocal } from "@/lib/raffles";

export type CollectionFormValues = {
  id?: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  display_order: number;
  status: string;
  reveal_at: string | null;
  show_items_during_countdown: boolean;
};

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminCollectionForm({
  collection
}: {
  collection?: CollectionFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(collection?.id);
  const [name, setName] = useState(collection?.name ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [subtitle, setSubtitle] = useState(collection?.subtitle ?? "");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [coverUrl, setCoverUrl] = useState(collection?.cover_image_url ?? "");
  const [displayOrder, setDisplayOrder] = useState(String(collection?.display_order ?? 0));
  const [status, setStatus] = useState(collection?.status ?? "draft");
  const [revealAt, setRevealAt] = useState(
    collection?.reveal_at ? toDatetimeLocal(collection.reveal_at) : ""
  );
  const [showDuringCountdown, setShowDuringCountdown] = useState(
    collection?.show_items_during_countdown ?? false
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const payload = {
      name,
      slug,
      subtitle,
      description,
      cover_image_url: coverUrl,
      display_order: displayOrder,
      status,
      reveal_at: revealAt || null,
      show_items_during_countdown: showDuringCountdown
    };

    try {
      const response = await fetch(
        isEdit ? `/api/admin/collections/${collection?.id}` : "/api/admin/collections",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not save collection");
      }

      setMessage(isEdit ? "Collection saved." : "Collection created.");
      router.refresh();
      if (!isEdit) {
        setName("");
        setSlug("");
        setSubtitle("");
        setDescription("");
        setCoverUrl("");
        setDisplayOrder("0");
        setStatus("draft");
        setRevealAt("");
        setShowDuringCountdown(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save collection");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Name</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Slug</span>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={fieldClass} placeholder="auto-from-name" />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Display order</span>
        <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className={fieldClass} />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Subtitle</span>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={fieldClass} />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Description</span>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} />
      </label>
      <AdminImageUpload
        label="Cover image"
        folder="collections"
        value={coverUrl}
        onChange={setCoverUrl}
        hint="Upload to Supabase Storage or paste an external URL."
      />
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClass} bg-panteron-black`}>
          <option value="draft">draft</option>
          <option value="active">active</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Reveal at (optional)</span>
        <input type="datetime-local" value={revealAt} onChange={(e) => setRevealAt(e.target.value)} className={fieldClass} />
      </label>
      <label className="flex items-center gap-3 md:col-span-2">
        <input
          type="checkbox"
          checked={showDuringCountdown}
          onChange={(e) => setShowDuringCountdown(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-sm text-zinc-400">Show product images during countdown</span>
      </label>
      <div className="md:col-span-2">
        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mb-4 text-sm text-panteron-violet">{message}</p> : null}
        <button type="submit" disabled={busy} className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet disabled:opacity-60">
          {busy ? "Saving…" : isEdit ? "Save collection" : "Create collection"}
        </button>
      </div>
    </form>
  );
}
