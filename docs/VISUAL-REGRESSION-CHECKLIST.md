# Visual regression checklist

Version 1.0 · 18 September 2026 · DR-005

## Capture matrix

Capture each completed route in both themes. Use a full-page image plus focused
captures for overlays and interactive states.

| Label | Viewport | Purpose |
| --- | --- | --- |
| `compact` | 390 × 844 | primary mobile approval width |
| `tablet` | 768 × 1024 | 8-column transition and navigation |
| `desktop` | 1024 × 900 | first 12-column/product split width |
| `wide` | 1440 × 1000 | gallery and maximum-container behavior |

Use `<route>--<state>--<theme>--<width>.png`, for example
`library--no-results--dark--390.png`.

## Capture order

1. Load the direct URL with a clean session.
2. Set theme explicitly and verify it persisted.
3. Wait for fonts and the primary image to settle.
4. Capture the stable page state.
5. Capture keyboard focus on the first meaningful action.
6. Capture menus, drawers, dialogs and filter sheets.
7. Repeat with reduced motion when spatial animation exists.
8. Record console errors, failed requests and horizontal overflow.

## Review checks

- No horizontal scroll at 390px or 200% zoom.
- Header, main landmark and footer remain present unless auth is intentionally focused.
- Page title, availability and next action appear before oversized media.
- Meaningful text does not clip or fall below 11px.
- Focus is visible; drawers and dialogs return focus when closed.
- Media reserves space, uses the correct fit and has a branded failure state.
- Both themes preserve hierarchy instead of merely inverting color.
- Reduced motion keeps all content and removes non-essential translation.
- Loading, empty, no-results and service-error states are distinct.
- Catalogue and access claims match real data and flags.

## Initial route set

Before DR-4, capture `/design-system`, `/`, `/library`, `/item/verdro`,
`/item/Asset`, item quick view, `/join` and `/account`. Reference screens need
populated plus relevant empty/error states; happy-path-only captures cannot pass.
