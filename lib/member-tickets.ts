import { createAdminClient } from "@/lib/supabase/admin";

export type MemberTicket = {
  raffleId: string;
  title: string;
  drawDate: string;
  status: string;
  yourEntries: number;
  lastEnteredAt: string;
};

export async function getMemberTickets(memberId: string): Promise<MemberTicket[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("raffle_entries")
    .select("quantity, created_at, raffles(id, title, draw_date, status)")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const grouped = new Map<string, MemberTicket>();

  for (const row of data ?? []) {
    const raffle = row.raffles as
      | { id: string; title: string; draw_date: string; status: string }
      | { id: string; title: string; draw_date: string; status: string }[]
      | null;

    const resolved = Array.isArray(raffle) ? raffle[0] : raffle;
    if (!resolved) {
      continue;
    }

    const existing = grouped.get(resolved.id);
    const quantity = Number(row.quantity);

    if (!existing) {
      grouped.set(resolved.id, {
        raffleId: resolved.id,
        title: resolved.title,
        drawDate: resolved.draw_date,
        status: resolved.status,
        yourEntries: quantity,
        lastEnteredAt: row.created_at as string
      });
      continue;
    }

    existing.yourEntries += quantity;
    if (new Date(row.created_at as string) > new Date(existing.lastEnteredAt)) {
      existing.lastEnteredAt = row.created_at as string;
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => new Date(b.lastEnteredAt).getTime() - new Date(a.lastEnteredAt).getTime()
  );
}
