import { formatProductPrice } from "@/lib/shop/format-price";
import { getAdminEmail, sendResendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site-url";

function esc(value: string) {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyAdminShopOrder(input: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  size: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  paid: boolean;
  shippingSummary?: string;
}) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return { sent: false as const, reason: "ADMIN_EMAIL not set" };
  }

  const total = formatProductPrice(input.totalPrice, input.currency);
  const adminUrl = `${getSiteUrl()}/admin/orders/${input.orderId}`;

  return sendResendEmail({
    to: adminEmail,
    subject: `[Dom Panteron] ${input.paid ? "Paid" : "New"} shop order — ${input.productTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; color: #111; line-height: 1.5;">
        <p><strong>${input.paid ? "Payment received" : "New order request"}</strong></p>
        <p>${esc(input.productTitle)} · ${esc(input.size)} × ${input.quantity} · ${total}</p>
        <p>Customer: ${esc(input.customerName)} &lt;${esc(input.customerEmail)}&gt;</p>
        ${input.shippingSummary ? `<p>Ship to: ${esc(input.shippingSummary)}</p>` : ""}
        <p><a href="${adminUrl}">Open in admin</a></p>
      </div>
    `
  });
}

export async function notifyAdminRaffleEntry(input: {
  memberName: string | null;
  memberEmail: string;
  raffleTitle: string;
  quantity: number;
  yourTotalEntries: number;
  raffleId: string;
}) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return { sent: false as const, reason: "ADMIN_EMAIL not set" };
  }

  const adminUrl = `${getSiteUrl()}/admin/raffles/${input.raffleId}`;

  return sendResendEmail({
    to: adminEmail,
    subject: `[Dom Panteron] Raffle entry — ${input.raffleTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; color: #111; line-height: 1.5;">
        <p><strong>New raffle entries</strong></p>
        <p>${esc(input.raffleTitle)}</p>
        <p>${esc(input.memberName || "Member")} &lt;${esc(input.memberEmail)}&gt; added ${input.quantity} (total ${input.yourTotalEntries}).</p>
        <p><a href="${adminUrl}">Open in admin</a></p>
      </div>
    `
  });
}
