import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/LegalProse";
import { buildShareMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildShareMetadata({
  title: "Terms",
  description: "Terms of use for Dom Panteron Universe — membership, shop, and raffles.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-24 sm:pt-28">
          <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Legal</p>
          <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">Terms of use</h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: October 2025</p>

          <div className="mt-12">
            <LegalSection title="Using this site">
              <p>
                By using Dom Panteron Universe you agree to these terms. If you do not agree, please
                do not use the site. We may update these terms; continued use after changes means you
                accept the updated version.
              </p>
            </LegalSection>

            <LegalSection title="Membership">
              <p>
                You must provide accurate information when joining. You are responsible for keeping
                your login secure. We may suspend or remove accounts that abuse the community, attempt
                fraud, or break these terms.
              </p>
            </LegalSection>

            <LegalSection title="Shop">
              <p>
                Product listings describe ready-made pieces. Prices are shown in the currency indicated
                at checkout. A order is confirmed when payment is received (or when we confirm manual
                payment, if applicable). Shipping times and any return policy for a drop will be stated
                on the product or in order communications.
              </p>
              <p>
                One-of-one or limited items may be marked sold after purchase; duplicate orders for the
                same piece may be cancelled and refunded where payment was taken.
              </p>
            </LegalSection>

            <LegalSection title="Raffles">
              <p>
                Member raffles are promotional draws operated by Dom Panteron. Each draw has its own
                description, entry price (if any), limits, and draw date shown on the site. Entry is
                open to signed-in members unless stated otherwise.
              </p>
              <p>
                Winners are selected at random from valid entries after the draw closes. We may publish
                winner initials or first name on the site. Prizes are as described in the draw; no
                cash alternative unless we offer it in writing.
              </p>
              <p>
                You are responsible for ensuring participation is lawful in your jurisdiction. This is
                not legal advice — if in doubt, seek local guidance before entering paid draws.
              </p>
            </LegalSection>

            <LegalSection title="Payments">
              <p>
                Card and PayPal payments are processed by third-party providers. You agree to their
                terms when paying. We are not liable for failures caused by your bank, PayPal, or
                SumUp outside our reasonable control.
              </p>
            </LegalSection>

            <LegalSection title="Content and intellectual property">
              <p>
                Brand assets, music, images, and copy on this site belong to Dom Panteron or licensors.
                Do not copy or reuse them for commercial purposes without permission.
              </p>
            </LegalSection>

            <LegalSection title="Disclaimer">
              <p>
                The site is provided &quot;as is&quot;. To the fullest extent permitted by law, we are not
                liable for indirect loss, or for events outside our reasonable control. Nothing here
                limits rights you cannot waive under consumer law.
              </p>
            </LegalSection>
          </div>

          <p className="mt-12 text-sm text-zinc-500">
            See also our{" "}
            <Link href="/privacy" className="text-panteron-violet hover:text-white">
              Privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
