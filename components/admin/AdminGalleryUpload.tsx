"use client";

import { ChangeEvent, useState } from "react";

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

function appendLine(existing: string, line: string) {
  const trimmed = existing.trim();
  if (!trimmed) return line;
  if (trimmed.split("\n").includes(line)) return existing;
  return `${trimmed}\n${line}`;
}

export default function AdminGalleryUpload({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPickFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    event.target.value = "";
    if (!files?.length) return;

    setBusy(true);
    setError(null);

    let next = value;

    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", "products");

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

        next = appendLine(next, payload.publicUrl);
      }

      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="block md:col-span-2">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
        Gallery URLs (one per line)
      </span>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
      <label className="mt-3 inline-block cursor-pointer border border-white/20 px-4 py-2 text-sm text-zinc-300 transition hover:border-panteron-violet hover:text-white">
        {busy ? "Uploading…" : "Upload to gallery"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => void onPickFiles(e)}
        />
      </label>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
