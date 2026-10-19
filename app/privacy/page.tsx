import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/LegalProse";
import { buildShareMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = buildShareMetadata({
  title: "Privacy",
  description: "How Dom Panteron Universe handles your data for membership, shop, raffles, and email.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-24 sm:pt-28">
          <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Legal</p>
          <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">Privacy policy</h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: October 2025</p>

          <div className="mt-12">
            <LegalSection title="Who we are">
              <p>
                Dom Panteron Universe (&quot;we&quot;, &quot;us&quot;) operates this website for clothing,
                music, member raffles, and related services. This policy explains what personal data we
                collect and why.
              </p>
            </LegalSection>

            <LegalSection title="Data we collect">
              <p>
                <strong className="text-white">Account:</strong> email address, password (stored securely
                by our auth provider), and optional display name when you join.
              </p>
              <p>
                <strong className="text-white">Shop orders:</strong> name, email, shipping address, size,
                and order details needed to fulfil ready-made product purchases.
              </p>
              <p>
                <strong className="text-white">Raffles:</strong> membership link, entry quantities, and
                payment records for paid draws.
              </p>
              <p>
                <strong className="text-white">Payments:</strong> we do not store full card numbers.
                SumUp and/or PayPal process payments under their own privacy policies.
              </p>
            </LegalSection>

            <LegalSection title="Email">
              <p>
                We send transactional email (order confirmations, raffle entry confirmations, password
                resets) via our email provider. If you contact us or join the universe, we may send
                updates about drops and draws. You can ask us to stop non-essential marketing at any
                time.
              </p>
            </LegalSection>

            <LegalSection title="Cookies and sessions">
              <p>
                We use essential cookies and local storage to keep you signed in and to complete
                checkout flows (for example returning from a payment page). We do not use third-party
                advertising trackers on this site.
              </p>
            </LegalSection>

            <LegalSection title="How long we keep data">
              <p>
                We retain account and order data for as long as needed to run the service, comply with
                law, and resolve disputes. You may request deletion of your account subject to legal
                and accounting requirements for past orders.
              </p>
            </LegalSection>

            <LegalSection title="Your rights">
              <p>
                Depending on where you live (including the EU/EEA under GDPR), you may have rights to
                access, correct, delete, or restrict use of your personal data, and to object to
                certain processing. Contact us to exercise these rights.
              </p>
            </LegalSection>

            <LegalSection title="Contact">
              <p>
                For privacy questions, use the contact details published on this site or the admin
                email configured for order and raffle notifications.
              </p>
            </LegalSection>
          </div>

          <p className="mt-12 text-sm text-zinc-500">
            See also our{" "}
            <Link href="/terms" className="text-panteron-violet hover:text-white">
              Terms of use
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
