import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      fullName?: string;
    };

    const { user, member, error } = await ensureCurrentMember(body.fullName);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (error || !member) {
      return NextResponse.json(
        { ok: false, error: error || "Could not create member profile" },
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
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
