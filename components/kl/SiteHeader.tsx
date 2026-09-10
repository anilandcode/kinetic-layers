import Header from "./Header";
import { getViewer } from "@/lib/kl/viewer";

/**
 * The header, with whoever is looking already resolved.
 *
 * Header is a client component and cannot read a session. Every one of its call
 * sites is a server component, and four of them already had a viewer in scope —
 * but PageShell did not, and passing one down would have meant a new prop
 * threaded through the ten or so pages that use it.
 *
 * So the lookup moves here instead. getViewer is wrapped in React `cache`
 * (lib/kl/viewer.ts:13), so a page that asks for the viewer itself and a header
 * that asks independently still cost one round trip between them.
 *
 * Not for loading boundaries: RouteSkeleton renders <Header pending /> directly,
 * because awaiting a session to paint a skeleton defeats the skeleton.
 */
export default async function SiteHeader() {
  const viewer = await getViewer();
  return <Header viewer={viewer} />;
}
