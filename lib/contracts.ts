/**
 * Shared shapes and validation.
 *
 * The client uses these to decide what to send; the API routes use them to
 * decide what to accept. Nothing is trusted because the client also has it —
 * every value is re-checked server-side, and the database re-checks again with
 * its own constraints.
 */

export const ROLES = ["agency", "freelancer", "neither"] as const;
export const SHIPPED = ["0-1", "2-5", "6plus"] as const;
export const CONCEPTS = ["signal-arc", "proof-ledger", "studio-current"] as const;
export const VARIANTS = ["a", "b"] as const;

export const EVENT_NAMES = [
  "page_view",
  "cta_click",
  "form_start",
  "form_submit",
  "qualified_submit",
  /* Kinetic Layers. The four questions worth answering during validation: what do people
     look for, what do they reach for, where does the paywall stop them, and
     does being stopped send them to pricing or away. */
  "search",
  "download",
  "gate_hit",
  "unlock_click",
  /* From the earlier demand test. Kept so old rows stay readable. */
  "concept_click",
] as const;

export type Role = (typeof ROLES)[number];
export type Shipped = (typeof SHIPPED)[number];
export type Concept = (typeof CONCEPTS)[number];
export type Variant = (typeof VARIANTS)[number];
export type EventName = (typeof EVENT_NAMES)[number];

/** Constrain a value to a known set, or fall back. */
export function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T | null = null
): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Trim, strip control characters, and cap length. */
export function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\0]/g, "").trim().slice(0, max);
}

/** Flags arrive as booleans, "1", "yes" or "on" depending on the caller. */
export function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "yes" || value === "on";
}

/**
 * The recruiting spec: delivers client sites, and shipped at least two in the
 * last year. The database computes this too, as a generated column — this copy
 * exists only so the client can fire a `qualified_submit` event without a
 * round trip. The database is the authority.
 */
export function isQualified(role: string | null, shipped: string | null): boolean {
  return (
    (role === "agency" || role === "freelancer") &&
    (shipped === "2-5" || shipped === "6plus")
  );
}

export const LOOKS_LIKE_EMAIL = /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/;
