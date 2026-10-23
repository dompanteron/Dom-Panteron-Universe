"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { REALM_ACCENTS, REALM_KINDS, REALM_STATUSES } from "@/lib/shop/realm-admin";
import type { RealmAccent, RealmKind } from "@/lib/shop/types";

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminRealmCreateForm({
  nextDisplayOrder = 100
}: {
  nextDisplayOrder?: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [status, setStatus] = useState<(typeof REALM_STATUSES)[number]>("draft");
  const [kind, setKind] = useState<RealmKind>("commerce");
  const [accent, setAccent] = useState<RealmAccent>("violet");
  const [displayOrder, setDisplayOrder] = useState(String(nextDisplayOrder));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/realms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          tagline,
          status,
          kind,
          accent,
          display_order: displayOrder
        })
      });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        realm?: { id: string };
      };

      if (!response.ok || !result.ok || !result.realm) {
        throw new Error(result.error || "Could not create realm");
      }

      router.push(`/admin/realms/${result.realm.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create realm");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
          placeholder="Wellness"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Slug</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={fieldClass}
          placeholder="auto-from-name → /shop/slug"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Display order
        </span>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Tagline</span>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof REALM_STATUSES)[number])}
          className={`${fieldClass} bg-panteron-black`}
        >
          {REALM_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Kind</span>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as RealmKind)}
          className={`${fieldClass} bg-panteron-black`}
        >
          {REALM_KINDS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Accent</span>
        <select
          value={accent}
          onChange={(e) => setAccent(e.target.value as RealmAccent)}
          className={`${fieldClass} bg-panteron-black`}
        >
          {REALM_ACCENTS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="md:col-span-2 text-sm text-red-400">{error}</p>
      ) : null}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create realm"}
        </button>
        <p className="mt-3 text-xs text-zinc-500">
          Slug becomes the URL <code className="text-zinc-400">/shop/your-slug</code> and the tag for
          collections and raffles. Set status to active when ready for the public shop.
        </p>
      </div>
    </form>
  );
}
