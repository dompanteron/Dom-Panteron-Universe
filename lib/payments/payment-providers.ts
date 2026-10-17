import { isPayPalConfigured } from "@/lib/payments/paypal-config";
import { isSumUpConfigured } from "@/lib/payments/sumup-config";

export type PaymentProvider = "sumup" | "paypal";

export function getPaymentOptionsForUi() {
  const sumup = isSumUpConfigured();
  const paypal = isPayPalConfigured();
  return { sumup, paypal, any: sumup || paypal };
}

export function resolvePaymentProvider(requested?: string | null): PaymentProvider | null {
  const sumup = isSumUpConfigured();
  const paypal = isPayPalConfigured();

  if (requested === "sumup" && sumup) {
    return "sumup";
  }
  if (requested === "paypal" && paypal) {
    return "paypal";
  }

  if (!requested) {
    if (sumup) {
      return "sumup";
    }
    if (paypal) {
      return "paypal";
    }
  }

  return null;
}
