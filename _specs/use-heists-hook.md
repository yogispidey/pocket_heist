# Spec for use-heists-hook

branch: claude/feature/use-heists-hook

## Summary

- Create a `useHeists` hook that subscribes to real-time Firestore data from the `heists` collection and returns a typed array of `Heist` objects.
- The hook accepts a single `mode` argument (`'active'`, `'assigned'`, or `'expired'`) that determines the Firestore query applied.
- Use the hook in `app/(dashboard)/heists/page.tsx` to display the titles of each result set under the three existing section headings.

## Functional Requirements

- The hook must accept one argument, `mode`, with the union type `'active' | 'assigned' | 'expired'`.
- The hook must use `onSnapshot` (not `getDocs`) to subscribe to real-time updates from Firestore and unsubscribe on unmount.
- The hook must return `{ heists: Heist[], isLoading: boolean, error: string | null }`.
- Query behaviour by mode:
  - `'active'`: heists where `assignedTo` equals the current user's uid AND `deadline` is greater than now.
  - `'assigned'`: heists where `createdBy` equals the current user's uid AND `deadline` is greater than now.
  - `'expired'`: heists where `deadline` is less than now AND `finalStatus` is not null.
- Use `useUser()` to get the current user's uid for `active` and `assigned` queries.
- Use the `heistConverter` and `COLLECTIONS` constant from `types/firestore`.
- The `heists/page.tsx` page must become a Client Component (`"use client"`) and call `useHeists` three times — once per mode — to populate the three existing sections with heist titles.

## Possible Edge Cases

- The `expired` query does not filter by user — it returns all expired heists across all users.
- Firestore composite indexes may be required for the compound queries (`assignedTo` + `deadline`, `createdBy` + `deadline`, `deadline` + `finalStatus`). The spec does not provision them, but the implementation should note that missing indexes will surface as a console error with a link to create them.
- `useUser()` may return a null user briefly on first render — the hook should not fire the query until `user` is non-null for `active` and `assigned` modes.
- The real-time listener must be cleaned up (unsubscribed) when the component unmounts to avoid memory leaks.
- An empty result set is valid and should return an empty array, not an error.

## Acceptance Criteria

- `useHeists('active')` returns only heists assigned to the current user with a future deadline.
- `useHeists('assigned')` returns only heists created by the current user with a future deadline.
- `useHeists('expired')` returns all heists with a past deadline and a non-null `finalStatus`.
- The hook updates automatically when Firestore data changes without a page reload.
- `isLoading` is `true` until the first snapshot arrives, then `false`.
- An error during the snapshot subscription sets `error` to a human-readable message.
- The heists page renders each section with a list of heist titles under the correct heading.

## Open Questions

- Should the `expired` section be paginated or capped at a maximum number of results, given it could grow large over time?

## Testing Guidelines

Create a test file at `tests/hooks/useHeists.test.tsx`. Mock `firebase/firestore` (`onSnapshot`, `collection`, `query`, `where`, `orderBy`, `Timestamp`), `@/lib/firebase`, `@/context/AuthContext`, and `@/types/firestore`. Test the following cases:

- Returns an empty array with `isLoading: true` on initial render.
- Returns heists from the snapshot once data arrives.
- Calls `onSnapshot` with a query filtered by `assignedTo` for `'active'` mode.
- Calls `onSnapshot` with a query filtered by `createdBy` for `'assigned'` mode.
- Calls `onSnapshot` with a deadline/finalStatus filter for `'expired'` mode (no user filter).
- Sets `error` when the snapshot subscription returns an error.
- Unsubscribes (calls the returned unsubscribe function) on unmount.
