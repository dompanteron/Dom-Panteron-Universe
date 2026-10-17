import { sumMemberRaffleEntries } from "@/lib/raffle-entries";
import { createAdminClient } from "@/lib/supabase/admin";

export type RaffleForEntry = {
  id: string;
  title: string;
  draw_date: string;
  status: string;
  ticket_price: number;
  max_entries: number;
  total_entries: number;
  ticket_limit_per_user: number | null;
};

export async function validateRaffleEntry(input: {
  raffleId: string;
  memberId: string;
  quantity: number;
}) {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return { ok: false as const, error: "Quantity must be at least 1." };
  }

  const admin = createAdminClient();
  const { data: raffle, error: raffleError } = await admin
    .from("raffles")
    .select(
      "id, title, draw_date, status, ticket_price, max_entries, total_entries, ticket_limit_per_user"
    )
    .eq("id", input.raffleId)
    .maybeSingle();

  if (raffleError || !raffle) {
    return { ok: false as const, error: "Raffle not found." };
  }

  const row = raffle as RaffleForEntry;

  if (row.status !== "active") {
    return { ok: false as const, error: "This draw is not open for entries." };
  }

  const spotsLeft = row.max_entries - row.total_entries;
  if (spotsLeft <= 0) {
    return { ok: false as const, error: "This draw is full." };
  }

  if (input.quantity > spotsLeft) {
    return {
      ok: false as const,
      error: `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left.`
    };
  }

  let existingEntries = 0;
  try {
    existingEntries = await sumMemberRaffleEntries(input.raffleId, input.memberId);
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not read your entries."
    };
  }

  if (row.ticket_limit_per_user != null) {
    const limit = Number(row.ticket_limit_per_user);
    if (existingEntries + input.quantity > limit) {
      const remaining = Math.max(0, limit - existingEntries);
      return {
        ok: false as const,
        error:
          remaining === 0
            ? "You reached your entry limit for this draw."
            : `You can add at most ${remaining} more entr${remaining === 1 ? "y" : "ies"}.`
      };
    }
  }

  return {
    ok: true as const,
    raffle: row,
    existingEntries,
    spotsLeft
  };
}
