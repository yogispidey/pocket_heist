# Plan: Navbar Logout Button

## Context

The app has Firebase Auth and a global `useUser()` hook, but the Navbar has no way to sign the user out. This feature adds a Logout button to `<Navbar>` that is visible only when a user is signed in and calls Firebase `signOut` when clicked. No redirect on logout is in scope.

## Approach

Convert `Navbar.tsx` to a Client Component (add `"use client"`), call `useUser()` to gate visibility, and call `signOut(auth)` directly on click. No changes to `AuthContext` — `signOut` is called inline from `firebase/auth`. A local `isSigning` state disables the button while the request is in flight.

---

## Files to Modify

### `components/Navbar/Navbar.tsx`

- Add `"use client"` as the first line (required to use hooks)
- Import `useUser` from `@/context/AuthContext`
- Import `signOut` from `firebase/auth`
- Import `auth` from `@/lib/firebase`
- Add local `isSigning` state (boolean, default `false`)
- Read `{ user, isLoading }` from `useUser()`
- Add an async `handleLogout` function:
  - Sets `isSigning(true)`
  - Calls `await signOut(auth)` inside try/catch (errors logged, not thrown)
  - Sets `isSigning(false)` in a `finally` block
- Render the Logout button conditionally: only when `!isLoading && user !== null`
- Button has `disabled={isSigning}`, `onClick={handleLogout}`, `className={styles.logoutBtn}`
- Place the button inside the existing `<ul>` alongside the Create New Heist link

### `components/Navbar/Navbar.module.css`

- Add `.logoutBtn` class matching the Figma outline style:
  - Transparent background, 1px solid white border, `rounded-[10px]`
  - `px-4 py-2 text-white text-base font-normal tracking-[-0.02em]`
  - `hover:opacity-80 transition-opacity`
  - `disabled:opacity-50 disabled:cursor-not-allowed`

### `tests/components/Navbar.test.tsx`

- Add `vi.mock("@/context/AuthContext", ...)` at the top using `vi.hoisted()` for the mock user value so all existing and new tests can control the `useUser` return value
- Also add `vi.mock("firebase/auth", ...)` and `vi.mock("@/lib/firebase", ...)` to support `signOut` calls
- Update the two existing tests to set `useUser` to return `{ user: null, isLoading: false }` (no user = current behaviour, no logout button rendered)
- Add new tests:
  1. Logout button is **not** rendered when `user` is `null`
  2. Logout button is rendered when `user` is present
  3. Clicking Logout calls `signOut`
  4. Logout button is disabled while sign-out is in flight

---

## Files to Create

None.

---

## Verification

1. Run `npx vitest run tests/components/Navbar.test.tsx` — all tests pass (existing + new)
2. Run `npx vitest run` — full suite green, no regressions
3. Start dev server (`npm run dev`), sign in via the signup page, confirm the Logout button appears in the Navbar
4. Click Logout — button disables briefly, then disappears as `user` becomes `null`
5. Confirm no redirect occurs (user stays on current page)
