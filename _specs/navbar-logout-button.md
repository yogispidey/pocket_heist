# Spec for navbar-logout-button

branch: claude/feature/navbar-logout-button

## Summary

- Add a Logout button to the `<Navbar>` component that signs the user out of Firebase Auth when clicked.
- The button is only visible when a user is currently signed in (read from `useUser()`).
- No redirect on logout is required at this stage.

## Functional Requirements

- The Navbar must import and call `useUser()` to determine whether a user is signed in.
- A Logout button must be rendered in the Navbar only when `user` is non-null.
- Clicking the Logout button must call Firebase Auth's `signOut` method.
- While the sign-out request is in flight, the button must be disabled to prevent double-clicks.
- After a successful sign-out, the button disappears because `user` becomes `null` (no redirect needed).
- If `signOut` throws an error, it should be logged to the console but must not crash the UI.

## Figma Design Reference

- File: Page Designs (`0JOCd6LHB7GB1rHJJrR3nW`)
- Node: `57:18` — LogoutButton
- Figma link: https://www.figma.com/design/0JOCd6LHB7GB1rHJJrR3nW/Page-Designs?node-id=57-18
- Key visual constraints:
  - Button dimensions: 127×38px, border-radius 10px
  - Style: ghost/outline — transparent background, 1px solid white border
  - Label: "Logout", Inter Regular 16px, white, centered, letter-spacing −0.3125px
  - No fill gradient (distinct from the "Create New Heist" CTA button)

## Possible Edge Cases

- `signOut` may reject (network failure, Firebase error) — must not crash the page.
- `useUser()` may briefly return `isLoading: true` on mount before Firebase resolves the auth state — the button should not flash visible during this window.
- The Navbar is rendered on every dashboard page; a component error here would break the entire layout.

## Acceptance Criteria

- The Logout button is not rendered when no user is signed in.
- The Logout button is rendered when a user is signed in.
- Clicking the Logout button calls Firebase `signOut`.
- The button is disabled while the sign-out is in flight.
- After sign-out completes, the button is no longer visible (user becomes `null`).
- A `signOut` error is caught and logged; the UI remains intact.
- The button matches the Figma outline style: transparent background, white border, rounded-[10px].

## Open Questions

- Should the Navbar be converted to a Client Component to use `useUser()`, or should auth state be passed down as a prop? (Likely needs `"use client"` added.)
- Should a loading skeleton or `null` be shown for the button while `isLoading` is true?

## Testing Guidelines

Create a test file in `./tests/components/` for the Navbar logout behaviour. Test the following cases:

- Logout button is not rendered when `user` is `null`.
- Logout button is rendered when `user` is present.
- Clicking the Logout button calls `signOut`.
- The button is disabled while sign-out is in flight.
- A `signOut` error is caught and does not propagate.
