import { completeProductOrderPayment } from "@/lib/payments/complete-product-order-payment";
import { completeRaffleCheckout } from "@/lib/payments/complete-raffle-checkout";
import { capturePayPalOrder, fetchPayPalOrder } from "@/lib/payments/paypal-api";

function referenceFromOrder(order: Awaited<ReturnType<typeof fetchPayPalOrder>>) {
  const unit = order.purchase_units?.[0];
  return unit?.custom_id?.trim() || unit?.reference_id?.trim() || null;
}

export async function completePayPalPaymentFromOrderId(paypalOrderId: string) {
  let order = await fetchPayPalOrder(paypalOrderId);
  let status = (order.status || "").toUpperCase();

  if (status === "APPROVED") {
    order = await capturePayPalOrder(paypalOrderId);
    status = (order.status || "").toUpperCase();
  }

  if (status !== "COMPLETED") {
    return { completed: false as const, reason: "not_completed" as const, status };
  }

  const referenceId = referenceFromOrder(order);
  if (!referenceId) {
    return { completed: false as const, reason: "missing_reference" as const };
  }

  const productResult = await completeProductOrderPayment({
    orderId: referenceId,
    checkoutId: paypalOrderId,
    paymentReference: `paypal:${paypalOrderId}`
  });

  if (!productResult.completed) {
    const raffleResult = await completeRaffleCheckout({
      checkoutId: referenceId,
      paypalOrderId
    });
    if (!raffleResult.completed) {
      return {
        completed: false as const,
        reason: "not_matched" as const,
        referenceId
      };
    }
  }

  return { completed: true as const, referenceId, orderId: paypalOrderId };
}

export async function completePayPalPaymentFromReference(input: {
  referenceId: string;
  paypalOrderId?: string | null;
}) {
  const productResult = await completeProductOrderPayment({
    orderId: input.referenceId,
    checkoutId: input.paypalOrderId ?? undefined,
    paymentReference: input.paypalOrderId ? `paypal:${input.paypalOrderId}` : "paypal:capture"
  });

  if (productResult.completed) {
    return { completed: true as const, kind: "product" as const };
  }

  const raffleResult = await completeRaffleCheckout({
    checkoutId: input.referenceId,
    paypalOrderId: input.paypalOrderId ?? undefined
  });

  if (raffleResult.completed) {
    return { completed: true as const, kind: "raffle" as const };
  }

  return { completed: false as const, reason: "not_matched" as const };
}
