/**
 * Which of the six thumbnail grounds an asset gets.
 *
 * Derived from the slug rather than from a position in a list. Position looked
 * simpler and was wrong twice over: the item page had to fetch the whole
 * catalogue just to find an asset's index — a Sanity round trip per prerendered
 * page, for a background colour — and the index it found did not even match the
 * card, because grid order changes with every filter and sort.
 *
 * A hash is stable: the same asset is the same colour on the home strip, in a
 * filtered library, and on its own page, for as long as its slug does not
 * change.
 */

export const GROUNDS = ["--t1", "--t2", "--t3", "--t4", "--t5", "--t6"] as const;

/** FNV-1a, 32-bit. Small, no dependency, and well spread over short strings. */
export function groundFor(slug: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return GROUNDS[Math.abs(h) % GROUNDS.length];
}
