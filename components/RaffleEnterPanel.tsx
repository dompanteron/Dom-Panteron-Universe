"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import PaymentMethodPicker from "@/components/payments/PaymentMethodPicker";
import type { PaymentProvider } from "@/lib/payments/payment-providers";

const RAFFLE_CHECKOUT_STORAGE_KEY = "dom_panteron_raffle_sumup_checkout_id";

type RaffleEnterPanelProps = {
  raffleId: string;
  ticketPrice: number;
  spotsLeft: number;
  yourEntries: number;
  ticketLimitPerUser: number | null;
  isFull: boolean;
  signedIn: boolean;
  paymentsEnabled: boolean;
  paymentSumup: boolean;
  paymentPaypal: boolean;
};

export default function RaffleEnterPanel({
  raffleId,
  ticketPrice,
  spotsLeft,
  yourEntries,
  ticketLimitPerUser,
  isFull,
  signedIn,
  paymentsEnabled,
  paymentSumup,
  paymentPaypal
}: RaffleEnterPanelProps) {
  const router = useRouter();
  const defaultProvider = useMemo((): PaymentProvider => {
    if (paymentSumup) {
      return "sumup";
    }
    return "paypal";
  }, [paymentSumup]);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(defaultProvider);
  const maxQuantity = useMemo(() => {
    if (isFull || spotsLeft <= 0) {
      return 0;
    }

    let max = spotsLeft;
    if (ticketLimitPerUser != null) {
      max = Math.min(max, Math.max(0, ticketLimitPerUser - yourEntries));
    }
    return Math.min(max, 10);
  }, [isFull, spotsLeft, ticketLimitPerUser, yourEntries]);

  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [localYourEntries, setLocalYourEntries] = useState(yourEntries);

  const lineTotal = ticketPrice * quantity;

  async function enter() {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/raffles/${raffleId}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          paymentProvider: paymentsEnabled && lineTotal > 0 ? paymentProvider : undefined
        })
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        yourEntries?: number;
        checkoutUrl?: string;
        checkoutId?: string;
        paymentMode?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not enter draw");
      }

      if (
        (payload.paymentMode === "sumup" || payload.paymentMode === "paypal") &&
        payload.checkoutUrl
      ) {
        if (payload.checkoutId && payload.paymentMode === "sumup") {
          sessionStorage.setItem(RAFFLE_CHECKOUT_STORAGE_KEY, payload.checkoutId);
        }
        window.location.assign(payload.checkoutUrl);
        return;
      }

      if (payload.yourEntries != null) {
        setLocalYourEntries(payload.yourEntries);
      }

      setMessage(
        paymentsEnabled
          ? "You're in."
          : "You're in. Payment will be arranged separately if required."
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enter draw");
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return (
      <Link
        href="/join"
        className="mt-8 block w-full bg-panteron-purple px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-panteron-violet"
      >
        Join to enter
      </Link>
    );
  }

  return (
    <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
      <p className="text-sm text-zinc-300">
        You have <span className="text-panteron-violet">{localYourEntries}</span> entr
        {localYourEntries === 1 ? "y" : "ies"} in this draw.
      </p>

      {isFull ? (
        <p className="text-sm text-zinc-500">This draw is full.</p>
      ) : maxQuantity <= 0 ? (
        <p className="text-sm text-zinc-500">You reached your entry limit.</p>
      ) : (
        <>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
              Entries
            </span>
            <select
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-full border border-white/15 bg-panteron-black px-4 py-3 text-white outline-none focus:border-panteron-violet"
            >
              {Array.from({ length: maxQuantity }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-zinc-500">
            {ticketPrice.toFixed(2)} EUR per entry · Total {lineTotal.toFixed(2)} EUR
            {paymentsEnabled
              ? paymentSumup && paymentPaypal
                ? " · Card or PayPal"
                : paymentPaypal
                  ? " · PayPal"
                  : " · Card (SumUp)"
              : " · Manual payment for now"}
          </p>
          {paymentsEnabled && lineTotal > 0 ? (
            <PaymentMethodPicker
              sumup={paymentSumup}
              paypal={paymentPaypal}
              value={paymentProvider}
              onChange={setPaymentProvider}
            />
          ) : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {message ? <p className="text-sm text-panteron-violet">{message}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void enter()}
            className="w-full bg-panteron-purple px-5 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet disabled:opacity-60"
          >
            {busy
              ? "Continuing…"
              : paymentsEnabled && lineTotal > 0
                ? "Continue to payment"
                : "Enter draw"}
          </button>
        </>
      )}
    </div>
  );
}
