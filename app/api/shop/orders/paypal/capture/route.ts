import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { capturePayPalOrder } from "@/lib/payments/paypal-api";
import { isPayPalConfigured } from "@/lib/payments/paypal-config";
import { completeProductOrderPayment } from "@/lib/payments/complete-product-order-payment";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ ok: false, error: "PayPal not configured" }, { status: 500 });
  }

  const { user, member } = await ensureCurrentMember();
  if (!user || !member) {
    return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    orderId?: string;
    paypalOrderId?: string;
  };

  const orderId = body.orderId?.trim();
  const paypalOrderId = body.paypalOrderId?.trim();

  if (!orderId || !paypalOrderId) {
    return NextResponse.json({ ok: false, error: "orderId and paypalOrderId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: orderRow } = await admin
    .from("product_orders")
    .select("id, member_id, status, paypal_order_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!orderRow || orderRow.member_id !== member.id) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  if (orderRow.status === "paid") {
    return NextResponse.json({ ok: true, status: "paid", orderId: orderRow.id });
  }

  if (orderRow.paypal_order_id && orderRow.paypal_order_id !== paypalOrderId) {
    return NextResponse.json({ ok: false, error: "PayPal order mismatch" }, { status: 400 });
  }

  try {
    const captured = await capturePayPalOrder(paypalOrderId);
    const status = (captured.status || "").toUpperCase();

    if (status !== "COMPLETED") {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    if (!orderRow.paypal_order_id) {
      await admin
        .from("product_orders")
        .update({ paypal_order_id: paypalOrderId })
        .eq("id", orderId)
        .eq("status", "pending");
    }

    const result = await completeProductOrderPayment({
      orderId,
      checkoutId: paypalOrderId,
      paymentReference: `paypal:${paypalOrderId}`
    });

    if (!result.completed) {
      return NextResponse.json({ ok: false, error: "Could not mark order paid" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "paid", orderId: result.orderId });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "PayPal capture failed"
      },
      { status: 500 }
    );
  }
}
