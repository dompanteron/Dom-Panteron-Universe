import { getPaymentHealthSnapshot } from "@/lib/payments/payment-health";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`}
      aria-hidden
    />
  );
}

export default function AdminPaymentStatus() {
  const health = getPaymentHealthSnapshot();

  return (
    <div className="mt-16 border border-white/10 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">Payments</p>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">Checkout status</h2>
      <p className="mt-2 text-sm text-zinc-400">
        From Vercel env on this deployment. Public check:{" "}
        <a
          href="/api/health/payments"
          className="text-panteron-violet hover:text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          /api/health/payments
        </a>
      </p>

      <ul className="mt-6 space-y-3 text-sm">
        <li className="flex items-center gap-3 text-zinc-300">
          <StatusDot ok={health.sumup} />
          SumUp (card) — {health.sumup ? "configured" : "missing SUMUP_API_KEY + SUMUP_MERCHANT_CODE"}
        </li>
        <li className="flex items-center gap-3 text-zinc-300">
          <StatusDot ok={health.paypal} />
          PayPal —{" "}
          {health.paypal
            ? `configured (${health.paypalEnv ?? "unknown env"})`
            : "missing NEXT_PUBLIC_PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET"}
        </li>
        <li className="flex items-center gap-3 text-zinc-300">
          <StatusDot ok={health.paypalWebhookConfigured} />
          PayPal webhook —{" "}
          {health.paypalWebhookConfigured
            ? "PAYPAL_WEBHOOK_ID set"
            : "recommended for Production (PAYPAL_WEBHOOK_ID)"}
        </li>
        <li className="flex items-center gap-3 text-zinc-300">
          <StatusDot ok={health.checkoutLive} />
          Store checkout — {health.checkoutLive ? "live (paid flow enabled)" : "manual pending only"}
        </li>
      </ul>

      <div className="mt-8 space-y-2 text-xs text-zinc-500">
        <p>Register webhooks at your provider using site URL: {health.siteUrl}</p>
        <p>
          SumUp: <code className="text-zinc-400">{health.webhookUrls.sumup}</code>
        </p>
        <p>
          PayPal: <code className="text-zinc-400">{health.webhookUrls.paypal}</code>
        </p>
      </div>
    </div>
  );
}
