import Link from "next/link";
import { ensureCurrentMember } from "@/lib/members";
import { mainNav } from "@/lib/navigation";
import { getActiveRealms } from "@/lib/shop/realms";
import { realmShopPath } from "@/lib/shop/realm-ui";

export default async function SiteFooter() {
  const { member } = await ensureCurrentMember();
  let realms: Awaited<ReturnType<typeof getActiveRealms>> = [];
  try {
    realms = await getActiveRealms();
  } catch {
    realms = [];
  }

  return (
    <footer className="border-t border-white/10 bg-panteron-black">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-xl text-white">Dom Panteron</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Clothing and music fused with a mission: uplift the frequency of Earth and every living
            being.
          </p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Footer">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Explore</p>
          {mainNav.map((item) => {
            const href = item.href === "/join" && member ? "/account" : item.href;
            const label = item.href === "/join" && member ? "Account" : item.label;

            return (
              <Link
                key={item.href}
                href={href}
                className="text-sm text-zinc-400 transition hover:text-panteron-violet"
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {realms.length > 0 ? (
          <nav className="flex flex-col gap-2" aria-label="Shop realms">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Realms</p>
            <Link
              href="/shop"
              className="text-sm text-zinc-400 transition hover:text-panteron-violet"
            >
              All realms
            </Link>
            {realms.map((realm) => (
              <Link
                key={realm.id}
                href={realmShopPath(realm.slug)}
                className="text-sm text-zinc-400 transition hover:text-panteron-violet"
              >
                {realm.name}
              </Link>
            ))}
          </nav>
        ) : null}

        <nav className="flex flex-col gap-2" aria-label="Legal">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Legal</p>
          <Link href="/privacy" className="text-sm text-zinc-400 transition hover:text-panteron-violet">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-zinc-400 transition hover:text-panteron-violet">
            Terms
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Dom Panteron Universe
          </p>
        </div>
      </div>
    </footer>
  );
}
