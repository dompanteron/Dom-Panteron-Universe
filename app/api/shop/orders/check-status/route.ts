import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { completeProductOrderPayment } from "@/lib/payments/complete-product-order-payment";
import { getSumUpCredentials } from "@/lib/payments/sumup-config";
import { fetchSumUpCheckout } from "@/lib/payments/sumup-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutId = searchParams.get("checkoutId");

  if (!checkoutId) {
    return NextResponse.json({ ok: false, error: "checkoutId required" }, { status: 400 });
  }

  const creds = getSumUpCredentials();
  if (!creds) {
    return NextResponse.json({ ok: false, error: "Payments not configured" }, { status: 500 });
  }

  const { user, member } = await ensureCurrentMember();
  if (!user || !member) {
    return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: orderRow } = await admin
    .from("product_orders")
    .select("id, member_id, status")
    .eq("sumup_checkout_id", checkoutId)
    .maybeSingle();

  if (!orderRow || orderRow.member_id !== member.id) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  if (orderRow.status === "paid") {
    return NextResponse.json({ ok: true, status: "paid", orderId: orderRow.id });
  }

  try {
    const checkout = await fetchSumUpCheckout(creds.apiKey, checkoutId);
    const status = (checkout.status || "").toUpperCase();

    if (status === "PAID") {
      const result = await completeProductOrderPayment({
        checkoutId,
        paymentReference: checkoutId
      });
      return NextResponse.json({
        ok: true,
        status: "paid",
        orderId: result.orderId ?? orderRow.id
      });
    }

    if (status === "FAILED") {
      return NextResponse.json({ ok: true, status: "failed" });
    }

    return NextResponse.json({ ok: true, status: "pending" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Could not check payment"
      },
      { status: 500 }
    );
  }
}
