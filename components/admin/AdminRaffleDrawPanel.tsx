"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminRaffleDrawPanel({
  raffleId,
  totalEntries,
  winnerNumber,
  winnerInitials,
  winnerDisplayName
}: {
  raffleId: string;
  totalEntries: number;
  winnerNumber: number | null;
  winnerInitials: string | null;
  winnerDisplayName: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    winningTicket: number;
    winner: { email: string; fullName: string | null; displayName: string };
  } | null>(null);

  const hasWinner = winnerNumber != null;

  async function runDraw() {
    if (
      !window.confirm(
        "Run the draw now? This picks a random winning ticket, saves the winner, and sets status to ended. This cannot be undone."
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/raffles/${raffleId}/draw`, {
        method: "POST"
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        winningTicket?: number;
        winner?: { email: string; fullName: string | null; displayName: string };
      };

      if (!response.ok || !payload.ok || payload.winningTicket == null || !payload.winner) {
        throw new Error(payload.error || "Draw failed");
      }

      setResult({ winningTicket: payload.winningTicket, winner: payload.winner });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draw failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 border border-white/10 bg-panteron-deep p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-panteron-violet">Draw</p>
      <h2 className="font-display mt-2 text-2xl text-white">Run winner selection</h2>
      <p className="mt-3 max-w-xl text-sm text-zinc-400">
        Each entry row counts as one or more tickets (1…{totalEntries}). A random ticket number is
        chosen and the matching member wins. The public sees initials and a first-name display only.
      </p>

      {hasWinner ? (
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-zinc-500">Winning ticket</dt>
            <dd className="text-lg text-white">#{winnerNumber}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Public winner</dt>
            <dd className="text-lg text-panteron-violet">
              {winnerDisplayName}{" "}
              {winnerInitials ? (
                <span className="text-zinc-400">({winnerInitials})</span>
              ) : null}
            </dd>
          </div>
        </dl>
      ) : null}

      {result ? (
        <div className="mt-6 border border-panteron-violet/40 bg-panteron-black p-4 text-sm">
          <p className="text-panteron-violet">Draw complete</p>
          <p className="mt-2 text-white">
            Ticket #{result.winningTicket} · {result.winner.displayName}
          </p>
          <p className="mt-1 text-zinc-400">
            Contact winner: {result.winner.fullName || result.winner.displayName} ·{" "}
            {result.winner.email}
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {!hasWinner ? (
        <button
          type="button"
          disabled={busy || totalEntries < 1}
          onClick={() => void runDraw()}
          className="mt-6 bg-panteron-purple px-5 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet disabled:opacity-50"
        >
          {busy ? "Drawing…" : "Run draw"}
        </button>
      ) : (
        <p className="mt-6 text-sm text-zinc-500">Winner locked in. Edit other fields above if needed.</p>
      )}

      {totalEntries < 1 && !hasWinner ? (
        <p className="mt-3 text-sm text-zinc-500">Add at least one entry before running the draw.</p>
      ) : null}
    </div>
  );
}
