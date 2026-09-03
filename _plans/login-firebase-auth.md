# Plan: Login Firebase Auth

## Context

The login form in `app/(public)/login` renders via `<AuthForm mode="login" />` but submitting it does nothing — `handleSubmit` bails immediately with `if (mode !== "signup") return`. This feature wires the login path to Firebase Auth so users can sign in with email and password and see a success message on the same page. No redirect is in scope.

## Approach

Extend the existing `AuthForm` component with a login branch inside `handleSubmit`. Add a `success` state string (displayed in place of, or alongside, the error paragraph) and map login-specific Firebase error codes to human-readable messages. Follow the exact same patterns already used in the signup path and tests.

---

## Files to Modify

### `components/AuthForm/AuthForm.tsx`

- Add `signInWithEmailAndPassword` to the existing `firebase/auth` import line
- Add a `success` state: `const [success, setSuccess] = useState<string | null>(null)`
- Extend `getErrorMessage` with login-specific codes:
  - `auth/invalid-credential` → `"Invalid email or password."`
  - `auth/user-not-found` → `"Invalid email or password."` (same message to avoid enumeration)
  - `auth/wrong-password` → `"Invalid email or password."`
  - `auth/too-many-requests` → `"Too many attempts. Please try again later."`
- Replace `if (mode !== "signup") return;` with a `mode` branch:
  - `"signup"` path: existing logic unchanged
  - `"login"` path:
    - Clear `success` and `error` at the start of the request
    - Call `await signInWithEmailAndPassword(auth, email, password)`
    - On success: `setSuccess("You're logged in!")` — no redirect
    - On error: `setError(getErrorMessage(code))` — same pattern as signup
- In JSX, render `{success && <p className={styles.success}>{success}</p>}` below the error paragraph

### `components/AuthForm/AuthForm.module.css`

- Add `.success { @apply text-sm; color: #22c55e; }` (or use a `--color-success` token if one exists; green is a safe fallback)

---

## Files to Create

### `tests/components/AuthForm.login.test.tsx`

Follow the exact pattern of `tests/components/AuthForm.signup.test.tsx`:

- Hoist `mockSignInWithEmailAndPassword` and `mockPush` with `vi.hoisted(() => vi.fn())`
- `vi.mock("firebase/auth", ...)` including all imports the component uses (`createUserWithEmailAndPassword`, `updateProfile`, `signInWithEmailAndPassword`)
- `vi.mock("firebase/firestore", ...)`, `vi.mock("@/lib/firebase", ...)`, `vi.mock("@/lib/generateCodename", ...)`, `vi.mock("next/navigation", ...)`
- `beforeEach`: `mockReset` on `mockSignInWithEmailAndPassword` and `mockPush`
- Helper `fillAndSubmit(email, password)`: `userEvent.setup()`, render `<AuthForm mode="login" />`, type into `"Email"` and `"Password"` labels, click `/log in/i` button
- Tests:
  1. Calls `signInWithEmailAndPassword` with the correct email and password
  2. Shows a success message after a successful sign-in
  3. Shows `"Invalid email or password."` for `auth/invalid-credential`
  4. Disables the submit button while the request is in flight (never-resolving promise pattern + `act`)

---

## Verification

1. `npx vitest run tests/components/AuthForm.login.test.tsx` — all 4 tests pass
2. `npx vitest run` — full suite (25+ tests) stays green, no regressions
3. `npm run dev`, visit `/login`, submit with valid credentials → success message appears
4. Submit with bad credentials → human-readable error appears
5. Confirm no redirect occurs after login
