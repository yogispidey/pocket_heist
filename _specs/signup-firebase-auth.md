# Spec for signup-firebase-auth

branch: claude/feature/signup-firebase-auth

## Summary

- Wire the existing signup form (`app/(public)/signup`) to Firebase Auth using `createUserWithEmailAndPassword`.
- On successful signup, generate a random codename by picking one word each from three distinct word lists and joining them in PascalCase (e.g. `SilentCrimsonFox`).
- Set the Firebase Auth `displayName` on the newly created user to the generated codename.
- Create a document in the Firestore `users` collection storing the user's `id` and `codename` — do not store email.
- Only use the Firebase Web SDK (no server-side calls, no admin SDK).

## Functional Requirements

- The signup form must call `createUserWithEmailAndPassword(auth, email, password)` on submit.
- If signup succeeds, a codename must be generated immediately before any other writes.
- The codename is built by randomly selecting one word from each of three separate word lists (e.g. adjective + colour + animal), then concatenating them in PascalCase.
- Each word list must contain only unique words. The three lists must not share words.
- `updateProfile(user, { displayName: codename })` must be called to persist the codename on the Firebase Auth user object.
- A Firestore document must be written to `users/{uid}` containing `{ id: uid, codename }` — no email field.
- If the Firestore write fails, the error should be caught and logged but must not prevent the user from being signed in.
- If signup fails (e.g. email already in use, weak password), the error message must be surfaced to the user in the form — do not just `console.log` it.
- The form must be disabled (inputs + submit button) while the signup request is in flight.

## Possible Edge Cases

- Firebase may return specific error codes (`auth/email-already-in-use`, `auth/weak-password`). The UI should show a human-readable message for at least these two cases.
- The codename generator must never produce an empty string — all three word lists must be non-empty.
- If `updateProfile` or the Firestore write fails after a successful `createUserWithEmailAndPassword`, the user is still created in Firebase Auth — handle gracefully.
- The word lists should be large enough that repeated signups are unlikely to collide on codename, but uniqueness is not enforced at this stage.

## Acceptance Criteria

- Submitting the signup form with valid credentials creates a Firebase Auth user.
- The newly created user's `displayName` is set to a PascalCase codename composed of three words.
- A document exists at `users/{uid}` in Firestore with `id` and `codename` fields — no `email` field present.
- Submitting with an already-registered email shows a human-readable error in the form.
- The form is visually disabled while the request is in flight.
- No email address is stored in Firestore at any point.

## Open Questions

- Should a successful signup immediately redirect the user (e.g. to `/heists`), or stay on the page? (Assume redirect to `/heists` for now — adjust at implementation time if needed.)
- How many words should each word list contain? (Suggest 20–30 per list as a reasonable starting point.)

## Testing Guidelines

Create a test file in `./tests` for the new feature. Mock `firebase/auth` and `firebase/firestore`. Test the following without going too heavy:

- Submitting the form calls `createUserWithEmailAndPassword` with the correct email and password.
- On success, `updateProfile` is called with a non-empty PascalCase `displayName`.
- On success, a Firestore `setDoc` is called with `id` and `codename` but no `email`.
- A Firebase `auth/email-already-in-use` error results in a visible error message in the form.
- The codename generator returns a non-empty string in PascalCase format.
