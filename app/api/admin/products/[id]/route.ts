import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { parseImagesInput, parseSizesInput, slugify } from "@/lib/shop/slug";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, member } = await ensureCurrentMember();
  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const title = String(body.title ?? "").trim();
  const collectionId = String(body.collection_id ?? "").trim();

  if (!title || !collectionId) {
    return NextResponse.json(
      { ok: false, error: "Title and collection are required." },
      { status: 400 }
    );
  }

  const slug = String(body.slug ?? "").trim() || slugify(title);
  const status = String(body.status ?? "draft");
  if (!["draft", "active", "sold"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const price = Number(body.price ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ ok: false, error: "Invalid price." }, { status: 400 });
  }

  const compareRaw = body.compare_at_price;
  const compareAt =
    compareRaw === "" || compareRaw == null ? null : Number(compareRaw);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .update({
      collection_id: collectionId,
      slug,
      title,
      subtitle: String(body.subtitle ?? "").trim() || null,
      description: String(body.description ?? "").trim() || null,
      price,
      compare_at_price: compareAt,
      currency: String(body.currency ?? "EUR").trim() || "EUR",
      sizes: parseSizesInput(String(body.sizes ?? "")),
      images: parseImagesInput(String(body.images ?? "")),
      main_image_url: String(body.main_image_url ?? "").trim() || null,
      display_order: Number(body.display_order ?? 0),
      status
    })
    .eq("id", params.id)
    .select("id, slug, collection_id")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${params.id}`);
  revalidatePath("/admin");
  revalidatePath("/collections");
  revalidatePath(`/products/${data.slug}`);

  const { data: collection } = await admin
    .from("collections")
    .select("slug")
    .eq("id", data.collection_id)
    .maybeSingle();

  if (collection?.slug) {
    revalidatePath(`/collections/${collection.slug}`);
  }

  return NextResponse.json({ ok: true, product: data });
}
