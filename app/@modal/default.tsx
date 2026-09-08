/**
 * Nothing in the modal slot unless an interception matched.
 *
 * Next renders `default` for a parallel route on any path the slot has no
 * segment for — including a hard load of /item/[slug], which must be the full
 * page rather than an overlay floating over nothing.
 */
export default function Default() {
  return null;
}
