# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (http://localhost:3000)
npm run build     # production build
npm run lint      # ESLint
npm test          # run all tests (Vitest)
npx vitest run tests/components/Navbar.test.tsx  # run a single test file
```

## Architecture

**Next.js 16 App Router** with two route groups that share one root layout (`app/layout.tsx`):

- `app/(public)/` — unauthenticated pages (splash, login, signup, preview). The splash page (`/`) is intended to redirect logged-in users to `/heists`; auth logic is not yet implemented.
- `app/(dashboard)/` — authenticated pages behind the `<Navbar>`. Heist routes: `/heists` (list), `/heists/[id]` (detail), `/heists/create`.

**Components** live in `components/<ComponentName>/` with a barrel `index.ts` re-export and a co-located CSS Module when needed (e.g. `Navbar.module.css`). Import via the `@/` alias (maps to the project root).

**Styling** uses Tailwind CSS v4 with a CSS-first config. Design tokens (colours, font) are declared in `app/globals.css` under `@theme {}` — add new tokens there, not in a separate config file. The colour palette is a dark theme: `--color-dark` background, `--color-primary` (purple) / `--color-secondary` (pink) accents. CSS Modules use `@reference "../../app/globals.css"` at the top to access tokens and `@apply` Tailwind utilities.

**Global utility classes** defined in `app/globals.css`: `.center-content`, `.page-content`, `.form-title`, `.btn`. Use these in components rather than duplicating the styles.

**Testing** uses Vitest + Testing Library in a jsdom environment. `vite-tsconfig-paths` resolves the `@/` alias inside tests. Setup file is `vitest.setup.ts` (imports `@testing-library/jest-dom/vitest`). Use `@testing-library/user-event` v14 for interactions. When using `getByLabelText`, prefer exact strings over regex to avoid accidental matches with `aria-label` attributes on nearby elements.

**Client Components** — any component that uses `useState`, `useEffect`, or browser APIs must have `"use client"` as its first line.

## Checking Documentation

- **important:** When implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation using the Context7 MCP server before writing any code.