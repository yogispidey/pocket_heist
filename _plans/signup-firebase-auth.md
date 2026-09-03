# Plan: Signup Firebase Auth

## Context

The signup form (`app/(public)/signup`) currently renders `<AuthForm mode="signup" />`, but `handleSubmit` only `console.log`s the credentials — no Firebase call is made. This feature replaces that placeholder with real Firebase Auth signup, codename generation, and a Firestore user document write. The Firebase app and `auth` instance already exist in `lib/firebase.ts`; Firestore is not yet wired up anywhere in app code.

---

## Files to Modify

### `lib/firebase.ts`

- Import `getFirestore` from `firebase/firestore`
- Add `export const db = getFirestore(app)` below the existing `auth` export

### `components/AuthForm/AuthForm.tsx`

This is the only component file that needs changes. The `signup/page.tsx` shell and CSS module stay untouched.

- Add `isLoading: boolean` state (default `false`) and `error: string | null` state (default `null`)
- Replace the placeholder `handleSubmit` with mode-aware logic:
  - **Signup path only** (guard with `if (mode !== "signup") return`):
    1. Set `isLoading(true)`, clear `error`
    2. Call `createUserWithEmailAndPassword(auth, email, password)`
    3. Generate a codename via `generateCodename()` (imported from `lib/generateCodename`)
    4. Call `updateProfile(user, { displayName: codename })`
    5. Call `setDoc(doc(db, "users", user.uid), { id: user.uid, codename })` — no email
    6. Wrap the Firestore write in its own try/catch so a failure there does not block sign-in
    7. On success, redirect to `/heists` via `useRouter()` from `next/navigation`
  - **Error handling**: catch Firebase errors and map error codes to human-readable strings:
    - `auth/email-already-in-use` → "An account with this email already exists."
    - `auth/weak-password` → "Password must be at least 6 characters."
    - Fallback → "Something went wrong. Please try again."
  - Always set `isLoading(false)` in a `finally` block
- Pass `disabled={isLoading}` to both inputs and the submit button
- Render `{error && <p className={styles.error}>{error}</p>}` above the submit button
- Add `.error` to `AuthForm.module.css` styled with `text-error text-sm`

---

## Files to Create

### `lib/generateCodename.ts`

A pure, side-effect-free function `generateCodename(): string`.

- Three separate word lists: adjectives (~25 words), colours (~25 words), animals (~25 words)
- No word appears in more than one list
- Returns one random word from each list concatenated in PascalCase (e.g. `SilentCrimsonFox`)
- Lists are defined as `readonly string[]` constants in the same file

### `tests/lib/generateCodename.test.ts`

Unit tests for the codename generator (no mocks needed — it's a pure function):

1. Returns a non-empty string
2. Return value matches `/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/` (three PascalCase words)

### `tests/components/AuthForm.signup.test.tsx`

Integration tests with `vi.mock("firebase/auth")`, `vi.mock("firebase/firestore")`, and `vi.mock("@/lib/generateCodename")`. Mock `next/navigation` for `useRouter`. Use `@testing-library/user-event` for interactions.

Tests:

1. Submitting the signup form calls `createUserWithEmailAndPassword` with email and password
2. On success, `updateProfile` is called with a non-empty `displayName`
3. On success, `setDoc` is called with `{ id: uid, codename }` and no `email` field
4. A `auth/email-already-in-use` error renders a visible error message
5. The submit button is disabled while the request is in flight

---

## Verification

1. Run `npx vitest run tests/lib/generateCodename.test.ts tests/components/AuthForm.signup.test.tsx` — all tests pass
2. Run `npm run dev`, visit `/signup`, submit with a new email — user is created in Firebase Console → Authentication
3. Check Firebase Console → Firestore → `users` collection — document exists with `id` and `codename`, no `email`
4. Submit with an already-registered email — error message appears in the form
5. Run `npx vitest run` — full suite (16 existing + new tests) all pass
