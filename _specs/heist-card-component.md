# Spec for heist-card-component

branch: claude/feature/heist-card-component
figma_component: https://www.figma.com/design/0JOCd6LHB7GB1rHJJrR3nW/Page-Designs?node-id=54-60&t=RzC32w9GGQ2MhU9v-0

## Summary

- Build a `HeistCard` component that displays a single heist's key details: title (linked to `/heists/:id`), assigned-to codename, created-by codename, and deadline with an overdue indicator.
- Build a `HeistCardSkeleton` component that renders a loading placeholder in the same card shape.
- Replace the plain title lists on `/heists` with a 3-column card grid for the Active and Assigned sections only. Expired section is unchanged.
- Add a new `--color-border: #1e2939` design token to `app/globals.css`.
- Create a stub page at `app/(dashboard)/heists/[id]/page.tsx` with no content, so title links don't 404.

## Functional Requirements

- `HeistCard` receives a `Heist` object as its sole prop and renders:
  - The heist **title** as a Next.js `<Link>` to `/heists/[heist.id]`
  - A **Clock icon** (16 px, top-right of the title row)
  - An **Assign to** row: `User` icon (12 px) + `assignedToCodename` in `--color-primary`
  - A **By** row: `User` icon (12 px) + `createdByCodename` in `--color-secondary`
  - A **Deadline** row: `Calendar` icon (12 px) + formatted date string. If `deadline < now`, append " • Overdue" in `--color-primary`
- `HeistCardSkeleton` renders the same card shape with animated pulse placeholder blocks replacing each text element.
- The `/heists` page renders:
  - **Your Active Heists** — 3-column grid of `HeistCardSkeleton` while `isLoading`, then `HeistCard` per result
  - **Heists You've Assigned** — same pattern
  - **All Expired Heists** — unchanged (no card treatment)
- The grid collapses to 1 column on mobile.

## Figma Design Reference

- File: Page-Designs (`0JOCd6LHB7GB1rHJJrR3nW`), node `54-60`
- Component name: HeistCard
- Key visual constraints:
  - Card: `~378×178px` in Figma → fluid `w-full` in a grid; column flex, padding `21px` top/left/right, `~1px` bottom
  - Background `var(--color-lighter)` (`#101828`); border `1px solid var(--color-border)` (`#1e2939` — new token); border-radius `10px`; no shadow
  - Two stacked sections, gap `~12px`: title row (title + Clock icon) and metadata column (three icon+text rows, gap `~8px`)
  - Title: Inter 16px / weight 400 / `--color-heading` / line-height 24px / letter-spacing -0.31px
  - Metadata labels ("To:", "By:", date): Inter 14px / weight 400 / `--color-body`
  - "To:" value → `--color-primary`; "By:" value → `--color-secondary`
  - Icons: `Clock` 16px top-right; `User` 12px (×2); `Calendar` 12px — all Lucide, icon colour `--color-body`
  - "Overdue" suffix: " • Overdue" appended after date string in `--color-primary`

## Possible Edge Cases

- The 3-skeleton loading row should use exactly 3 skeletons to match the column count.
- `assignedToCodename` or `createdByCodename` may be empty strings for older documents.
- The detail page stub (`/heists/[id]`) must exist to avoid Next.js 404 errors on card click.
- Grid should degrade gracefully: 3 columns on desktop → 1 column on mobile (consider 2-col on tablet).
- The `deadline` field on the `Heist` type is a `Date` — format it consistently (e.g. "Dec 5, 05:00 PM").

## Acceptance Criteria

- `HeistCard` renders the title as an anchor pointing to `/heists/[id]`.
- `HeistCard` shows "• Overdue" suffix (in `--color-primary`) when `deadline < now`.
- `HeistCard` does not show the suffix when `deadline >= now`.
- `HeistCardSkeleton` matches the card's outer dimensions and pulses.
- Active and Assigned sections show skeletons while loading, then real cards.
- Expired section is unaffected.
- `/heists/[id]` does not 404 (stub page exists).
- New `--color-border` token is added to `app/globals.css`.

## Open Questions

- Should the deadline be formatted as an absolute string (e.g. "Dec 5, 05:00 PM") or relative (e.g. "in 4h 32m")? Figma shows absolute; a live countdown would require `setInterval`.
- Should "Overdue" use `--color-primary` (as in Figma) or `--color-error` for stronger urgency signalling?

## Testing Guidelines

Create test files at `tests/components/HeistCard.test.tsx` and `tests/components/HeistCardSkeleton.test.tsx`.

**HeistCard:**

- Renders the heist title as a link to `/heists/[id]`
- Renders `assignedToCodename` in the "To:" row
- Renders `createdByCodename` in the "By:" row
- Renders a formatted deadline date
- Shows "Overdue" when `deadline` is in the past
- Does not show "Overdue" when `deadline` is in the future

**HeistCardSkeleton:**

- Renders without errors
- Contains placeholder elements (smoke test)
