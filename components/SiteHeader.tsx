"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminMenu from "@/components/AdminMenu";
import SiteHeaderShopNav from "@/components/SiteHeaderShopNav";
import { useCurrentMember } from "@/components/useCurrentMember";
import { mainNav } from "@/lib/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { member } = useCurrentMember();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const authItem = member
    ? { href: "/account", label: "Account" }
    : { href: "/join", label: "Join" };

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-panteron-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-white transition hover:text-panteron-violet sm:text-xl"
        >
          Dom Panteron
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {mainNav.map((item) => {
            if (item.href === "/join") {
              return (
                <Link
                  key={authItem.href}
                  href={authItem.href}
                  className="rounded-sm bg-panteron-purple px-4 py-2 text-sm font-medium text-white transition hover:bg-panteron-violet"
                >
                  {authItem.label}
                </Link>
              );
            }

            if ("shopMenu" in item && item.shopMenu) {
              return <SiteHeaderShopNav key={item.href} variant="desktop" />;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm tracking-wide transition ${
                  isActive(item.href)
                    ? "text-panteron-violet"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {member?.role === "admin" ? <AdminMenu variant="desktop" /> : null}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-white/10 bg-panteron-black md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4" aria-label="Mobile">
          {mainNav.map((item) => {
            if (item.href === "/join") {
              return (
                <Link
                  key={authItem.href}
                  href={authItem.href}
                  className="mt-2 rounded-sm bg-panteron-purple px-2 py-3 text-center text-base font-medium text-white"
                >
                  {authItem.label}
                </Link>
              );
            }

            if ("shopMenu" in item && item.shopMenu) {
              return <SiteHeaderShopNav key={item.href} variant="mobile" />;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-3 text-base transition ${
                  isActive(item.href) ? "text-panteron-violet" : "text-zinc-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {member?.role === "admin" ? (
            <div className="mt-4 px-2">
              <AdminMenu variant="mobile" />
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
