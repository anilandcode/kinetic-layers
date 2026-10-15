import s from "@/components/v2/Skeleton.module.css";
import a from "@/components/v2/account/Account.module.css";

/**
 * Panel-only, deliberately: this sits inside app/account/layout.tsx, which has
 * already drawn the shell, the hero and the tabs — a full-page skeleton here
 * would paint a second header under the real one.
 */
export default function Loading() {
  return (
    <div aria-busy="true">
      <p className="v-sr" role="status">
        Loading your account…
      </p>
      <div aria-hidden="true" className={a.stats}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={s.block} style={{ height: 200, borderRadius: 26 }} />
        ))}
      </div>
      <div aria-hidden="true" className={a.split} style={{ marginTop: "1.25rem" }}>
        <span className={s.block} style={{ height: 260, borderRadius: 26 }} />
        <span className={s.block} style={{ height: 260, borderRadius: 26 }} />
      </div>
    </div>
  );
}
