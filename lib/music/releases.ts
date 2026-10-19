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

export async function getMusicReleaseBySlug(slug: string): Promise<MusicReleaseRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("music_releases")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as MusicReleaseRow;
}
