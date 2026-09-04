# Plan: Expired Heist Card

## Context

The `/heists` page currently renders expired heists as a plain `<ul>` list of titles. This feature replaces that with a styled `ExpiredHeistCard` that matches the Figma design (node 34-13), adds a matching `ExpiredHeistCardSkeleton`, and wires both into the page's Expired section.

The card layout differs significantly from `HeistCard`: it uses a **two-row horizontal layout** (top row = icon + title + datetime + badge; bottom row = To/By meta), a semi-transparent background, and a status badge driven by `finalStatus`.

**Decisions confirmed:** title links to `/heists/[id]`; badge label is `"FAILED"` / `"SUCCESS"` (uppercase, mirrors `finalStatus`).

---

## Files to Create

### `components/ExpiredHeistCard/ExpiredHeistCard.tsx`

- No `"use client"` — pure display, no hooks
- Props: `{ heist: Heist }` from `@/types/firestore`
- Imports: `Link` from `next/link`; `CircleX`, `User`, `Calendar` from `lucide-react`; styles from CSS Module
- `formattedDeadline`: same `toLocaleString` options as `HeistCard` (`"en-US"`, `month: "short"`, `day: "numeric"`, `hour: "numeric"`, `minute: "2-digit"`, `hour12: true`)
- Badge label: `"FAILED"` when `finalStatus === "failure"`, `"SUCCESS"` when `finalStatus === "success"`, `"PENDING"` fallback when `null`
- Badge CSS class: `styles.badgeFailed` (error colours) vs `styles.badgeSuccess` (success colours) vs `styles.badgePending`
- Structure:
  ```
  <div className={styles.card}>
    <div className={styles.topRow}>
      <div className={styles.topLeft}>
        <CircleX size={16} className={styles.expiredIcon} />
        <Link href={`/heists/${heist.id}`} className={styles.title}>{heist.title}</Link>
      </div>
      <div className={styles.topRight}>
        <div className={styles.datetime}>
          <Calendar size={12} className={styles.icon} />
          <span>{formattedDeadline}</span>
        </div>
        <span className={`${styles.badge} ${badgeClass}`}>{badgeLabel}</span>
      </div>
    </div>
    <div className={styles.bottomRow}>
      <div className={styles.metaGroup}>
        <User size={12} className={styles.icon} />
        <span className={styles.label}>To:</span>
        <span className={styles.assignee}>{heist.assignedToCodename}</span>
      </div>
      <div className={styles.metaGroup}>
        <User size={12} className={styles.icon} />
        <span className={styles.label}>By:</span>
        <span className={styles.creator}>{heist.createdByCodename}</span>
      </div>
    </div>
  </div>
  ```

### `components/ExpiredHeistCard/ExpiredHeistCard.module.css`

- `@reference "../../app/globals.css"` at top
- `.card`: `w-full rounded-[10px] flex flex-col; background: rgba(16, 24, 40, 0.30); border: 0.833px solid rgba(30, 41, 57, 0.30); gap: 8px; padding: 16px 16px 0`
  - Note: semi-transparent background cannot use Tailwind opacity modifier with CSS vars in v4 — use raw `rgba` values
- `.topRow`: `flex justify-between items-center`
- `.topLeft`: `flex items-center; gap: 24px`
- `.topRight`: `flex items-center; gap: 12px`
- `.expiredIcon`: `color: var(--color-body); flex-shrink: 0`
- `.title`: `text-heading text-base leading-6 hover:opacity-80; font-weight: 500; letter-spacing: -0.3125px`
- `.datetime`: `flex items-center text-sm; gap: 6px; color: var(--color-body); letter-spacing: -0.15px`
- `.icon`: `color: var(--color-body); flex-shrink: 0`
- `.badge`: `text-xs rounded; padding: 4px 8px; letter-spacing: 0.6px; text-transform: uppercase`
- `.badgeFailed`: `color: var(--color-error); background: rgba(255, 100, 103, 0.05); border: 0.833px solid rgba(255, 100, 103, 0.20)`
- `.badgeSuccess`: `color: var(--color-success); background: rgba(5, 223, 114, 0.05); border: 0.833px solid rgba(5, 223, 114, 0.20)`
- `.badgePending`: `color: var(--color-body); background: transparent; border: 0.833px solid var(--color-border)`
- `.bottomRow`: `flex items-center text-sm; gap: 16px; color: var(--color-body); padding-bottom: 4px`
- `.metaGroup`: `flex items-center; gap: 6px; letter-spacing: -0.15px`
- `.label`: `color: var(--color-body)`
- `.assignee`: `color: var(--color-primary)`
- `.creator`: `color: var(--color-secondary)`

### `components/ExpiredHeistCard/index.ts`

```ts
export { default } from "./ExpiredHeistCard";
```

### `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.tsx`

- No `"use client"`, no props
- Mirrors the two-row layout of `ExpiredHeistCard`:
  - Top row: icon block + title block (left); datetime block + badge block (right)
  - Bottom row: two meta groups, each with icon + label + value blocks
- All blocks use `.pulse` class (`bg-light rounded animate-pulse`)

### `components/ExpiredHeistCardSkeleton/ExpiredHeistCardSkeleton.module.css`

- Same `@reference` header
- `.card`: same background/border/radius/gap/padding as `ExpiredHeistCard`; `min-height: 86px`
- `.topRow`, `.topLeft`, `.topRight`, `.bottomRow`, `.metaGroup`: same flex rules as the card
- `.pulse`: `bg-light rounded animate-pulse`
- Block sizes: `iconBlock` 16×16, `titleBlock` h-5 w-48, `datetimeBlock` h-4 w-20, `badgeBlock` h-5 w-16 rounded, `labelBlock` h-3.5 w-6, `valueBlock` h-3.5 w-20

### `components/ExpiredHeistCardSkeleton/index.ts`

```ts
export { default } from "./ExpiredHeistCardSkeleton";
```

### `tests/components/ExpiredHeistCard.test.tsx`

- Mock `next/link` the same way as `HeistCard.test.tsx`
- `makeHeist(overrides)` helper defaulting to `finalStatus: "failure"`
- Tests:
  1. Renders title as `<a>` with `href="/heists/[id]"`
  2. Renders `assignedToCodename`
  3. Renders `createdByCodename`
  4. Renders a formatted deadline string
  5. Shows `"FAILED"` badge when `finalStatus === "failure"`
  6. Shows `"SUCCESS"` badge when `finalStatus === "success"`
  7. Shows `"PENDING"` and does not crash when `finalStatus === null`

---

## Files to Modify

### `app/(dashboard)/heists/page.tsx`

- Add imports: `ExpiredHeistCard` from `@/components/ExpiredHeistCard`; `ExpiredHeistCardSkeleton` from `@/components/ExpiredHeistCardSkeleton`
- Destructure `isLoading: expiredLoading` from the `useHeists("expired")` call
- Replace the `<ul>` in the Expired section with:
  ```tsx
  <div className="flex flex-col gap-3 mt-4">
    {expiredLoading
      ? [0, 1, 2].map((i) => <ExpiredHeistCardSkeleton key={i} />)
      : expiredHeists.map((h) => <ExpiredHeistCard key={h.id} heist={h} />)}
  </div>
  ```

---

## Verification

1. `npx vitest run tests/components/ExpiredHeistCard.test.tsx` — all 7 tests pass
2. `npx vitest run` — full suite stays green (no regressions)
3. `npm run dev`, sign in, visit `/heists` — Expired section shows skeleton rows while loading, then `ExpiredHeistCard` per expired heist; clicking the title navigates to `/heists/[id]`
