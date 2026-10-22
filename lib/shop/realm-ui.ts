import { isProductLine, type ProductLine } from "@/lib/shop/product-lines";
import type { RealmAccent } from "@/lib/shop/types";

export function realmShopPath(slug: string) {
  return `/shop/${slug}`;
}

export function shopHubHrefForLine(line: string | null | undefined): string {
  if (!line || !isProductLine(line)) {
    return "/shop";
  }
  return realmShopPath(line);
}

export function productLineLabel(line: ProductLine | string | null | undefined): string {
  const labels: Record<string, string> = {
    fashion: "Fashion",
    champagne: "Champagne",
    home: "HOME",
    water: "Water",
    art: "Art",
    jewelry: "Jewelry",
    music: "Music"
  };
  if (!line) {
    return "Ready-made";
  }
  return labels[line] ?? line;
}

export const REALM_ACCENT_CLASSES: Record<
  RealmAccent,
  { glow: string; border: string; text: string }
> = {
  violet: {
    glow: "bg-panteron-purple/20",
    border: "hover:border-panteron-violet/50",
    text: "text-panteron-violet"
  },
  gold: {
    glow: "bg-amber-400/15",
    border: "hover:border-amber-400/40",
    text: "text-amber-300"
  },
  emerald: {
    glow: "bg-emerald-500/15",
    border: "hover:border-emerald-400/40",
    text: "text-emerald-300"
  },
  rose: {
    glow: "bg-rose-500/15",
    border: "hover:border-rose-400/40",
    text: "text-rose-300"
  },
  ice: {
    glow: "bg-sky-400/15",
    border: "hover:border-sky-400/40",
    text: "text-sky-300"
  },
  amber: {
    glow: "bg-orange-400/15",
    border: "hover:border-orange-400/40",
    text: "text-orange-300"
  }
};
