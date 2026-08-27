import { NextResponse } from "next/server";
import { getDb, visitorHash } from "@/lib/supabase";
import { throttle } from "@/lib/kiln/quota";
import {
  clean,
  CONCEPTS,
  isQualified,
  LOOKS_LIKE_EMAIL,
  oneOf,
  ROLES,
  SHIPPED,
  truthy,
  VARIANTS,
} from "@/lib/contracts";

/**
 * Invitation request handler.
 *
 * Nothing here charges anything or stores a payment detail: the demand test
 * collects a non-binding request only.
 *
 * The row is written to Supabase first, and the optional email provider is
 * called afterwards, so a provider outage can never lose a response.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, message: "Send this form as form data." });
  }

  const get = (key: string) => form.get(key);

  /* --- Spam trap ---------------------------------------------------------
     The field is hidden from people and left empty by them. A bot that fills
     every input trips it. Answer with a success so it stops retrying. */
  if (clean(get("company_website"), 200) !== "") {
    return json(200, { ok: true, message: "Thanks." });
  }

  /* --- Frequency cap ------------------------------------------------------
     The honeypot catches a bot that fills every field. It does nothing about
     one that posts a valid form ten thousand times, which is the cheaper
     attack and the one that fills the table. Checked after the honeypot so a
     trapped bot still gets its 200 and stops. */
  if (!(await throttle(request, "subscribe", 5, 3600))) {
    return json(429, {
      ok: false,
      message: "That is a lot of requests. Give it an hour and try again.",
    });
  }

  const email = clean(get("email"), 190);
  if (!email || !LOOKS_LIKE_EMAIL.test(email)) {
    return json(422, { ok: false, message: "That email address does not look right." });
  }

  const role = oneOf(get("role"), ROLES);
  const shipped = oneOf(get("shipped"), SHIPPED);
  const concept = oneOf(get("concept"), CONCEPTS);

  /* The variant is posted by the script. Without scripting, fall back to the
     cookie that decided which price was painted. */
  const cookieVariant = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)dk_variant=([ab])\b/)?.[1];
  const variant = oneOf(get("variant"), VARIANTS) ?? oneOf(cookieVariant, VARIANTS) ?? "unknown";

  const row = {
    email,
    role,
    shipped,
    concept,
    blocker: clean(get("blocker"), 1200) || null,
    interview: truthy(get("interview")),
    consent: truthy(get("consent")),
    variant,
    source: clean(get("source"), 60) || "unknown",
    qa: truthy(get("qa")),
    visitor: await visitorHash(request),
  };

  try {
    const { error } = await getDb().from("invite_requests").insert(row);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("invite_requests insert failed:", err);
    return json(500, {
      ok: false,
      message: "We could not save that. Please try again in a moment.",
    });
  }

  /* Only for people who ticked the marketing box, and only when a provider is
     configured. A failure here is logged and swallowed: the response is
     already safely stored. */
  if (row.consent) {
    await forwardToProvider(email, row).catch((err) =>
      console.error("provider forward failed:", err)
    );
  }

  return json(200, { ok: true, message: "Thanks — you are on the list." });
}

async function forwardToProvider(
  email: string,
  row: { role: string | null; shipped: string | null; variant: string; source: string }
) {
  const provider = process.env.EMAIL_PROVIDER;
  const key = process.env.EMAIL_API_KEY;
  const listId = process.env.EMAIL_LIST_ID ?? "";
  if (!provider || !key) return;

  const fields = {
    role: row.role ?? "",
    shipped: row.shipped ?? "",
    variant: row.variant,
    source: row.source,
  };

  let url: string;
  let body: unknown;
  let headers: Record<string, string> = { "Content-Type": "application/json" };

  switch (provider) {
    case "mailerlite":
      url = "https://connect.mailerlite.com/api/subscribers";
      body = { email, fields, ...(listId ? { groups: [listId] } : {}) };
      headers = { ...headers, Accept: "application/json", Authorization: `Bearer ${key}` };
      break;
    case "convertkit":
      url = `https://api.convertkit.com/v3/forms/${encodeURIComponent(listId)}/subscribe`;
      body = { api_key: key, email, fields };
      break;
    case "buttondown":
      url = "https://api.buttondown.email/v1/subscribers";
      body = { email_address: email, metadata: fields };
      headers = { ...headers, Authorization: `Token ${key}` };
      break;
    default:
      return;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    console.error(
      `provider ${provider} responded ${res.status}: ${(await res.text()).slice(0, 300)}`
    );
  }
}
