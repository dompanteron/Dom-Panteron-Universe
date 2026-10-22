import { isProductLine, productLineHubs, type ProductLine } from "@/lib/shop/product-lines";

const STATUSES = new Set(["draft", "active", "ended"]);

export type RaffleInput = {
  title: string;
  subtitle: string | null;
  description: string | null;
  ticket_price: number;
  max_entries: number;
  ticket_limit_per_user: number | null;
  draw_date: string;
  status: string;
  product_line: ProductLine | null;
};

export function parseRaffleProductLine(value: unknown): ProductLine | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "universe") {
    return null;
  }
  if (!isProductLine(raw)) {
    return null;
  }
  return raw;
}

export function parseRaffleBody(body: {
  title?: string;
  subtitle?: string;
  description?: string;
  ticket_price?: number | string;
  max_entries?: number | string;
  ticket_limit_per_user?: number | string | null;
  draw_date?: string;
  status?: string;
  product_line?: string | null;
}): { ok: true; data: RaffleInput } | { ok: false; error: string } {
  const title = body.title?.trim();
  const drawDate = body.draw_date?.trim();
  const status = body.status?.trim() || "draft";

  if (!title || !drawDate) {
    return { ok: false, error: "Title and draw date are required." };
  }

  if (!STATUSES.has(status)) {
    return { ok: false, error: "Status must be draft, active, or ended." };
  }

  const ticketPrice = Number(body.ticket_price ?? 5);
  const maxEntries = Number(body.max_entries ?? 100);

  if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
    return { ok: false, error: "Ticket price must be a valid number." };
  }

  if (!Number.isInteger(maxEntries) || maxEntries < 1) {
    return { ok: false, error: "Max entries must be a whole number of at least 1." };
  }

  let ticketLimitPerUser: number | null = null;
  const limitRaw = body.ticket_limit_per_user;
  if (limitRaw !== undefined && limitRaw !== null && String(limitRaw).trim() !== "") {
    const limit = Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1) {
      return {
        ok: false,
        error: "Per-member entry limit must be a whole number of at least 1, or leave empty."
      };
    }
    if (limit > maxEntries) {
      return {
        ok: false,
        error: "Per-member limit cannot exceed max entries for the draw."
      };
    }
    ticketLimitPerUser = limit;
  }

  const parsedDate = new Date(drawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, error: "Draw date is invalid." };
  }

  const productLine = parseRaffleProductLine(body.product_line);
  if (
    body.product_line !== undefined &&
    body.product_line !== null &&
    String(body.product_line).trim() &&
    String(body.product_line).trim() !== "universe" &&
    !productLine
  ) {
    return { ok: false, error: "Invalid product line for raffle." };
  }

  return {
    ok: true,
    data: {
      title,
      subtitle: body.subtitle?.trim() || null,
      description: body.description?.trim() || null,
      ticket_price: ticketPrice,
      max_entries: maxEntries,
      ticket_limit_per_user: ticketLimitPerUser,
      draw_date: parsedDate.toISOString(),
      status,
      product_line: productLine
    }
  };
}

export function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function revalidateRafflePaths() {
  return [
    "/admin/raffles",
    "/raffles",
    "/admin",
    ...productLineHubs.map((hub) => hub.path),
    "/shop",
    ...productLineHubs.map((hub) => `/shop/${hub.key}`)
  ] as const;
}

export type PublicRaffle = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  ticket_price: number;
  max_entries: number;
  total_entries: number;
  ticket_limit_per_user: number | null;
  draw_date: string;
  status: string;
  product_line?: ProductLine | null;
  winner_number?: number | null;
  winner_initials?: string | null;
  winner_display_name?: string | null;
};

export function formatRaffleDrawDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" as const } : {})
  }).format(new Date(value));
}
