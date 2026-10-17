import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { parseMusicReleaseBody, revalidateMusicPaths } from "@/lib/music/parse-release-body";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, member } = await ensureCurrentMember();
  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = parseMusicReleaseBody((await request.json()) as Record<string, unknown>);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("music_releases")
    .insert(parsed.data)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  for (const path of revalidateMusicPaths()) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, release: data });
}
