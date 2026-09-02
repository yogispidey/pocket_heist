# Spec for auth-state-management

branch: claude/feature/auth-state-management

## Summary

- Add a global Firebase Auth listener that tracks the signed-in user in real time.
- Expose the current user via a `useUser` hook that any page or component can call.
- The hook returns `null` when no user is signed in and the Firebase `User` object when they are.
- No sign-up, login, or logout UI is in scope — this is purely the listener and hook.

## Functional Requirements

- A React context (`AuthContext`) must hold the current user state and be available to the entire app.
- The context provider must attach a Firebase `onAuthStateChanged` listener on mount and detach it on unmount.
- The listener must update the context value whenever the auth state changes (login or logout elsewhere will reflect immediately).
- A `useUser` hook must read from `AuthContext` and return the current user value.
- `useUser` must throw a helpful error if called outside the provider.
- The provider must be placed high enough in the component tree (e.g. root layout) so every page and component can use `useUser` without additional setup.
- The provider must handle the initial loading period before Firebase has resolved the first auth state check — expose an `isLoading` boolean so consumers can defer rendering if needed.
- No sign-up, login, or log-out logic should be included in this feature.

## Possible Edge Cases

- Firebase may briefly return `null` on first load before the persisted session is restored — `isLoading` must cover this window.
- The provider being rendered in a Server Component (Next.js App Router) is not valid — it must be a Client Component.
- Multiple calls to `useUser` on the same page must all reflect the same user object without triggering extra listeners.
- Hot-module reload / fast refresh must not register duplicate listeners.

## Acceptance Criteria

- `useUser()` returns `null` when no user is signed in.
- `useUser()` returns the Firebase `User` object when a user is signed in.
- Changing auth state (e.g. signing in or out in a separate tab or via console) updates all components that call `useUser` without a page refresh.
- `isLoading` is `true` until the first `onAuthStateChanged` callback fires, then `false`.
- Calling `useUser` outside the provider throws an informative error.
- No existing pages or components break after the provider is added.

## Open Questions

- Should `isLoading` be exposed as part of `useUser`'s return value, or as a separate `useAuthLoading` hook?
- Are there any dashboard pages that should redirect to `/login` when `user` is `null`? (Out of scope for this spec but worth noting for next iteration.)

## Testing Guidelines

Create a test file in `./tests` for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `useUser` returns `null` when rendered inside the provider with no signed-in user.
- `useUser` returns a mock user object when the provider supplies one.
- `useUser` throws when called outside the provider.
- `isLoading` starts as `true` and becomes `false` after the auth state resolves.
