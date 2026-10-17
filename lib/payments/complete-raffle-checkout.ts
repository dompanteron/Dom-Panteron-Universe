import { revalidatePath } from "next/cache";
import { notifyAdminRaffleEntry } from "@/lib/email/send-admin-notification";
import { sendRaffleEntryEmail } from "@/lib/email/send-raffle-entry";
import { validateRaffleEntry } from "@/lib/raffles/validate-entry";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutRow = {
  id: string;
  raffle_id: string;
  member_id: string;
  quantity: number;
  total_price: number;
  status: string;
  members: { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
};

export async function completeRaffleCheckout(input: {
  checkoutId?: string | null;
  sumupCheckoutId?: string | null;
}) {
  const admin = createAdminClient();

  async function loadPending(match: { column: "id" | "sumup_checkout_id"; value: string }) {
    return admin
      .from("raffle_checkouts")
      .select("id, raffle_id, member_id, quantity, total_price, status, members(email, full_name)")
      .eq("status", "pending")
      .eq(match.column, match.value)
      .maybeSingle();
  }

  let checkoutRow: CheckoutRow | null = null;

  if (input.checkoutId) {
    const { data } = await loadPending({ column: "id", value: input.checkoutId });
    if (data) checkoutRow = data as CheckoutRow;
  }

  if (!checkoutRow && input.sumupCheckoutId) {
    const { data } = await loadPending({ column: "sumup_checkout_id", value: input.sumupCheckoutId });
    if (data) checkoutRow = data as CheckoutRow;
  }

  if (!checkoutRow) {
    return { completed: false as const, reason: "not_found_or_already_paid" as const };
  }

  const validated = await validateRaffleEntry({
    raffleId: checkoutRow.raffle_id,
    memberId: checkoutRow.member_id,
    quantity: checkoutRow.quantity
  });

  if (!validated.ok) {
    await admin
      .from("raffle_checkouts")
      .update({ status: "failed" })
      .eq("id", checkoutRow.id)
      .eq("status", "pending");
    return { completed: false as const, reason: "validation_failed" as const, error: validated.error };
  }

  const { raffle, existingEntries } = validated;

  const { error: insertError } = await admin.from("raffle_entries").insert({
    raffle_id: checkoutRow.raffle_id,
    member_id: checkoutRow.member_id,
    quantity: checkoutRow.quantity,
    total_paid: checkoutRow.total_price
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: updateRaffleError } = await admin
    .from("raffles")
    .update({ total_entries: raffle.total_entries + checkoutRow.quantity })
    .eq("id", checkoutRow.raffle_id);

  if (updateRaffleError) {
    throw new Error(updateRaffleError.message);
  }

  await admin
    .from("raffle_checkouts")
    .update({ status: "paid" })
    .eq("id", checkoutRow.id)
    .eq("status", "pending");

  const member = Array.isArray(checkoutRow.members)
    ? checkoutRow.members[0]
    : checkoutRow.members;
  const yourEntries = existingEntries + checkoutRow.quantity;

  revalidatePath("/raffles");
  revalidatePath(`/raffles/${checkoutRow.raffle_id}`);
  revalidatePath("/admin/raffles");
  revalidatePath("/admin");
  revalidatePath("/account");

  if (member?.email) {
    void sendRaffleEntryEmail({
      to: member.email,
      memberName: member.full_name,
      raffleTitle: raffle.title,
      drawDate: raffle.draw_date,
      quantity: checkoutRow.quantity,
      yourTotalEntries: yourEntries,
      raffleUrl: `${getSiteUrl()}/raffles/${checkoutRow.raffle_id}`,
      paid: true,
      totalPaid: Number(checkoutRow.total_price)
    });

    void notifyAdminRaffleEntry({
      memberName: member.full_name,
      memberEmail: member.email,
      raffleTitle: raffle.title,
      quantity: checkoutRow.quantity,
      yourTotalEntries: yourEntries,
      raffleId: checkoutRow.raffle_id
    });
  }

  return {
    completed: true as const,
    raffleId: checkoutRow.raffle_id,
    yourEntries
  };
}
