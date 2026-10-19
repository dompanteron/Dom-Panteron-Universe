import { NextResponse } from "next/server";
import { completePayPalPaymentFromOrderId, completePayPalPaymentFromReference } from "@/lib/payments/complete-paypal-payment";
import { isPayPalConfigured } from "@/lib/payments/paypal-config";
import { parsePayPalWebhookEvent, verifyPayPalWebhookSignature } from "@/lib/payments/paypal-webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ received: true });
  }

  const rawBody = await request.text();
  let body: unknown;
  try {
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const verified = await verifyPayPalWebhookSignature(request, body);
    if (!verified) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }

    const parsed = parsePayPalWebhookEvent(body);
    if (!parsed) {
      return NextResponse.json({ received: true });
    }

    if (parsed.eventType === "CHECKOUT.ORDER.APPROVED" && parsed.paypalOrderId) {
      await completePayPalPaymentFromOrderId(parsed.paypalOrderId);
      return NextResponse.json({ received: true });
    }

    if (parsed.eventType === "PAYMENT.CAPTURE.COMPLETED" && parsed.referenceId) {
      await completePayPalPaymentFromReference({
        referenceId: parsed.referenceId,
        paypalOrderId: parsed.paypalOrderId
      });
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
