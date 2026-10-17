export function isPayPalConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim()
  );
}

export function getPayPalCredentials() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  const envFlag = process.env.PAYPAL_ENV?.trim().toLowerCase();
  let sandbox = clientId.toLowerCase().includes("sandbox") || clientId.startsWith("sb");
  if (envFlag === "sandbox") {
    sandbox = true;
  } else if (envFlag === "live") {
    sandbox = false;
  }

  const apiBase = sandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

  return { clientId, clientSecret, apiBase, sandbox };
}
