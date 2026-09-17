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
    <div data-kl className="bench-item-overlay">
      <div className="kl-modal-veil">
        <div className="kl-modal-panel">
          <LoadingAnnouncement what="the asset" />

          <div className="bench-item-layout" aria-hidden="true">
            <div className="bench-item-stage"><Shimmer h={330} w="65%" r={18} /></div>
            <div className="bench-item-details" style={{ gap: 16 }}>
              <Shimmer h={40} w="70%" r={10} />
              <Shimmer h={80} r={10} />
              <Shimmer h={48} r={99} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
