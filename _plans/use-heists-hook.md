# Plan: useHeists Hook

## Context

The heists page (`app/(dashboard)/heists/page.tsx`) is a static stub with three empty sections. This feature adds a `useHeists` hook that subscribes to real-time Firestore snapshots and returns filtered heist arrays, then wires those arrays into the page to display heist titles.

## Approach

Create `hooks/useHeists.ts` — a `"use client"` hook that accepts a `mode` argument and opens one `onSnapshot` listener with the appropriate compound query. Follow the `AuthContext.tsx` pattern exactly: `useState` + `useEffect`, subscription returned as cleanup, `isLoading` starts `true` and flips `false` on first snapshot.

The page calls the hook three times (once per mode) and renders each result set as a title list.

---

## Files to Create

### `hooks/useHeists.ts`

- `"use client"` directive
- Imports: `useState`, `useEffect` from React; `collection`, `onSnapshot`, `query`, `where`, `Timestamp` from `firebase/firestore`; `db` from `@/lib/firebase`; `useUser` from `@/context/AuthContext`; `Heist`, `COLLECTIONS`, `heistConverter` from `@/types/firestore`
- Type: `export type HeistMode = 'active' | 'assigned' | 'expired'`
- Signature: `export function useHeists(mode: HeistMode): { heists: Heist[]; isLoading: boolean; error: string | null }`
- State: `heists` (default `[]`), `isLoading` (default `true`), `error` (default `null`)
- `{ user } = useUser()`
- `useEffect` depends on `[mode, user]`:
  - For `active` and `assigned`: return early (do nothing, keep `isLoading: true`) if `user` is null
  - Build the Firestore query via `query(collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter), ...whereClauses)`:
    - `active`: `where("assignedTo", "==", user.uid)`, `where("deadline", ">=", Timestamp.now())`
    - `assigned`: `where("createdBy", "==", user.uid)`, `where("deadline", ">=", Timestamp.now())`
    - `expired`: `where("deadline", "<", Timestamp.now())`, `where("finalStatus", "in", ["success", "failure"])`
  - Call `onSnapshot(q, (snapshot) => { setHeists(snapshot.docs.map(d => d.data())); setIsLoading(false); }, (err) => { setError("Failed to load heists."); setIsLoading(false); })`
  - Return the unsubscribe function from the effect cleanup

### `tests/hooks/useHeists.test.tsx`

Mock pattern: `vi.hoisted` + `vi.mock` for `firebase/firestore`, `@/lib/firebase`, `@/context/AuthContext`, `@/types/firestore`. The `mockOnSnapshot` mock captures its callback — call it manually inside `act` to simulate snapshot events.

Tests:

1. Returns `isLoading: true` and empty `heists` array before first snapshot
2. Returns heist array once the snapshot fires
3. Calls `onSnapshot` with `assignedTo == uid` and `deadline >= now` for `'active'` mode
4. Calls `onSnapshot` with `createdBy == uid` and `deadline >= now` for `'assigned'` mode
5. Calls `onSnapshot` with `deadline < now` and `finalStatus in [...]` for `'expired'` mode (no user filter)
6. Sets `error` when the snapshot listener receives an error
7. Calls the unsubscribe function on unmount

---

## Files to Modify

### `app/(dashboard)/heists/page.tsx`

- Add `"use client"` directive (required for hooks)
- Import `useHeists` from `@/hooks/useHeists`
- Call the hook three times:
  - `const { heists: activeHeists } = useHeists('active')`
  - `const { heists: assignedHeists } = useHeists('assigned')`
  - `const { heists: expiredHeists } = useHeists('expired')`
- Under each section heading, render a `<ul>` of `<li>` elements showing `heist.title` for each array

---

## Verification

1. `npx vitest run tests/hooks/useHeists.test.tsx` — all 7 tests pass
2. `npx vitest run` — full suite stays green
3. `npm run dev`, sign in, create a heist via `/heists/create`, visit `/heists` — title appears in the correct section
