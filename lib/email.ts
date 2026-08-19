// Email sender using Resend REST API — no SDK dependency.
// Sign up at https://resend.com (free, 100 emails/day).
// Without a verified domain, you can only send FROM `onboarding@resend.dev`
// and only TO the email you signed up with. For this portfolio, that's
// exactly what we need — emails go to the owner's signup email.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = "https://api.resend.com/emails";

/** The email address the owner wants contact form submissions to go to. */
const OWNER_EMAIL = "davedharmay@gmail.com";

/** Sandbox sender — works without a verified domain. */
const SENDER = "Portfolio Contact <onboarding@resend.dev>";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SendResult {
  ok: boolean;
  error?: string;
}

export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY;
}

export interface NewBlogPayload {
  title: string;
  url: string;
}

export async function sendNewBlogEmail(payload: NewBlogPayload): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "email backend not configured (missing RESEND_API_KEY)" };
  }

  const text = [`New blog link submitted on your portfolio`, "", `Title: ${payload.title}`, `URL: ${payload.url}`].join(
    "\n"
  );

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #2c2418;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #3a2817;">New blog link submitted</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
      <tr>
        <td style="padding: 6px 0; font-weight: 600; width: 60px; color: #7a6346;">Title</td>
        <td style="padding: 6px 0;">${escapeHtml(payload.title)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #7a6346;">URL</td>
        <td style="padding: 6px 0;"><a href="${escapeHtml(payload.url)}">${escapeHtml(payload.url)}</a></td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to: [OWNER_EMAIL],
        subject: `[Portfolio Blog] New link: ${payload.title}`,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[blog-notify] Resend error", res.status, errBody);
      return { ok: false, error: `Resend ${res.status}: ${errBody || "unknown error"}` };
    }

    return { ok: true };
  } catch (err) {
    console.error("[blog-notify] Resend fetch error:", err);
    return { ok: false, error: "network error while sending email" };
  }
}

export async function sendContactEmail(payload: ContactPayload): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "email backend not configured (missing RESEND_API_KEY)" };
  }

  // Basic validation
  if (!payload.name.trim() || !payload.email.trim() || !payload.subject.trim() || !payload.message.trim()) {
    return { ok: false, error: "all fields are required" };
  }
  if (payload.name.length > 200 || payload.subject.length > 300 || payload.message.length > 10000) {
    return { ok: false, error: "fields exceed maximum length" };
  }
  // Simple email regex
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { ok: false, error: "invalid email address" };
  }

  const text = [
    `From: ${payload.name} <${payload.email}>`,
    `Subject: ${payload.subject}`,
    "",
    payload.message,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #2c2418;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #3a2817;">New message from your portfolio</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
      <tr>
        <td style="padding: 6px 0; font-weight: 600; width: 90px; color: #7a6346;">From</td>
        <td style="padding: 6px 0;">${escapeHtml(payload.name)} &lt;${escapeHtml(payload.email)}&gt;</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #7a6346;">Subject</td>
        <td style="padding: 6px 0;">${escapeHtml(payload.subject)}</td>
      </tr>
    </table>
    <div style="border-top: 1px solid #e0d5c7; padding-top: 16px; white-space: pre-wrap;">${escapeHtml(payload.message)}</div>
  </div>
</body>
</html>`;

  try {
    console.log("[contact] sending via Resend; key length:", RESEND_API_KEY.length);
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to: [OWNER_EMAIL],
        reply_to: payload.email,
        subject: `[Portfolio Contact] ${payload.subject}`,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[contact] Resend error", res.status, errBody);
      // Try to extract the human-readable message from Resend's JSON
      // response so it bubbles up to the contact form UI.
      let detail = errBody;
      try {
        const parsed = JSON.parse(errBody) as { message?: string; name?: string };
        if (parsed.message) detail = parsed.message;
        if (parsed.name && parsed.message) detail = `${parsed.name}: ${parsed.message}`;
      } catch {
        /* not JSON */
      }
      return {
        ok: false,
        error: `Resend ${res.status}: ${detail || "unknown error"}`,
      };
    }

    const okBody = await res.json().catch(() => ({}));
    console.log("[contact] Resend accepted", okBody);
    return { ok: true };
  } catch (err) {
    console.error("[contact] Resend fetch error:", err);
    return { ok: false, error: "network error while sending email" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
