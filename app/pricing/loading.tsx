import { LoadingAnnouncement, Shimmer } from "@/components/kiln/Skeleton";

export default function Loading() {
  return (
    <main className="shell" style={{ paddingBlock: "64px 90px", display: "flex", flexDirection: "column", gap: 34 }}>
      <LoadingAnnouncement what="pricing" />
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <Shimmer h={52} w="min(560px,80%)" />
        <Shimmer h={18} w="min(420px,60%)" />
      </div>
      <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", gap: 24 }}>
        <Shimmer h={430} r={20} />
        <Shimmer h={430} r={20} />
      </div>
    </main>
  );
}
