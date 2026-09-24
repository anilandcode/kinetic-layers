import s from "./fx.module.css";

/**
 * Fluted glass over an image — the ribbed pane over the portrait in the dark
 * dashboard reference.
 *
 * The picture is cut into vertical ribs. Each rib shows the part of the image
 * behind it, magnified about its own centre, so edges step and shift the way
 * light bends through reeded glass; a highlight and a shade along each rib
 * give it depth. Pure CSS and one image URL, repeated from cache.
 */
export default function Fluted({
  src,
  ribs = 16,
  zoom = 1.22,
  className,
}: {
  src: string;
  ribs?: number;
  /** How strongly each rib magnifies what is behind it. */
  zoom?: number;
  className?: string;
}) {
  return (
    <span className={`${s.fluted} ${className ?? ""}`} aria-hidden="true">
      {Array.from({ length: ribs }, (_, i) => (
        <span key={i} className={s.rib}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              width: `${ribs * 100}%`,
              left: `${-i * 100}%`,
              transformOrigin: `${((i + 0.5) / ribs) * 100}% 50%`,
              transform: `scale(${zoom}, 1.08) translateX(${(i % 2 ? 1 : -1) * 2}%)`,
            }}
          />
        </span>
      ))}
    </span>
  );
}
