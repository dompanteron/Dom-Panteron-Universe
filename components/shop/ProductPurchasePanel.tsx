"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import PaymentMethodPicker from "@/components/payments/PaymentMethodPicker";
import type { PaymentProvider } from "@/lib/payments/payment-providers";
import {
  collectionCheckoutRules,
  effectiveMaxQuantity,
  quantityOptions,
  type CollectionCheckoutRules
} from "@/lib/shop/checkout-rules";
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
  defaultEmail,
  paymentSumup,
  paymentPaypal,
  purchaseLocked,
  checkoutRules: checkoutRulesInput,
  stockQuantity,
  browseMoreHref = "/shop"
}: {
  productSlug: string;
  price: number;
  currency: string;
  compareAtPrice?: number | null;
  sizes: string[];
  signedIn: boolean;
  isSold: boolean;
  purchaseLocked?: boolean;
  checkoutRules?: Partial<CollectionCheckoutRules> | null;
  stockQuantity?: number | null;
  defaultName?: string | null;
  defaultEmail?: string | null;
  paymentSumup: boolean;
  paymentPaypal: boolean;
  browseMoreHref?: string;
}) {
  const checkoutRules = collectionCheckoutRules(checkoutRulesInput);
  const maxQuantity = effectiveMaxQuantity(checkoutRules, stockQuantity);
  const qtyChoices = quantityOptions(maxQuantity);
  const defaultProvider = useMemo((): PaymentProvider => {
    if (paymentSumup) {
      return "sumup";
    }
    return "paypal";
  }, [paymentSumup]);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(defaultProvider);
  const paymentsOnline = paymentSumup || paymentPaypal;
  const [size, setSize] = useState(sizes[0] ?? "One size");
  const [quantity, setQuantity] = useState(1);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
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
          shipping_country: shippingCountry,
          paymentProvider: paymentsOnline ? paymentProvider : undefined,
          age_confirmed: checkoutRules.requires_age_confirm ? ageConfirmed : undefined
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

      if (
        (payload.paymentMode === "sumup" || payload.paymentMode === "paypal") &&
        payload.checkoutUrl
      ) {
        if (payload.checkoutId && payload.paymentMode === "sumup") {
          sessionStorage.setItem("dom_panteron_sumup_checkout_id", payload.checkoutId);
        }
        if (payload.checkoutId && payload.paymentMode === "paypal") {
          sessionStorage.setItem("dom_panteron_paypal_order_id", payload.checkoutId);
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

  if (purchaseLocked) {
    return (
      <div className="mt-8 border border-white/10 bg-panteron-deep p-6">
        <p className="font-display text-2xl text-panteron-violet">Drops soon</p>
        <p className="mt-2 text-sm text-zinc-400">
          This collection is still on countdown. Checkout opens when the drop goes live.
        </p>
        <Link
          href={browseMoreHref}
          className="mt-6 inline-block text-sm text-zinc-300 transition hover:text-panteron-violet"
        >
          Back to shop →
        </Link>
      </div>
    );
  }

  if (isSold) {
    return (
      <div className="mt-8 border border-white/10 bg-panteron-deep p-6">
        <p className="font-display text-2xl text-panteron-violet">Sold out</p>
        <p className="mt-2 text-sm text-zinc-400">This piece has left the circle.</p>
        <Link
          href={browseMoreHref}
          className="mt-6 inline-block text-sm text-zinc-300 transition hover:text-panteron-violet"
        >
          Browse the shop →
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
        Ready-made piece — choose size and checkout.
        {paymentsOnline
          ? " Pay with card (SumUp) and/or PayPal when configured."
          : " We confirm payment manually for now."}
      </p>
      {stockQuantity != null ? (
        <p className="mt-2 text-sm text-zinc-500">
          {stockQuantity > 0 ? `${stockQuantity} in stock` : "Out of stock"}
        </p>
      ) : null}
      {checkoutRules.checkout_note ? (
        <p className="mt-4 border border-white/10 bg-panteron-black/40 p-3 text-sm text-zinc-400">
          {checkoutRules.checkout_note}
        </p>
      ) : null}

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

          {qtyChoices.length > 1 ? (
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                Quantity
              </span>
              <select
                value={Math.min(quantity, maxQuantity)}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className={fieldClass}
              >
                {qtyChoices.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {checkoutRules.requires_age_confirm ? (
            <label className="flex items-start gap-3 border border-white/10 p-3">
              <input
                type="checkbox"
                required
                checked={ageConfirmed}
                onChange={(event) => setAgeConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span className="text-sm text-zinc-300">
                I confirm I am 18 years or older. Alcohol is sold only to adults; you may be asked
                to verify age on delivery where required by law.
              </span>
            </label>
          ) : null}

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

          {paymentsOnline ? (
            <PaymentMethodPicker
              sumup={paymentSumup}
              paypal={paymentPaypal}
              value={paymentProvider}
              onChange={setPaymentProvider}
            />
          ) : null}

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
