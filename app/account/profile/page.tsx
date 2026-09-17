import type { Metadata } from "next";
import { Avatar } from "@/components/legacy/Chrome";
import ApiKeys from "@/components/legacy/ApiKeys";
import { getViewer } from "@/lib/kl/viewer";
import { createClient } from "@/lib/supabase/server";
import { updateDisplayName } from "../actions";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

/**
 * Who you are here, and the keys that act as you.
 *
 * The name is the new part. `profiles.display_name` has been in the schema
 * since the first migration, read in one place and shown on none; there was no
 * way to set it. The header greets people by it now, which is why it earns a
 * form rather than staying a column nobody fills.
 */
export default async function AccountProfile({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const viewer = await getViewer();
  if (!viewer) return null;

  const supabase = await createClient();
  const { data: apiKeys } = supabase
    ? await supabase
        .from("api_keys")
        .select("id, name, prefix, created_at, last_used")
        .is("revoked_at", null)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section
      className="kl-pad"
      style={{ paddingBlock: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(380px,100%),1fr))", gap: 12, alignItems: "start" }}
    >
      <div data-reveal style={{ borderRadius: 10, border: "1px solid var(--line)", background: "var(--board)", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Avatar email={viewer.name || viewer.email} size={40} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>
              {viewer.email}
            </span>
            <span className="kl-mono" style={{ fontSize: 10, letterSpacing: 0, color: "var(--muted)" }}>
              Signed in
            </span>
          </div>
        </div>

        <form action={updateDisplayName} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label htmlFor="display_name" style={{ fontSize: 13, color: "var(--muted)" }}>
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            maxLength={60}
            defaultValue={viewer.name ?? ""}
            placeholder="How you want to be addressed"
            className="kl-input"
          />
          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            Shown in the header. Leave it empty to go back to your email address.
          </p>
          <div>
            <button type="submit" className="kl-btn kl-btn--ghost kl-btn--sm">
              <span className="kl-btn-label" data-btn-label>
                Save
              </span>
            </button>
          </div>

          {saved ? (
            <p role="status" style={{ fontSize: 13, color: "var(--moss)" }}>
              Saved.
            </p>
          ) : null}
          {error ? (
            <p role="alert" style={{ fontSize: 13, color: "var(--amber)" }}>
              {error}
            </p>
          ) : null}
        </form>
      </div>

      <ApiKeys initial={apiKeys ?? []} />
    </section>
  );
}
