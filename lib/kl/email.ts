import "server-only";
import { SITE_URL } from "./site";

/**
 * Sending mail, through Resend.
 *
 * One service does two jobs here: Supabase's SMTP for auth (configured in the
 * dashboard, not in this file) and this, for the newsletter. Resend's free tier
 * is 3,000 a month and 100 a day, which is far past what a new site needs.
 *
 * The important property is that it **fails loudly**. The bug this replaces was
 * /api/subscribe answering "Thanks — you are on the list" while no provider was
 * configured and nothing was sent: a silent no-op wearing a success message.
 * Every path here either sends or says plainly that it did not.
 */

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM;

/** Whether mail can actually go out. Callers must not promise delivery without it. */
export const EMAIL_READY = Boolean(KEY && FROM);

export type Mail = {
  to: string;
  subject: string;
  /** Plain text is required, HTML optional: text-only mail still reaches people. */
  text: string;
  html?: string;
  /** One-click unsubscribe, for the clients that honour it. */
  unsubscribeUrl?: string;
};

export async function sendMail(mail: Mail): Promise<{ ok: boolean; error?: string }> {
  if (!EMAIL_READY) {
    const why = "RESEND_API_KEY and EMAIL_FROM are not set — nothing was sent";
    console.error(`sendMail refused: ${why} (to: ${mail.to}, subject: ${mail.subject})`);
    return { ok: false, error: why };
  }

  /* List-Unsubscribe lets Gmail and Outlook show their own unsubscribe control
     above the message. People use that one far more than the link in the
     footer, and an unsubscribe nobody can find is a spam complaint waiting to
     happen. `One-Click` tells them they may POST it without asking. */
  const headers: Record<string, string> = {};
  if (mail.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${mail.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.html ? { html: mail.html } : {}),
        ...(Object.keys(headers).length ? { headers } : {}),
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error(`sendMail failed ${res.status}: ${detail}`);
      return { ok: false, error: `provider responded ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    const why = err instanceof Error ? err.message : String(err);
    console.error("sendMail threw:", why);
    return { ok: false, error: why };
  }
}

export const confirmUrl = (token: string) => `${SITE_URL}/newsletter/confirm?token=${token}`;

/** A distinct confirmation target for the non-binding Founding Membership list. */
export const membershipInterestConfirmUrl = (token: string) =>
  `${SITE_URL}/membership-interest/confirm?token=${token}`;

/** The link a person clicks. Lands on a page that says what happened. */
export const unsubscribeUrl = (token: string) => `${SITE_URL}/newsletter/unsubscribe?token=${token}`;

/** What goes in List-Unsubscribe: it must accept a POST, which a page cannot. */
export const unsubscribePostUrl = (token: string) =>
  `${SITE_URL}/api/newsletter/unsubscribe?token=${token}`;

/** The one mail /api/subscribe sends. Plain, short, and it says who it is from. */
export function confirmationMail(email: string, token: string): Mail {
  const confirm = confirmUrl(token);
  return {
    to: email,
    subject: "Confirm your Kinetic Layers subscription",
    unsubscribeUrl: unsubscribePostUrl(token),
    text: [
      "One click and you are on the list.",
      "",
      confirm,
      "",
      "You get one email a week — the new assets and what they were built for.",
      "Nothing else, and you can unsubscribe from any of them.",
      "",
      "If you did not ask for this, ignore this message. You are not subscribed",
      "until you use the link above.",
      "",
      "— Kinetic Layers",
      SITE_URL,
    ].join("\n"),
  };
}

/**
 * This mail confirms interest only. Its language must stay separate from the
 * newsletter confirmation above: confirming must never be mistaken for a
 * purchase, a subscription, or permission for the regular digest.
 */
export function membershipInterestConfirmationMail(email: string, token: string): Mail {
  const confirm = membershipInterestConfirmUrl(token);
  return {
    to: email,
    subject: "Confirm your Founding Membership interest",
    text: [
      "Confirm that you want to hear when Kinetic Layers Founding Membership opens.",
      "",
      confirm,
      "",
      "This is only an interest list. It does not create a subscription, collect payment details, or charge you.",
      "",
      "If you did not ask for this, ignore this email. You will not receive launch updates unless you confirm.",
      "",
      "— Kinetic Layers",
      SITE_URL,
    ].join("\n"),
  };
}
