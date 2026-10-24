import { PRODUCT_LINE_VALUES } from "@/lib/shop/product-lines";
import { productLineLabel, realmShopPath } from "@/lib/shop/realm-ui";
import type { RealmRow } from "@/lib/shop/types";

export type ShopNavLink = { key: string; href: string; label: string };

/** Header shop menu: DB active realms, or static /shop/[slug] links when DB is empty. */
export function buildShopNavLinks(shopRealms: RealmRow[]): ShopNavLink[] {
  if (shopRealms.length > 0) {
    return shopRealms.map((realm) => ({
      key: realm.id,
      href: realmShopPath(realm.slug),
      label: realm.name
    }));
  }

  return PRODUCT_LINE_VALUES.map((slug) => ({
    key: slug,
    href: realmShopPath(slug),
    label: productLineLabel(slug)
  }));
}
