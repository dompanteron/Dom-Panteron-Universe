import { sendResendEmail } from "@/lib/email/resend";
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
  paid?: boolean;
};

export async function sendProductOrderEmail(input: SendProductOrderEmailInput) {
  const greeting = input.memberName ? input.memberName : "there";
  const total = formatProductPrice(input.totalPrice, input.currency);

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #111; line-height: 1.5;">
      <p>Hi ${greeting},</p>
      <p>We received your order for <strong>${input.productTitle}</strong>.</p>
      <p>Size: ${input.size} · Qty: ${input.quantity} · Total: ${total}</p>
      <p>Status: <strong>${input.paid ? "paid" : "pending"}</strong>${
        input.paid
          ? " — thank you. We will prepare your piece for shipping."
          : " — payment will be arranged separately. We will confirm when it is processed."
      }</p>
      <p><a href="${input.productUrl}">View product</a></p>
      <p>Dom Panteron Universe</p>
    </div>
  `;

  return sendResendEmail({
    to: input.to,
    subject: input.paid
      ? `Payment confirmed — ${input.productTitle}`
      : `Order received — ${input.productTitle}`,
    html
  });
}
