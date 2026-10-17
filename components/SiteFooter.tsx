import Link from "next/link";
import { ensureCurrentMember } from "@/lib/members";
import { mainNav } from "@/lib/navigation";

export default async function SiteFooter() {
  const { member } = await ensureCurrentMember();

  return (
    <footer className="border-t border-white/10 bg-panteron-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-xl text-white">Dom Panteron</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Clothing and music fused with a mission: uplift the frequency of Earth
            and every living being.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer">
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
      </div>

      <div className="border-t border-white/5">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-zinc-500">
          © {new Date().getFullYear()} Dom Panteron Universe
        </p>
      </div>
    </footer>
  );
}
