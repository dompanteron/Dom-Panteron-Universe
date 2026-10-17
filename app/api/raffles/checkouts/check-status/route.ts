import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { completeRaffleCheckout } from "@/lib/payments/complete-raffle-checkout";
import { fetchSumUpCheckout } from "@/lib/payments/sumup-api";
import { getSumUpCredentials } from "@/lib/payments/sumup-config";
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
  const { data: row } = await admin
    .from("raffle_checkouts")
    .select("id, member_id, status, raffle_id")
    .eq("sumup_checkout_id", checkoutId)
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

  try {
    const checkout = await fetchSumUpCheckout(creds.apiKey, checkoutId);
    const status = (checkout.status || "").toUpperCase();

    if (status === "PAID") {
      const result = await completeRaffleCheckout({
        checkoutId: row.id,
        sumupCheckoutId: checkoutId
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
