import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Save and unsave.
 *
 * Uses the RLS-scoped client on purpose: the policies on saved_assets and
 * saved_collections already restrict rows to auth.uid(), so this route does not
 * have to be trusted to filter correctly — the database does it.
 *
 * The two tables are handled in separate branches rather than through a
 * computed column name, so the row shape is checked at compile time.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { kind?: string; slug?: string; saved?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.slice(0, 120) : "";
  if (!slug) return NextResponse.json({ ok: false, message: "Which item?" }, { status: 400 });

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Accounts are not connected yet." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, message: "Sign in first." }, { status: 401 });

  const saved = Boolean(body.saved);
  const isCollection = body.kind === "collection";

  const { error } = isCollection
    ? saved
      ? await supabase.from("saved_collections").upsert({ user_id: user.id, collection_slug: slug })
      : await supabase
          .from("saved_collections")
          .delete()
          .eq("user_id", user.id)
          .eq("collection_slug", slug)
    : saved
      ? await supabase.from("saved_assets").upsert({ user_id: user.id, asset_slug: slug })
      : await supabase.from("saved_assets").delete().eq("user_id", user.id).eq("asset_slug", slug);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, saved });
}
