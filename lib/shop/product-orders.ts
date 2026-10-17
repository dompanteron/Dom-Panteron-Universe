export const PRODUCT_ORDER_STATUSES = ["pending", "paid", "fulfilled", "cancelled"] as const;

export type ProductOrderStatus = (typeof PRODUCT_ORDER_STATUSES)[number];

export function formatOrderDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function parseProductOrderUpdate(body: unknown):
  | { ok: true; data: { status: ProductOrderStatus; payment_reference: string | null } }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body." };
  }

  const record = body as { status?: string; payment_reference?: string | null };
  const status = record.status?.trim();

  if (!status || !PRODUCT_ORDER_STATUSES.includes(status as ProductOrderStatus)) {
    return { ok: false, error: "Choose a valid status." };
  }

  const paymentRef =
    record.payment_reference === undefined || record.payment_reference === null
      ? null
      : String(record.payment_reference).trim() || null;

  return {
    ok: true,
    data: {
      status: status as ProductOrderStatus,
      payment_reference: paymentRef
    }
  };
}
