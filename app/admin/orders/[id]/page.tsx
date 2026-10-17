import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminProductOrderForm from "@/components/admin/AdminProductOrderForm";
import { requireAdmin } from "@/lib/members";
import { formatProductPrice } from "@/lib/shop/format-price";
import { formatOrderDate } from "@/lib/shop/product-orders";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Shop order | Dom Panteron Universe"
};

function shippingLine(parts: (string | null | undefined)[]) {
  const text = parts.filter(Boolean).join(", ");
  return text || "—";
}

export default async function AdminOrderDetailPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_orders")
    .select(
      "*, products(slug, title), members(email, full_name)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const product = Array.isArray(data.products) ? data.products[0] : data.products;
  const memberRow = Array.isArray(data.members) ? data.members[0] : data.members;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/admin/orders" className="text-sm text-zinc-400 hover:text-panteron-violet">
        ← Shop orders
      </Link>
      <h1 className="font-display mt-6 text-4xl font-semibold">Order detail</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Placed {formatOrderDate(data.created_at as string)}
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="border border-white/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl">Line item</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Product</dt>
              <dd className="mt-1 text-lg text-white">
                {product?.title ?? "—"}
                {product?.slug ? (
                  <>
                    {" "}
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm text-panteron-violet hover:text-white"
                    >
                      View
                    </Link>
                  </>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Size / qty</dt>
              <dd className="mt-1 text-zinc-300">
                {data.size} · {data.quantity}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</dt>
              <dd className="mt-1 text-xl text-panteron-violet">
                {formatProductPrice(Number(data.total_price), data.currency as string)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border border-white/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl">Customer</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Name</dt>
              <dd className="mt-1 text-white">{data.customer_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Email</dt>
              <dd className="mt-1 text-zinc-300">{data.customer_email}</dd>
            </div>
            {memberRow ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Member</dt>
                <dd className="mt-1 text-zinc-300">
                  {memberRow.full_name || memberRow.email}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">Shipping</dt>
              <dd className="mt-1 text-zinc-300">
                {shippingLine([
                  data.shipping_address,
                  data.shipping_city,
                  data.shipping_postal_code,
                  data.shipping_country
                ])}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 border border-white/10 p-6 sm:p-8">
        <h2 className="font-display text-2xl">Fulfillment</h2>
        <div className="mt-6">
          <AdminProductOrderForm
            orderId={data.id as string}
            status={data.status as string}
            paymentReference={data.payment_reference as string | null}
          />
        </div>
      </div>
    </section>
  );
}
