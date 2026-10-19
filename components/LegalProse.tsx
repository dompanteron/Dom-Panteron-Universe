import type { ReactNode } from "react";

export function LegalSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/10 py-10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-lg leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}
