import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "ForgeKit <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set; skipping "${subject}" → ${to}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

function layout(title: string, body: string) {
  return `<!doctype html>
<html><body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#f6f6f6;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #eee">
    <h2 style="margin:0 0 16px;font-size:20px">${title}</h2>
    <div style="font-size:15px;line-height:1.6;color:#333">${body}</div>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="font-size:12px;color:#999">Sent by ForgeKit · <a href="${APP_URL}" style="color:#999">${APP_URL}</a></p>
  </div>
</body></html>`;
}

export async function sendWelcomeEmail(to: string, name: string) {
  await send(
    to,
    "Welcome to ForgeKit",
    layout(
      `Welcome, ${name}!`,
      `<p>Your account is ready. Head to your <a href="${APP_URL}/dashboard">dashboard</a> to start chatting.</p>`,
    ),
  );
}

export async function sendSubscriptionChangedEmail(to: string, message: string) {
  await send(
    to,
    "Your ForgeKit subscription changed",
    layout(
      "Subscription update",
      `<p>${message}</p><p>Manage your plan any time from <a href="${APP_URL}/dashboard/billing">Billing</a>.</p>`,
    ),
  );
}

export async function sendUsageThresholdEmail(
  to: string,
  used: number,
  threshold: number,
) {
  await send(
    to,
    "ForgeKit usage alert",
    layout(
      "You've crossed your usage threshold",
      `<p>This month's usage is <strong>${used.toLocaleString()}</strong> units, past your alert threshold of ${threshold.toLocaleString()}.</p>
       <p>Review details on the <a href="${APP_URL}/dashboard/usage">usage page</a> or adjust your plan in <a href="${APP_URL}/dashboard/billing">Billing</a>.</p>`,
    ),
  );
}
