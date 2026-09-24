import s from "@/components/v2/KitDialog.module.css";

/**
 * The quick view before its kit has loaded.
 *
 * A boundary inside the slot suspends only the slot, so the page behind stays
 * mounted and the veil has something to frost. Deliberately inert — the focus
 * trap and Escape belong to KitDialog, which mounts a moment later, and two
 * components must not fight over document.body during the handover.
 */
export default function Loading() {
  return (
    <div data-v2 className={s.layer}>
      <div className={s.veil}>
        <div className={s.panel} aria-busy="true">
          <p className="v-sr" role="status">Loading the kit…</p>
          <div className={s.layout} aria-hidden="true">
            <div className={s.stage}>
              <div className={`${s.frame} ${s.skeletonBlock}`} style={{ ["--ratio" as string]: "1.4" }} />
            </div>
            <div className={s.details}>
              <div className={s.skeletonBlock} style={{ height: 18, width: "40%" }} />
              <div className={s.skeletonBlock} style={{ height: 44, width: "75%" }} />
              <div className={s.skeletonBlock} style={{ height: 64 }} />
              <div className={s.skeletonBlock} style={{ height: 52, marginTop: "auto" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
