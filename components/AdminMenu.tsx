"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adminNav } from "@/lib/navigation";

function isActiveAdminPath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(href);
}

export default function AdminMenu({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  if (variant === "mobile") {
    return (
      <div className="mt-2 border-t border-white/10 pt-3">
        <p className="px-2 pb-2 text-xs uppercase tracking-[0.25em] text-panteron-violet">
          Admin
        </p>
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-2 py-3 text-base ${
              isActiveAdminPath(pathname, item.href)
                ? "text-panteron-violet"
                : "text-zinc-300"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={`text-sm tracking-wide transition ${
          pathname.startsWith("/admin")
            ? "text-panteron-violet"
            : "text-zinc-300 hover:text-white"
        }`}
      >
        Admin
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 min-w-[12rem] border border-white/10 bg-panteron-black py-2 shadow-xl"
        >
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={`block px-4 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${
                isActiveAdminPath(pathname, item.href)
                  ? "text-panteron-violet"
                  : "text-zinc-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
