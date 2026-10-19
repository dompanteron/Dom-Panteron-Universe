import type { CollectionRow, ProductRow } from "@/lib/shop/types";

export type CollectionRevealState = {
  isLive: boolean;
  msUntilReveal: number;
  showProducts: boolean;
  allowPurchase: boolean;
  revealAt: string | null;
};

export function getCollectionRevealState(
  collection: Pick<CollectionRow, "reveal_at" | "show_items_during_countdown">,
  nowMs = Date.now()
): CollectionRevealState {
  const revealAt = collection.reveal_at;
  const revealAtMs = revealAt ? new Date(revealAt).getTime() : null;
  const hasValidReveal = revealAtMs != null && !Number.isNaN(revealAtMs);
  const isLive = !hasValidReveal || revealAtMs <= nowMs;
  const msUntilReveal =
    hasValidReveal && revealAtMs > nowMs ? revealAtMs - nowMs : 0;

  return {
    isLive,
    msUntilReveal,
    showProducts: isLive || collection.show_items_during_countdown,
    allowPurchase: isLive,
    revealAt: revealAt ?? null
  };
}

export function visibleProductsForCollection(
  collection: Pick<CollectionRow, "reveal_at" | "show_items_during_countdown">,
  products: ProductRow[],
  nowMs = Date.now()
) {
  const reveal = getCollectionRevealState(collection, nowMs);
  if (!reveal.showProducts) {
    return { reveal, products: [] as ProductRow[] };
  }
  return { reveal, products };
}
