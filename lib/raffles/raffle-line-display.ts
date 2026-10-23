import type { ProductLine, ProductLineHubKey } from "@/lib/shop/product-lines";
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
  if (REALM_LABELS[line]) {
    return REALM_LABELS[line];
  }
  return line
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function raffleLineHref(line: ProductLine | string | null | undefined): string {
  if (!line) {
    return "/raffles";
  }
  return `${realmShopPath(line)}#draws`;
}

export function isHubProductLine(line: string): line is ProductLineHubKey {
  return line === "champagne" || line === "home" || line === "water";
}
