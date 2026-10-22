import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

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
