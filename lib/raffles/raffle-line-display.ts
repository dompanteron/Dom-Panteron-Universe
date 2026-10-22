import type { ProductLine, ProductLineHubKey } from "@/lib/shop/product-lines";
import { productLineHubs } from "@/lib/shop/product-lines";
import { realmShopPath } from "@/lib/shop/realm-ui";

const REALM_LABELS: Record<string, string> = {
  fashion: "Fashion",
  champagne: "Champagne",
  home: "HOME",
  water: "Water bottles",
  art: "Art",
  jewelry: "Jewelry",
  music: "Music"
};

export function raffleLineLabel(line: ProductLine | string | null | undefined): string {
  if (!line) {
    return "Universe";
  }
  const hub = productLineHubs.find((entry) => entry.key === line);
  if (hub) {
    return hub.navLabel;
  }
  return REALM_LABELS[line] ?? line;
}

export function raffleLineHref(line: ProductLine | string | null | undefined): string {
  if (!line) {
    return "/raffles";
  }
  if (line === "fashion") {
    return "/shop/fashion#draws";
  }
  if (REALM_LABELS[line]) {
    return `${realmShopPath(line)}#draws`;
  }
  return "/raffles";
}

export function isHubProductLine(line: string): line is ProductLineHubKey {
  return line === "champagne" || line === "home" || line === "water";
}
