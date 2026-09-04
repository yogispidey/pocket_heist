# Spec for expired-heist-card

branch: claude/feature/expired-heist-card  
figma_component: Page-Designs / node 34-13

## Summary

- Add an `ExpiredHeistCard` component for rendering a single heist in the Expired section of the `/heists` page.
- The card is read-only (no click/hover interaction required) and displays the heist title, deadline datetime, assignee, creator, and a status badge (Failed or Success).
- It replaces the existing plain `<ul>` list items for expired heists on the `/heists` page.
- A matching `ExpiredHeistCardSkeleton` provides a loading placeholder with the same dimensions.

## Functional Requirements

- Accept a `{ heist: Heist }` prop; `heist.finalStatus` will be `"success"` or `"failure"` (never `null` for expired heists).
- Display a `CircleX` icon (16 px, `--color-body`) at the start of the top row as an expired indicator.
- Display the heist title in the top row (16 px, weight 500, `--color-heading`).
- Display the formatted deadline in the top row, right side, with a `Calendar` icon (12 px, `--color-body`).
- Display the status badge in the top row, far right: `"FAILED"` or `"SUCCESS"` in uppercase, 12 px, letter-spaced, coloured with `--color-error` or `--color-success` respectively, with matching low-opacity background and border.
- Display a second row with "To: @assigneeCodename" and "By: @creatorCodename", each prefixed by a `User` icon (12 px). Assignee uses `--color-primary`, creator uses `--color-secondary`.
- Format the deadline as: `"Sep 4, 5:00 PM"` (same locale options as `HeistCard`).
- Card background: `--color-lighter` at 30 % opacity; border: `--color-border` at 30 % opacity; border-radius: 10 px.

## Figma Design Reference

- File: `https://www.figma.com/design/0JOCd6LHB7GB1rHJJrR3nW/Page-Designs?node-id=34-13`
- Component name: Expired Heist Card (node 34-13)
- Key visual constraints:
  - Card width: `w-full`; padding: `pt-4 px-4 pb-0`; row gap: `~8 px`
  - Top row: `flex justify-between items-center`; left group: icon + title with `gap-6`; right group: datetime + badge with `gap-3`
  - Bottom row: `flex gap-4 items-center`; each meta group: icon + text with `gap-1.5`
  - Badge: `border-radius: 4px`, padding `~8px horizontal / ~4px vertical`, text `uppercase`, `letter-spacing: 0.6px`
  - All colours map to existing tokens — no net-new tokens needed
  - Background uses semi-transparent `rgba(var(--color-lighter), 0.30)` — **requires inline style or a new CSS variable** since Tailwind opacity modifiers don't work with custom CSS vars in v4 the same way

## Possible Edge Cases

- `finalStatus` could technically be `null` if the component is rendered before the status is set — guard with a fallback ("Pending" badge or no badge).
- The `--color-lighter` semi-transparent background cannot be expressed with `bg-lighter/30` in Tailwind v4 (CSS var opacity modifier) — use `rgba(16, 24, 40, 0.30)` directly in CSS.
- Badge colour is driven by `finalStatus`; a `success` variant swaps `--color-error` for `--color-success` across background, border, and text.

## Acceptance Criteria

- `ExpiredHeistCard` renders the title, deadline, assignee handle, creator handle, and status badge.
- Failed heists show a red badge (`--color-error`); successful heists show a green badge (`--color-success`).
- The expired indicator icon (`CircleX`) is always visible in the top row.
- The `/heists` page Expired section renders `ExpiredHeistCard` per heist and `ExpiredHeistCardSkeleton` while `isLoading` is true.
- No existing tests regress.

## Open Questions

None — decisions confirmed:

- Card title links to `/heists/[id]` (same as `HeistCard`).
- Badge labels mirror `finalStatus` values: `"FAILED"` when `finalStatus === "failure"`, `"SUCCESS"` when `finalStatus === "success"` (uppercase via CSS).

## Testing Guidelines

Create `tests/components/ExpiredHeistCard.test.tsx`:

- Renders title, assignee codename, and creator codename.
- Shows `"FAILED"` badge when `finalStatus === "failure"`.
- Shows `"SUCCESS"` badge when `finalStatus === "success"`.
- Renders a formatted deadline string.
- Renders the `CircleX` expired indicator (can check for the element via accessible name or test id).
- Does not crash when `finalStatus` is `null` (edge-case guard).
