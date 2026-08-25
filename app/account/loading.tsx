import { LoadingAnnouncement, Shimmer } from "@/components/kiln/Skeleton";

export default function Loading() {
  return (
    <main className="shell" style={{ paddingBlock: "64px 90px", display: "flex", flexDirection: "column", gap: 30 }}>
      <LoadingAnnouncement what="your account" />
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Shimmer h={12} w={160} />
        <Shimmer h={40} w="55%" />
      </div>
      <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} h={110} r={16} />
        ))}
      </div>
      <Shimmer h={320} r={16} style={{ marginTop: 6 }} />
    </main>
  );
}
