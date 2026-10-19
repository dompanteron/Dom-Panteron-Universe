function normalizeOrigin(url: string) {
  return url.replace(/\/$/, "");
}

function isLocalhostOrigin(value: string) {
  try {
    const withProtocol = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
    const hostname = new URL(withProtocol).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Canonical site origin for emails, auth redirects, and Open Graph. */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fromApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const vercel = process.env.VERCEL_URL?.trim();
  const vercelOrigin = vercel ? normalizeOrigin(`https://${vercel}`) : null;

  const envCandidate = fromEnv || fromApp;
  if (envCandidate && !isLocalhostOrigin(envCandidate)) {
    return normalizeOrigin(envCandidate);
  }

  if (vercelOrigin) {
    return vercelOrigin;
  }

  if (envCandidate) {
    return normalizeOrigin(envCandidate);
  }

  return "http://localhost:3000";
}
