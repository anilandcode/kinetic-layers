import "server-only";

import { getDb } from "@/lib/supabase";

export type MembershipInterestOutcome = "done" | "already" | "unknown" | "error";

/**
 * Confirms a separate membership-launch list. It intentionally does not touch
 * `subscribers`: newsletter consent and willingness to hear about a future
 * paid offer answer different questions.
 */
export async function confirmMembershipInterest(token: string): Promise<MembershipInterestOutcome> {
  if (!isUuid(token)) return "unknown";

  const { data, error } = await getDb()
    .from("membership_interest")
    .select("id, confirmed_at")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    console.error("membership interest confirmation lookup failed:", error.message);
    return "error";
  }
  if (!data) return "unknown";
  if (data.confirmed_at) return "already";

  const { error: updateError } = await getDb()
    .from("membership_interest")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", data.id);
  if (updateError) {
    console.error("membership interest confirmation failed:", updateError.message);
    return "error";
  }
  return "done";
}

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
