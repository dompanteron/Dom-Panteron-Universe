import Link from "next/link";

const steps = [
  {
    title: "Realms copy & heroes",
    detail: "Taglines, descriptions, and hero images for each /shop realm.",
    href: "/admin/realms"
  },
  {
    title: "Collections per realm",
    detail: "Assign every drop to a realm; covers, checkout rules, reveal times.",
    href: "/admin/collections"
  },
  {
    title: "Products + specs",
    detail: "Photos, prices, line-specific attributes; stock for bottles and limited runs.",
    href: "/admin/products"
  },
  {
    title: "Realm raffles",
    detail: "Tag draws with product line so they show on the matching realm hub.",
    href: "/admin/raffles"
  },
  {
    title: "Payments & webhooks",
    detail: "SumUp/PayPal on Production; PayPal webhook ID for paid orders.",
    href: "https://vercel.com/docs/projects/environment-variables"
  },
  {
    title: "Supabase auth URLs",
    detail: "Site URL + /auth/callback for your live Vercel domain.",
    href: "https://supabase.com/dashboard"
  }
] as const;

export default function AdminLaunchChecklist() {
  return (
    <div className="mt-16 border border-white/10 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Go live</p>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">Launch checklist</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Code and database are ready — finish these in admin and your host dashboards.
      </p>
      <ol className="mt-8 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="font-display mt-0.5 text-lg text-panteron-violet">{index + 1}</span>
            <div>
              <p className="font-medium text-white">{step.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{step.detail}</p>
              {step.href.startsWith("http") ? (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-panteron-violet hover:text-white"
                >
                  Open docs →
                </a>
              ) : (
                <Link
                  href={step.href}
                  className="mt-2 inline-block text-sm text-panteron-violet hover:text-white"
                >
                  Open in admin →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-xs text-zinc-500">
        Tip: on Vercel you can leave{" "}
        <code className="text-zinc-400">NEXT_PUBLIC_SITE_URL</code> unset (or set your real domain)
        — avoid <code className="text-zinc-400">localhost</code> in Production.
      </p>
    </div>
  );
}
