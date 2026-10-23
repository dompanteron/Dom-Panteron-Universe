import { validateProductLineSlug } from "@/lib/shop/realm-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function validateRaffleRealmSlug(
  admin: SupabaseClient,
  slug: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await validateProductLineSlug(admin, slug);
  if (!result.ok) {
    return result;
  }
  return { ok: true };
}
