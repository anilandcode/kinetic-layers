/**
 * The empty state of the modal slot.
 *
 * Every route that is not an intercepted item renders this, and without it
 * Next has nothing to put in the slot on a hard navigation and 404s the whole
 * page. Returning null is the point.
 */
export default function Default() {
  return null;
}
