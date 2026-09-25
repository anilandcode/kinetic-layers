/**
 * The Kinetic Layers mark: three glass layers folding over one another, the
 * lowest lit ember from within (public/brand/mark.png — the owner's logo,
 * trimmed and reduced to a 128px palette PNG; app/icon.png and
 * app/apple-icon.png are cut from the same source).
 *
 * Decorative wherever it appears: the brand name always sits beside it.
 */
export default function Mark({ size = 26 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- an 8 KB fixed asset; next/image would add a round trip
    <img
      src="/brand/mark.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ display: "block", width: size, height: size, objectFit: "contain" }}
    />
  );
}
