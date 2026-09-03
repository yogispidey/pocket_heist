# Spec for login-firebase-auth

branch: claude/feature/login-firebase-auth

## Summary

- Wire the existing login form in `app/(public)/login` to Firebase Auth so users can sign in with email and password.
- On a successful login, display an inline success message to the user.
- No redirect is needed at this stage.

## Functional Requirements

- When the login form is submitted, call Firebase Auth's email/password sign-in method with the provided email and password.
- While the sign-in request is in flight, the form inputs and submit button must be disabled to prevent double-submission.
- On success, display a visible success message (e.g. "You're logged in!") within the form area.
- On failure, display a human-readable error message derived from the Firebase error code (e.g. invalid credentials, user not found).
- Clear any previous error or success message when a new submission starts.
- Only the login path (`mode === "login"`) triggers Firebase Auth — the signup path is already handled separately.

## Possible Edge Cases

- `auth/user-not-found` and `auth/wrong-password` / `auth/invalid-credential` — map to a generic "Invalid email or password." message to avoid user enumeration.
- `auth/too-many-requests` — map to a human-readable rate-limit message.
- Network failure with no Firebase error code — fall back to a generic "Something went wrong. Please try again." message.
- User submits the form twice quickly — disabled state during flight prevents double calls.

## Acceptance Criteria

- Submitting the form with valid credentials calls Firebase sign-in and shows a success message.
- Submitting with invalid credentials shows a descriptive, human-readable error message.
- The submit button and inputs are disabled while the request is in flight.
- A success message is visible after a successful login.
- No redirect occurs after login.
- The signup form path is unaffected.

## Open Questions

- Should the success message replace the form, or appear above/below it while the form remains visible?
- Should the success state persist if the user edits the email/password fields again, or clear on input change?

## Testing Guidelines

Create a test file in `./tests/components/` (or extend the existing `AuthForm` tests) for the login Firebase Auth flow. Test the following cases:

- `signInWithEmailAndPassword` is called with the correct email and password on form submit.
- A success message is rendered after a successful sign-in.
- A human-readable error is shown for `auth/invalid-credential`.
- The submit button is disabled while the sign-in request is in flight.
