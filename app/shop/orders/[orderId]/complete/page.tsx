import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ShopOrderComplete from "@/components/shop/ShopOrderComplete";
import { requireMember } from "@/lib/members";
import { shopHubHrefForLine } from "@/lib/shop/realm-ui";
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
    .select("id, member_id, products(collections(product_line))")
    .eq("id", params.orderId)
    .maybeSingle();

  if (!order || order.member_id !== member.id) {
    notFound();
  }

  const productRow = order.products as
    | { collections?: { product_line?: string | null } | { product_line?: string | null }[] | null }
    | { collections?: { product_line?: string | null } | { product_line?: string | null }[] | null }[]
    | null;
  const product = Array.isArray(productRow) ? productRow[0] : productRow;
  const collectionRaw = product?.collections;
  const collection = Array.isArray(collectionRaw) ? collectionRaw[0] : collectionRaw;
  const continueShoppingHref = shopHubHrefForLine(collection?.product_line ?? null);

  return (
    <main className="min-h-[70vh] bg-panteron-black px-6 py-24 text-white">
      <Link href="/shop" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Shop
      </Link>
      <div className="mt-12">
        <Suspense
          fallback={
            <p className="text-center text-sm text-zinc-400">Confirming payment…</p>
          }
        >
          <ShopOrderComplete
            orderId={params.orderId}
            continueShoppingHref={continueShoppingHref}
          />
        </Suspense>
      </div>
    </main>
  );
}
