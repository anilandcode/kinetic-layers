import { CardSkeleton, LoadingAnnouncement } from "@/components/kiln/Skeleton";

export default function Loading() {
  return (
    <main className="shell" style={{ paddingBlock: "64px 90px" }}>
      <LoadingAnnouncement what="collections" />
      <div
        aria-hidden="true"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(400px,100%),1fr))", gap: 26 }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} h={230} />
        ))}
      </div>
    </main>
  );
}
