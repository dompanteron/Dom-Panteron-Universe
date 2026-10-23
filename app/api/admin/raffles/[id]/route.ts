import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { parseRaffleBody, revalidateRafflePathsForAllRealms } from "@/lib/raffles";
import { validateRaffleRealmSlug } from "@/lib/raffles/validate-raffle-realm";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { data: existing, error: existingError } = await admin
      .from("raffles")
      .select("id, total_entries")
      .eq("id", params.id)
      .maybeSingle();

    if (existingError || !existing) {
      return NextResponse.json({ ok: false, error: "Raffle not found." }, { status: 404 });
    }

    if (parsed.data.max_entries < Number(existing.total_entries)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Max entries cannot be below current entries (${existing.total_entries}).`
        },
        { status: 400 }
      );
    }

    const realmCheck = await validateRaffleRealmSlug(admin, parsed.data.product_line);
    if (!realmCheck.ok) {
      return NextResponse.json({ ok: false, error: realmCheck.error }, { status: 400 });
    }

    const { data, error } = await admin
      .from("raffles")
      .update(parsed.data)
      .eq("id", params.id)
      .select("id, title, status, draw_date")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    for (const path of await revalidateRafflePathsForAllRealms(parsed.data.product_line)) {
      revalidatePath(path);
    }
    revalidatePath(`/admin/raffles/${params.id}`);
    revalidatePath(`/raffles/${params.id}`);

    return NextResponse.json({ ok: true, raffle: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not update raffle." },
      { status: 500 }
    );
  }
}
