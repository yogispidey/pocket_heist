# Spec for auth-forms

**Branch:** `claude/feature/auth-forms`

## Summary:

Add email/password login and signup forms to /login and /signup pages, with a password visibility toggle, console logging on submit, and easy navigation between the two forms.

## Functional Requirements

- The /login page displays a login form with an email field, a password field, and a "Log in" submit button
- The /signup page displays a signup form with an email field, a password field, and a "Sign up" submit button
- Both password fields include a toggle icon to show or hide the password value
- On form submission, the form data (email and password) is logged to the browser console — no API call is made at this stage
- Each page provides a visible link to easily switch to the other form (e.g. "Don't have an account? Sign up" on /login, and "Already have an account? Log in" on /signup)
- Navigation between /login and /signup uses Next.js client-side routing (no full page reload)

## Figma Design Reference (only if referenced)

- N/A

## Possible Edge Cases

- User submits the form with an empty email or password field
- User submits with an invalid email format
- Password toggle icon switches state correctly between hidden and visible
- User navigates between /login and /signup — form fields should reset
- Long email addresses or passwords that overflow the input field

## Acceptance Criteria

- Visiting /login shows the login form with email, password, toggle icon, and "Log in" button
- Visiting /signup shows the signup form with email, password, toggle icon, and "Sign up" button
- Clicking the password toggle icon reveals or hides the password text
- Submitting either form logs `{ email, password }` to the browser console
- A link on each page navigates the user to the other form
- The forms are visually consistent with the existing dark-theme design

## Open Questions

- Should the email and password fields have HTML5 validation (required, type="email") or rely on custom validation?
- Should the "switch form" link be a full navigation link or an in-page state toggle on a shared route?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Login form renders email field, password field, toggle icon, and submit button
- Signup form renders email field, password field, toggle icon, and submit button
- Password toggle icon switches input type between "password" and "text"
- Submitting the login form calls console.log with the entered email and password
- Submitting the signup form calls console.log with the entered email and password
- Each form contains a link to the other form
