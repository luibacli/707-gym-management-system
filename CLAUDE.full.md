# CLAUDE.md

## 1. Purpose and Project Context

This file defines the engineering rules and working behavior Claude must
follow when working on this project.

CLAUDE.md defines **how Claude should work**.

Project and domain knowledge belongs in the `docs/` directory:

- `docs/project-overview.md` --- what the product is and how the
  business works
- `docs/business-rules.md` --- what the system must and must not do
- `docs/architecture.md` --- how the application is technically
  structured
- `docs/ui-design.md` --- visual language, layout, component usage,
  and UI design rules
- `docs/database.md` --- how data is modeled and stored
- `docs/api.md` --- API conventions and contracts
- `docs/development.md` --- local development, testing, build, and
  deployment
- `docs/security.md` --- authentication, authorization, and security
  architecture
- `docs/decisions/` --- significant architectural decisions

Before implementing significant business functionality, read the
relevant project documentation.

Do not invent project behavior, business rules, requirements, or
architecture.

When documentation conflicts with an explicit current requirement,
identify the conflict and ask for clarification when necessary.

---

## 2. Technology Stack

### Core

- Nuxt 4
- Vue 3
- TypeScript

### UI

- PrimeVue
- Tailwind CSS

### State Management

- Pinia

### Backend

- Nuxt Server Routes
- Node.js runtime

### Database

- MongoDB
- Mongoose

### Testing

- Vitest
- Playwright

### Development

- Docker
- Git

Do not introduce alternative frameworks or libraries without first
checking whether the existing stack can solve the requirement.

---

## 3. Architecture

Nuxt is the primary full-stack application framework.

Do not create a separate Express, Fastify, NestJS, or other backend
application unless explicitly requested or there is a clearly documented
architectural requirement.

### Application Structure

Frontend:

- Nuxt pages
- Vue components
- PrimeVue
- Tailwind CSS
- Pinia
- composables

Backend:

- Nuxt server routes
- server-side services
- Mongoose models

Database:

- MongoDB

---

## 4. Data Flow

Prefer the following application flow:

Component ↓ Composable / Pinia ↓ Nuxt API ↓ Server Service ↓ Mongoose
Model ↓ MongoDB

Not every feature requires every layer.

Do not introduce unnecessary layers for simple operations.

### Important Rules

- Client code must never access MongoDB directly.
- Database queries must remain server-side.
- Vue components must not contain database logic.
- Vue components should not contain complex business logic.
- Pinia manages client-side application state, not database access.
- Server routes handle HTTP concerns.
- Business logic belongs in server-side services when complexity
  justifies it.
- Mongoose models handle persistence concerns.

---

## 5. Frontend Architecture

Use Vue 3 Composition API and `<script setup>`.

Prefer:

- composables for reusable frontend logic
- Pinia for shared application state
- local component state for local UI state
- server APIs for server-side operations

Avoid putting everything into Pinia.

Use local state when state does not need to be shared.

### Naming

Follow existing project naming conventions first.

When no established convention exists:

- Vue components: PascalCase
- composables: camelCase with a `use` prefix
- Pinia stores: descriptive camelCase
- types/interfaces: descriptive PascalCase
- Mongoose models: singular domain names
- server routes: follow Nuxt filesystem conventions

Do not rename existing code solely to impose a preferred convention.

---

## 6. UI Architecture

PrimeVue is the primary component library.

Use PrimeVue for standard application components such as:

- Button
- Input
- Select
- MultiSelect
- DatePicker
- DataTable
- Dialog
- Drawer
- Menu
- Tabs
- Toast
- ConfirmDialog
- Form controls

Use Tailwind CSS for:

- layout
- spacing
- sizing
- positioning
- responsive behavior
- flexbox
- grid
- typography
- visual composition

Prefer PrimeVue components over creating custom equivalents.

Do not introduce another UI framework.

Do not recreate functionality already provided by PrimeVue unless there
is a specific design or behavior requirement.

Follow the existing PrimeVue theme and design system.

### UI Design Philosophy

The application should have a consistent, modern, clean, and practical
SaaS dashboard visual language. Prioritize clarity, usability,
hierarchy, and consistency over decorative effects.

The client-provided logo is a brand reference, not the complete UI
design system. Do not simply apply the logo colors to every part of the
interface. Use the brand color strategically for primary actions, active
navigation, and important visual emphasis while keeping the main UI
grounded in a neutral visual system.

When the client provides branding or an existing design system:

1.  Inspect the provided branding before choosing UI colors.
2.  Identify the primary brand color and any clearly established
    secondary colors.
3.  Use neutral colors for backgrounds, surfaces, borders, and most
    text.
4.  Reserve semantic colors such as success, warning, and danger for
    their intended meaning.
5.  Do not invent a large color palette without a design reason.

When branding is incomplete, propose a simple neutral UI foundation with
strategic use of the available brand color rather than guessing a full
visual identity.

### UI Design Rules

Prefer:

- clear visual hierarchy
- consistent spacing and sizing
- restrained use of borders and shadows
- consistent typography
- predictable page layouts
- responsive behavior
- accessible contrast and readable text
- reusable PrimeVue components
- consistent empty, loading, error, success, and disabled states

Avoid unless clearly justified:

- excessive gradients
- excessive animations
- excessive shadows
- excessive rounded containers
- too many colors
- deeply nested cards
- decorative elements that compete with primary actions
- recreating standard PrimeVue components from scratch

For major new screens, determine the page structure, information
hierarchy, and primary user actions before implementing the UI. A short
layout proposal is preferred over immediately coding an unverified
visual direction.

### UI Design Documentation

When `docs/ui-design.md` exists, read it before implementing significant
UI changes and follow its established design language.

Update `docs/ui-design.md` when a meaningful visual or interaction
convention is established. Do not document every minor styling change.

---

## 7. State Management

Use Pinia for shared client-side state.

Use local component state when state is only relevant to one component.

Do not put the following inside Pinia stores:

- database queries
- Mongoose logic
- server secrets
- server-only business logic

Prefer composables for reusable frontend behavior that does not require
global state.

---

## 8. API Architecture

Use Nuxt server routes for API endpoints.

Follow REST-style conventions unless the existing project uses another
established convention.

Example:

```text
GET    /api/members
GET    /api/members/:id
POST   /api/members
PATCH  /api/members/:id
DELETE /api/members/:id
```

Keep HTTP concerns in the route layer.

Keep business logic in server-side services when appropriate.

Do not duplicate business rules across multiple endpoints.

### API Response Conventions

API response formats must follow the established project convention.

Before creating a new endpoint:

1.  Inspect existing API responses.
2.  Follow the established structure.
3.  Reuse established error and status-code conventions.
4.  Do not invent a new response format unless there is a justified
    reason.

Document the established API contract in `docs/api.md`.

---

## 9. Validation

Validate all external input at the server boundary.

Never rely only on client-side validation.

Client-side validation exists for user experience.

Server-side validation exists for correctness and security.

Validate where applicable:

- request body
- query parameters
- route parameters
- uploaded data
- external API responses

Do not trust client-provided:

- IDs
- permissions
- roles
- prices
- ownership information
- other security-sensitive values

---

## 10. Authentication and Authorization

Authentication and authorization are separate concerns.

Authentication determines who the user is.

Authorization determines what the user is allowed to do.

Never rely solely on frontend route guards or hidden UI elements for
authorization.

Sensitive operations must be authorized server-side.

Do not expose:

- passwords
- tokens
- secrets
- private database fields
- internal system information

to the client.

Follow the project's established authentication mechanism.

Do not introduce a new authentication system without first inspecting
the existing implementation and documenting the decision.

Document authentication and authorization architecture in
`docs/security.md`.

---

## 11. Domain Rules and Business Priority

For business behavior, use this priority order:

1.  Explicit current developer/client requirements
2.  Approved business rules
3.  Approved project specifications
4.  Existing documented project behavior
5.  Existing implementation
6.  Claude's assumptions

Claude must never invent business rules.

If requirements, documentation, and implementation conflict:

1.  Identify the conflict.
2.  Determine whether the conflict affects intended behavior.
3.  Do not silently choose an interpretation.
4.  Ask for clarification when necessary.
5.  Update documentation only after the intended behavior is
    established.

Approved business rules take priority over an implementation that is
clearly incorrect.

---

## 12. MongoDB Rules

Use MongoDB through Mongoose.

Keep database access server-side.

Prefer explicit schemas and indexes where appropriate.

Before adding a new query:

1.  Inspect the existing model.
2.  Check existing indexes.
3.  Check whether an existing query/helper can be reused.
4.  Consider the expected data volume and query pattern.

Avoid unnecessary database queries.

Avoid fetching entire collections when only a subset is required.

Use pagination for potentially large datasets.

Do not introduce MongoDB aggregation pipelines unless they are actually
needed.

Do not add indexes speculatively.

Indexes should be justified by actual query patterns.

Never run destructive database operations against production without
explicit confirmation.

Document important collections, relationships, indexes, and data
lifecycle rules in `docs/database.md`.

---

## 13. Error Handling

Errors should be handled intentionally.

Do not silently swallow errors.

Do not expose internal stack traces, database errors, or secrets to
users.

Return appropriate HTTP status codes from APIs.

Provide useful user-facing error messages.

Keep technical error details in server logs where appropriate.

Differentiate between:

- validation errors
- authentication errors
- authorization errors
- not found errors
- business rule errors
- unexpected server errors
- external service failures

Follow the established project error format.

---

## 14. Security

Treat all client input as untrusted.

Never commit secrets.

Never expose environment variables containing secrets to client-side
code.

Never hardcode:

- passwords
- API keys
- database credentials
- tokens
- private keys

Check authorization on the server.

Be cautious with:

- file uploads
- user-generated HTML
- URLs
- redirects
- database queries
- external API requests
- authentication tokens

Do not disable security protections simply to make tests or development
work.

Do not weaken authorization or validation to make a feature easier to
implement.

---

## 15. TypeScript

Use TypeScript throughout the application.

Prefer precise types over `any`.

Do not use `any` to silence a TypeScript error.

If `any` is genuinely required, document why.

Prefer:

- domain types/interfaces
- inferred types where inference is clear
- discriminated unions for state variations
- typed API responses where practical

Avoid unnecessary type complexity.

---

## 16. Code Quality

Prefer simple, readable code.

Optimize for maintainability.

Avoid:

- premature abstraction
- speculative architecture
- unnecessary design patterns
- unnecessary wrapper components
- unnecessary utility functions
- duplicate implementations
- unnecessary dependencies

Before creating a new abstraction:

1.  Search the repository.
2.  Check whether an existing abstraction can be reused.
3.  Determine whether the abstraction will actually be reused.
4.  Create it only when justified.

---

## 17. Overengineering and Scope Control

Do not expand the scope of a task without a clear reason.

If asked to fix a bug:

- fix the bug
- do not automatically refactor unrelated code

If asked to add a feature:

- implement the requested feature
- do not add speculative features
- do not redesign unrelated parts
- do not introduce additional infrastructure unless required

Prefer the minimum complexity necessary to correctly solve the problem.

If an unrelated issue is discovered:

- do not automatically fix it
- mention it in the final summary
- fix it only if it blocks the requested work or explicit approval is
  given

---

## 18. Dependency Rules

Before installing a new dependency:

1.  Check whether the existing stack can solve the problem.
2.  Check whether the project already has an equivalent dependency.
3.  Consider maintenance, bundle size, security, and operational impact.
4.  Explain why the dependency is needed.

Do not install libraries simply because they are convenient.

Do not replace an existing dependency without justification.

Inspect `package.json` before assuming a dependency or script exists.

---

## 19. Testing

Tests should verify behavior, not merely implementation details.

Use Vitest for unit and integration testing.

Use Playwright for end-to-end testing.

When implementing meaningful business logic:

- add or update relevant tests
- cover important edge cases
- preserve existing tests
- do not modify tests simply to make an incorrect implementation pass

Tests are verification tools, not the definition of correct behavior.

---

## 20. Verification

After implementing a meaningful change:

1.  Run relevant tests.
2.  Run the project's actual type-checking command, if available.
3.  Run the project's actual linting command, if available.
4.  Inspect the changed files.
5.  Verify that unrelated functionality was not changed.
6.  If the feature is UI-related, verify the rendered UI when browser
    tooling is available.
7.  Fix issues discovered during verification.

Do not claim a task is complete if required verification has not been
performed.

Do not invent test results, command results, or verification results.

---

## 21. UI Verification

For frontend changes, verify where applicable:

- desktop layout
- mobile layout
- loading state
- empty state
- error state
- success state
- disabled state
- validation state
- overflow behavior
- responsive behavior
- accessibility basics

When browser tooling is available, inspect the actual rendered result
rather than relying only on source code.

---

## 22. Git Safety

Use Git as a checkpoint and recovery mechanism.

Before substantial changes, inspect:

- `git status`
- recent commits
- existing uncommitted changes

Never:

- force push
- `git reset --hard`
- delete branches
- discard user changes
- overwrite unfamiliar work

without explicit confirmation.

Do not commit secrets or `.env` files.

Do not modify unrelated files merely to make a commit cleaner.

Preserve existing uncommitted work.

---

## 23. Destructive Operations

Ask for confirmation before operations that are:

- destructive
- difficult to reverse
- affect production
- affect shared infrastructure
- affect other developers
- delete data
- delete branches
- modify production configuration

Examples:

- dropping MongoDB collections
- deleting production data
- deleting unrelated files
- `git reset --hard`
- force pushing
- changing production environment variables
- modifying production infrastructure

Prefer reversible local actions.

---

## 24. Investigation Before Implementation

Before making significant changes:

1.  Inspect the repository structure.
2.  Read the relevant files.
3.  Read relevant project documentation.
4.  Search for existing implementations.
5.  Identify established patterns.
6.  Understand dependencies and data flow.
7.  Check existing tests.
8.  Only then decide how to implement the change.

Never invent the contents of files that have not been inspected.

If information is missing, investigate the repository rather than
guessing.

For significant business functionality, read at minimum:

- `docs/project-overview.md`
- `docs/business-rules.md`
- `docs/architecture.md`

For significant UI work, also read:

- `docs/ui-design.md`, when it exists

Read additional documentation relevant to the task.

---

## 25. Planning

For small changes, proceed directly when the implementation is obvious.

For medium or large changes:

1.  Investigate the existing architecture.
2.  Briefly explain the proposed approach.
3.  Identify files likely to change.
4.  Identify database/API implications.
5.  Identify testing requirements.
6.  Implement incrementally.
7.  Verify the result.

Do not create a large speculative plan for a trivial change.

Do not make major architectural changes silently.

---

## 26. Existing Code Takes Priority

When the existing project has an established pattern:

Prefer consistency with the existing pattern unless it is clearly broken
or there is a strong reason to change it.

Do not rewrite working architecture simply because another approach is
theoretically cleaner.

Before introducing a new pattern, inspect how similar functionality is
already implemented.

Existing project conventions take precedence over personal preference.

---

## 27. Temporary Files

Temporary scripts or files may be created when they materially help with
investigation or verification.

Clean up temporary files when they are no longer needed.

Do not leave debugging artifacts in the production codebase.

---

## 28. Project Documentation

The `docs/` directory is the project's persistent technical and domain
documentation.

Claude should create and maintain documentation when meaningful project
knowledge, architecture, business rules, or important technical
decisions are established.

### Documentation Structure

Use the following structure when applicable:

```text
docs/
├── project-overview.md
├── architecture.md
├── ui-design.md
├── business-rules.md
├── database.md
├── api.md
├── development.md
├── security.md
└── decisions/
    ├── ADR-001-*.md
    ├── ADR-002-*.md
    └── ADR-003-*.md
```

Do not create documentation files simply for the sake of creating files.

Create or update documentation when it provides meaningful long-term
value.

### Project Overview

`docs/project-overview.md` defines what the product is.

It should describe, when applicable:

- product purpose
- business problem
- target users
- user roles
- core modules
- domain concepts
- important terminology
- major workflows
- entity relationships at a business level
- lifecycle of important business entities
- high-level product boundaries
- known assumptions and constraints

This document is the primary source for understanding the nature and
purpose of the project.

Claude must read it before implementing significant domain
functionality.

### Architecture Documentation

Update `docs/architecture.md` when significant architectural changes
occur.

Examples:

- changing application architecture
- adding a major subsystem
- changing frontend/backend boundaries
- introducing a major integration
- changing authentication architecture
- changing deployment architecture
- changing major data-flow patterns

### Database Documentation

Update `docs/database.md` when significant database changes occur.

Examples:

- new collections
- changed schemas
- important indexes
- relationships
- significant query patterns
- data lifecycle rules

Do not document every minor schema change unless it provides meaningful
long-term value.

### UI Design Documentation

Use `docs/ui-design.md` for the project's visual and interaction
language.

Document, when applicable:

- design direction
- brand usage and color strategy
- typography and spacing conventions
- layout patterns
- PrimeVue component usage
- common page structures
- status and feedback patterns
- responsive behavior
- accessibility conventions
- important UI do/don't rules

The document should explain how the application should look and behave
visually without becoming a screen-by-screen implementation
specification.

Do not invent client branding. If the visual direction is not confirmed,
keep the guidance neutral and mark unresolved design decisions clearly.

### API Documentation

Update `docs/api.md` when significant API conventions or endpoints are
introduced.

Document, where applicable:

- endpoint purpose
- HTTP method
- request parameters
- request body
- response structure
- authentication requirements
- authorization requirements
- important error responses

Follow the project's actual implementation.

Do not invent endpoints.

### Business Rules

Document important business rules in `docs/business-rules.md`.

Business rules must come from:

- explicit developer requirements
- client requirements
- approved specifications
- established and intentionally accepted application behavior

Claude must not invent business rules.

When a requirement is ambiguous, ask for clarification instead of
guessing.

### Development Documentation

Use `docs/development.md` for practical development procedures.

Document, when applicable:

- required Node.js version
- package manager
- installation steps
- environment variables
- Docker setup
- development commands
- test commands
- lint commands
- type-check commands
- build commands
- deployment procedures
- common troubleshooting procedures

Claude must inspect `package.json` and project configuration before
documenting commands.

Do not document commands that do not actually exist.

### Security Documentation

Use `docs/security.md` for meaningful security architecture and
procedures.

Document, when applicable:

- authentication mechanism
- authorization model
- roles and permissions
- session/token strategy
- sensitive data handling
- security boundaries
- important security assumptions
- security-related integrations

Do not document secrets.

### Architectural Decisions

Use Architecture Decision Records (ADRs) for significant architectural
decisions.

Create an ADR when a decision:

- affects the overall architecture
- introduces or removes a major technology
- establishes an important technical convention
- has meaningful tradeoffs
- would be useful for future developers to understand

ADR format:

```md
# ADR-NNN: Decision Title

## Status

Proposed / Accepted / Superseded / Deprecated

## Context

Why the decision was necessary.

## Decision

What was decided.

## Alternatives Considered

Other approaches considered.

## Consequences

Positive and negative consequences.

## Date

Date of the decision.
```

Do not create an ADR for trivial implementation details.

### Documentation After Significant Changes

After completing a significant feature or architectural change:

1.  Determine whether project documentation is affected.
2.  Update the relevant documentation if necessary.
3.  Create an ADR if the change represents a significant architectural
    decision.
4.  Keep documentation consistent with the approved implementation.

Do not claim documentation was updated unless it was actually updated.

### Documentation Accuracy

Documentation must describe the intended and approved current system.

When code and documentation conflict:

1.  Investigate the discrepancy.
2.  Determine whether the code or documentation is incorrect.
3.  Do not silently change business rules to match incorrect code.
4.  Ask for clarification when the intended behavior is unclear.
5.  Update the appropriate source.
6.  Keep documentation synchronized with the approved implementation.

Never knowingly document behavior that does not exist.

---

## 29. Definition of Done

A significant feature is complete only when applicable:

- implementation is complete
- validation is implemented
- authorization is enforced
- error handling is implemented
- loading, empty, error, and success UI states are handled
- relevant tests are added or updated
- type checking passes or the project has no type-check command
- linting passes or the project has no lint command
- relevant UI is verified
- UI follows the established design language and component conventions
- relevant documentation is updated
- an ADR is created when a significant architectural decision was made
- no unrelated behavior was changed

Do not mark a feature complete simply because the primary happy path
works.

---

## 30. Communication

When completing a task, provide a concise summary containing:

- what changed
- important files changed
- tests/checks performed
- documentation updated
- unresolved issues
- recommended follow-up, if any

Do not claim something was tested if it was not actually tested.

Do not claim something works if it was not verified.

If an important assumption was required, state it clearly.

---

## 31. Default Engineering Behavior

When uncertain:

1.  Investigate before guessing.
2.  Read the relevant project documentation.
3.  Prefer the existing architecture.
4.  Prefer the simplest correct solution.
5.  Make the smallest necessary change.
6.  Preserve existing behavior.
7.  Follow approved business rules.
8.  Verify the result.
9.  Update documentation when the change materially affects it.
10. Ask before destructive or irreversible actions.

The goal is not to write the most code.

The goal is to produce correct, secure, maintainable software with the
minimum necessary complexity.
