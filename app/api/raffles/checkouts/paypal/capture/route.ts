import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { capturePayPalOrder } from "@/lib/payments/paypal-api";
import { isPayPalConfigured } from "@/lib/payments/paypal-config";
import { completeRaffleCheckout } from "@/lib/payments/complete-raffle-checkout";
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
    checkoutId?: string;
    paypalOrderId?: string;
  };

  const checkoutId = body.checkoutId?.trim();
  const paypalOrderId = body.paypalOrderId?.trim();

  if (!checkoutId || !paypalOrderId) {
    return NextResponse.json(
      { ok: false, error: "checkoutId and paypalOrderId required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("raffle_checkouts")
    .select("id, member_id, status, paypal_order_id, raffle_id")
    .eq("id", checkoutId)
    .maybeSingle();

  if (!row || row.member_id !== member.id) {
    return NextResponse.json({ ok: false, error: "Checkout not found" }, { status: 404 });
  }

  if (row.status === "paid") {
    return NextResponse.json({
      ok: true,
      status: "paid",
      raffleId: row.raffle_id
    });
  }

  if (row.paypal_order_id && row.paypal_order_id !== paypalOrderId) {
    return NextResponse.json({ ok: false, error: "PayPal order mismatch" }, { status: 400 });
  }

  try {
    const captured = await capturePayPalOrder(paypalOrderId);
    const status = (captured.status || "").toUpperCase();

    if (status !== "COMPLETED") {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    if (!row.paypal_order_id) {
      await admin
        .from("raffle_checkouts")
        .update({ paypal_order_id: paypalOrderId })
        .eq("id", checkoutId)
        .eq("status", "pending");
    }

    const result = await completeRaffleCheckout({
      checkoutId,
      paypalOrderId
    });

    if (!result.completed) {
      return NextResponse.json({
        ok: true,
        status: "failed",
        error: "error" in result ? result.error : "Could not complete entry"
      });
    }

    return NextResponse.json({
      ok: true,
      status: "paid",
      raffleId: result.raffleId,
      yourEntries: result.yourEntries
    });
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
