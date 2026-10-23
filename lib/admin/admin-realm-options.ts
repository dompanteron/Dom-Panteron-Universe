import { createAdminClient } from "@/lib/supabase/admin";

export type AdminRealmOption = {
  slug: string;
  name: string;
};

export async function fetchAdminRealmOptions(): Promise<AdminRealmOption[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("realms")
    .select("slug, name")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminRealmOption[];
}

export function buildAdminLineFilterOptions(realms: AdminRealmOption[]) {
  return [
    { value: "all" as const, label: "All realms" },
    ...realms.map((realm) => ({ value: realm.slug, label: realm.name }))
  ];
}

export function realmSlugSet(realms: AdminRealmOption[]): Set<string> {
  return new Set(realms.map((realm) => realm.slug));
}

export function realmLabelForSlug(
  slug: string,
  realms: AdminRealmOption[]
): string {
  return realms.find((realm) => realm.slug === slug)?.name ?? slug;
}
