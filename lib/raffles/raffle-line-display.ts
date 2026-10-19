import type { ProductLine, ProductLineHubKey } from "@/lib/shop/product-lines";
import { productLineHubs } from "@/lib/shop/product-lines";

export function raffleLineLabel(line: ProductLine | null | undefined): string {
  if (!line) {
    return "Universe";
  }
  const hub = productLineHubs.find((entry) => entry.key === line);
  if (hub) {
    return hub.navLabel;
  }
  if (line === "fashion") {
    return "Fashion";
  }
  return line;
}

export function raffleLineHref(line: ProductLine | null | undefined): string {
  if (!line) {
    return "/raffles";
  }
  const hub = productLineHubs.find((entry) => entry.key === line);
  if (hub) {
    return `${hub.path}#draws`;
  }
  if (line === "fashion") {
    return "/collections";
  }
  return "/raffles";
}

export function isHubProductLine(line: string): line is ProductLineHubKey {
  return line === "champagne" || line === "home" || line === "water";
}
