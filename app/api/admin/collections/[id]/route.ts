import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { slugify } from "@/lib/shop/slug";
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
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim() || slugify(name);
  const status = String(body.status ?? "draft");
  if (status !== "draft" && status !== "active") {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("collections")
    .update({
      name,
      slug,
      subtitle: String(body.subtitle ?? "").trim() || null,
      description: String(body.description ?? "").trim() || null,
      cover_image_url: String(body.cover_image_url ?? "").trim() || null,
      display_order: Number(body.display_order ?? 0),
      status,
      reveal_at: body.reveal_at ? new Date(String(body.reveal_at)).toISOString() : null,
      show_items_during_countdown: Boolean(body.show_items_during_countdown)
    })
    .eq("id", params.id)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${params.id}`);
  revalidatePath("/admin");
  revalidatePath("/collections");
  revalidatePath(`/collections/${data.slug}`);

  return NextResponse.json({ ok: true, collection: data });
}
