# BARR Code Conventions

Team-wide conventions for BARR Digital webapp projects. This document is copied into every new project by `barr-init` and is the single reference for naming, structure, data fetching, git and code quality. If a rule is missing here, ask the Tech Lead before deciding on your own.

## Language

The codebase is bilingual on purpose:

- **Italian** — anything the end user sees: UI labels, button text, toast/error messages, dialog titles, validation messages.
- **English** — everything else: variable/function/type names, comments, commit messages, branch names, documentation.

Example: a server action returns `'Errore durante la creazione'` to the user, but the function is named `createProject` and its comments are in English.

## Naming

All files and folders use **kebab-case**. Names in code follow the convention of their kind. Never use generic names (`data`, `item`, `temp`, `handleClick` without context) — the name must say what it contains or does.

| Kind                    | Convention                | Example                                |
| ----------------------- | ------------------------- | -------------------------------------- |
| Variables and functions | camelCase                 | `userName`, `handleSubmit`             |
| Components (in code)    | PascalCase                | `UserCard`, `DashboardHeader`          |
| TypeScript types        | PascalCase                | `ProjectProps`, `ActionResult`         |
| Constants               | UPPER_SNAKE_CASE          | `MAX_RETRIES`, `DEFAULT_PAGE_SIZE`     |
| All files               | kebab-case                | `button.tsx`, `use-auth.ts`            |
| Folders                 | kebab-case                | `user-settings/`, `dashboard/`         |
| Git branches            | type/kebab-case           | `feature/login-form`, `fix/header-bug` |
| Server actions          | verb + entity (camelCase) | `createProject`, `deleteInvoice`       |
| Zod schemas             | entity + `Schema`         | `createProjectSchema`, `contactSchema` |

Why kebab-case for files: standard for Next.js / shadcn / Tailwind, avoids macOS↔Linux case-sensitivity issues in CI, one rule for everything.

## Project structure

Code lives at the repo root — **no `src/` folder** in BARR projects.

```
app/                     Next.js App Router (routes, page, layout)
  (auth)/                Route group: public auth pages (login, register)
  (logged)/              Route group: authenticated pages
  api/                   Route handlers — ONLY webhooks / external integrations
  globals.css            CSS reset + base
actions/                 Server Actions ("use server" as first line)
components/
  ui/                    Reusable primitives (shadcn + custom)
  layout/                Header, Footer, Sidebar, Nav
  <feature>/             Domain components (dashboard/, projects/, …)
hooks/                   ALL custom hooks — nowhere else
lib/
  data/                  Read-only fetchers, `import 'server-only'` as first line
  supabase/              Supabase client factories (browser, server, admin)
schema/                  Zod schemas for validation
constants/               App constants (routes, config, labels)
types/                   Shared TypeScript types (incl. generated database.ts)
utils/                   Pure helpers (formatters, validators, cn)
styles/                  Design tokens
public/                  Static assets
supabase/
  migrations/            SQL migrations
```

Rules that go with the tree:

- **Hooks only in `hooks/`.** One place to look for them.
- **Types**: component props co-located in the component file; types shared by 2+ files go in `types/`. Never more than one folder for types.
- **`utils/` vs `lib/`**: `utils/` for pure functions (`formatDate`, `cn`); `lib/` for integrations and heavy configuration (`supabase/`).
- **No barrel files** (`index.ts` re-exports). Import directly from the source file: `import { Button } from '@/components/ui/button'`. Only exception: `index.tsx` as entry point of a component organised as a folder.
- Use the `@/` alias for absolute imports. Relative imports only for siblings in the same feature folder.

## Data fetching — RSC-first

- **Server Components by default.** `'use client'` only when you need interactivity (state, event handlers, effects).
- **Reads** live in `lib/data/<domain>.ts` with `import 'server-only'` as the very first line. Called from `page.tsx` (RSC) and from server actions. See `docs/data-layer.md`.
- **Mutations** live in `actions/<domain>.ts` with `'use server'` as the very first line. See `docs/server-actions.md`.
- **Every server-side input is validated with Zod** — schemas in `schema/`, shared between form (client) and action (server). Never trust the client.
- Typical page flow: `page.tsx` (RSC, fetches via `lib/data/*`) → `<feature>-client.tsx` (`'use client'`, state + calls to actions) → presentational children.
- Data joins happen server-side (data layer or action), never by stitching queries together in a client component.

## Components

- A component over ~80–100 lines is a signal to split. Single responsibility.
- Comment the **why**, not the **what**. Never leave commented-out code — delete it, git remembers.
- No `console.log` left in code. `console.error` only for legitimate server-side logging.

## Environment variables

- `NEXT_PUBLIC_*` **only** for values that are safe to expose to the browser.
- Secrets (API keys, service-role keys) have **no prefix** and are used only in server code (data layer, actions, route handlers).
- `.env*` files with real values are always gitignored. Document every variable in a committed `.env.example`.
- Never put a token in `NEXT_PUBLIC_*`. If it must not be visible in the browser, it is server-only.

## Git flow

- Permanent branches: `main` (production, every commit deploys) and `development` (integration).
- Work branches: `feature/short-name` or `fix/short-name` (kebab-case), created from an **up-to-date** `development`:
  ```bash
  git checkout development && git pull --ff-only
  git checkout -b feature/short-name
  ```
- Commit messages in **English**, descriptive, one coherent unit of change per commit ("Add login form with validation", not "fix" or "update").
- PRs target `development`, description in Italian (Cosa / Riferimento / Note / Come testare). One PR per task — no giant PRs.
- **Only the Tech Lead merges** into `development` and `main`. Merge strategy: merge commit.
- Never force push. Never push directly to `development` or `main`.

## Dependencies

Always ask the Tech Lead before adding **any** npm package, even small ones. Every dependency is third-party code we maintain indirectly.

## Anti-patterns to avoid

| Anti-pattern                                     | Do this instead                                                              |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| "Fake actions": client `fetch` for internal CRUD | Real Server Actions with `'use server'`                                      |
| `'use client'` on every page                     | RSC by default; `'use client'` only for interactivity                        |
| Data joins inside a client component             | Join server-side, in the data layer or the action                            |
| Supabase admin client as the default             | Server client with RLS active; admin only for specific, justified operations |
| API tokens in `NEXT_PUBLIC_*`                    | Server-only variable, used only in actions / data layer / route handlers     |
| Silenced errors (`catch {}`)                     | Propagate, show a toast to the user, log server-side with `console.error`    |
| Client-only validation                           | Shared Zod schema; the server action always re-parses with `safeParse`       |
| `useEffect` to derive computable data            | Compute in render (or `useMemo`); `useEffect` is for side effects            |
| Components over ~100 lines                       | Split into single-responsibility components                                  |

## Pre-PR checklist

- ☐ Project builds without errors; no TypeScript errors
- ☐ Tested the base case AND at least one edge case (error, empty data, extreme input)
- ☐ No `any` without a `// TODO: type`
- ☐ No commented-out code or debug `console.log`
- ☐ Descriptive names; components under ~100 lines
- ☐ Branch name and commit messages follow the conventions above
- ☐ Responsive: checked on mobile, tablet, desktop

Formatting is not a preference: Prettier config lives in the repo (`.prettierrc`). Run `npm run format` before opening a PR (the barr-core plugin also auto-formats each file Claude edits). Don't override the config in your editor.
