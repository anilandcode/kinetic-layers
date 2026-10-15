import { NextResponse, type NextRequest } from "next/server";
import { sanity } from "@/lib/sanity/client";
import { signedUploadUrl } from "@/lib/kl/storage";
import { UPLOAD_PREFIX, UPLOAD_TYPE } from "@/lib/kl/paid";

/**
 * Hands the Studio a one-time URL to PUT a website's ZIP into the private bucket.
 *
 * Who may ask is decided by Sanity, not by a secret here. The Studio first
 * writes a ticket — `paid.upload.<nonce>` — with the member's own session.
 * Anonymous visitors cannot write to the dataset at all, and `paid.*` cannot be
 * read without a token, so a fresh ticket this route can read proves the request
 * came from a signed-in member. The ticket names the website and the file; the
 * key is derived here, never taken from the caller.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STUDIO_ORIGINS = new Set(["https://kineticlayers.sanity.studio", "http://localhost:3333"]);
const TICKET_TTL_MS = 10 * 60 * 1000;
const UPLOAD_TTL_S = 15 * 60;
const MAX_BYTES = 1024 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cors(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  return STUDIO_ORIGINS.has(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Max-Age": "600",
        Vary: "Origin",
      }
    : { Vary: "Origin" };
}

const refuse = (request: NextRequest, status: number, message: string) =>
  NextResponse.json({ ok: false, message }, { status, headers: cors(request) });

export function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: cors(request) });
}

export async function POST(request: NextRequest) {
  if (!sanity) return refuse(request, 503, "The CMS is not configured.");

  let nonce = "";
  try {
    nonce = String((await request.json())?.nonce ?? "");
  } catch {
    return refuse(request, 400, "Malformed request.");
  }
  if (!UUID.test(nonce)) return refuse(request, 400, "Bad ticket.");

  const ticket = await sanity.fetch<{
    _type?: string;
    _createdAt?: string;
    website?: string;
    filename?: string;
    size?: number;
  } | null>(`*[_id == $id][0]{ _type, _createdAt, website, filename, size }`, { id: `${UPLOAD_PREFIX}${nonce}` }, { cache: "no-store" });

  if (!ticket || ticket._type !== UPLOAD_TYPE) return refuse(request, 403, "No upload ticket — upload from the Studio.");
  if (!ticket._createdAt || Date.now() - Date.parse(ticket._createdAt) > TICKET_TTL_MS) {
    return refuse(request, 403, "That upload ticket has expired. Try again.");
  }
  if (!ticket.website || !/^[\w-]+$/.test(ticket.website)) return refuse(request, 400, "Which website?");
  if (!ticket.filename?.toLowerCase().endsWith(".zip")) return refuse(request, 400, "Only .zip files.");
  if (typeof ticket.size !== "number" || ticket.size <= 0 || ticket.size > MAX_BYTES) {
    return refuse(request, 400, "The ZIP must be under 1 GB.");
  }

  /* The website may still be an unpublished draft when its ZIP goes up. */
  const exists = await sanity.fetch<number>(
    `count(*[_id in [$id, "drafts." + $id] && _type == "website"])`,
    { id: ticket.website },
    { perspective: "raw", cache: "no-store" }
  );
  if (!exists) return refuse(request, 404, "No such website.");

  const key = `websites/${ticket.website}/${nonce}.zip`;
  try {
    const url = await signedUploadUrl(key, "application/zip", UPLOAD_TTL_S);
    return NextResponse.json({ ok: true, url, key }, { headers: cors(request) });
  } catch (err) {
    console.error("upload signing failed:", err instanceof Error ? err.message : err);
    return refuse(request, 500, "Could not prepare the upload. Try again in a moment.");
  }
}
