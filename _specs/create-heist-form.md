# Spec for create-heist-form

branch: claude/feature/create-heist-form

## Summary

- Build the Create Heist form at `app/(dashboard)/heists/create/page.tsx`.
- On submit, write a new document to the Firestore `heists` collection using the `CreateHeistInput` interface.
- `createdAt` (server timestamp) and `deadline` (48 hours from now) are set programmatically — not entered by the user.
- The `assignedTo` and `assignedToCodename` fields are populated by fetching all users from the Firestore `users` collection and presenting them in a dropdown.
- On successful submission, redirect the user to `/heists`.

## Functional Requirements

- The form must have the following user-facing fields:
  - **Title** — text input, required
  - **Description** — textarea, required
  - **Assign to** — dropdown list of users fetched from the `users` Firestore collection (display their codename, store their uid and codename)
- The current signed-in user's uid and codename (from `useUser()`) populate `createdBy` and `createdByCodename` automatically.
- `createdAt` is set to `serverTimestamp()` from Firebase.
- `deadline` is set to a Firestore `Timestamp` 48 hours from the current client time at submission.
- `finalStatus` is always `null` on creation.
- Users list must be fetched from the `users` Firestore collection using the `userConverter` and `COLLECTIONS` constant from `types/firestore`.
- While users are loading, the assign-to dropdown should be disabled with a loading state.
- While the form is submitting, all inputs and the submit button must be disabled.
- On a successful Firestore write, redirect to `/heists` using `useRouter().push()`.
- On a Firestore write error, display a human-readable error message and keep the user on the form.

## Possible Edge Cases

- The `users` collection fetch may fail — show an error state in the dropdown and prevent submission.
- The signed-in user will appear in the users list — they should be included (self-assignment is valid).
- The users collection may be empty (no other users yet) — the dropdown should still render with just the current user.
- A slow network may cause the Firestore write to take several seconds — the disabled state must hold for the full duration.
- `useUser()` may still be loading on mount — the form should not render until `user` is available (the dashboard layout guard already handles this, but the component should not assume `user` is non-null without checking).

## Acceptance Criteria

- The form renders with Title, Description, and Assign To fields.
- The Assign To dropdown is populated with codenames fetched from the `users` collection.
- Submitting with valid fields writes a document to the `heists` collection with the correct shape matching `CreateHeistInput`.
- `createdAt` is a Firestore server timestamp; `deadline` is 48 hours from submission time.
- `createdBy` and `createdByCodename` match the signed-in user.
- `finalStatus` is `null`.
- After a successful write, the user is redirected to `/heists`.
- A write error is caught and displayed as a message without crashing the page.
- All inputs and the submit button are disabled while submission is in flight.

## Open Questions

- Should the form use a `<select>` dropdown for assigning users, or a more styled component?
- Should the form validate that Title and Description are non-empty before enabling the submit button, or only on submit attempt?

## Testing Guidelines

Create a test file at `tests/components/CreateHeistForm.test.tsx`. Mock Firestore (`addDoc`, `collection`, `getDocs`, `serverTimestamp`, `Timestamp`), `@/lib/firebase`, `@/types/firestore`, `useUser`, and `next/navigation`. Test the following cases:

- The form renders the Title, Description, and Assign To fields.
- The Assign To dropdown is populated with users fetched from Firestore.
- Submitting the form calls `addDoc` with the correct fields (title, description, createdBy, createdByCodename, assignedTo, assignedToCodename, finalStatus: null).
- `addDoc` is called with a `deadline` Timestamp approximately 48 hours in the future.
- On successful submit, `router.push("/heists")` is called.
- A Firestore write error displays a human-readable error message.
- The submit button is disabled while submission is in flight.
