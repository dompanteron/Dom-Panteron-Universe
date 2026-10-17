import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";

export async function GET() {
  const { user, member, error } = await ensureCurrentMember();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  if (error || !member) {
    return NextResponse.json(
      { ok: false, error: error || "Member not found" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    member: {
      id: member.id,
      email: member.email,
      full_name: member.full_name,
      role: member.role
    }
  });
}
