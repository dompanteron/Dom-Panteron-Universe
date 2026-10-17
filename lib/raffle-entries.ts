import { createAdminClient } from "@/lib/supabase/admin";

export async function sumMemberRaffleEntries(
  raffleId: string,
  memberId: string
): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("raffle_entries")
    .select("quantity")
    .eq("raffle_id", raffleId)
    .eq("member_id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.quantity), 0);
}
