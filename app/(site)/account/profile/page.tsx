import type { Metadata } from "next";
import { getViewer } from "@/lib/kl/viewer";
import { createClient } from "@/lib/supabase/server";
import ApiKeys from "@/components/v2/account/ApiKeys";
import PasswordForm from "@/components/v2/PasswordForm";
import { Button } from "@/components/v2/Button";
import { updateDisplayName } from "../actions";
import p from "@/components/v2/Page.module.css";
import f from "@/components/v2/Form.module.css";
import a from "@/components/v2/account/Account.module.css";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

/**
 * Who you are here, and the keys that act as you: the display name the
 * header greets you by, a new password, and the MCP server's API keys.
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

  const initial = (viewer.name || viewer.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className={a.split}>
      <div className={a.panelStack}>
        <section className={`${p.panel} ${a.panelStack}`} aria-labelledby="name-title">
          <div className={a.who}>
            <span className={a.avatar} aria-hidden="true">
              {initial}
            </span>
            <span className={a.whoWords}>
              <strong>{viewer.email}</strong>
              <span>Signed in</span>
            </span>
          </div>
          <h2 id="name-title" className="v-sr">
            Display name
          </h2>
          <form action={updateDisplayName} className={a.inlineForm}>
            <div className={f.field}>
              <label htmlFor="display_name" className={f.label}>
                Display name
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                maxLength={60}
                defaultValue={viewer.name ?? ""}
                placeholder="How you want to be addressed"
                className={f.input}
                aria-describedby="display-name-hint"
              />
              <p id="display-name-hint" className={f.hint}>
                Shown in the header. Leave it empty to go back to your email address.
              </p>
            </div>
            <div className={a.actions}>
              <Button type="submit" variant="secondary" size="sm">
                Save name
              </Button>
            </div>
            {saved ? (
              <p role="status" className={f.notice}>
                Saved.
              </p>
            ) : null}
            {error ? (
              <p role="alert" className={f.error}>
                {error}
              </p>
            ) : null}
          </form>
        </section>

        <section className={`${p.panel} ${a.panelStack}`} aria-labelledby="password-title">
          <h2 id="password-title" className={p.panelTitle}>
            Password
          </h2>
          <p className={p.panelNote}>Set a new one here. You stay signed in on this device.</p>
          <PasswordForm submitLabel="Save new password" />
        </section>
      </div>

      <ApiKeys initial={apiKeys ?? []} />
    </div>
  );
}
