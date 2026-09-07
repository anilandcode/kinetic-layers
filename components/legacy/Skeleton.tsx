/**
 * Shapes that stand in while a route loads.
 *
 * The app root already had a loading.tsx, but every segment fell back to it —
 * so navigating anywhere showed one line of text where a page was about to be.
 * A skeleton that matches the arriving layout makes the wait feel like loading
 * rather than like nothing happening.
 *
 * Marked aria-hidden and paired with a single polite status line: announcing
 * twenty grey rectangles helps nobody, but "Loading" does.
 */
export function Shimmer({ h = 16, w = "100%", r = 8, style }: { h?: number | string; w?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="kiln-skel" style={{ height: h, width: w, borderRadius: r, ...style }} />;
}

export function LoadingAnnouncement({ what }: { what: string }) {
  return (
    <p role="status" aria-live="polite" className="visually-hidden">
      {`Loading ${what}`}
    </p>
  );
}

export function CardSkeleton({ h = 220 }: { h?: number }) {
  return (
    <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Shimmer h={h} r={14} />
      <Shimmer h={17} w="62%" />
      <Shimmer h={11} w="38%" />
    </div>
  );
}

export function GridSkeleton({ count = 8, heights }: { count?: number; heights?: number[] }) {
  const hs = heights ?? [230, 300, 170, 200, 260, 320, 180, 280];
  return (
    <div className="kiln-masonry" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ marginBottom: 26, breakInside: "avoid" }}>
          <CardSkeleton h={hs[i % hs.length]} />
        </div>
      ))}
    </div>
  );
}
