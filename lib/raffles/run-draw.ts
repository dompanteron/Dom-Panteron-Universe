import { randomInt } from "node:crypto";
import {
  memberDisplayInitials,
  memberPublicDisplayName
} from "@/lib/raffles/winner-display";
import { createAdminClient } from "@/lib/supabase/admin";

type EntryRow = {
  id: string;
  member_id: string;
  quantity: number;
  created_at: string;
  members:
    | { email: string; full_name: string | null }
    | { email: string; full_name: string | null }[]
    | null;
};

export async function runRaffleDraw(raffleId: string) {
  const admin = createAdminClient();

  const { data: raffle, error: raffleError } = await admin
    .from("raffles")
    .select("id, title, status, total_entries, winner_number")
    .eq("id", raffleId)
    .maybeSingle();

  if (raffleError || !raffle) {
    return { ok: false as const, error: "Raffle not found." };
  }

  if (raffle.winner_number != null) {
    return { ok: false as const, error: "This draw already has a winner." };
  }

  const { data: entries, error: entriesError } = await admin
    .from("raffle_entries")
    .select("id, member_id, quantity, created_at, members(email, full_name)")
    .eq("raffle_id", raffleId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (entriesError) {
    return { ok: false as const, error: entriesError.message };
  }

  const rows = (entries ?? []) as EntryRow[];
  let ticketCursor = 1;
  const ranges: {
    start: number;
    end: number;
    entry: EntryRow;
  }[] = [];

  for (const entry of rows) {
    if (entry.quantity < 1) {
      continue;
    }
    ranges.push({
      start: ticketCursor,
      end: ticketCursor + entry.quantity - 1,
      entry
    });
    ticketCursor += entry.quantity;
  }

  const poolTotal = ticketCursor - 1;
  if (poolTotal < 1) {
    return { ok: false as const, error: "No entries to draw from." };
  }

  const winningTicket = randomInt(1, poolTotal + 1);
  const winningRange = ranges.find(
    (range) => winningTicket >= range.start && winningTicket <= range.end
  );

  if (!winningRange) {
    return { ok: false as const, error: "Could not resolve winning ticket." };
  }

  const member = Array.isArray(winningRange.entry.members)
    ? winningRange.entry.members[0]
    : winningRange.entry.members;

  if (!member?.email) {
    return { ok: false as const, error: "Winning member record is missing." };
  }

  const winnerInitials = memberDisplayInitials(member.full_name, member.email);
  const winnerDisplayName = memberPublicDisplayName(member.full_name, member.email);

  const { error: updateError } = await admin
    .from("raffles")
    .update({
      status: "ended",
      winner_number: winningTicket,
      winner_initials: winnerInitials,
      winner_display_name: winnerDisplayName
    })
    .eq("id", raffleId)
    .is("winner_number", null);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  return {
    ok: true as const,
    winningTicket,
    poolTotal,
    recordedTotalEntries: Number(raffle.total_entries),
    winner: {
      memberId: winningRange.entry.member_id,
      email: member.email,
      fullName: member.full_name,
      initials: winnerInitials,
      displayName: winnerDisplayName
    }
  };
}
