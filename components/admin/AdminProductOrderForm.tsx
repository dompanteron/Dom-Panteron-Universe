"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_ORDER_STATUSES } from "@/lib/shop/product-orders";

const fieldClass =
  "w-full border border-white/15 bg-transparent px-4 py-3 text-white outline-none focus:border-panteron-violet";

export default function AdminProductOrderForm({
  orderId,
  status,
  paymentReference
}: {
  orderId: string;
  status: string;
  paymentReference: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [paymentRef, setPaymentRef] = useState(paymentReference ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/product-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: value,
          payment_reference: paymentRef
        })
      });
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not update order");
      }

      setMessage("Order updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-5">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Status
        </span>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${fieldClass} bg-panteron-black`}
        >
          {PRODUCT_ORDER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
          Payment reference
        </span>
        <input
          value={paymentRef}
          onChange={(e) => setPaymentRef(e.target.value)}
          className={fieldClass}
          placeholder="SumUp, bank transfer, PayPal ID…"
        />
        <p className="mt-2 text-xs text-zinc-500">
          SumUp payments auto-mark paid; use this field for bank transfer or manual notes.
        </p>
      </label>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-panteron-violet">{message}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-fit bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save order"}
      </button>
    </form>
  );
}
