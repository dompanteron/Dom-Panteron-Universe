import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ShopOrderComplete from "@/components/shop/ShopOrderComplete";
import { requireMember } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Order complete | Dom Panteron Universe"
};

export default async function ShopOrderCompletePage({
  params
}: {
  params: { orderId: string };
}) {
  const { member } = await requireMember();
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("product_orders")
    .select("id, member_id")
    .eq("id", params.orderId)
    .maybeSingle();

  if (!order || order.member_id !== member.id) {
    notFound();
  }

  return (
    <main className="min-h-[70vh] bg-panteron-black px-6 py-24 text-white">
      <Link href="/collections" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Collections
      </Link>
      <div className="mt-12">
        <Suspense
          fallback={
            <p className="text-center text-sm text-zinc-400">Confirming payment…</p>
          }
        >
          <ShopOrderComplete orderId={params.orderId} />
        </Suspense>
      </div>
    </main>
  );
}
