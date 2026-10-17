import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return NextResponse.json(
        { ok: false, provider: "supabase", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: "supabase",
      bucketsFound: data?.length ?? 0
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: "supabase",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
