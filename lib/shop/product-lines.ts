export const PRODUCT_LINE_VALUES = ["fashion", "champagne", "home", "water"] as const;

export type ProductLine = (typeof PRODUCT_LINE_VALUES)[number];

/** Lines with dedicated marketing hub routes (not fashion). */
export type ProductLineHubKey = "champagne" | "home" | "water";

export type ProductLineHubConfig = {
  key: ProductLineHubKey;
  path: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  lead: string;
  detail: string;
  /** Primary collection slug when one drop represents the line. */
  primaryCollectionSlug: string;
};

export const productLineHubs: ProductLineHubConfig[] = [
  {
    key: "champagne",
    path: "/champagne",
    navLabel: "Champagne",
    eyebrow: "Champagne",
    title: "Raise a glass to the frequency",
    lead: "Limited bottles for celebrations, launches, and the inner circle.",
    detail:
      "Same checkout and membership as the rest of the universe — curated champagne with Dom Panteron presence.",
    primaryCollectionSlug: "champagne"
  },
  {
    key: "home",
    path: "/home",
    navLabel: "HOME",
    eyebrow: "HOME",
    title: "Live inside the jungle mood",
    lead: "Objects and accents for the space you return to after the night.",
    detail:
      "HOME is its own line — still one account, one order flow, one admin — with pieces made for calm and power at home.",
    primaryCollectionSlug: "home"
  },
  {
    key: "water",
    path: "/water",
    navLabel: "Water bottles",
    eyebrow: "Water",
    title: "Carry the signal with you",
    lead: "Reusable bottles for daily rhythm — studio, travel, and everything between.",
    detail:
      "Hydration gear with panteron identity. Order like any other product; drops and raffles can tie in later.",
    primaryCollectionSlug: "water-bottles"
  }
];

export function getProductLineHub(key: ProductLineHubKey): ProductLineHubConfig {
  const hub = productLineHubs.find((entry) => entry.key === key);
  if (!hub) {
    throw new Error(`Unknown product line hub: ${key}`);
  }
  return hub;
}

export function isProductLine(value: string): value is ProductLine {
  return (PRODUCT_LINE_VALUES as readonly string[]).includes(value);
}

export function parseProductLineInput(value: unknown): ProductLine | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "none") {
    return null;
  }
  if (!isProductLine(raw)) {
    return null;
  }
  return raw;
}
