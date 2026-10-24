"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buildShopNavLinks } from "@/lib/shop/realm-nav-links";
import { productLineHubs } from "@/lib/shop/product-lines";
import type { RealmRow } from "@/lib/shop/types";

function shopSectionActive(pathname: string) {
  if (
    pathname.startsWith("/shop") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/products")
  ) {
    return true;
  }
  return productLineHubs.some((hub) => pathname === hub.path || pathname.startsWith(`${hub.path}/`));
}

export default function SiteHeaderShopNav({
  variant,
  shopRealms = []
}: {
  variant: "desktop" | "mobile";
  shopRealms?: RealmRow[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = shopSectionActive(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (variant !== "desktop" || !open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, variant]);

  const realmLinks = buildShopNavLinks(shopRealms);

  if (variant === "mobile") {
    return (
      <div className="border-b border-white/5 pb-2">
        <p className="px-2 py-2 text-xs uppercase tracking-[0.25em] text-zinc-500">Shop</p>
        <Link
          href="/shop"
          className={`block px-2 py-2 text-base transition ${
            pathname === "/shop" ? "text-panteron-violet" : "text-zinc-300"
          }`}
        >
          All realms
        </Link>
        <Link
          href="/collections"
          className={`block px-2 py-2 text-base transition ${
            pathname.startsWith("/collections") ? "text-panteron-violet" : "text-zinc-300"
          }`}
        >
          All collections
        </Link>
        {realmLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`block px-2 py-2 pl-4 text-base transition ${
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? "text-panteron-violet"
                : "text-zinc-300"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1 text-sm tracking-wide transition ${
          active ? "text-panteron-violet" : "text-zinc-300 hover:text-white"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        Shop
        <span aria-hidden className="text-[0.65rem] opacity-70">
          ▾
        </span>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-[100] mt-2 max-h-[min(70vh,24rem)] min-w-[12rem] overflow-y-auto border border-white/10 bg-panteron-black py-2 shadow-xl">
          <Link
            href="/shop"
            className="block px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            All realms
          </Link>
          <Link
            href="/collections"
            className="block px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            All collections
          </Link>
          <div className="my-2 border-t border-white/10" />
          {realmLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="block px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
