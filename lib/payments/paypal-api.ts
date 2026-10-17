import { getPayPalCredentials } from "@/lib/payments/paypal-config";

type PayPalLink = { href: string; rel: string; method?: string };

export type PayPalOrder = {
  id: string;
  status: string;
  links?: PayPalLink[];
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function formatAmount(amount: number) {
  return amount.toFixed(2);
}

async function getAccessToken() {
  const creds = getPayPalCredentials();
  if (!creds) {
    throw new Error("PayPal is not configured");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const response = await fetch(`${creds.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "PayPal auth failed");
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000
  };

  return data.access_token;
}

export async function createPayPalCheckoutOrder(input: {
  referenceId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const creds = getPayPalCredentials();
  if (!creds) {
    throw new Error("PayPal is not configured");
  }

  const token = await getAccessToken();
  const response = await fetch(`${creds.apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.referenceId,
          custom_id: input.referenceId,
          description: input.description.slice(0, 127),
          amount: {
            currency_code: input.currency.toUpperCase(),
            value: formatAmount(input.amount)
          }
        }
      ],
      application_context: {
        brand_name: "Dom Panteron Universe",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl
      }
    })
  });

  const order = (await response.json().catch(() => ({}))) as PayPalOrder & {
    message?: string;
    details?: { description?: string }[];
  };

  if (!response.ok || !order.id) {
    const detail = order.details?.[0]?.description || order.message;
    throw new Error(detail || "PayPal order creation failed");
  }

  const approveUrl = order.links?.find((link) => link.rel === "approve")?.href;
  if (!approveUrl) {
    throw new Error("PayPal approve URL missing");
  }

  return { orderId: order.id, approveUrl };
}

export async function fetchPayPalOrder(paypalOrderId: string) {
  const creds = getPayPalCredentials();
  if (!creds) {
    throw new Error("PayPal is not configured");
  }

  const token = await getAccessToken();
  const response = await fetch(`${creds.apiBase}/v2/checkout/orders/${paypalOrderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const order = (await response.json().catch(() => ({}))) as PayPalOrder & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(order.message || "Could not load PayPal order");
  }

  return order;
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const creds = getPayPalCredentials();
  if (!creds) {
    throw new Error("PayPal is not configured");
  }

  const token = await getAccessToken();
  const response = await fetch(
    `${creds.apiBase}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  const data = (await response.json().catch(() => ({}))) as PayPalOrder & {
    message?: string;
    details?: { description?: string }[];
  };

  if (!response.ok) {
    const detail = data.details?.[0]?.description || data.message;
    throw new Error(detail || "PayPal capture failed");
  }

  return data;
}
