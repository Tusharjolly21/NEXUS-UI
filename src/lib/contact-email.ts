/**
 * Builds the notification email sent to the support inbox when someone uses the contact form.
 *
 * Email clients ignore most CSS, so this is a table layout with inline styles. Every value that
 * comes from the visitor is escaped before it goes into the HTML.
 */

const SITE = "https://www.nexus-ui.com";
const LOGO = `${SITE}/nexus-ui-logo.png`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Keep line breaks out of one-line fields (subject, mailto subject) so a name can never add headers. */
export function oneLine(v: string): string {
  return v.replace(/[\r\n]+/g, " ").trim();
}

export type ContactEmailInput = {
  name: string;
  email: string;
  topic?: string;
  message: string;
  /** When the message was received. Defaults to now. */
  receivedAt?: Date;
};

export function buildContactEmail({ name, email, topic, message, receivedAt = new Date() }: ContactEmailInput) {
  const subject = `New contact from ${oneLine(name)}${topic ? ` @ ${oneLine(topic)}` : ""}`;

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeTopic = topic ? escapeHtml(topic) : "";
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  const when =
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(receivedAt) + " UTC";

  const replyHref = escapeHtml(
    `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: your message to Nexus UI`)}`,
  );

  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f7;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;font-family:${font};">
      <tr><td style="padding:0 4px 16px 4px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="vertical-align:middle;padding-right:10px;"><img src="${LOGO}" width="32" height="32" alt="Nexus UI" style="display:block;border:0;border-radius:8px;" /></td>
          <td style="vertical-align:middle;font-size:15px;font-weight:600;color:#1d1d1f;">Nexus UI</td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:20px;padding:28px 28px 24px 28px;box-shadow:0 0 0 1px rgba(0,0,0,0.05);">
        <div style="font-size:13px;color:#6e6e73;line-height:18px;">New message from the contact form</div>
        <div style="font-size:24px;font-weight:600;color:#1d1d1f;line-height:30px;letter-spacing:-0.4px;margin-top:6px;">${safeName}</div>
        <div style="font-size:15px;line-height:22px;margin-top:2px;"><a href="mailto:${safeEmail}" style="color:#0071e3;text-decoration:none;">${safeEmail}</a></div>
        ${
          safeTopic
            ? `<div style="margin-top:14px;"><span style="display:inline-block;background:#f5f5f7;color:#1d1d1f;font-size:13px;line-height:18px;padding:4px 12px;border-radius:999px;">${safeTopic}</span></div>`
            : ""
        }
        <div style="height:1px;background:#e8e8ed;line-height:1px;font-size:1px;margin:22px 0;">&nbsp;</div>
        <div style="font-size:16px;line-height:25px;color:#1d1d1f;word-break:break-word;">${safeMessage}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;"><tr>
          <td style="background:#0071e3;border-radius:999px;"><a href="${replyHref}" style="display:inline-block;padding:11px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Reply to ${safeName}</a></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px 8px 0 8px;font-size:12px;line-height:18px;color:#86868b;text-align:center;">
        Received ${when}. Replies to this email go straight to ${safeEmail}.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  // A plain-text copy helps deliverability and reads in any mail client.
  const text = `New message from the contact form\n\nName: ${name}\nEmail: ${email}\n${topic ? `Topic: ${topic}\n` : ""}Received: ${when}\n\n${message}\n`;

  return { subject, html, text };
}
