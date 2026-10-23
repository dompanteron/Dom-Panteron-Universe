import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import {
  isRealmAccent,
  isRealmKind,
  normalizeRealmSlug,
  realmSlugExists,
  REALM_STATUSES
} from "@/lib/shop/realm-admin";
import { revalidateShopPaths } from "@/lib/shop/revalidate-shop-paths";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, member } = await ensureCurrentMember();
  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }

  const slug = normalizeRealmSlug(body.slug, name);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Invalid slug." }, { status: 400 });
  }

  const status = String(body.status ?? "draft");
  if (!(REALM_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const kind = String(body.kind ?? "commerce");
  if (!isRealmKind(kind)) {
    return NextResponse.json({ ok: false, error: "Invalid kind." }, { status: 400 });
  }

  const accent = String(body.accent ?? "violet");
  if (!isRealmAccent(accent)) {
    return NextResponse.json({ ok: false, error: "Invalid accent." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (await realmSlugExists(admin, slug)) {
    return NextResponse.json({ ok: false, error: "That slug is already in use." }, { status: 400 });
  }

  const displayOrder = Number(body.display_order ?? 0);
  const tagline = String(body.tagline ?? "").trim() || null;

  const { data, error } = await admin
    .from("realms")
    .insert({
      slug,
      name,
      tagline,
      description: null,
      hero_image_url: null,
      accent,
      display_order: displayOrder,
      status,
      kind,
      listen_path: kind === "music" ? "/music" : null
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/admin/realms");
  revalidatePath("/shop");
  revalidatePath(`/shop/${data.slug}`);
  revalidateShopPaths(undefined, [data.slug]);

  return NextResponse.json({ ok: true, realm: data });
}

export async function GET() {
  const { user, member } = await ensureCurrentMember();
  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("realms")
    .select(
      "id, slug, name, tagline, description, hero_image_url, accent, display_order, status, kind, listen_path, created_at"
    )
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, realms: data ?? [] });
}
