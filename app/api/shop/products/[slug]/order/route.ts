import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { sendProductOrderEmail } from "@/lib/email/send-product-order";
import { getSiteUrl } from "@/lib/site-url";
import { ensureCurrentMember } from "@/lib/members";
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
    .select("id, slug, title, price, currency, sizes, status")
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

  const allowedSizes = parseProductSizes(product.sizes);
  if (allowedSizes.length > 0 && !allowedSizes.includes(size)) {
    return NextResponse.json({ ok: false, error: "Choose a valid size." }, { status: 400 });
  }

  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * quantity;

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
      currency: product.currency ?? "EUR",
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

  void sendProductOrderEmail({
    to: customerEmail,
    memberName: customerName,
    productTitle: product.title,
    size,
    quantity,
    totalPrice,
    currency: product.currency ?? "EUR",
    productUrl: `${getSiteUrl()}/products/${product.slug}`
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    message: "Order request received. We will confirm payment separately."
  });
}
