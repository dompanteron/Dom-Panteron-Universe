"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = ["user", "admin", "pr"] as const;

export default function MemberRoleSelect({
  memberId,
  role,
  locked
}: {
  memberId: string;
  role: string;
  locked?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(nextRole: string) {
    const previous = value;
    setValue(nextRole);
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/members/${memberId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole })
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not update role");
      }

      router.refresh();
    } catch (err) {
      setValue(previous);
      setError(err instanceof Error ? err.message : "Could not update role");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <select
        value={value}
        disabled={busy || locked}
        onChange={(event) => void onChange(event.target.value)}
        className={`border border-white/15 bg-panteron-black px-2 py-1.5 text-sm outline-none focus:border-panteron-violet disabled:opacity-60 ${
          value === "admin" ? "text-panteron-violet" : "text-zinc-300"
        }`}
      >
        {ROLES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {locked ? (
        <span className="text-[10px] text-zinc-500">Last admin</span>
      ) : null}
      {error ? <span className="text-[10px] text-red-400">{error}</span> : null}
    </span>
  );
}
