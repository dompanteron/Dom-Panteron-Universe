import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { parseRaffleBody, revalidateRafflePaths } from "@/lib/raffles";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, member } = await ensureCurrentMember();

  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const parsed = parseRaffleBody(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("raffles")
      .insert(parsed.data)
      .select("id, title, status, draw_date")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    for (const path of revalidateRafflePaths()) {
      revalidatePath(path);
    }

    return NextResponse.json({ ok: true, raffle: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not create raffle." },
      { status: 500 }
    );
  }
}
