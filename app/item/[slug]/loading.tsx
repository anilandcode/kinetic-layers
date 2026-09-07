import { GridSkeleton, LoadingAnnouncement, Shimmer } from "@/components/legacy/Skeleton";

/** Shaped like the item page: buy rail beside a tall preview. */
export default function Loading() {
  return (
    <main>
      <LoadingAnnouncement what="this asset" />
      <div
        className="shell"
        style={{
          paddingBlock: "50px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))",
          gap: 34,
          alignItems: "start",
        }}
      >
        <div aria-hidden="true" style={{ order: 2, display: "flex", flexDirection: "column", gap: 16 }}>
          <Shimmer h={38} w="70%" />
          <Shimmer h={15} w="90%" />
          <Shimmer h={15} w="55%" />
          <Shimmer h={54} r={99} style={{ marginTop: 14 }} />
          <Shimmer h={180} r={16} style={{ marginTop: 10 }} />
        </div>
        <div aria-hidden="true" style={{ order: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <Shimmer h={520} r={20} />
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <Shimmer key={i} h={74} r={12} />
            ))}
          </div>
        </div>
      </div>
      <div className="shell" style={{ paddingBlock: "40px 90px" }}>
        <GridSkeleton count={4} heights={[190, 190, 190, 190]} />
      </div>
    </main>
  );
}
