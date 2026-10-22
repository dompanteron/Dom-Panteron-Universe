import type { RealmRow } from "@/lib/shop/types";

export type RealmEmptyContent = {
  headline: string;
  body: string;
  hint: string;
};

const BY_SLUG: Partial<Record<string, RealmEmptyContent>> = {
  art: {
    headline: "The canvas is opening",
    body:
      "Prints, originals, and visual drops from the jungle — collected in limited runs for people who feel color as frequency.",
    hint: "First art collection lands here. Join to hear when the gate opens."
  },
  jewelry: {
    headline: "Marks of belonging",
    body:
      "Subtle power for ceremony and everyday — pieces that say you move with the circle without shouting.",
    hint: "Adornments are being forged. Members get first word on the drop."
  },
  fashion: {
    headline: "The next fit is forming",
    body:
      "Ready-made streetwear with panteron presence — when a collection goes live, it appears here and on All collections.",
    hint: "Browse active drops on the collections page anytime."
  },
  champagne: {
    headline: "Bottles on the way",
    body: "Celebration releases with Dom Panteron energy — same checkout, same membership.",
    hint: "Join for launch alerts when the next pour is ready."
  },
  home: {
    headline: "HOME objects incoming",
    body: "Accents for the space you return to — calm, power, and jungle mood at home.",
    hint: "We will announce HOME drops to members first."
  },
  water: {
    headline: "Carry the signal soon",
    body: "Reusable bottles for studio, travel, and daily rhythm — identity you can hold.",
    hint: "Join to catch the next bottle drop."
  },
  music: {
    headline: "Merch meets the mix",
    body:
      "Sound lives on the music page today — when apparel or objects tie to a release, they checkout here.",
    hint: "Press play on /music while the shop shelf wakes up."
  }
};

export function realmEmptyContent(realm: Pick<RealmRow, "slug" | "name" | "kind">): RealmEmptyContent {
  return (
    BY_SLUG[realm.slug] ?? {
      headline: `${realm.name} is waking up`,
      body: "Pieces for this realm are being prepared — one account, one checkout when they land.",
      hint: "Join the universe for drop alerts."
    }
  );
}
