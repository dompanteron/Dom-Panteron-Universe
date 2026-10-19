import type { CollectionRow } from "@/lib/shop/types";

export type CollectionCheckoutRules = Pick<
  CollectionRow,
  | "requires_age_confirm"
  | "allow_multi_quantity"
  | "max_quantity_per_order"
  | "checkout_note"
>;

export function collectionCheckoutRules(
  collection: Partial<CollectionCheckoutRules> | null | undefined
): CollectionCheckoutRules {
  return {
    requires_age_confirm: Boolean(collection?.requires_age_confirm),
    allow_multi_quantity: collection?.allow_multi_quantity !== false,
    max_quantity_per_order: clampMax(collection?.max_quantity_per_order ?? 10),
    checkout_note: collection?.checkout_note?.trim() || null
  };
}

function clampMax(value: number) {
  if (!Number.isFinite(value)) {
    return 10;
  }
  return Math.min(99, Math.max(1, Math.floor(value)));
}

export function effectiveMaxQuantity(
  rules: CollectionCheckoutRules,
  stockQuantity: number | null | undefined
): number {
  let max = rules.allow_multi_quantity ? rules.max_quantity_per_order : 1;
  if (stockQuantity != null && Number.isFinite(stockQuantity)) {
    max = Math.min(max, Math.max(0, Math.floor(stockQuantity)));
  }
  return max >= 1 ? max : 0;
}

export function quantityOptions(maxQuantity: number): number[] {
  const cap = Math.min(99, Math.max(0, maxQuantity));
  return Array.from({ length: cap }, (_, index) => index + 1);
}

export function validateOrderQuantity(input: {
  quantity: number;
  rules: CollectionCheckoutRules;
  stockQuantity: number | null | undefined;
}): { ok: true; max: number } | { ok: false; error: string } {
  const max = effectiveMaxQuantity(input.rules, input.stockQuantity);

  if (max < 1) {
    return { ok: false, error: "This item is out of stock." };
  }

  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return { ok: false, error: "Choose a valid quantity." };
  }

  if (!input.rules.allow_multi_quantity && input.quantity !== 1) {
    return { ok: false, error: "This piece is limited to one per order." };
  }

  if (input.quantity > max) {
    return {
      ok: false,
      error:
        input.stockQuantity != null
          ? `Only ${max} available right now.`
          : `Quantity must be between 1 and ${max}.`
    };
  }

  return { ok: true, max };
}

export function parseCollectionCheckoutFromBody(body: Record<string, unknown>): CollectionCheckoutRules {
  const maxRaw = Number(body.max_quantity_per_order ?? 10);
  return {
    requires_age_confirm: Boolean(body.requires_age_confirm),
    allow_multi_quantity: body.allow_multi_quantity !== false,
    max_quantity_per_order: clampMax(maxRaw),
    checkout_note: String(body.checkout_note ?? "").trim() || null
  };
}
