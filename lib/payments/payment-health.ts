import { getPaymentOptionsForUi } from "@/lib/payments/payment-providers";
import { getPayPalCredentials } from "@/lib/payments/paypal-config";
import { getSiteUrl } from "@/lib/site-url";

export function getPaymentHealthSnapshot() {
  const options = getPaymentOptionsForUi();
  const paypal = getPayPalCredentials();
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  const siteUrl = getSiteUrl();

  return {
    siteUrl,
    sumup: options.sumup,
    paypal: options.paypal,
    checkoutLive: options.any,
    paypalEnv: paypal ? (paypal.sandbox ? "sandbox" : "live") : null,
    paypalWebhookConfigured: Boolean(webhookId),
    webhookUrls: {
      sumup: `${siteUrl}/api/webhooks/sumup`,
      paypal: `${siteUrl}/api/webhooks/paypal`
    }
  };
}
