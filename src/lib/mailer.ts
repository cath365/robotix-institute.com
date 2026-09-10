import { getSiteUrlForMetadata } from '@/lib/site-url';

type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';

function getFromAddress() {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!fromEmail) return null;
  const fromName = process.env.RESEND_FROM_NAME?.trim() || 'Robotix Institute';
  return `${fromName} <${fromEmail}>`;
}

export function isEmailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && getFromAddress());
}

export function getOpsInboxEmail() {
  return (
    process.env.CONTACT_INBOX_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    null
  );
}

export function getAppOrigin() {
  return getSiteUrlForMetadata().href.replace(/\/$/, '');
}

async function sendEmail({ to, subject, html, text, replyTo }: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getFromAddress();

  if (!apiKey || !from) {
    throw new Error(
      'Email delivery is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to enable transactional email.'
    );
  }

  const recipients = Array.isArray(to) ? to : [to];
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html,
      text,
      reply_to: replyTo ? [replyTo] : undefined,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<{ id: string }>;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendPasswordResetEmail(args: {
  to: string;
  firstName: string;
  resetUrl: string;
  expiresInHours: number;
}) {
  const safeName = escapeHtml(args.firstName);
  const safeUrl = escapeHtml(args.resetUrl);

  return sendEmail({
    to: args.to,
    subject: 'Reset your Robotix Institute password',
    text: `Hello ${args.firstName}, use this link to reset your password: ${args.resetUrl}. This link expires in ${args.expiresInHours} hour(s).`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10213f">
        <h2 style="margin-bottom:12px;">Reset your Robotix Institute password</h2>
        <p>Hello ${safeName},</p>
        <p>We received a request to reset your password. Use the secure link below to choose a new one.</p>
        <p style="margin:24px 0;">
          <a href="${safeUrl}" style="background:#57D4FF;color:#10213f;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;">
            Reset password
          </a>
        </p>
        <p>If the button does not open, copy and paste this link into your browser:</p>
        <p><a href="${safeUrl}">${safeUrl}</a></p>
        <p>This link expires in ${args.expiresInHours} hour(s). If you did not request a reset, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOpsNotification(args: {
  subject: string;
  preheader: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const opsInbox = getOpsInboxEmail();
  if (!opsInbox) return null;

  return sendEmail({
    to: opsInbox,
    subject: args.subject,
    text: `${args.preheader}\n\n${args.text}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10213f">
        <p style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#567;">${escapeHtml(args.preheader)}</p>
        ${args.html}
        <p style="margin-top:24px;font-size:12px;color:#567;">Sent from ${escapeHtml(getAppOrigin())}</p>
      </div>
    `,
    replyTo: args.replyTo,
  });
}

export async function sendTeamInviteEmail(args: {
  to: string;
  firstName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}) {
  const safeName = escapeHtml(args.firstName);
  const safeRole = escapeHtml(args.role);
  const safeUrl = escapeHtml(args.inviteUrl);
  const expiresLabel = args.expiresAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return sendEmail({
    to: args.to,
    subject: 'You have been invited to Robotix Institute',
    text: `Hello ${args.firstName}, you have been invited as ${args.role}. Accept your invite here: ${args.inviteUrl}. This invite expires in 2 hours, at ${expiresLabel}.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10213f">
        <h2 style="margin-bottom:12px;">Robotix Institute team invitation</h2>
        <p>Hello ${safeName},</p>
        <p>You have been invited to join the Robotix Institute website team as <strong>${safeRole}</strong>.</p>
        <p style="margin:24px 0;">
          <a href="${safeUrl}" style="background:#57D4FF;color:#10213f;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;">
            Accept invitation
          </a>
        </p>
        <p>If the button does not open, copy and paste this link into your browser:</p>
        <p><a href="${safeUrl}">${safeUrl}</a></p>
        <p>This invite expires in <strong>2 hours</strong>, at ${escapeHtml(expiresLabel)}.</p>
      </div>
    `,
  });
}
