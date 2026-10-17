import { NextResponse } from "next/server";
import { completeProductOrderPayment } from "@/lib/payments/complete-product-order-payment";
import { completeRaffleCheckout } from "@/lib/payments/complete-raffle-checkout";
import { getSumUpCredentials } from "@/lib/payments/sumup-config";
import { fetchSumUpCheckout } from "@/lib/payments/sumup-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      event_type?: string;
      eventType?: string;
      id?: string;
      payload?: { checkout_id?: string; checkoutId?: string };
    };

    const eventType = body.event_type || body.eventType;
    const checkoutId = body.id ?? body.payload?.checkout_id ?? body.payload?.checkoutId;

    if (
      (eventType !== "checkout.status.updated" && eventType !== "CHECKOUT_STATUS_CHANGED") ||
      !checkoutId
    ) {
      return NextResponse.json({ received: true });
    }

    const creds = getSumUpCredentials();
    if (!creds) {
      return NextResponse.json({ received: true });
    }

    const checkout = await fetchSumUpCheckout(creds.apiKey, checkoutId);
    const status = (checkout.status || "").toUpperCase();

    if (status !== "PAID") {
      return NextResponse.json({ received: true });
    }

    const reference = checkout.checkout_reference ?? null;

    const productResult = await completeProductOrderPayment({
      orderId: reference,
      checkoutId,
      paymentReference: checkoutId
    });

    if (!productResult.completed) {
      await completeRaffleCheckout({
        checkoutId: reference,
        sumupCheckoutId: checkoutId
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("SumUp webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
