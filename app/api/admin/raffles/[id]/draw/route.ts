import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { revalidateRafflePaths } from "@/lib/raffles";
import { runRaffleDraw } from "@/lib/raffles/run-draw";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { user, member } = await ensureCurrentMember();

  if (!user || member?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const result = await runRaffleDraw(params.id);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  for (const path of revalidateRafflePaths()) {
    revalidatePath(path);
  }
  revalidatePath(`/admin/raffles/${params.id}`);
  revalidatePath(`/raffles/${params.id}`);

  return NextResponse.json({
    ok: true,
    winningTicket: result.winningTicket,
    poolTotal: result.poolTotal,
    winner: result.winner
  });
}
