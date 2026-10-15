import type { ReactNode } from "react";
import { getViewer } from "@/lib/kl/viewer";
import { ShellFrame } from "@/components/v2/ShellFrame";

/**
 * Every page shares one frame, mounted once.
 *
 * Each page used to render its own header and footer, and the root loading
 * boundary repainted all of it, so every click blanked the header and mounted
 * it twice. A layout survives client navigation; only the page swaps.
 *
 * The viewer is handed down unawaited: the header resolves it inside a
 * Suspense boundary, so first paint never waits on Supabase. getViewer is
 * cached per request, so a page that also asks costs no second round trip.
 * Sign-in, sign-out and profile edits revalidate the layout or reload, which is
 * what refreshes the account slot.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <ShellFrame viewer={getViewer().catch(() => null)}>{children}</ShellFrame>;
}
