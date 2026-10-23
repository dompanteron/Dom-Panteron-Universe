import type { RealmAccent, RealmKind } from "@/lib/shop/types";
import { slugify } from "@/lib/shop/slug";
import type { SupabaseClient } from "@supabase/supabase-js";

export const REALM_ACCENTS = ["violet", "gold", "emerald", "rose", "ice", "amber"] as const;
export const REALM_STATUSES = ["draft", "active"] as const;
export const REALM_KINDS = ["commerce", "music", "mixed"] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeRealmSlug(value: unknown, fallbackName?: string): string | null {
  const raw = String(value ?? "").trim();
  const base = raw || String(fallbackName ?? "").trim();
  if (!base) {
    return null;
  }
  const slug = slugify(base, "realm");
  if (!SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

export async function realmSlugExists(
  admin: SupabaseClient,
  slug: string
): Promise<boolean> {
  const { data } = await admin.from("realms").select("id").eq("slug", slug).maybeSingle();
  return Boolean(data);
}

export async function fetchAllRealmSlugs(admin: SupabaseClient): Promise<string[]> {
  const { data, error } = await admin.from("realms").select("slug").order("display_order");
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map((row) => row.slug as string);
}

export function parseProductLineSlug(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "none") {
    return null;
  }
  const slug = slugify(raw, "");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

export async function validateProductLineSlug(
  admin: SupabaseClient,
  slug: string | null
): Promise<{ ok: true; slug: string | null } | { ok: false; error: string }> {
  if (slug === null) {
    return { ok: true, slug: null };
  }
  if (!(await realmSlugExists(admin, slug))) {
    return { ok: false, error: "Product line must match an existing realm slug." };
  }
  return { ok: true, slug };
}

export function isRealmAccent(value: string): value is RealmAccent {
  return (REALM_ACCENTS as readonly string[]).includes(value);
}

export function isRealmKind(value: string): value is RealmKind {
  return (REALM_KINDS as readonly string[]).includes(value);
}
