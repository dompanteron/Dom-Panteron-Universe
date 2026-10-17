"use client";

import type { PaymentProvider } from "@/lib/payments/payment-providers";

export default function PaymentMethodPicker({
  sumup,
  paypal,
  value,
  onChange
}: {
  sumup: boolean;
  paypal: boolean;
  value: PaymentProvider;
  onChange: (provider: PaymentProvider) => void;
}) {
  if (!sumup || !paypal) {
    return null;
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
        Pay with
      </legend>
      <label className="flex cursor-pointer items-center gap-3 border border-white/15 px-4 py-3 has-[:checked]:border-panteron-violet">
        <input
          type="radio"
          name="paymentProvider"
          checked={value === "sumup"}
          onChange={() => onChange("sumup")}
          className="accent-panteron-violet"
        />
        <span className="text-sm text-white">Card (SumUp)</span>
      </label>
      <label className="flex cursor-pointer items-center gap-3 border border-white/15 px-4 py-3 has-[:checked]:border-panteron-violet">
        <input
          type="radio"
          name="paymentProvider"
          checked={value === "paypal"}
          onChange={() => onChange("paypal")}
          className="accent-panteron-violet"
        />
        <span className="text-sm text-white">PayPal</span>
      </label>
    </fieldset>
  );
}
