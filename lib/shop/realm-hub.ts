/** Known primary collection slugs per realm (legacy drops). */
const PRIMARY_BY_REALM: Record<string, string> = {
  champagne: "champagne",
  home: "home",
  water: "water-bottles"
};

export function primaryCollectionSlugForRealm(realmSlug: string): string | undefined {
  return PRIMARY_BY_REALM[realmSlug];
}
