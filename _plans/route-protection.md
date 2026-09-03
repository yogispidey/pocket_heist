# Plan: Route Protection

## Context

Both route group layouts exist but have no auth awareness. Any user can visit `/login` while signed in, or `/heists` while signed out, and see the wrong page. This feature adds auth guards to both group layouts using the existing `useUser()` hook — showing a `Clock8` spinner while Firebase resolves auth state, then redirecting to the correct destination.

## Approach

Add `"use client"` to both existing group layouts and wire `useUser()` + `useRouter().replace()` directly inside them. This is the minimal change — no new component files needed. The spinner reuses the `Clock8` icon already imported in `Navbar.tsx`, sized up and animated with `animate-spin`. The splash page `/` is in the `(public)` group and will also redirect logged-in users to `/heists`.

---

## Files to Modify

### `app/(public)/layout.tsx`

- Add `"use client"` as the first line
- Import `useUser` from `@/context/AuthContext`
- Import `useRouter` from `next/navigation`
- Import `Clock8` from `lucide-react`
- Import `useEffect` from `react`
- Call `const { user, isLoading } = useUser()`
- Call `const router = useRouter()`
- Use `useEffect` to redirect: when `!isLoading && user`, call `router.replace("/heists")`
- While `isLoading`, render a centred `<Clock8>` spinner (Tailwind `animate-spin`, size 32)
- When `!isLoading && !user`, render `{children}`
- Use the existing `.center-content` global utility class for the spinner wrapper

### `app/(dashboard)/layout.tsx`

- Add `"use client"` as the first line
- Import `useUser`, `useRouter`, `Clock8`, `useEffect` (same set as above)
- When `!isLoading && !user`, call `router.replace("/login")`
- While `isLoading`, render the same centred `Clock8` spinner
- When `!isLoading && user`, render the existing `<Navbar />{children}` structure unchanged

---

## Files to Create

### `tests/layouts/public-layout.test.tsx`

Mock pattern: same `vi.hoisted` + `vi.mock("@/context/AuthContext")` + `vi.mock("next/navigation")` pattern as `tests/components/Navbar.test.tsx`.

Tests:

1. Renders children when `isLoading: false` and `user: null`
2. Renders the spinner (Clock8) when `isLoading: true`
3. Calls `router.replace("/heists")` when `isLoading: false` and `user` is present

### `tests/layouts/dashboard-layout.test.tsx`

Same mock pattern.

Tests:

1. Renders children (and Navbar) when `isLoading: false` and `user` is present
2. Renders the spinner when `isLoading: true`
3. Calls `router.replace("/login")` when `isLoading: false` and `user: null`

> Note: mock `@/components/Navbar` as a simple `() => <div data-testid="navbar" />` to keep dashboard layout tests isolated.

---

## Verification

1. `npx vitest run tests/layouts/` — all 6 new tests pass
2. `npx vitest run` — full suite (29+ tests) stays green
3. `npm run dev`:
   - Visit `/login` while signed in → redirected to `/heists`
   - Visit `/heists` while signed out → redirected to `/login`
   - On a slow connection, briefly see the spinner before redirect fires
   - Splash page `/` while signed in → redirected to `/heists`
   - Back button after redirect does not return to the protected page
