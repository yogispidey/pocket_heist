# Plan: Authentication Forms

## Context

The /login and /signup pages are currently empty shells with only a heading. This feature adds functional email/password forms to both pages, with a password visibility toggle, console logging on submit, and a link to switch between the two forms. No API integration yet.

## Approach

Create a shared `AuthForm` component that accepts a `mode: "login" | "signup"` prop. Both pages render this single component — mode drives the heading, button label, and the switch-form link. This keeps the two forms consistent and avoids duplication.

The component must be a Client Component (`"use client"`) because it needs `useState` for the password toggle.

---

## Files to Create

### `components/AuthForm/AuthForm.tsx`

- `"use client"` directive at the top
- Props: `mode: "login" | "signup"`
- State: `showPassword: boolean` (default false)
- Controlled inputs for email and password using `useState`
- Password field: `type={showPassword ? "text" : "password"}`
- Toggle button with `Eye` / `EyeOff` icons from `lucide-react` (already a project dependency)
- `onSubmit` handler: `e.preventDefault()` then `console.log({ email, password })`
- Switch link using `next/link`: login → `/signup`, signup → `/login`
- Reuse existing global classes: `.form-title`, `.btn`, `.page-content`, `.center-content`

### `components/AuthForm/AuthForm.module.css`

- `@reference "../../app/globals.css"` at top (matches Navbar pattern)
- `.form` — `display: flex; flex-direction: column; gap: 1rem;`
- `.field` — label + input stacked vertically
- `.input` — dark background (`var(--color-light)`), border (`var(--color-lighter)`), focus ring (`var(--color-primary)`), full width, rounded, padding
- `.passwordWrapper` — `position: relative` to hold the toggle button
- `.toggleBtn` — `position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%)` — transparent background, icon color body
- `.switchLink` — centred text, small size, body colour with primary hover

### `components/AuthForm/index.ts`

```ts
export { default } from "./AuthForm";
```

---

## Files to Modify

### `app/(public)/login/page.tsx`

Replace the shell with:

```tsx
import AuthForm from "@/components/AuthForm";
export default function LoginPage() {
  return <AuthForm mode="login" />;
}
```

Fix the misnamed export (`SignupPage` → `LoginPage`).

### `app/(public)/signup/page.tsx`

Replace the shell with:

```tsx
import AuthForm from "@/components/AuthForm";
export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
```

---

## Test File to Create

### `tests/components/AuthForm.test.tsx`

Use `@testing-library/react` + `@testing-library/user-event` v14 + `vi.spyOn` (vitest). Follow the Avatar/Navbar pattern: import via `@/components/AuthForm` barrel.

Tests to write:

1. Login mode renders email field, password field, toggle button, and "Log in" submit button
2. Signup mode renders email field, password field, toggle button, and "Sign up" submit button
3. Password toggle switches input `type` between `"password"` and `"text"`
4. Submitting the login form calls `console.log` with `{ email, password }`
5. Submitting the signup form calls `console.log` with `{ email, password }`
6. Login form renders a link to `/signup`
7. Signup form renders a link to `/login`

---

## Verification

1. Run `npm run dev` and visit `/login` — form renders with email, password, toggle icon, Log in button, and link to /signup
2. Visit `/signup` — same structure with Sign up button and link to /login
3. Click password toggle — input type switches, icon changes
4. Submit each form — `{ email, password }` appears in browser console
5. Click switch link — navigates to the other form without full reload
6. Run `npx vitest run tests/components/AuthForm.test.tsx` — all tests pass
