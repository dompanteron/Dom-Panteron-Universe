import type { PublicRaffle } from "@/lib/raffles";
import type { ProductLine, ProductLineHubKey } from "@/lib/shop/product-lines";
import { createClient as createServerClient } from "@/lib/supabase/server";

const publicRaffleFields =
  "id, title, subtitle, description, ticket_price, max_entries, total_entries, ticket_limit_per_user, draw_date, status, product_line";

const endedExtraFields =
  ", winner_number, winner_initials, winner_display_name";

export async function fetchActivePublicRaffles(options?: {
  productLine?: ProductLineHubKey | ProductLine | null;
}): Promise<PublicRaffle[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from("raffles")
    .select(publicRaffleFields)
    .eq("status", "active")
    .order("draw_date", { ascending: true });

  if (options && "productLine" in options) {
    const line = options.productLine;
    if (line === null) {
      query = query.is("product_line", null);
    } else {
      query = query.eq("product_line", line);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as unknown as PublicRaffle[];
}

export async function fetchEndedPublicRaffles(options?: {
  limit?: number;
  productLine?: ProductLineHubKey | ProductLine | null;
}): Promise<PublicRaffle[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from("raffles")
    .select(publicRaffleFields + endedExtraFields)
    .eq("status", "ended")
    .order("draw_date", { ascending: false })
    .limit(options?.limit ?? 12);

  if (options && "productLine" in options) {
    const line = options.productLine;
    if (line === null) {
      query = query.is("product_line", null);
    } else {
      query = query.eq("product_line", line);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as unknown as PublicRaffle[];
}
