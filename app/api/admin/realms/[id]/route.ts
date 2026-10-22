import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { revalidateShopPaths } from "@/lib/shop/revalidate-shop-paths";
import { createAdminClient } from "@/lib/supabase/admin";

const ACCENTS = ["violet", "gold", "emerald", "rose", "ice", "amber"] as const;
const STATUSES = ["draft", "active"] as const;
const KINDS = ["commerce", "music", "mixed"] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, member } = await ensureCurrentMember();
  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (body.name !== undefined) {
    patch.name = String(body.name).trim();
  }
  if (body.tagline !== undefined) {
    patch.tagline = String(body.tagline).trim() || null;
  }
  if (body.description !== undefined) {
    patch.description = String(body.description).trim() || null;
  }
  if (body.hero_image_url !== undefined) {
    patch.hero_image_url = String(body.hero_image_url).trim() || null;
  }
  if (body.display_order !== undefined) {
    patch.display_order = Number(body.display_order);
  }
  if (body.listen_path !== undefined) {
    patch.listen_path = String(body.listen_path).trim() || null;
  }

  if (body.accent !== undefined) {
    const accent = String(body.accent);
    if (!(ACCENTS as readonly string[]).includes(accent)) {
      return NextResponse.json({ ok: false, error: "Invalid accent." }, { status: 400 });
    }
    patch.accent = accent;
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    patch.status = status;
  }
  if (body.kind !== undefined) {
    const kind = String(body.kind);
    if (!(KINDS as readonly string[]).includes(kind)) {
      return NextResponse.json({ ok: false, error: "Invalid kind." }, { status: 400 });
    }
    patch.kind = kind;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "No changes." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("realms")
    .update(patch)
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  revalidatePath("/shop");
  revalidatePath(`/shop/${data.slug}`);
  revalidateShopPaths();

  return NextResponse.json({ ok: true });
}
