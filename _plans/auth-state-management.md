# Plan: Auth State Management

## Context

The app has Firebase Auth enabled (email/password) and a Firebase app instance in `lib/firebase.ts`, but no mechanism for components to know whether a user is signed in. This feature adds a global `onAuthStateChanged` listener and exposes the current user through a `useUser()` hook, so any page or component can react to auth state without prop-drilling. No login/logout/signup logic is in scope.

## Approach

Create an `AuthContext` with a Client Component provider that wires the Firebase listener. Mount the provider in the root layout so both the `(public)` and `(dashboard)` route groups are covered. Expose `user` (Firebase `User | null`) and `isLoading: boolean` via a `useUser()` hook.

`isLoading` will be returned from `useUser()` itself as `{ user, isLoading }` — no separate hook needed.

---

## Files to Modify

### `lib/firebase.ts`

- Import `getAuth` from `firebase/auth`
- Add `export const auth = getAuth(app)` below the existing `app` export
- Keeps Firebase initialisation central; the provider imports `auth` from here

### `app/layout.tsx`

- Import `<AuthProvider>` (a new Client Component)
- Wrap `{children}` inside `<body>` with `<AuthProvider>{children}</AuthProvider>`
- The root layout is a Server Component so the provider must live in its own file — this is the standard Next.js App Router pattern

---

## Files to Create

### `context/AuthContext.tsx`

- `"use client"` at the top
- Create `AuthContext` with shape `{ user: User | null; isLoading: boolean }`
- `AuthProvider` component:
  - State: `user` (default `null`), `isLoading` (default `true`)
  - `useEffect`: call `onAuthStateChanged(auth, (u) => { setUser(u); setIsLoading(false); })` and return the unsubscribe function to clean up on unmount
  - Renders `<AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>`
- `useUser()` hook:
  - Reads from `AuthContext`
  - Throws `Error("useUser must be used inside AuthProvider")` if context is `undefined`
  - Returns `{ user, isLoading }`
- Default export: `AuthProvider`; named export: `useUser`

### `tests/context/AuthContext.test.tsx`

Use the same Vitest + Testing Library stack as the other test files. Mock `firebase/auth` with `vi.mock`.

Tests:

1. `useUser` returns `{ user: null, isLoading: false }` inside provider when `onAuthStateChanged` fires with `null`
2. `useUser` returns the mock user object when the listener fires with a user
3. `useUser` throws with the correct message when called outside `AuthProvider`
4. `isLoading` is `true` before `onAuthStateChanged` fires, `false` after

---

## Verification

1. Run `npx vitest run tests/context/AuthContext.test.tsx` — all 4 tests pass
2. Run `npm run dev`, visit `/heists` — no console errors, app renders normally
3. In the browser console, sign in via Firebase Auth to confirm `useUser()` returns the signed-in user in a component that calls it

## Out of Scope
- Do not use the hook anywhere in application yet