import { REALM_ACCENT_CLASSES } from "@/lib/shop/realm-ui";
import type { RealmAccent } from "@/lib/shop/types";

export default function RealmHeroAtmosphere({
  accent,
  hasHeroImage
}: {
  accent: RealmAccent;
  hasHeroImage: boolean;
}) {
  const classes = REALM_ACCENT_CLASSES[accent];

  return (
    <>
      <div
        aria-hidden
        className={`home-haze absolute -right-1/4 top-0 h-[55%] w-[55%] rounded-full blur-3xl ${classes.glow}`}
      />
      <div
        aria-hidden
        className="home-haze-delayed absolute -left-1/4 bottom-0 h-[45%] w-[45%] rounded-full bg-panteron-violet/10 blur-3xl"
      />
      {!hasHeroImage ? (
        <>
          <div
            aria-hidden
            className={`absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-2xl opacity-30 ${classes.glow}`}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]"
          />
        </>
      ) : null}
    </>
  );
}
