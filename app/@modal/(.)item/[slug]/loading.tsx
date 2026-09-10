import { LoadingAnnouncement, Shimmer } from "@/components/legacy/Skeleton";

/**
 * The overlay, before its asset has loaded.
 *
 * Without this file the modal slot had no boundary of its own, so an
 * intercepted click suspended the whole route and fell all the way up to
 * app/loading.tsx — which replaced the entire page. The panel then opened over
 * a blank screen, and the veil's blur had nothing behind it to blur. It read as
 * "the background isn't blurring"; it was really "the background is gone".
 *
 * A loading boundary inside the slot suspends only the slot. The library stays
 * mounted underneath, the veil frosts it exactly as designed, and the overlay
 * appears immediately with its shape already in place.
 *
 * Deliberately inert: no focus trap, no Escape handler, no scroll lock. Those
 * belong to ItemModal, which mounts a few hundred milliseconds later, and
 * duplicating them here would mean two components fighting over document.body
 * during the handover.
 */
export default function Loading() {
  return (
    <div data-kl>
      <div className="kl-modal-veil">
        <div className="kl-modal-panel">
          <LoadingAnnouncement what="the asset" />

          <div className="kl-crumbs" aria-hidden="true">
            <Shimmer h={11} w={128} r={99} />
            <span className="kl-spacer" />
            <Shimmer h={30} w={84} r={99} />
          </div>

          <div
            aria-hidden="true"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, .62fr)",
              gap: 28,
              marginTop: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Shimmer h={430} r={20} />
              <Shimmer h={34} w="42%" r={10} />
              <Shimmer h={15} w="68%" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Shimmer h={220} r={18} />
              <Shimmer h={180} r={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
