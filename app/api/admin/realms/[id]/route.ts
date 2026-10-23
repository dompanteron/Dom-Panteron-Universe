import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import {
  isRealmAccent,
  isRealmKind,
  REALM_STATUSES
} from "@/lib/shop/realm-admin";
import { revalidateShopPaths } from "@/lib/shop/revalidate-shop-paths";
import { createAdminClient } from "@/lib/supabase/admin";

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
    if (!isRealmAccent(accent)) {
      return NextResponse.json({ ok: false, error: "Invalid accent." }, { status: 400 });
    }
    patch.accent = accent;
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!(REALM_STATUSES as readonly string[]).includes(status as (typeof REALM_STATUSES)[number])) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    patch.status = status;
  }
  if (body.kind !== undefined) {
    const kind = String(body.kind);
    if (!isRealmKind(kind)) {
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
  revalidatePath("/admin/realms");
  revalidatePath(`/shop/${data.slug}`);
  revalidateShopPaths(undefined, [data.slug]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, member } = await ensureCurrentMember();
  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const admin = createAdminClient();

  const { count, error: countError } = await admin
    .from("collections")
    .select("id", { count: "exact", head: true })
    .eq("realm_id", id);

  if (countError) {
    return NextResponse.json({ ok: false, error: countError.message }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This realm still has collections. Reassign or remove them, or set status to draft instead of deleting."
      },
      { status: 409 }
    );
  }

  const { data: realm } = await admin.from("realms").select("slug").eq("id", id).maybeSingle();

  const { error } = await admin.from("realms").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/shop");
  revalidatePath("/admin/realms");
  if (realm?.slug) {
    revalidatePath(`/shop/${realm.slug}`);
  }

  return NextResponse.json({ ok: true });
}
