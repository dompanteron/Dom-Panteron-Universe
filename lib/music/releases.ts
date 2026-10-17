import { createAdminClient } from "@/lib/supabase/admin";
import type { MusicReleaseRow } from "@/lib/music/types";

export async function getActiveMusicReleases(): Promise<MusicReleaseRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("music_releases")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MusicReleaseRow[];
}
