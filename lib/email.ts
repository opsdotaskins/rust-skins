import "server-only";
import nodemailer from "nodemailer";
import { SITE, COMPANY, CONTACT_EMAIL } from "./config";

interface Attachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

export async function sendEmail({ to, subject, html, attachments }: SendArgs) {
  const from = process.env.SMTP_FROM || `${SITE.name} <${CONTACT_EMAIL}>`;
  const transport = getTransport();
  if (!transport) {
    // Dev fallback: no SMTP configured — log instead of failing.
    console.log("\n──── EMAIL (dev, not sent) ────");
    console.log("To:", to);
    console.log("Subject:", subject);
    if (attachments?.length) {
      console.log("Attachments:", attachments.map((a) => a.filename).join(", "));
    }
    console.log("───────────────────────────────\n");
    return { delivered: false as const };
  }
  await transport.sendMail({ from, to, subject, html, attachments });
  return { delivered: true as const };
}

function shell(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#0B1512;font-family:Inter,Arial,sans-serif;color:#EFEAD8;padding:32px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#122019;border:1px solid #25382E;border-radius:12px;overflow:hidden">
    <tr><td style="padding:24px 28px;border-bottom:1px solid #25382E">
      <span style="font-size:20px;font-weight:700;letter-spacing:0.04em;color:#E8B44A">RUNEVAULT</span>
      <span style="display:block;font-size:12px;color:#8FA093;margin-top:4px">${title}</span>
    </td></tr>
    <tr><td style="padding:28px;line-height:1.6;font-size:15px">${inner}</td></tr>
    <tr><td style="padding:20px 28px;border-top:1px solid #25382E;font-size:12px;color:#8FA093">
      ${COMPANY.name} · ${COMPANY.address} · Reg ${COMPANY.regNumber}<br/>
      Need help? ${CONTACT_EMAIL} · Support ${"24/7"}<br/>
      Runevault is not affiliated with or endorsed by Facepunch Studios or Valve Corporation. Rust is a trademark of Facepunch Studios.
    </td></tr>
  </table></body></html>`;
}

export function registrationConfirmationEmail(name: string, verifyUrl: string) {
  return shell(
    "Welcome to the vault",
    `<h1 style="font-size:20px;margin:0 0 12px">Welcome, ${escapeHtml(name)}.</h1>
     <p style="color:#8FA093;margin:0 0 20px">Your Runevault account is ready. Confirm your email to unlock instant delivery on every relic.</p>
     <p><a href="${verifyUrl}" style="display:inline-block;background:#E8B44A;color:#0B1512;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:8px">Confirm email</a></p>
     <p style="color:#8FA093;font-size:13px;margin-top:20px">If the button doesn't work, paste this link:<br/><span style="color:#2FA98C">${verifyUrl}</span></p>`
  );
}

export function passwordResetEmail(name: string, resetUrl: string) {
  return shell(
    "Reset your password",
    `<h1 style="font-size:20px;margin:0 0 12px">Password reset</h1>
     <p style="color:#8FA093;margin:0 0 20px">Hi ${escapeHtml(name)}, we received a request to reset your Runevault password. This link expires in 60 minutes.</p>
     <p><a href="${resetUrl}" style="display:inline-block;background:#E8B44A;color:#0B1512;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:8px">Set a new password</a></p>
     <p style="color:#8FA093;font-size:13px;margin-top:20px">Didn't request this? You can safely ignore this email.<br/><span style="color:#2FA98C">${resetUrl}</span></p>`
  );
}

export function orderConfirmationEmail(
  name: string,
  reference: string,
  total: string,
  lines: { name: string; price: string }[]
) {
  const rows = lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #25382E">${escapeHtml(
          l.name
        )}</td><td style="padding:8px 0;border-bottom:1px solid #25382E;text-align:right;font-family:monospace;color:#E8B44A">${l.price}</td></tr>`
    )
    .join("");
  return shell(
    `Order ${reference} confirmed`,
    `<h1 style="font-size:20px;margin:0 0 12px">Thank you, ${escapeHtml(name)}.</h1>
     <p style="color:#8FA093;margin:0 0 20px">Your relics have been delivered instantly to your inventory. Your invoice is attached as a PDF.</p>
     <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">${rows}
       <tr><td style="padding:12px 0;font-weight:700">Total</td><td style="padding:12px 0;text-align:right;font-family:monospace;font-weight:700;color:#E8B44A">${total}</td></tr>
     </table>`
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
