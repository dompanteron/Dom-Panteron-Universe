import { createAdminClient } from "@/lib/supabase/admin";

export type MemberProductOrder = {
  orderId: string;
  productSlug: string;
  productTitle: string;
  size: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: string;
  createdAt: string;
};

export async function getMemberProductOrders(
  memberId: string
): Promise<MemberProductOrder[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_orders")
    .select(
      "id, size, quantity, total_price, currency, status, created_at, products(slug, title)"
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).flatMap((row) => {
    const product = row.products as
      | { slug: string; title: string }
      | { slug: string; title: string }[]
      | null;
    const resolved = Array.isArray(product) ? product[0] : product;
    if (!resolved) {
      return [];
    }

    return [
      {
        orderId: row.id as string,
        productSlug: resolved.slug,
        productTitle: resolved.title,
        size: row.size as string,
        quantity: Number(row.quantity),
        totalPrice: Number(row.total_price),
        currency: row.currency as string,
        status: row.status as string,
        createdAt: row.created_at as string
      }
    ];
  });
}
