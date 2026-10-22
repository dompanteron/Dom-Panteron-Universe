import { parseProductLineInput, type ProductLine } from "@/lib/shop/product-lines";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveCollectionRealmFields(
  admin: SupabaseClient,
  body: Record<string, unknown>
): Promise<{ realm_id: string | null; product_line: ProductLine | null }> {
  const realmIdRaw = String(body.realm_id ?? "").trim();
  const realm_id = realmIdRaw || null;

  let product_line = parseProductLineInput(body.product_line);

  if (realm_id) {
    const { data: realm } = await admin
      .from("realms")
      .select("slug")
      .eq("id", realm_id)
      .maybeSingle();
    if (realm?.slug && parseProductLineInput(realm.slug)) {
      product_line = parseProductLineInput(realm.slug);
    }
  } else if (product_line) {
    const { data: realm } = await admin
      .from("realms")
      .select("id")
      .eq("slug", product_line)
      .maybeSingle();
    if (realm?.id) {
      return { realm_id: realm.id as string, product_line };
    }
  }

  return { realm_id, product_line };
}
