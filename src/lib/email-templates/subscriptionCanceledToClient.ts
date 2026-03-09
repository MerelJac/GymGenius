// src/lib/email-templates/subscriptionCanceledToClient.ts
import { sendEmail } from "./config";

export async function subscriptionCanceledToClient(
  to: string,
  userName: string,
) {
  const appUrl = process.env.APP_URL || "";
  const billingUrl = `${appUrl}/billing`;

  return sendEmail({
    to,
    subject: `Your subscription has been canceled`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Your subscription has been canceled 😔</h2>
        <p>Hi ${userName},</p>
        <p>Your Dialed Fitness subscription has been canceled and your access has ended.</p>
        <p>If this was a mistake or you'd like to come back, you can resubscribe anytime.</p>
        <p>
          <a href="${billingUrl}"
             style="display:inline-block; background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
            Resubscribe
          </a>
        </p>
        <p style="font-size: 0.9rem; color: #888;">Your workout history and data will be waiting for you if you return.</p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Dialed Fitness Club</p>
      </div>
    `,
    text: `Hi ${userName}, your Dialed Fitness subscription has been canceled. Resubscribe here: ${billingUrl}`,
  });
}