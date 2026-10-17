import { sendResendEmail } from "@/lib/email/resend";
import { formatRaffleDrawDate } from "@/lib/raffles";

type SendRaffleEntryEmailInput = {
  to: string;
  memberName: string | null;
  raffleTitle: string;
  drawDate: string;
  quantity: number;
  yourTotalEntries: number;
  raffleUrl: string;
};

export async function sendRaffleEntryEmail(input: SendRaffleEntryEmailInput) {
  const greeting = input.memberName ? input.memberName : "there";
  const subject = `You're in — ${input.raffleTitle}`;
  const html = `
    <div style="font-family: system-ui, sans-serif; color: #111; line-height: 1.5;">
      <p>Hi ${greeting},</p>
      <p>You added <strong>${input.quantity}</strong> entr${input.quantity === 1 ? "y" : "ies"} to <strong>${input.raffleTitle}</strong>.</p>
      <p>You now have <strong>${input.yourTotalEntries}</strong> entr${input.yourTotalEntries === 1 ? "y" : "ies"} in this draw.</p>
      <p>Draw: ${formatRaffleDrawDate(input.drawDate, true)}</p>
      <p>No payment was taken yet — this confirms your place in the circle.</p>
      <p><a href="${input.raffleUrl}">View the draw</a></p>
      <p>Dom Panteron Universe</p>
    </div>
  `;

  return sendResendEmail({ to: input.to, subject, html });
}
