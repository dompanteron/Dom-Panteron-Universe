"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import type { RealmRow } from "@/lib/shop/types";

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminRealmForm({ realm }: { realm: RealmRow }) {
  const router = useRouter();
  const [name, setName] = useState(realm.name);
  const [tagline, setTagline] = useState(realm.tagline ?? "");
  const [description, setDescription] = useState(realm.description ?? "");
  const [heroUrl, setHeroUrl] = useState(realm.hero_image_url ?? "");
  const [accent, setAccent] = useState(realm.accent);
  const [status, setStatus] = useState(realm.status);
  const [kind, setKind] = useState(realm.kind);
  const [displayOrder, setDisplayOrder] = useState(String(realm.display_order));
  const [listenPath, setListenPath] = useState(realm.listen_path ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/realms/${realm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tagline,
          description,
          hero_image_url: heroUrl,
          accent,
          status,
          kind,
          display_order: displayOrder,
          listen_path: listenPath
        })
      });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not save realm");
      }
      setMessage("Saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save realm");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm text-zinc-400">Slug</label>
        <p className="text-zinc-300">{realm.slug}</p>
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-name">
          Name
        </label>
        <input
          id="realm-name"
          className={fieldClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-tagline">
          Tagline
        </label>
        <input
          id="realm-tagline"
          className={fieldClass}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-description">
          Description
        </label>
        <textarea
          id="realm-description"
          className={`${fieldClass} min-h-[120px]`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <AdminImageUpload
        label="Hero image"
        folder="realms"
        value={heroUrl}
        onChange={setHeroUrl}
        hint="Wide hero for /shop/[realm] — 16:9 or wider works best."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-accent">
            Accent
          </label>
          <select
            id="realm-accent"
            className={fieldClass}
            value={accent}
            onChange={(e) => setAccent(e.target.value as RealmRow["accent"])}
          >
            {["violet", "gold", "emerald", "rose", "ice", "amber"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-status">
          Status
        </label>
        <select
          id="realm-status"
          className={fieldClass}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="draft">draft</option>
          <option value="active">active</option>
        </select>
        <p className="mt-2 text-xs text-zinc-500">
          Draft hides the realm from /shop and the header. Prefer draft over delete when sunsetting a
          world.
        </p>
      </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-kind">
            Kind
          </label>
          <select
            id="realm-kind"
            className={fieldClass}
            value={kind}
            onChange={(e) => setKind(e.target.value as RealmRow["kind"])}
          >
            <option value="commerce">commerce</option>
            <option value="music">music</option>
            <option value="mixed">mixed</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-order">
            Display order
          </label>
          <input
            id="realm-order"
            className={fieldClass}
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400" htmlFor="realm-listen">
          Listen path (music realms)
        </label>
        <input
          id="realm-listen"
          className={fieldClass}
          value={listenPath}
          onChange={(e) => setListenPath(e.target.value)}
          placeholder="/music"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save realm"}
      </button>
    </form>
  );
}
