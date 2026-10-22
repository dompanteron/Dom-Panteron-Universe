"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { toDatetimeLocal } from "@/lib/raffles";
export type AdminRealmOption = {
  id: string;
  slug: string;
  name: string;
};

export type CollectionFormValues = {
  id?: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  display_order: number;
  status: string;
  product_line: string | null;
  realm_id?: string | null;
  requires_age_confirm?: boolean;
  allow_multi_quantity?: boolean;
  max_quantity_per_order?: number;
  checkout_note?: string | null;
  reveal_at: string | null;
  show_items_during_countdown: boolean;
};

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

function initialRealmId(
  collection: CollectionFormValues | undefined,
  realms: AdminRealmOption[]
): string {
  if (collection?.realm_id) {
    return collection.realm_id;
  }
  if (collection?.product_line) {
    const match = realms.find((realm) => realm.slug === collection.product_line);
    if (match) {
      return match.id;
    }
  }
  return "";
}

export default function AdminCollectionForm({
  collection,
  realms = []
}: {
  collection?: CollectionFormValues;
  realms?: AdminRealmOption[];
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
  const [realmId, setRealmId] = useState(() => initialRealmId(collection, realms));
  const [requiresAgeConfirm, setRequiresAgeConfirm] = useState(
    collection?.requires_age_confirm ?? false
  );
  const [allowMultiQuantity, setAllowMultiQuantity] = useState(
    collection?.allow_multi_quantity !== false
  );
  const [maxQuantity, setMaxQuantity] = useState(
    String(collection?.max_quantity_per_order ?? 10)
  );
  const [checkoutNote, setCheckoutNote] = useState(collection?.checkout_note ?? "");
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

    const selectedRealm = realms.find((realm) => realm.id === realmId);
    const payload = {
      name,
      slug,
      subtitle,
      description,
      cover_image_url: coverUrl,
      display_order: displayOrder,
      status,
      realm_id: realmId || null,
      product_line: selectedRealm?.slug ?? null,
      requires_age_confirm: requiresAgeConfirm,
      allow_multi_quantity: allowMultiQuantity,
      max_quantity_per_order: maxQuantity,
      checkout_note: checkoutNote,
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
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Realm</span>
        <select
          value={realmId}
          onChange={(e) => setRealmId(e.target.value)}
          className={`${fieldClass} bg-panteron-black`}
        >
          <option value="">Not set</option>
          {realms.map((realm) => (
            <option key={realm.id} value={realm.id}>
              {realm.name} ({realm.slug})
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-zinc-500">
          Sets which /shop realm hub shows this drop. Checkout rules stay on the collection.
        </p>
      </label>
      <div className="md:col-span-2 border border-white/10 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Checkout rules</p>
        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={requiresAgeConfirm}
            onChange={(e) => setRequiresAgeConfirm(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-zinc-400">Require 18+ confirmation at checkout</span>
        </label>
        <label className="mt-3 flex items-center gap-3">
          <input
            type="checkbox"
            checked={allowMultiQuantity}
            onChange={(e) => setAllowMultiQuantity(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-zinc-400">Allow quantity greater than 1</span>
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
            Max quantity per order
          </span>
          <input
            type="number"
            min={1}
            max={99}
            value={maxQuantity}
            onChange={(e) => setMaxQuantity(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
            Checkout note (optional)
          </span>
          <textarea
            rows={2}
            value={checkoutNote}
            onChange={(e) => setCheckoutNote(e.target.value)}
            className={fieldClass}
            placeholder="Shown above the order form — shipping or legal copy."
          />
        </label>
      </div>
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
        <span className="text-sm text-zinc-400">
          Show product images during countdown (checkout stays locked until reveal time)
        </span>
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
