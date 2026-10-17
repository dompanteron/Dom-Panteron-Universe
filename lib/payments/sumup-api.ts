export type SumUpCheckout = {
  id: string;
  status?: string;
  checkout_reference?: string;
  hosted_checkout_url?: string;
  amount?: number;
  currency?: string;
};

export async function createSumUpHostedCheckout(input: {
  apiKey: string;
  merchantCode: string;
  amount: number;
  currency: string;
  checkoutReference: string;
  description: string;
  redirectUrl: string;
  returnUrl: string;
}) {
  const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`
    },
    body: JSON.stringify({
      merchant_code: input.merchantCode,
      amount: input.amount,
      currency: input.currency,
      checkout_reference: input.checkoutReference,
      description: input.description.slice(0, 140),
      redirect_url: input.redirectUrl,
      return_url: input.returnUrl,
      hosted_checkout: { enabled: true }
    })
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      (data.error_message as string) ||
      (data.message as string) ||
      (data.error as string) ||
      "SumUp checkout failed";
    throw new Error(message);
  }

  const checkout = data as SumUpCheckout;
  if (!checkout.id || !checkout.hosted_checkout_url) {
    throw new Error("Invalid SumUp checkout response");
  }

  return checkout;
}

export async function fetchSumUpCheckout(apiKey: string, checkoutId: string) {
  const response = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  const data = (await response.json().catch(() => ({}))) as SumUpCheckout & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Could not load checkout");
  }

  return data;
}
