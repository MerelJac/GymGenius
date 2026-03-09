// src/lib/email-templates/paymentFailedToClient.ts
import { sendEmail } from "./config";

export async function paymentFailedToClient(
  to: string,
  userName: string,
) {
  const appUrl = process.env.APP_URL || "";
  const billingUrl = `${appUrl}/billing`;

  return sendEmail({
    to,
    subject: `Payment failed — action required`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>We couldn't process your payment ⚠️</h2>
        <p>Hi ${userName},</p>
        <p>Your latest payment for Dialed Fitness failed. This can happen if your card expired or had insufficient funds.</p>
        <p>Please update your payment method to keep access to your workouts and programs.</p>
        <p>
          <a href="${billingUrl}"
             style="display:inline-block; background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
            Update Payment Method
          </a>
        </p>
        <p style="font-size: 0.9rem; color: #888;">If you don't update within a few days, your account will be suspended.</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Dialed Fitness Club</p>
      </div>
    `,
    text: `Hi ${userName}, your payment failed. Update your payment method here: ${billingUrl}`,
  });
}