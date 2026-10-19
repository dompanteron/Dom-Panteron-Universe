import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();
  return NextResponse.json({
    ok: true,
    siteUrl,
    vercel: Boolean(process.env.VERCEL),
    vercelEnv: process.env.VERCEL_ENV ?? null
  });
}
