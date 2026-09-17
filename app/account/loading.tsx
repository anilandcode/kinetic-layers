import { Shimmer, LoadingAnnouncement } from "@/components/legacy/Skeleton";

/**
 * Panel-only, deliberately.
 *
 * The other routes use RouteSkeleton, which draws the whole page down to the
 * header. This one sits inside app/account/layout.tsx, which has already
 * rendered the shell, the header and the tab row — so a full-page skeleton here
 * would paint a second header underneath the real one.
 */
export default function Loading() {
  return (
    <section className="kl-pad" style={{ paddingBlock: 20 }}>
      <LoadingAnnouncement what="your account" />
      <div
        aria-hidden="true"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 12 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} h={132} r={10} />
        ))}
      </div>
    </section>
  );
}
