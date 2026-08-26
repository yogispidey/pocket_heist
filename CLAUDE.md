# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
npm test          # run all tests (Vitest)
npx vitest run tests/components/Navbar.test.tsx  # run a single test file
npx vitest --reporter=verbose  # run tests with detailed output
```

## Architecture

### Route Groups

The app uses Next.js App Router with two route groups that share separate layouts:

- `app/(public)/` — unauthenticated routes (`/`, `/login`, `/signup`, `/preview`). Plain `<main class="public">` wrapper, no Navbar.
- `app/(dashboard)/` — authenticated routes (`/heists`, `/heists/create`, `/heists/[id]`). Layout mounts `<Navbar />` above the page content.

Auth gating (middleware/redirects) is not yet implemented. The root page (`app/(public)/page.tsx`) notes the intended redirect logic in comments.

### Styling

Tailwind CSS v4 is used via PostCSS (`@tailwindcss/postcss`). The design system lives in `app/globals.css` as `@theme` tokens:

- Dark background: `--color-dark` (#030712), surface: `--color-light` (#0A101D)
- Accents: `--color-primary` (purple #C27AFF), `--color-secondary` (pink #FB64B6)
- Utility classes defined there: `.page-content`, `.center-content`, `.form-title`

Component-level styles use CSS Modules (e.g. `Navbar.module.css`) with Tailwind `@apply` directives referencing the theme tokens.

### Components

Components live in `components/<Name>/` with a barrel `index.ts` re-export. Example: `components/Navbar/Navbar.tsx` + `Navbar.module.css` + `index.ts`.

### Path Alias

`@/` maps to the project root. Use it for all imports (e.g. `import { Navbar } from "@/components/Navbar"`).

### Testing

Tests live in `tests/` mirroring the source structure (e.g. `tests/components/`). Vitest runs in `jsdom` with `globals: true`, so `describe`/`it`/`expect` need no imports. `@testing-library/jest-dom` matchers are available globally via the setup file.
