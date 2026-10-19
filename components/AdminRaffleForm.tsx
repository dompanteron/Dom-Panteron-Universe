"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toDatetimeLocal } from "@/lib/raffles";
import { PRODUCT_LINE_VALUES } from "@/lib/shop/product-lines";

export type RaffleFormValues = {
  id?: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  ticket_price: number | string;
  max_entries: number | string;
  ticket_limit_per_user?: number | string | null;
  draw_date: string;
  status: string;
  product_line?: string | null;
};

export default function AdminRaffleForm({ raffle }: { raffle?: RaffleFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(raffle?.id);
  const [title, setTitle] = useState(raffle?.title ?? "");
  const [subtitle, setSubtitle] = useState(raffle?.subtitle ?? "");
  const [description, setDescription] = useState(raffle?.description ?? "");
  const [ticketPrice, setTicketPrice] = useState(String(raffle?.ticket_price ?? "5"));
  const [maxEntries, setMaxEntries] = useState(String(raffle?.max_entries ?? "100"));
  const [ticketLimitPerUser, setTicketLimitPerUser] = useState(
    raffle?.ticket_limit_per_user != null ? String(raffle.ticket_limit_per_user) : ""
  );
  const [drawDate, setDrawDate] = useState(
    raffle?.draw_date ? toDatetimeLocal(raffle.draw_date) : ""
  );
  const [status, setStatus] = useState(raffle?.status ?? "draft");
  const [productLine, setProductLine] = useState(
    raffle?.product_line ? raffle.product_line : "universe"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        isEdit ? `/api/admin/raffles/${raffle?.id}` : "/api/admin/raffles",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subtitle,
            description,
            ticket_price: ticketPrice,
            max_entries: maxEntries,
            ticket_limit_per_user: ticketLimitPerUser.trim() ? ticketLimitPerUser : null,
            draw_date: drawDate,
            status,
            product_line: productLine === "universe" ? null : productLine
          })
        }
      );

      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || (isEdit ? "Could not update raffle" : "Could not create raffle"));
      }

      if (!isEdit) {
        setTitle("");
        setSubtitle("");
        setDescription("");
        setTicketPrice("5");
        setMaxEntries("100");
        setTicketLimitPerUser("");
        setDrawDate("");
        setStatus("draft");
        setProductLine("universe");
      }

      setMessage(isEdit ? "Raffle saved." : "Raffle created.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save raffle");
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-panteron-violet";

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Title
        </span>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={fieldClass}
          placeholder="Jungle Circle Draw"
        />
      </label>

      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Subtitle
        </span>
        <input
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          className={fieldClass}
          placeholder="Limited member drop"
        />
      </label>

      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Description
        </span>
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={fieldClass}
          placeholder="What the winner receives"
        />
      </label>

      <label className="block md:col-span-2">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Product line
        </span>
        <select
          value={productLine}
          onChange={(event) => setProductLine(event.target.value)}
          className={`${fieldClass} bg-panteron-black`}
        >
          <option value="universe">Universe-wide (all raffles page)</option>
          {PRODUCT_LINE_VALUES.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>
        <span className="mt-2 block text-xs text-zinc-500">
          Champagne / HOME / water draws also appear on that line&apos;s shop page.
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Ticket price
        </span>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={ticketPrice}
          onChange={(event) => setTicketPrice(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Max entries
        </span>
        <input
          required
          type="number"
          min="1"
          step="1"
          value={maxEntries}
          onChange={(event) => setMaxEntries(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Max entries per member
        </span>
        <input
          type="number"
          min="1"
          step="1"
          value={ticketLimitPerUser}
          onChange={(event) => setTicketLimitPerUser(event.target.value)}
          className={fieldClass}
          placeholder="No limit"
        />
        <span className="mt-2 block text-xs text-zinc-500">
          Optional cap on how many tickets one member can hold in this draw.
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Draw date
        </span>
        <input
          required
          type="datetime-local"
          value={drawDate}
          onChange={(event) => setDrawDate(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Status
        </span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={`${fieldClass} bg-panteron-black`}
        >
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="ended">ended</option>
        </select>
      </label>

      <div className="md:col-span-2">
        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mb-4 text-sm text-panteron-violet">{message}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="bg-panteron-purple px-6 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet disabled:opacity-60"
        >
          {busy ? "Saving…" : isEdit ? "Save raffle" : "Create raffle"}
        </button>
      </div>
    </form>
  );
}
