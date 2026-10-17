"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dom_panteron_sumup_checkout_id";

export default function ShopOrderComplete({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "failed">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl =
      searchParams.get("checkout_id") ||
      searchParams.get("checkoutId") ||
      searchParams.get("id");
    const checkoutId =
      fromUrl || (typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null);

    if (!checkoutId) {
      setStatus("pending");
      setMessage("Payment is processing. Check your account in a moment.");
      return;
    }

    const resolvedCheckoutId = checkoutId;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/shop/orders/check-status?checkoutId=${encodeURIComponent(resolvedCheckoutId)}`
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
          sessionStorage.removeItem(STORAGE_KEY);
          setStatus("paid");
          return;
        }

        if (payload.status === "failed") {
          setStatus("failed");
          return;
        }

        if (attempts < 12) {
          window.setTimeout(() => void poll(), 2500);
          return;
        }

        setStatus("pending");
        setMessage("Payment is still processing. Refresh this page or check Account.");
      } catch {
        if (!cancelled) {
          setStatus("pending");
          setMessage("Could not reach the server. Try again shortly.");
        }
      }
    }

    void poll();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

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
          <p className="font-display text-2xl text-panteron-violet">Payment received</p>
          <p className="mt-3 text-sm text-zinc-300">Your order is in the universe. We will follow up on shipping.</p>
          <Link
            href="/account"
            className="mt-8 inline-block bg-panteron-purple px-6 py-3 text-sm font-medium text-white hover:bg-panteron-violet"
          >
            View account
          </Link>
        </>
      ) : null}

      {status === "failed" ? (
        <>
          <p className="font-display text-2xl text-red-400">Payment failed</p>
          <p className="mt-3 text-sm text-zinc-400">Try again from the product page or use another card.</p>
          <Link href="/collections" className="mt-8 inline-block text-sm text-panteron-violet hover:text-white">
            Back to collections →
          </Link>
        </>
      ) : null}

      {status === "pending" ? (
        <>
          <p className="font-display text-2xl text-white">Almost there</p>
          <p className="mt-3 text-sm text-zinc-400">{message}</p>
          <Link
            href="/account"
            className="mt-8 inline-block border border-white/25 px-6 py-3 text-sm text-white hover:border-panteron-violet"
          >
            Account
          </Link>
        </>
      ) : null}

      <p className="mt-6 text-xs text-zinc-600">Order ref {orderId.slice(0, 8)}…</p>
    </div>
  );
}
