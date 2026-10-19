import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { applyProductInventoryForOrder } from "@/lib/shop/product-inventory";
import { parseProductOrderUpdate } from "@/lib/shop/product-orders";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, member } = await ensureCurrentMember();

  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const parsed = parseProductOrderUpdate(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: existing, error: existingError } = await admin
      .from("product_orders")
      .select("id, product_id, status, quantity")
      .eq("id", params.id)
      .maybeSingle();

    if (existingError || !existing) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
    }

    const { data, error } = await admin
      .from("product_orders")
      .update(parsed.data)
      .eq("id", params.id)
      .select("id, status, payment_reference")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${params.id}`);
    revalidatePath("/account");

    if (
      existing.product_id &&
      parsed.data.status !== existing.status &&
      (parsed.data.status === "paid" || parsed.data.status === "fulfilled")
    ) {
      await applyProductInventoryForOrder(existing.product_id, existing.quantity ?? 1);
    }

    return NextResponse.json({ ok: true, order: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not update order." },
      { status: 500 }
    );
  }
}
