import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import RaffleCheckoutComplete from "@/components/raffles/RaffleCheckoutComplete";
import { requireMember } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Raffle payment | Dom Panteron Universe"
};

export default async function RaffleCheckoutCompletePage({
  params
}: {
  params: { checkoutId: string };
}) {
  const { member } = await requireMember();
  const admin = createAdminClient();
  const { data: checkout } = await admin
    .from("raffle_checkouts")
    .select("id, raffle_id, member_id")
    .eq("id", params.checkoutId)
    .maybeSingle();

  if (!checkout || checkout.member_id !== member.id) {
    notFound();
  }

  return (
    <main className="min-h-[70vh] bg-panteron-black px-6 py-24 text-white">
      <Link href={`/raffles/${checkout.raffle_id}`} className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Draw
      </Link>
      <div className="mt-12">
        <Suspense fallback={<p className="text-center text-sm text-zinc-400">Confirming…</p>}>
          <RaffleCheckoutComplete checkoutId={params.checkoutId} raffleId={checkout.raffle_id} />
        </Suspense>
      </div>
    </main>
  );
}
