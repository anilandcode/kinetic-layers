
import { hasRealPreview } from "@/lib/kl/preview-ready";
import Link from "next/link";
import type { Asset } from "@/lib/kl/types";
import { img, clip as clipUrl, frame } from "@/lib/kl/media";
import PreviewMedia from "@/components/legacy/PreviewMedia";

export default function AssetCard({ asset }: { asset: Asset }) {
  if (!hasRealPreview(asset)) return null;
  const poster = asset.poster ? img(asset.poster) : asset.clip ? frame(asset.clip) : undefined;
  const category = asset.type.toLowerCase().replace(/^\w/, c => c.toUpperCase()).replace(/^3d/, "3D");
  return (
    <div className="bench-wall-cell">
      <Link href={`/item/${asset.slug}`} className="bench-card bench-original-card" aria-label={`${asset.name}, original ${category}${asset.free ? "" : ", Premium"}`}>
        <PreviewMedia gradient="var(--canvas-bg)" poster={poster} clip={asset.clip ? clipUrl(asset.clip) : undefined}
          alt={asset.name} play="auto" style={{ position: "absolute", inset: 0 }} />
        <span className="bench-card-kind">Original kit</span>
        {!asset.free && <span className="bench-premium" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/premium.svg" width="9" height="9" alt="" /><span>Premium</span>
        </span>}
        <span className="bench-card-scrim" />
        <span className="bench-card-caption"><strong>{asset.name}</strong><span>{category}</span></span>
      </Link>
    </div>
  );
}
