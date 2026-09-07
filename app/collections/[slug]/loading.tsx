import { GridSkeleton, LoadingAnnouncement, Shimmer } from "@/components/legacy/Skeleton";

export default function Loading() {
  return (
    <main>
      <LoadingAnnouncement what="this collection" />
      <div className="shell" style={{ paddingBlock: "60px 40px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 680 }} aria-hidden="true">
        <Shimmer h={12} w={220} />
        <Shimmer h={52} w="80%" />
        <Shimmer h={16} w="65%" />
      </div>
      <div className="shell" style={{ paddingBottom: 90 }}>
        <GridSkeleton count={6} heights={[200, 200, 200, 200, 200, 200]} />
      </div>
    </main>
  );
}
