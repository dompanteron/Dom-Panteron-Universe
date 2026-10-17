import { NextResponse } from "next/server";
import { ensureCurrentMember } from "@/lib/members";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const authError = searchParams.get("error");
  const errorCode = searchParams.get("error_code");

  if (authError) {
    const query = new URLSearchParams({ error: authError });
    if (errorCode) {
      query.set("error_code", errorCode);
    }
    return NextResponse.redirect(`${origin}/join?${query.toString()}`);
  }

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await ensureCurrentMember();
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/join?error=auth`);
}
