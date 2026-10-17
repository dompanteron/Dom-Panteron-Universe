import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

const ROLES = new Set(["user", "admin", "pr"]);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, member: actor } = await ensureCurrentMember();

  if (!user || actor?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const memberId = params.id;
  const body = (await request.json().catch(() => ({}))) as { role?: string };
  const role = body.role?.trim();

  if (!role || !ROLES.has(role)) {
    return NextResponse.json(
      { ok: false, error: "Role must be user, admin, or pr." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: target, error: targetError } = await admin
    .from("members")
    .select("id, role")
    .eq("id", memberId)
    .maybeSingle();

  if (targetError || !target) {
    return NextResponse.json({ ok: false, error: "Member not found." }, { status: 404 });
  }

  if (target.role === "admin" && role !== "admin") {
    const { count, error: countError } = await admin
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      return NextResponse.json({ ok: false, error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { ok: false, error: "Keep at least one admin." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await admin
    .from("members")
    .update({ role })
    .eq("id", memberId)
    .select("id, email, full_name, role")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not update role." },
      { status: 500 }
    );
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  revalidatePath("/account");

  return NextResponse.json({ ok: true, member: data });
}
