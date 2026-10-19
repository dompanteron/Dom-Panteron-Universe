import { revalidatePath } from "next/cache";
import { notifyAdminShopOrder } from "@/lib/email/send-admin-notification";
import { sendProductOrderEmail } from "@/lib/email/send-product-order";
import { applyProductInventoryForOrder } from "@/lib/shop/product-inventory";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

type OrderWithProduct = {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  size: string;
  quantity: number;
  total_price: number;
  currency: string;
  status: string;
  products: { slug: string; title: string } | { slug: string; title: string }[] | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
};

function shippingSummary(order: OrderWithProduct) {
  return [
    order.shipping_address,
    order.shipping_city,
    order.shipping_postal_code,
    order.shipping_country
  ]
    .filter(Boolean)
    .join(", ");
}

export async function completeProductOrderPayment(input: {
  orderId?: string | null;
  checkoutId?: string | null;
  paymentReference?: string | null;
}) {
  const admin = createAdminClient();
  if (!input.orderId && !input.checkoutId) {
    return { completed: false as const, reason: "missing_reference" as const };
  }

  const paymentRef = input.paymentReference ?? input.checkoutId ?? null;

  async function tryUpdate(
    match: { column: "id" | "sumup_checkout_id" | "paypal_order_id"; value: string }
  ) {
    return admin
      .from("product_orders")
      .update({ status: "paid", payment_reference: paymentRef })
      .eq("status", "pending")
      .eq(match.column, match.value)
      .select(
        "id, product_id, customer_name, customer_email, size, quantity, total_price, currency, status, shipping_address, shipping_city, shipping_postal_code, shipping_country, products(slug, title)"
      )
      .maybeSingle();
  }

  let data = null;
  let error = null;

  if (input.orderId) {
    ({ data, error } = await tryUpdate({ column: "id", value: input.orderId }));
  }

  if (!data && input.checkoutId) {
    ({ data, error } = await tryUpdate({ column: "sumup_checkout_id", value: input.checkoutId }));
  }

  if (!data && input.checkoutId) {
    ({ data, error } = await tryUpdate({ column: "paypal_order_id", value: input.checkoutId }));
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { completed: false as const, reason: "not_found_or_already_paid" as const };
  }

  const order = data as OrderWithProduct;
  const product = Array.isArray(order.products) ? order.products[0] : order.products;

  revalidatePath("/account");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);

  if (product?.slug) {
    void sendProductOrderEmail({
      to: order.customer_email,
      memberName: order.customer_name,
      productTitle: product.title,
      size: order.size,
      quantity: order.quantity,
      totalPrice: Number(order.total_price),
      currency: order.currency,
      productUrl: `${getSiteUrl()}/products/${product.slug}`,
      paid: true
    });
  }

  void notifyAdminShopOrder({
    orderId: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    productTitle: product?.title ?? "Product",
    size: order.size,
    quantity: order.quantity,
    totalPrice: Number(order.total_price),
    currency: order.currency,
    paid: true,
    shippingSummary: shippingSummary(order) || undefined
  });

  await applyProductInventoryForOrder(order.product_id, order.quantity);

  return { completed: true as const, orderId: order.id };
}
