# CLAUDE.md — 707 Gym Management System

Membership management MVP for gym staff. Scope and out-of-scope list: `docs/project-overview.md`.

This file defines how Claude works on this project.

Project and domain knowledge lives in `docs/`. Do not duplicate it here.

## Stack

- Nuxt 4, Vue 3 (`<script setup>`, Composition API), TypeScript
- PrimeVue (primary components) + Tailwind CSS (layout, spacing, typography)
- Pinia (shared client state only)
- Nuxt server routes on Node.js
- MongoDB via Mongoose
- Vitest (unit/integration), Playwright (e2e)
- Docker, Git

Do not add frameworks, UI libraries, or dependencies without first checking
whether the existing stack solves the problem. If a new dependency is
needed, explain why before installing it.

## Commands

| Task            | Command           |
| --------------- | ----------------- |
| Install         | `pnpm install`    |
| Dev server      | `pnpm dev`        |
| Unit/Nuxt tests | `pnpm test`       |
| E2E tests       | `pnpm test:e2e`   |
| Lint            | `pnpm lint`       |
| Typecheck       | `pnpm typecheck`  |
| Build           | `pnpm build`      |
| Demo            | `pnpm demo:reset`, then `pnpm demo:start` |

Package manager: pnpm 11. Node version: 24. Setup and env vars: `docs/development.md`.

## Read First

| Task                         | Read                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Any domain feature           | `docs/project-overview.md`, `docs/business-rules.md` |
| Architecture / new subsystem | `docs/architecture.md`, `docs/decisions/`            |
| UI work                      | `docs/ui-design.md`                                  |
| Schema, queries, indexes     | `docs/database.md`                                   |
| New or changed endpoint      | `docs/api.md`                                        |
| Auth, roles, sensitive data  | `docs/security.md`                                   |
| Setup, env vars, deploy      | `docs/development.md`                                |

If a relevant doc is missing or empty, say so. Do not fill the gap with
assumptions.

## Source of Truth

For business behavior, in priority order:

1. Explicit current developer/client requirements
2. Approved business rules (`docs/business-rules.md`)
3. Approved specifications and ADRs
4. Documented project behavior
5. Existing implementation
6. Claude's assumptions (never sufficient on their own)

Never invent business rules. When sources conflict or a requirement is
ambiguous, name the conflict and ask. Do not silently pick an interpretation.

## Architecture

Data flow:

```text
Component
  ↓
Composable / Pinia
  ↓
Nuxt API route
  ↓
Server service
  ↓
Mongoose model
  ↓
MongoDB
```

Skip layers that add nothing for simple operations.

Hard boundaries:

- Database access happens only on the server. Client code never touches MongoDB.
- Vue components contain no database logic and no complex business logic.
- Pinia holds client state only: no queries, secrets, or server-only logic.
- Route handlers own HTTP concerns (parsing, validation, status codes).
- Business rules live in server services, defined once, not duplicated across routes.
- No separate backend app (Express, Fastify, NestJS) unless explicitly requested.

Prefer local component state over Pinia when state isn't shared.

Prefer composables for reusable frontend logic.

## Conventions

Follow existing project conventions first. Defaults when none exist:

- Components: PascalCase. Composables: `useX`. Stores: descriptive camelCase.
- Types: PascalCase domain types. Mongoose models: singular domain names.
- API: REST-style Nuxt filesystem routes.
- Response and error format: follow `docs/api.md`.
- Server models imported by CLI scripts (`scripts/`) must use explicit `.ts`
  extensions for relative imports, because the scripts run under plain Node.
- API routes: define with `defineApiHandler`, not `defineEventHandler` (ADR-003).
- Client data calls: use `useApi` / `useNuxtApp().$api`, not `useFetch` / `$fetch`,
  so an expired session redirects to sign-in. The only exception is the login page.
- Validation library: follow the established project choice; if none exists, document the decision before introducing one.
- Auth mechanism: follow the established project choice; if none exists, document the decision before introducing one.
- No `any` to silence errors. If `any` is truly required, comment why.

Do not rename existing code just to match these defaults.

## UI

- Use PrimeVue components before building custom ones. Tailwind handles layout and composition.
- Follow `docs/ui-design.md` for brand, color, typography, spacing, and visual usage.
- The client-provided logo is a brand reference, not a requirement to reproduce its visual style throughout the application.
- Semantic colors (success, warning, danger) keep their meaning only.
- Every data view handles loading, empty, and error states.
- For a major new screen, propose the layout (structure, hierarchy, primary actions) before implementing it.

## Hard Rules

### Security

- Validate all external input server-side (body, query, params, uploads). Client validation is UX only.
- Never trust client-provided IDs, roles, permissions, prices, or ownership.
- Authorize every sensitive operation on the server. Frontend guards are UX only.
- Never expose passwords, tokens, secrets, private fields, stack traces, or raw database errors to the client.
- Never hardcode or commit secrets or `.env` files.
- Never weaken validation, auth, or security settings to make a feature or test work.

### Scope

- Do not build anything listed as out of scope in `docs/project-overview.md` §8 unless the scope is formally changed.

### Data

- Paginate potentially large lists. Don't fetch whole collections when only a subset is needed.
- Add indexes only for real query patterns. Use aggregation only when needed.
- Check existing models and helpers before writing a new query.

### Errors

- Never swallow errors silently.
- Return appropriate HTTP status codes and follow the conventions documented in `docs/api.md`.
- Show users helpful messages. Technical details go to server logs.

### Ask First

Ask before:

- Any destructive or irreversible action: dropping collections, deleting data,
  deleting files you didn't create, `git reset --hard`, force-push, deleting branches.
- Anything touching production, shared infrastructure, or production config.
- Overwriting or discarding uncommitted work you didn't create.

## Workflow

- **Small change:** just do it.
- **Medium or large change:** investigate the relevant code and docs, then briefly
  state the approach, the files affected, any DB/API impact, and the tests. Then
  implement incrementally.
- **Scope:** do what was asked. Don't refactor unrelated code or add speculative
  features. Mention unrelated issues in the summary instead of fixing them.
- **Abstractions:** create one only when it's actually reused. Search first.
- **Tests:** add or update tests for meaningful business logic and its edge cases.
  Never change a test just to make wrong code pass.
- **Temporary files:** clean them up. Leave no debug artifacts.

## Definition of Done

Before reporting a change as complete:

- [ ] Relevant tests run and pass
- [ ] Typecheck and lint pass
- [ ] Validation, authorization, and error handling are in place where applicable
- [ ] UI changes checked in the browser at desktop and mobile widths, including loading, empty, and error states
- [ ] No unrelated behavior changed
- [ ] Affected docs updated; an ADR added if an architectural decision was made

Never claim something was tested or verified unless it actually was. If a
check was skipped or failed, say so.

## Documentation

Keep `docs/` in sync with the approved system:

- Update the relevant doc when a feature changes business rules, schema, API
  contracts, security, or architecture. Skip trivial changes.
- Record significant architectural decisions as `docs/decisions/ADR-NNN-title.md`
  with Status, Context, Decision, Alternatives, Consequences, and Date.
- Never document behavior that doesn't exist or business rules that weren't approved.
- When code and docs disagree, find out which one is wrong before changing either.

## Final Summary Format

End each task with:

- what changed
- key files
- checks actually run and their real results
- docs updated
- open issues
- assumptions made
