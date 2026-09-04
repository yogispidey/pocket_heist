# Plan: Heist Card Component

## Context

The `/heists` page currently renders plain `<li>` title lists. This feature replaces those with a styled `HeistCard` for the active and assigned sections, adds a `HeistCardSkeleton` for loading states, and adds a `--color-border` token. The detail page route already has its directory (`app/(dashboard)/heists/[id]/`) but may need a stub `page.tsx` — verify on implementation.

**Decisions confirmed:** deadline = absolute date string; "Overdue" colour = `--color-primary`.

---

## Files to Create

### `components/HeistCard/HeistCard.tsx`

- No `"use client"` — pure display, no hooks
- Props: `{ heist: Heist }` (imported from `@/types/firestore`)
- Imports: `Link` from `next/link`; `Clock`, `User`, `Calendar` from `lucide-react`; styles from CSS Module
- `const isOverdue = heist.deadline < new Date()`
- `formattedDeadline`: `heist.deadline.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })`
- Structure:
  - Outer `<div className={styles.card}>`
  - Title row: `<div className={styles.titleRow}>` → `<Link href={/heists/${heist.id}} className={styles.title}>{heist.title}</Link>` + `<Clock size={16} className={isOverdue ? styles.clockOverdue : styles.clock} />`
  - Meta column: `<div className={styles.meta}>` with three rows (each `<div className={styles.metaRow}>`):
    - `<User size={12} /> <span className={styles.label}>To:</span> <span className={styles.assignee}>{heist.assignedToCodename}</span>`
    - `<User size={12} /> <span className={styles.label}>By:</span> <span className={styles.creator}>{heist.createdByCodename}</span>`
    - `<Calendar size={12} /> <span className={styles.date}>{formattedDeadline}{isOverdue && <span className={styles.overdue}> • Overdue</span>}</span>`

### `components/HeistCard/HeistCard.module.css`

- `@reference "../../app/globals.css"` at top
- `.card`: `@apply bg-lighter rounded-[10px] flex flex-col; border: 1px solid var(--color-border); gap: 12px; padding: 21px 21px 1px;`
- `.titleRow`: `@apply flex justify-between items-start gap-2`
- `.title`: `@apply text-heading text-base leading-6 hover:opacity-80; letter-spacing: -0.3125px;`
- `.clock`: `@apply text-body`
- `.clockOverdue`: `color: var(--color-primary)`
- `.meta`: `@apply flex flex-col; gap: 8px;`
- `.metaRow`: `@apply flex items-center gap-2 text-sm text-body`
- `.label`: `@apply text-body`
- `.assignee`: `color: var(--color-primary)`
- `.creator`: `color: var(--color-secondary)`
- `.date`: `@apply text-body`
- `.overdue`: `color: var(--color-primary)`

### `components/HeistCard/index.ts`

- `export { default } from "./HeistCard"`

### `components/HeistCardSkeleton/HeistCardSkeleton.tsx`

- No `"use client"`
- No props
- Same card shape as `HeistCard` using the same `.card` styles (import own CSS Module)
- Title row: wide placeholder block + small square placeholder (for clock icon)
- Meta column: three rows, each with a small square + two short blocks
- All placeholder blocks use `@apply bg-light rounded animate-pulse`

### `components/HeistCardSkeleton/HeistCardSkeleton.module.css`

- `@reference "../../app/globals.css"`
- `.card`: same values as `HeistCard` — `bg-lighter`, `rounded-[10px]`, border, gap, padding; add `min-h-[178px]` to hold the shape while empty
- `.titleRow`: `@apply flex justify-between items-start gap-2`
- `.meta`: `@apply flex flex-col; gap: 8px;`
- `.metaRow`: `@apply flex items-center gap-2`
- `.pulse`: `@apply bg-light rounded animate-pulse`

### `components/HeistCardSkeleton/index.ts`

- `export { default } from "./HeistCardSkeleton"`

### `tests/components/HeistCard.test.tsx`

- Mock `next/link`: `vi.mock("next/link", () => ({ default: ({ href, children }) => <a href={href}>{children}</a> }))`
- No Firebase mocks needed — pure display component
- Use a `makeHeist(overrides)` helper that builds a valid `Heist` object
- Tests:
  1. Renders title as `<a>` with `href="/heists/[id]"`
  2. Renders `assignedToCodename` in the "To:" row
  3. Renders `createdByCodename` in the "By:" row
  4. Renders a formatted deadline string
  5. Shows "Overdue" when `deadline` is set to a past date
  6. Does not show "Overdue" when `deadline` is a future date

### `tests/components/HeistCardSkeleton.test.tsx`

- Renders without errors
- Smoke test for presence of pulse placeholder elements

---

## Files to Modify

### `app/globals.css`

- Inside `@theme {}`, add: `--color-border: #1e2939;`

### `app/(dashboard)/heists/page.tsx`

- Add imports: `HeistCard` from `@/components/HeistCard`; `HeistCardSkeleton` from `@/components/HeistCardSkeleton`
- Destructure `isLoading` from the `active` and `assigned` `useHeists` calls
- Replace the `<ul>` in the Active section with a grid `<div>` that renders 3× `HeistCardSkeleton` while loading, then `HeistCard` per heist
- Same for the Assigned section
- Grid classes: `grid grid-cols-1 md:grid-cols-3 gap-4 mt-4`
- Expired section stays as-is (plain `<ul>`)

### `app/(dashboard)/heists/[id]/page.tsx` (create if missing)

- If no `page.tsx` exists in that directory, create a minimal stub that returns `null`

---

## Verification

1. `npx vitest run tests/components/HeistCard.test.tsx` — all 6 tests pass
2. `npx vitest run tests/components/HeistCardSkeleton.test.tsx` — passes
3. `npx vitest run` — full suite (49 tests) stays green
4. `npm run dev`, sign in, visit `/heists` — skeleton grid appears while loading, real cards once data arrives; clicking a title navigates to `/heists/[id]` without 404
