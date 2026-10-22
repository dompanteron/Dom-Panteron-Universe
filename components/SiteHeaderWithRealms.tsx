import SiteHeader from "@/components/SiteHeader";
import { getActiveRealms } from "@/lib/shop/realms";
import type { RealmRow } from "@/lib/shop/types";

export default async function SiteHeaderWithRealms() {
  let shopRealms: RealmRow[] = [];
  try {
    shopRealms = await getActiveRealms();
  } catch {
    shopRealms = [];
  }
  return <SiteHeader shopRealms={shopRealms} />;
}
