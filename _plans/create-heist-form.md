# Plan: Create Heist Form

## Context

The create heist page at `app/(dashboard)/heists/create/page.tsx` is a stub. This feature builds the full form: fetches users from Firestore for the assignee dropdown, writes a new document to the `heists` collection using the typed `CreateHeistInput` interface, and redirects to `/heists` on success.

## Approach

Extract the form into a Client Component (`CreateHeistForm`) that the Server Component page imports. This follows the same pattern as `AuthForm` — the page file stays a Server Component while all stateful/Firebase logic lives in the Client Component. Follow `AuthForm.tsx` state and error-handling patterns exactly: `isLoading`, `error`, `handleSubmit` with try/catch/finally, disabled inputs during submission.

---

## Files to Create

### `components/CreateHeistForm/CreateHeistForm.tsx`

- `"use client"` directive
- Imports: `useState`, `useEffect`, `useRouter` from `next/navigation`; `addDoc`, `collection`, `getDocs`, `serverTimestamp`, `Timestamp` from `firebase/firestore`; `db` from `@/lib/firebase`; `useUser` from `@/context/AuthContext`; `User`, `COLLECTIONS`, `userConverter`, `CreateHeistInput` from `@/types/firestore`
- State: `title` (string), `description` (string), `assignedTo` (string uid — default to first user on load), `users` (User[]), `isLoading` (bool), `error` (string | null)
- `useEffect` on mount: call `getDocs(collection(db, COLLECTIONS.USERS).withConverter(userConverter))`, map `.docs` to `User[]`, set `users` state; on fetch error set `error`
- `{ user } = useUser()` — use `user.uid` → `createdBy`, `user.displayName ?? ""` → `createdByCodename`
- `handleSubmit`: derive `assignedToCodename` from `users.find(u => u.id === assignedTo)?.codename ?? ""`; build `CreateHeistInput` with `serverTimestamp()` for `createdAt`, `Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000)` for `deadline`, `null` for `finalStatus`; call `addDoc(collection(db, COLLECTIONS.HEISTS), payload)`; on success `router.push("/heists")`; catch → `setError("Something went wrong. Please try again.")`; finally `setIsLoading(false)`
- Form fields: Title (`<input type="text">`), Description (`<textarea>`), Assign To (`<select>` of `users` — display `user.codename`, value `user.id`)
- All inputs `disabled={isLoading}`, submit button `disabled={isLoading || users.length === 0}`
- `{error && <p className={styles.error}>{error}</p>}` before the submit button
- Use global `.btn` class for submit button; CSS Module for form layout

### `components/CreateHeistForm/CreateHeistForm.module.css`

- `@reference "../../app/globals.css"` at top
- `.form` — flex column, gap-4, max-w-sm, mt-6, mx-auto
- `.field` — flex column, gap-1; `label` — text-sm font-medium
- `.input` — matches AuthForm: `w-full px-3 py-2 rounded-md bg-light border border-lighter text-heading outline-none focus:border-primary`
- `.textarea` — same as `.input` but `resize-y min-h-[100px]`
- `.error` — `text-error text-sm`

### `components/CreateHeistForm/index.ts`

- `export { default } from "./CreateHeistForm"`

### `tests/components/CreateHeistForm.test.tsx`

Mock pattern: `vi.hoisted` + `vi.mock` for `firebase/firestore`, `@/lib/firebase`, `@/context/AuthContext`, `next/navigation`. Mock `getDocs` to return a snapshot with two user docs.

Tests:

1. Renders Title, Description, and Assign To fields
2. Populates the Assign To dropdown with users fetched from Firestore
3. Calls `addDoc` with correct fields on submit (title, description, createdBy, createdByCodename, assignedTo, assignedToCodename, finalStatus: null)
4. Deadline passed to `addDoc` is a Timestamp ~48h from now
5. Calls `router.push("/heists")` after successful submit
6. Shows an error message when `addDoc` rejects
7. Disables submit button while submission is in flight

---

## Files to Modify

### `app/(dashboard)/heists/create/page.tsx`

- Import `CreateHeistForm` from `@/components/CreateHeistForm`
- Replace the `<h2>` stub with `<CreateHeistForm />`
- Keep the page as a Server Component (no `"use client"`)

---

## Verification

1. `npx vitest run tests/components/CreateHeistForm.test.tsx` — all 7 tests pass
2. `npx vitest run` — full suite stays green
3. `npm run dev`, sign in, visit `/heists/create`, fill in form, submit → new doc appears in Firebase console `heists` collection and browser redirects to `/heists`
