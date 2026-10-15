import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { PAID_TYPE } from "@/lib/kl/paid";

/**
 * Sanity webhook. Invalidates only the tags an edit actually touched, so a
 * change to one asset does not throw away the whole cache.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = { _type?: string; slug?: { current?: string } };

export async function POST(request: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<Payload>(
      request,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return NextResponse.json({ ok: false, message: "Bad signature." }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ ok: false, message: "No document type." }, { status: 400 });
    }

    /* A paid document (prompts, code, design, ZIP key) has no slug and belongs
       to a kit or a website; refreshing both lists is cheap and always right. */
    const tags =
      body._type === PAID_TYPE ? ["asset", "website"] : [body._type, ...(body.slug?.current ? [`${body._type}:${body.slug.current}`] : [])];
    tags.forEach(revalidateTag);

    return NextResponse.json({ ok: true, revalidated: tags });
  } catch (err) {
    console.error("revalidate failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
