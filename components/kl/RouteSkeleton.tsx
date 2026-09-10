import Header from "./Header";
import {
  CardSkeleton,
  GridSkeleton,
  LoadingAnnouncement,
  Shimmer,
} from "@/components/legacy/Skeleton";

/**
 * What a route shows while its server components fetch.
 *
 * Every loading.tsx used to be one line of grey monospace on an otherwise empty
 * page, and the comment above it defended that: "a spinner on every navigation
 * reads as slower than nothing at all." That is true of a spinner, and this is
 * not one. A spinner says *wait* without saying what for; a skeleton is the
 * shape the content will take, so the header never disappears and nothing jumps
 * when the real thing arrives.
 *
 * The pieces come from components/legacy/Skeleton.tsx, which was written for
 * this exact problem — its own doc comment says so — and then never imported by
 * anything. The shimmer is `.legacy-skel` in styles/legacy.css, whose keyframe
 * already carries a prefers-reduced-motion guard, so none of this needs a new
 * animation.
 *
 * The wording each route used to print is still here, moved into
 * LoadingAnnouncement: a polite live region for screen readers, rather than a
 * naked sentence where a page should be.
 */

type Shape = "grid" | "item" | "panel";

export default function RouteSkeleton({ what, shape = "grid" }: { what: string; shape?: Shape }) {
  return (
    <div data-kl className="kl-shell">
      <Header />
      <main aria-busy="true">
        <LoadingAnnouncement what={what} />

        {/* The masthead, at the size the real one lands at, so the grid below
            does not slide up when the copy replaces it. */}
        <div
          className="kl-pad"
          style={{ paddingTop: 76, paddingBottom: 34, display: "flex", flexDirection: "column", gap: 16 }}
          aria-hidden="true"
        >
          <Shimmer h={10} w={120} r={99} />
          <Shimmer h={shape === "item" ? 34 : 46} w="52%" r={10} />
          <Shimmer h={15} w="34%" />
        </div>

        {shape === "grid" ? (
          <>
            {/* The filter rail: a row of pills. */}
            <div className="kl-pad" style={{ display: "flex", gap: 10, flexWrap: "wrap" }} aria-hidden="true">
              {[54, 78, 66, 92, 58, 70, 84].map((w, i) => (
                <Shimmer key={i} h={30} w={w} r={99} />
              ))}
            </div>
            <div className="kl-pad" style={{ paddingTop: 30 }}>
              <GridSkeleton />
            </div>
          </>
        ) : null}

        {shape === "item" ? (
          <div
            className="kl-pad"
            style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, .62fr)", gap: 28 }}
            aria-hidden="true"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Shimmer h={420} r={20} />
              <Shimmer h={30} w="44%" r={10} />
              <Shimmer h={15} w="72%" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Shimmer h={210} r={18} />
              <Shimmer h={170} r={18} />
            </div>
          </div>
        ) : null}

        {shape === "panel" ? (
          <div className="kl-pad" style={{ display: "flex", flexDirection: "column", gap: 18 }} aria-hidden="true">
            <CardSkeleton h={150} />
            <CardSkeleton h={150} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
