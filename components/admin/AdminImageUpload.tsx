"use client";

import { ChangeEvent, useState } from "react";

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminImageUpload({
  label,
  folder,
  value,
  onChange,
  hint
}: {
  label: string;
  folder: "collections" | "products";
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);

      const response = await fetch("/api/admin/storage/upload", {
        method: "POST",
        body
      });

      const payload = (await response.json()) as {
        ok: boolean;
        publicUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.publicUrl) {
        throw new Error(payload.error || "Upload failed");
      }

      onChange(payload.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="block md:col-span-2">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-24 w-24 shrink-0 border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-dashed border-white/20 text-xs text-zinc-500">
            No image
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={fieldClass}
            placeholder="URL or upload below"
          />
          <label className="inline-block cursor-pointer border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-white">
            {busy ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={busy}
              onChange={(e) => void onPickFile(e)}
            />
          </label>
          {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
