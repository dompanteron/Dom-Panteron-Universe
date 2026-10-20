import { NextResponse } from "next/server";
import { getPaymentHealthSnapshot } from "@/lib/payments/payment-health";

export async function GET() {
  return NextResponse.json({ ok: true, ...getPaymentHealthSnapshot() });
}
