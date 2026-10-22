import type { RealmRow } from "@/lib/shop/types";
import { createClient as createServerClient } from "@/lib/supabase/server";

export { REALM_ACCENT_CLASSES, realmShopPath } from "@/lib/shop/realm-ui";

const realmSelect = `
  id,
  slug,
  name,
  tagline,
  description,
  hero_image_url,
  accent,
  display_order,
  status,
  kind,
  listen_path,
  created_at
`;

export async function getActiveRealms(): Promise<RealmRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("realms")
    .select(realmSelect)
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RealmRow[];
}

export async function getRealmBySlug(slug: string): Promise<RealmRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("realms")
    .select(realmSelect)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as RealmRow;
}
