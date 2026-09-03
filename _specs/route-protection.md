# Spec for route-protection

branch: claude/feature/route-protection

## Summary

- Add auth-based route protection to both route groups using the existing `useUser()` hook.
- `(public)` group pages (login, signup, splash) redirect authenticated users away to `/heists`.
- `(dashboard)` group pages redirect unauthenticated users to `/login`.
- Each group layout shows a simple loading indicator while Firebase resolves the initial auth state, so users never see a flash of the wrong page before a redirect fires.

## Functional Requirements

- Each route group must have its own layout component that imports `useUser()`.
- While `isLoading` is `true`, the layout renders a simple loader (e.g. a centred spinner or loading text) instead of the page content.
- Once `isLoading` is `false`:
  - `(public)` layout: if `user` is non-null, redirect to `/heists`; otherwise render `{children}`.
  - `(dashboard)` layout: if `user` is `null`, redirect to `/login`; otherwise render `{children}`.
- Redirects must use Next.js `useRouter().replace()` so the protected page is not added to browser history.
- The loader must be visually minimal — no complex animations or external dependencies.
- The existing `<Navbar>` in the dashboard layout is unaffected by this change.

## Possible Edge Cases

- `isLoading` may remain `true` briefly on every page load — the loader must always be shown during this window to prevent a flash of the wrong content.
- Fast networks may resolve auth state before the first render paint — the loader should still be rendered at least once (no skipping the loading state).
- A user whose session expires mid-session will be redirected to `/login` on the next navigation to a dashboard page.
- The splash page `/` sits in the `(public)` group — a logged-in user visiting `/` should be redirected to `/heists`.
- The layouts are Client Components (they use hooks); the page files themselves may remain Server Components.

## Acceptance Criteria

- Visiting a `(public)` page while logged in redirects to `/heists`.
- Visiting a `(dashboard)` page while logged out redirects to `/login`.
- A loading indicator is shown on both groups while auth state is being resolved.
- After redirect, the browser back button does not return the user to the protected page.
- No existing page content or component breaks as a result of these layout changes.
- The `<Navbar>` continues to render correctly on dashboard pages.

## Open Questions

- Should the splash page `/` be treated as fully public (redirect logged-in users) or neutral (no redirect, show landing either way)?
- What should the loader look like — a spinner, a pulsing dot, or plain text ("Loading…")? spinner, using the clock icon from the title

## Testing Guidelines

Create test files in `./tests/` for each layout. Test the following cases without going too heavy:

**Public layout (`app/(public)/layout.tsx`):**

- Renders children when `isLoading` is `false` and `user` is `null`.
- Shows a loader when `isLoading` is `true`.
- Redirects to `/heists` when `isLoading` is `false` and `user` is present.

**Dashboard layout (`app/(dashboard)/layout.tsx`):**

- Renders children when `isLoading` is `false` and `user` is present.
- Shows a loader when `isLoading` is `true`.
- Redirects to `/login` when `isLoading` is `false` and `user` is `null`.
