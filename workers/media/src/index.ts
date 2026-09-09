/**
 * media.kineticlayers.com — R2 in front, Sanity behind.
 *
 * Two kinds of key live in the one bucket:
 *
 *   <slug>/card.webp   seeded previews, uploaded by tools/upload-r2.mjs.
 *                      Stable keys, so a replaced render has to be able to
 *                      reach someone holding the old one — cached, not
 *                      immutable.
 *   sanity/<file>      mirrored from cdn.sanity.io on first request. Sanity
 *                      asset filenames are content-hashed, so these can never
 *                      go stale and are cached immutable.
 *
 * The mirror is pull-through rather than pushed on a webhook. Nothing has to be
 * backfilled, nothing has to be kept in step, and there is no window after a
 * publish where a document points at bytes that are not there yet. The cost is
 * one slow request per file, once, ever.
 *
 * Range and HEAD are not optional here. Media Transformations require the
 * origin to answer both and to return Content-Range, so /cdn-cgi/media/ breaks
 * without them — which is also why a cache miss stores the object and then
 * re-reads it through R2 rather than streaming the upstream response straight
 * back. One extra hop on the first request buys correct range semantics on it.
 */

export interface Env {
  MEDIA: R2Bucket;
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
}

/** Content-hashed, so it can never point at different bytes later. */
const IMMUTABLE = "public, max-age=31536000, immutable";

/** Matches tools/upload-r2.mjs, deliberately. */
const STABLE = "public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400";

const MIRROR_PREFIX = "sanity/";
const IMAGE_EXT = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" },
      });
    }

    const key = decodeURIComponent(new URL(request.url).pathname).replace(/^\/+/, "");
    /* A key is a path into a public bucket, so traversal is the one thing worth
       refusing outright rather than letting R2 answer it. */
    if (!key || key.includes("..")) return notFound();

    const mirrored = key.startsWith(MIRROR_PREFIX);
    const cacheControl = mirrored ? IMMUTABLE : STABLE;

    const hit = await env.MEDIA.get(key, { range: request.headers, onlyIf: request.headers });
    if (hit) return serve(hit, request, cacheControl);

    /* A miss on a seeded key is simply a miss — there is no upstream for it. */
    if (!mirrored) return notFound();

    const upstream = await fetchFromSanity(key.slice(MIRROR_PREFIX.length), env);
    if (!upstream?.body) return notFound();

    /* Streamed, not buffered. A Worker has 128 MB and a transform will accept a
       100 MB input, so reading one into an ArrayBuffer is a way to fall over. */
    await env.MEDIA.put(key, upstream.body, {
      httpMetadata: {
        contentType: upstream.headers.get("content-type") ?? "application/octet-stream",
        cacheControl: IMMUTABLE,
      },
    });

    const stored = await env.MEDIA.get(key, { range: request.headers, onlyIf: request.headers });
    return stored ? serve(stored, request, cacheControl) : notFound();
  },
};

/**
 * Sanity splits its CDN by asset type and the filename does not say which.
 * The extension is a good guess; the other kind is tried when it is wrong,
 * which costs one 404 on a file we have never seen before and nothing after.
 */
async function fetchFromSanity(file: string, env: Env): Promise<Response | null> {
  const kinds = IMAGE_EXT.test(file) ? ["images", "files"] : ["files", "images"];
  for (const kind of kinds) {
    const res = await fetch(
      `https://cdn.sanity.io/${kind}/${env.SANITY_PROJECT_ID}/${env.SANITY_DATASET}/${file}`
    );
    if (res.ok) return res;
  }
  return null;
}

function serve(obj: R2Object | R2ObjectBody, request: Request, cacheControl: string): Response {
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", cacheControl);
  headers.set("accept-ranges", "bytes");

  /* onlyIf matched, so the client already has it. */
  if (!("body" in obj) || obj.body === null) {
    return new Response(null, { status: 304, headers });
  }

  /* R2 reports a range covering the whole object even when the request asked
     for no range at all, so trusting obj.range alone answers a plain GET with
     206 Partial Content and a Content-Range spanning everything. That is
     malformed, and a transformer is entitled to refuse it. The request header
     is the only thing that says whether a range was actually wanted. */
  const range = (request.headers.has("range") ? obj.range : undefined) as
    | { offset?: number; length?: number; suffix?: number }
    | undefined;

  let status = 200;
  if (range) {
    const { offset, length } =
      typeof range.suffix === "number"
        ? { offset: obj.size - range.suffix, length: range.suffix }
        : { offset: range.offset ?? 0, length: range.length ?? obj.size - (range.offset ?? 0) };
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set("content-length", String(length));
    status = 206;
  } else {
    headers.set("content-length", String(obj.size));
  }

  return new Response(request.method === "HEAD" ? null : obj.body, { status, headers });
}

const notFound = () => new Response("Not found", { status: 404 });
