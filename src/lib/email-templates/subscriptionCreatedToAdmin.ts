// src/lib/email-templates/subscriptionCreatedToAdmin.ts
import { sendEmail } from "./config";

export async function subscriptionCreatedToAdmin(
  to: string,
  userName: string,
  userEmail: string,
  plan: string,
) {
  const appUrl = process.env.APP_URL || "";

  return sendEmail({
    to,
    subject: `New subscription — ${userName}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>New subscription activated 💳</h2>
        <p>A user just subscribed to Dialed Fitness.</p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #eee; color: #888;">Name</td>
            <td style="padding: 8px; border: 1px solid #eee;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee; color: #888;">Email</td>
            <td style="padding: 8px; border: 1px solid #eee;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee; color: #888;">Plan</td>
            <td style="padding: 8px; border: 1px solid #eee;">${plan}</td>
          </tr>
        </table>
        <p>
          <a href="${appUrl}/trainer"
             style="display:inline-block; background:#ff6a00; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none;">
            View Dashboard
          </a>
        </p>
        <br/>
        <p style="font-size: 0.9rem; color: #888;">— Dialed Fitness Club</p>
      </div>
    `,
    text: `New subscription: ${userName} (${userEmail}) just subscribed to ${plan}.`,
  });
}