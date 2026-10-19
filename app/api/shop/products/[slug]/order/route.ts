import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { notifyAdminShopOrder } from "@/lib/email/send-admin-notification";
import { sendProductOrderEmail } from "@/lib/email/send-product-order";
import { ensureCurrentMember } from "@/lib/members";
import { createPayPalCheckoutOrder } from "@/lib/payments/paypal-api";
import { resolvePaymentProvider } from "@/lib/payments/payment-providers";
import { createSumUpHostedCheckout } from "@/lib/payments/sumup-api";
import { getSumUpCredentials } from "@/lib/payments/sumup-config";
import { getSiteUrl } from "@/lib/site-url";
import { getCollectionRevealState } from "@/lib/shop/collection-reveal";
import { parseProductSizes } from "@/lib/shop/products";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { user, member, error: memberError } = await ensureCurrentMember();

  if (!user || !member) {
    return NextResponse.json(
      { ok: false, error: memberError || "Sign in to place an order." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    customer_name?: string;
    customer_email?: string;
    size?: string;
    quantity?: number | string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_postal_code?: string;
    shipping_country?: string;
    paymentProvider?: string;
  };

  const customerName = body.customer_name?.trim() || member.full_name?.trim();
  const customerEmail = body.customer_email?.trim().toLowerCase() || member.email;
  const size = body.size?.trim() || "One size";
  const quantity = Number(body.quantity ?? 1);

  if (!customerName || !customerEmail) {
    return NextResponse.json(
      { ok: false, error: "Name and email are required." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return NextResponse.json(
      { ok: false, error: "Quantity must be between 1 and 10." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: product, error: productError } = await admin
    .from("products")
    .select(
      `
      id,
      slug,
      title,
      price,
      currency,
      sizes,
      status,
      collections (
        status,
        reveal_at,
        show_items_during_countdown
      )
    `
    )
    .eq("slug", params.slug)
    .maybeSingle();

  if (productError || !product) {
    return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
  }

  if (product.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "This piece is not available to order." },
      { status: 400 }
    );
  }

  const collection = Array.isArray(product.collections)
    ? product.collections[0]
    : product.collections;

  if (collection?.status === "active") {
    const reveal = getCollectionRevealState({
      reveal_at: collection.reveal_at ?? null,
      show_items_during_countdown: Boolean(collection.show_items_during_countdown)
    });
    if (!reveal.allowPurchase) {
      return NextResponse.json(
        { ok: false, error: "This drop is not open for orders yet." },
        { status: 400 }
      );
    }
  }

  const allowedSizes = parseProductSizes(product.sizes);
  if (allowedSizes.length > 0 && !allowedSizes.includes(size)) {
    return NextResponse.json({ ok: false, error: "Choose a valid size." }, { status: 400 });
  }

  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * quantity;
  const currency = product.currency ?? "EUR";

  const { data: order, error: insertError } = await admin
    .from("product_orders")
    .insert({
      product_id: product.id,
      member_id: member.id,
      customer_name: customerName,
      customer_email: customerEmail,
      size,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      currency,
      shipping_address: body.shipping_address?.trim() || null,
      shipping_city: body.shipping_city?.trim() || null,
      shipping_postal_code: body.shipping_postal_code?.trim() || null,
      shipping_country: body.shipping_country?.trim() || null,
      status: "pending"
    })
    .select("id")
    .single();

  if (insertError || !order) {
    return NextResponse.json(
      { ok: false, error: insertError?.message || "Could not save order." },
      { status: 500 }
    );
  }

  revalidatePath("/account");

  const siteUrl = getSiteUrl();
  const provider = resolvePaymentProvider(body.paymentProvider);

  if (provider === "sumup") {
    const sumupCreds = getSumUpCredentials();
    if (!sumupCreds) {
      await admin.from("product_orders").delete().eq("id", order.id);
      return NextResponse.json({ ok: false, error: "SumUp not configured." }, { status: 500 });
    }

    try {
      const returnUrl = `${siteUrl}/api/webhooks/sumup`;
      const redirectUrl = `${siteUrl}/shop/orders/${order.id}/complete?payment_return=1`;

      const checkout = await createSumUpHostedCheckout({
        apiKey: sumupCreds.apiKey,
        merchantCode: sumupCreds.merchantCode,
        amount: totalPrice,
        currency,
        checkoutReference: order.id,
        description: `${product.title} (${size} × ${quantity})`,
        redirectUrl,
        returnUrl
      });

      await admin
        .from("product_orders")
        .update({ sumup_checkout_id: checkout.id })
        .eq("id", order.id);

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        checkoutId: checkout.id,
        checkoutUrl: checkout.hosted_checkout_url,
        paymentMode: "sumup",
        message: "Redirecting to secure payment…"
      });
    } catch (error) {
      await admin.from("product_orders").delete().eq("id", order.id);
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Payment setup failed."
        },
        { status: 500 }
      );
    }
  }

  if (provider === "paypal") {
    try {
      const returnUrl = `${siteUrl}/shop/orders/${order.id}/complete?payment_return=1`;
      const cancelUrl = `${siteUrl}/products/${product.slug}`;

      const paypal = await createPayPalCheckoutOrder({
        referenceId: order.id,
        amount: totalPrice,
        currency,
        description: `${product.title} (${size} × ${quantity})`,
        returnUrl,
        cancelUrl
      });

      await admin
        .from("product_orders")
        .update({ paypal_order_id: paypal.orderId })
        .eq("id", order.id);

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        checkoutId: paypal.orderId,
        checkoutUrl: paypal.approveUrl,
        paymentMode: "paypal",
        message: "Redirecting to PayPal…"
      });
    } catch (error) {
      await admin.from("product_orders").delete().eq("id", order.id);
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : "PayPal setup failed."
        },
        { status: 500 }
      );
    }
  }

  void sendProductOrderEmail({
    to: customerEmail,
    memberName: customerName,
    productTitle: product.title,
    size,
    quantity,
    totalPrice,
    currency,
    productUrl: `${siteUrl}/products/${product.slug}`
  });

  void notifyAdminShopOrder({
    orderId: order.id,
    customerName,
    customerEmail,
    productTitle: product.title,
    size,
    quantity,
    totalPrice,
    currency,
    paid: false,
    shippingSummary: [
      body.shipping_address,
      body.shipping_city,
      body.shipping_postal_code,
      body.shipping_country
    ]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ")
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    paymentMode: "manual",
    message: "Order request received. We will confirm payment separately."
  });
}
