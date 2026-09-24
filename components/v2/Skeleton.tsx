import { ShellFrame } from "./Shell";
import l from "./layout.module.css";
import s from "./Skeleton.module.css";

/**
 * What a v2 route shows while its server components fetch: the real header,
 * and the shape the content will take, so nothing jumps when it arrives. The
 * words are for screen readers, in a polite live region.
 */
export default function Skeleton({ what, shape }: { what: string; shape: "page" | "kit" | "grid" }) {
  return (
    <ShellFrame pending>
      <main className={l.container} aria-busy="true">
        <p className="v-sr" role="status">
          Loading {what}…
        </p>
        <div aria-hidden="true" className={s.stack}>
          {shape === "kit" ? (
            <>
              <div className={s.row}>
                <span className={s.block} style={{ width: 180, height: 14 }} />
              </div>
              <span className={s.block} style={{ width: "min(34rem, 80%)", height: 56 }} />
              <span className={s.block} style={{ width: "min(26rem, 60%)", height: 18 }} />
              <span className={`${s.block} ${s.stage}`} />
              <div className={s.split}>
                <span className={s.block} style={{ height: 120 }} />
                <span className={s.block} style={{ height: 260 }} />
              </div>
            </>
          ) : shape === "grid" ? (
            <>
              <span className={s.block} style={{ width: "min(30rem, 70%)", height: 48 }} />
              <div className={s.grid}>
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className={`${s.block} ${s.card}`} />
                ))}
              </div>
            </>
          ) : (
            <>
              <span className={s.block} style={{ width: "min(40rem, 85%)", height: 72 }} />
              <span className={s.block} style={{ width: "min(30rem, 70%)", height: 18 }} />
              <span className={`${s.block} ${s.stage}`} />
            </>
          )}
        </div>
      </main>
    </ShellFrame>
  );
}
