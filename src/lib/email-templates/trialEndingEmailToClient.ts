// src/lib/email-templates/trialEndingEmail.ts
import { sendEmail } from "./config";

export async function trialEndingEmailToClient(
  to: string,
  userName: string,
  trialEndsAt: Date,
) {
  const appUrl = process.env.APP_URL || "";
  const billingUrl = `${appUrl}/billing`;

  return sendEmail({
    to,
    subject: `Your trial has ended.`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Your trial has ended. ⏳</h2>
        <p>Hi ${userName},</p>
        <p>Your free trial expired on <strong>${trialEndsAt.toLocaleDateString()}</strong>.</p>
        <p>Upgrade now to keep access to all your workouts, programs, and progress tracking.</p>
        <p>
          <a href="${billingUrl}"
             style="display:inline-block; background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
            Upgrade Now
          </a>
        </p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Dialed Fitness Club</p>
      </div>
    `,
    text: `Your trial expired on ${trialEndsAt.toLocaleDateString()}. Upgrade here: ${billingUrl}`,
  });
}