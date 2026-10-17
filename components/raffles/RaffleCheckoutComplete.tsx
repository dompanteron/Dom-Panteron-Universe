"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SUMUP_STORAGE_KEY = "dom_panteron_raffle_sumup_checkout_id";

export default function RaffleCheckoutComplete({
  checkoutId,
  raffleId
}: {
  checkoutId: string;
  raffleId: string;
}) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "failed">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const paypalToken = searchParams.get("token");

    if (paypalToken) {
      let cancelled = false;

      async function capturePayPal() {
        try {
          const response = await fetch("/api/raffles/checkouts/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checkoutId, paypalOrderId: paypalToken })
          });
          const payload = (await response.json()) as {
            ok: boolean;
            status?: string;
            error?: string;
          };

          if (cancelled) return;

          if (!response.ok || !payload.ok) {
            setStatus("failed");
            setMessage(payload.error || "PayPal capture failed.");
            return;
          }

          if (payload.status === "paid") {
            setStatus("paid");
            return;
          }

          if (payload.status === "failed") {
            setStatus("failed");
            setMessage(payload.error ?? "Draw may be full or entry limit reached.");
            return;
          }

          setStatus("pending");
          setMessage("PayPal is still processing. Refresh or check Account.");
        } catch {
          if (!cancelled) {
            setStatus("pending");
            setMessage("Could not reach the server.");
          }
        }
      }

      void capturePayPal();
      return () => {
        cancelled = true;
      };
    }

    const fromUrl =
      searchParams.get("checkout_id") ||
      searchParams.get("checkoutId") ||
      searchParams.get("id");
    const sumupId =
      fromUrl || (typeof window !== "undefined" ? sessionStorage.getItem(SUMUP_STORAGE_KEY) : null);

    if (!sumupId) {
      setStatus("pending");
      setMessage("Payment is processing. Check your account in a moment.");
      return;
    }

    const checkoutRef = sumupId;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/raffles/checkouts/check-status?checkoutId=${encodeURIComponent(checkoutRef)}`
        );
        const payload = (await response.json()) as {
          ok: boolean;
          status?: string;
          error?: string;
        };

        if (cancelled) return;

        if (!response.ok || !payload.ok) {
          setStatus("pending");
          setMessage(payload.error || "Could not verify payment yet.");
          return;
        }

        if (payload.status === "paid") {
          sessionStorage.removeItem(SUMUP_STORAGE_KEY);
          setStatus("paid");
          return;
        }

        if (payload.status === "failed") {
          setStatus("failed");
          setMessage(payload.error ?? "Draw may be full or entry limit reached.");
          return;
        }

        if (attempts < 12) {
          window.setTimeout(() => void poll(), 2500);
          return;
        }

        setStatus("pending");
        setMessage("Payment is still processing. Refresh or check Account.");
      } catch {
        if (!cancelled) {
          setStatus("pending");
          setMessage("Could not reach the server.");
        }
      }
    }

    void poll();

    return () => {
      cancelled = true;
    };
  }, [checkoutId, searchParams]);

  return (
    <div className="mx-auto max-w-lg border border-white/10 bg-panteron-deep p-8 text-center">
      {status === "loading" ? (
        <>
          <p className="font-display text-2xl text-white">Confirming payment…</p>
          <p className="mt-3 text-sm text-zinc-400">Stay on this page for a moment.</p>
        </>
      ) : null}

      {status === "paid" ? (
        <>
          <p className="font-display text-2xl text-panteron-violet">You&apos;re in the draw</p>
          <p className="mt-3 text-sm text-zinc-300">Payment received. Your entries are locked in.</p>
          <Link
            href={`/raffles/${raffleId}`}
            className="mt-8 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet"
          >
            Back to draw
          </Link>
        </>
      ) : null}

      {status === "failed" ? (
        <>
          <p className="font-display text-2xl text-red-400">Entry not completed</p>
          <p className="mt-3 text-sm text-zinc-400">{message}</p>
          <Link href={`/raffles/${raffleId}`} className="mt-8 inline-block text-sm text-panteron-violet">
            Try again →
          </Link>
        </>
      ) : null}

      {status === "pending" ? (
        <>
          <p className="font-display text-2xl text-white">Almost there</p>
          <p className="mt-3 text-sm text-zinc-400">{message}</p>
          <Link href="/account" className="mt-8 inline-block border border-white/25 px-6 py-3 text-sm">
            Account
          </Link>
        </>
      ) : null}

      <p className="mt-6 text-xs text-zinc-600">Checkout {checkoutId.slice(0, 8)}…</p>
    </div>
  );
}
