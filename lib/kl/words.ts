/**
 * Small numbers as words.
 *
 * The design's voice writes counts out — "Two hundred and forty things worth
 * stealing" — which reads well but hardcoded a number that was never true. This
 * keeps the voice while letting the count come from the catalogue.
 *
 * Above a thousand it gives up and returns digits, which is the right place to
 * stop: nobody wants to read "three thousand four hundred and twelve".
 */

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function spell(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n >= 1000) return String(n);
  const i = Math.floor(n);
  if (i < 20) return ONES[i];
  if (i < 100) {
    const t = TENS[Math.floor(i / 10)];
    return i % 10 ? `${t}-${ONES[i % 10]}` : t;
  }
  const hundreds = `${ONES[Math.floor(i / 100)]} hundred`;
  const rest = i % 100;
  return rest ? `${hundreds} and ${spell(rest)}` : hundreds;
}

/** Capitalised, for the start of a sentence. */
export const Spell = (n: number) => {
  const s = spell(n);
  return s.charAt(0).toUpperCase() + s.slice(1);
};
