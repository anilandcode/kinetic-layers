import { NextResponse } from "next/server";
import { getViewer } from "@/lib/kl/viewer";
import { admin } from "@/lib/supabase/admin";
import { mintKey } from "@/lib/kl/apikey";

/**
 * Mint and revoke API keys for the MCP endpoint.
 *
 * Minting needs the service role, because the row has to be written with a
 * hash the user never supplies — the RLS policy deliberately allows no INSERT,
 * so a key can only come into existence here, where the plaintext is generated
 * and returned exactly once.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ ok: false, message: "Sign in first." }, { status: 401 });

  let name = "MCP";
  try {
    const body = await request.json();
    if (typeof body?.name === "string" && body.name.trim()) name = body.name.trim().slice(0, 40);
  } catch {
    /* Body is optional — a POST with nothing in it means "a key, default name". */
  }

  const db = admin();

  /* A ceiling, so a loop cannot fill the table. Revoked keys do not count. */
  const { count } = await db
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", viewer.id)
    .is("revoked_at", null);

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { ok: false, message: "Five active keys is the limit. Revoke one first." },
      { status: 409 }
    );
  }

  const { key, hash, prefix } = mintKey();
  const { error } = await db.from("api_keys").insert({ user_id: viewer.id, name, key_hash: hash, prefix });
  if (error) {
    console.error("key insert failed:", error.message);
    return NextResponse.json({ ok: false, message: "Could not create that key." }, { status: 500 });
  }

  /* The only moment the plaintext exists outside the caller's hands. */
  return NextResponse.json({ ok: true, key, prefix, name });
}

export async function DELETE(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ ok: false }, { status: 401 });

  let id = "";
  try {
    id = String((await request.json())?.id ?? "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!id) return NextResponse.json({ ok: false, message: "Which key?" }, { status: 400 });

  /* Revoked, not deleted, so `last_used` survives as a record of what the key
     did before it was turned off. Scoped by user_id as well as id — the row
     belongs to whoever is asking, or it is not theirs to revoke. */
  const { error } = await admin()
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", viewer.id);

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
