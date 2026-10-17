"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { formatProductPrice } from "@/lib/shop/format-price";

const fieldClass =
  "w-full border border-white/15 bg-panteron-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-panteron-violet";

export default function ProductPurchasePanel({
  productSlug,
  price,
  currency,
  compareAtPrice,
  sizes,
  signedIn,
  isSold,
  defaultName,
  defaultEmail
}: {
  productSlug: string;
  price: number;
  currency: string;
  compareAtPrice?: number | null;
  sizes: string[];
  signedIn: boolean;
  isSold: boolean;
  defaultName?: string | null;
  defaultEmail?: string | null;
}) {
  const [size, setSize] = useState(sizes[0] ?? "One size");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(defaultName ?? "");
  const [customerEmail, setCustomerEmail] = useState(defaultEmail ?? "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/shop/products/${productSlug}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          size,
          quantity,
          shipping_address: shippingAddress,
          shipping_city: shippingCity,
          shipping_postal_code: shippingPostalCode,
          shipping_country: shippingCountry
        })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        message?: string;
        checkoutUrl?: string;
        checkoutId?: string;
        paymentMode?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not place order");
      }

      if (payload.paymentMode === "sumup" && payload.checkoutUrl) {
        if (payload.checkoutId) {
          sessionStorage.setItem("dom_panteron_sumup_checkout_id", payload.checkoutId);
        }
        window.location.assign(payload.checkoutUrl);
        return;
      }

      setMessage(payload.message ?? "Order request received.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  if (isSold) {
    return (
      <div className="mt-8 border border-white/10 bg-panteron-deep p-6">
        <p className="font-display text-2xl text-panteron-violet">Sold out</p>
        <p className="mt-2 text-sm text-zinc-400">This piece has left the circle.</p>
        <Link
          href="/collections"
          className="mt-6 inline-block text-sm text-zinc-300 transition hover:text-panteron-violet"
        >
          Browse other collections →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-white/10 bg-panteron-deep p-6">
      <p className="text-3xl font-medium text-white">{formatProductPrice(price, currency)}</p>
      {compareAtPrice != null && compareAtPrice > price ? (
        <p className="mt-1 text-sm text-zinc-500 line-through">
          {formatProductPrice(compareAtPrice, currency)}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-zinc-400">
        Ready-made piece — choose size and checkout. Card payment via SumUp when configured;
        otherwise we confirm payment manually.
      </p>

      {!signedIn ? (
        <Link
          href="/join"
          className="mt-6 block w-full bg-panteron-purple px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-panteron-violet"
        >
          Sign in to order
        </Link>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {sizes.length > 0 ? (
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                Size
              </span>
              <select
                value={size}
                onChange={(event) => setSize(event.target.value)}
                className={fieldClass}
              >
                {sizes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
              Quantity
            </span>
            <select
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className={fieldClass}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
              Name
            </span>
            <input
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
              Email
            </span>
            <input
              required
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
              Address
            </span>
            <input
              required
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              className={fieldClass}
              placeholder="Street and number"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                City
              </span>
              <input
                required
                value={shippingCity}
                onChange={(event) => setShippingCity(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                Postal code
              </span>
              <input
                required
                value={shippingPostalCode}
                onChange={(event) => setShippingPostalCode(event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
              Country
            </span>
            <input
              required
              value={shippingCountry}
              onChange={(event) => setShippingCountry(event.target.value)}
              className={fieldClass}
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {message ? (
            <p className="text-sm text-panteron-violet">
              {message}{" "}
              <Link href="/account" className="text-white underline-offset-2 hover:underline">
                View on your account →
              </Link>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-panteron-purple px-5 py-3 text-sm font-medium text-white transition hover:bg-panteron-violet disabled:opacity-60"
          >
            {busy ? "Continuing…" : "Continue to checkout"}
          </button>
        </form>
      )}
    </div>
  );
}
