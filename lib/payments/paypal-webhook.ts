import { getPayPalCredentials, isPayPalConfigured } from "@/lib/payments/paypal-config";
import { getPayPalAccessToken } from "@/lib/payments/paypal-api";

type WebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    custom_id?: string;
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
  };
};

export async function verifyPayPalWebhookSignature(
  request: Request,
  event: unknown
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) {
    return process.env.NODE_ENV === "development";
  }

  if (!isPayPalConfigured()) {
    return false;
  }

  const creds = getPayPalCredentials();
  if (!creds) {
    return false;
  }

  const token = await getPayPalAccessToken();
  const response = await fetch(`${creds.apiBase}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      auth_algo: request.headers.get("paypal-auth-algo"),
      cert_url: request.headers.get("paypal-cert-url"),
      transmission_id: request.headers.get("paypal-transmission-id"),
      transmission_sig: request.headers.get("paypal-transmission-sig"),
      transmission_time: request.headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event
    })
  });

  const data = (await response.json().catch(() => ({}))) as {
    verification_status?: string;
  };

  return data.verification_status === "SUCCESS";
}

export function parsePayPalWebhookEvent(body: unknown): {
  eventType: string;
  paypalOrderId: string | null;
  referenceId: string | null;
} | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const event = body as WebhookEvent;
  const eventType = event.event_type?.trim();
  if (!eventType) {
    return null;
  }

  const resource = event.resource;
  const referenceId = resource?.custom_id?.trim() || null;

  if (eventType === "CHECKOUT.ORDER.APPROVED") {
    return {
      eventType,
      paypalOrderId: resource?.id?.trim() || null,
      referenceId
    };
  }

  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const orderId = resource?.supplementary_data?.related_ids?.order_id?.trim() || null;
    return {
      eventType,
      paypalOrderId: orderId,
      referenceId
    };
  }

  return null;
}
