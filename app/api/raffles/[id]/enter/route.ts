import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { notifyAdminRaffleEntry } from "@/lib/email/send-admin-notification";
import { sendRaffleEntryEmail } from "@/lib/email/send-raffle-entry";
import { ensureCurrentMember } from "@/lib/members";
import { createPayPalCheckoutOrder } from "@/lib/payments/paypal-api";
import { resolvePaymentProvider } from "@/lib/payments/payment-providers";
import { createSumUpHostedCheckout } from "@/lib/payments/sumup-api";
import { getSumUpCredentials } from "@/lib/payments/sumup-config";
import { getSiteUrl } from "@/lib/site-url";
import { validateRaffleEntry } from "@/lib/raffles/validate-entry";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, member, error: memberError } = await ensureCurrentMember();

  if (!user || !member) {
    return NextResponse.json(
      { ok: false, error: memberError || "Sign in to enter." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    quantity?: number | string;
    paymentProvider?: string;
  };
  const quantity = Number(body.quantity ?? 1);

  const validated = await validateRaffleEntry({
    raffleId: params.id,
    memberId: member.id,
    quantity
  });

  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const { raffle, existingEntries } = validated;
  const unitPrice = Number(raffle.ticket_price);
  const totalPrice = unitPrice * quantity;
  const admin = createAdminClient();
  const provider = totalPrice > 0 ? resolvePaymentProvider(body.paymentProvider) : null;

  if (provider) {
    const { data: checkoutRow, error: checkoutInsertError } = await admin
      .from("raffle_checkouts")
      .insert({
        raffle_id: params.id,
        member_id: member.id,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        currency: "EUR",
        status: "pending"
      })
      .select("id")
      .single();

    if (checkoutInsertError || !checkoutRow) {
      return NextResponse.json(
        { ok: false, error: checkoutInsertError?.message || "Could not start checkout." },
        { status: 500 }
      );
    }

    const siteUrl = getSiteUrl();
    const description = `${raffle.title} · ${quantity} entr${quantity === 1 ? "y" : "ies"}`;
    const returnPath = `${siteUrl}/raffles/checkout/${checkoutRow.id}/complete?payment_return=1`;

    try {
      if (provider === "sumup") {
        const sumupCreds = getSumUpCredentials();
        if (!sumupCreds) {
          throw new Error("SumUp not configured.");
        }

        const sumup = await createSumUpHostedCheckout({
          apiKey: sumupCreds.apiKey,
          merchantCode: sumupCreds.merchantCode,
          amount: totalPrice,
          currency: "EUR",
          checkoutReference: checkoutRow.id,
          description,
          redirectUrl: returnPath,
          returnUrl: `${siteUrl}/api/webhooks/sumup`
        });

        await admin
          .from("raffle_checkouts")
          .update({ sumup_checkout_id: sumup.id })
          .eq("id", checkoutRow.id);

        return NextResponse.json({
          ok: true,
          paymentMode: "sumup",
          checkoutId: sumup.id,
          checkoutUrl: sumup.hosted_checkout_url,
          message: "Redirecting to payment…"
        });
      }

      const paypal = await createPayPalCheckoutOrder({
        referenceId: checkoutRow.id,
        amount: totalPrice,
        currency: "EUR",
        description,
        returnUrl: returnPath,
        cancelUrl: `${siteUrl}/raffles/${params.id}`
      });

      await admin
        .from("raffle_checkouts")
        .update({ paypal_order_id: paypal.orderId })
        .eq("id", checkoutRow.id);

      return NextResponse.json({
        ok: true,
        paymentMode: "paypal",
        checkoutId: paypal.orderId,
        raffleCheckoutId: checkoutRow.id,
        checkoutUrl: paypal.approveUrl,
        message: "Redirecting to PayPal…"
      });
    } catch (error) {
      await admin.from("raffle_checkouts").delete().eq("id", checkoutRow.id);
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Payment setup failed."
        },
        { status: 500 }
      );
    }
  }

  const { error: insertError } = await admin.from("raffle_entries").insert({
    raffle_id: params.id,
    member_id: member.id,
    quantity,
    total_paid: totalPrice
  });

  if (insertError) {
    return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("raffles")
    .update({ total_entries: raffle.total_entries + quantity })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: "Entry saved but count update failed. Contact support." },
      { status: 500 }
    );
  }

  const yourEntries = existingEntries + quantity;

  revalidatePath("/raffles");
  revalidatePath(`/raffles/${params.id}`);
  revalidatePath("/admin/raffles");
  revalidatePath("/admin");
  revalidatePath("/account");

  void sendRaffleEntryEmail({
    to: member.email,
    memberName: member.full_name,
    raffleTitle: raffle.title,
    drawDate: raffle.draw_date,
    quantity,
    yourTotalEntries: yourEntries,
    raffleUrl: `${getSiteUrl()}/raffles/${params.id}`
  });

  void notifyAdminRaffleEntry({
    memberName: member.full_name,
    memberEmail: member.email,
    raffleTitle: raffle.title,
    quantity,
    yourTotalEntries: yourEntries,
    raffleId: params.id
  });

  return NextResponse.json({
    ok: true,
    paymentMode: "manual",
    yourEntries,
    totalEntries: raffle.total_entries + quantity
  });
}
