import { formatProductPrice } from "@/lib/shop/format-price";

type SendProductOrderEmailInput = {
  to: string;
  memberName: string | null;
  productTitle: string;
  size: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  productUrl: string;
};

export async function sendProductOrderEmail(input: SendProductOrderEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false as const, reason: "Email not configured" };
  }

  const greeting = input.memberName ? input.memberName : "there";
  const total = formatProductPrice(input.totalPrice, input.currency);

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #111; line-height: 1.5;">
      <p>Hi ${greeting},</p>
      <p>We received your order request for <strong>${input.productTitle}</strong>.</p>
      <p>Size: ${input.size} · Qty: ${input.quantity} · Total: ${total}</p>
      <p>Status: <strong>pending</strong> — payment will be arranged separately. We will confirm when it is processed.</p>
      <p><a href="${input.productUrl}">View product</a></p>
      <p>Dom Panteron Universe</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Order received — ${input.productTitle}`,
      html
    })
  });

  if (!response.ok) {
    const text = await response.text();
    return { sent: false as const, reason: text || "Resend request failed" };
  }

  return { sent: true as const };
}
