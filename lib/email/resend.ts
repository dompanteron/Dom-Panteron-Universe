export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return null;
  }
  return { apiKey, from };
}

export async function sendResendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const config = getResendConfig();
  if (!config) {
    return { sent: false as const, reason: "Email not configured" };
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.from,
      to: recipients,
      subject: input.subject,
      html: input.html
    })
  });

  if (!response.ok) {
    const text = await response.text();
    return { sent: false as const, reason: text || "Resend request failed" };
  }

  return { sent: true as const };
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim() || null;
}
