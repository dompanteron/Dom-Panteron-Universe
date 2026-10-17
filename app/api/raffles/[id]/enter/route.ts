import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sendRaffleEntryEmail } from "@/lib/email/send-raffle-entry";
import { ensureCurrentMember } from "@/lib/members";
import { sumMemberRaffleEntries } from "@/lib/raffle-entries";
import { getSiteUrl } from "@/lib/site-url";
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

  const body = (await request.json().catch(() => ({}))) as { quantity?: number | string };
  const quantity = Number(body.quantity ?? 1);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { ok: false, error: "Quantity must be at least 1." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: raffle, error: raffleError } = await admin
    .from("raffles")
    .select(
      "id, title, draw_date, status, ticket_price, max_entries, total_entries, ticket_limit_per_user"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (raffleError || !raffle) {
    return NextResponse.json({ ok: false, error: "Raffle not found." }, { status: 404 });
  }

  if (raffle.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "This draw is not open for entries." },
      { status: 400 }
    );
  }

  const spotsLeft = raffle.max_entries - raffle.total_entries;
  if (spotsLeft <= 0) {
    return NextResponse.json({ ok: false, error: "This draw is full." }, { status: 400 });
  }

  if (quantity > spotsLeft) {
    return NextResponse.json(
      { ok: false, error: `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left.` },
      { status: 400 }
    );
  }

  let existingEntries = 0;
  try {
    existingEntries = await sumMemberRaffleEntries(params.id, member.id);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Could not read your entries."
      },
      { status: 500 }
    );
  }

  if (raffle.ticket_limit_per_user != null) {
    const limit = Number(raffle.ticket_limit_per_user);
    if (existingEntries + quantity > limit) {
      const remaining = Math.max(0, limit - existingEntries);
      return NextResponse.json(
        {
          ok: false,
          error:
            remaining === 0
              ? "You reached your entry limit for this draw."
              : `You can add at most ${remaining} more entr${remaining === 1 ? "y" : "ies"}.`
        },
        { status: 400 }
      );
    }
  }

  const { error: insertError } = await admin.from("raffle_entries").insert({
    raffle_id: params.id,
    member_id: member.id,
    quantity,
    total_paid: 0
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

  return NextResponse.json({
    ok: true,
    yourEntries,
    totalEntries: raffle.total_entries + quantity
  });
}
