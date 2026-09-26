# ADR-004: PrimeVue styled mode + Tailwind CSS v4

## Status

Accepted (2026-09-25)

## Context

PrimeVue is the primary component library and Tailwind handles layout
(CLAUDE.md). `docs/ui-design.md` asks for neutral surfaces, with the brand red
used for primary actions and emphasis.

**Licensing finding (2026-09-25):** PrimeVue **5.x** (`primevue`, `@primevue/nuxt-module`,
`@primeuix/themes` v3) uses the commercial **PrimeUI License**:

- A license key is required. Without one, an "Invalid PrimeUI License" notice
  appears on every page.
- A free Community License is available to organizations under $1M revenue,
  with fewer than 5 developers and fewer than 10 employees. It must be renewed
  each year.
- Otherwise it's a paid per-developer license.

PrimeVue **4.5.x** (the latest 4.x) is MIT-licensed.

## Decision

- **Styling mode:** PrimeVue styled mode with the **Aura** preset, customized
  so the primary color uses the red scale (`app/theme/index.ts`).
- **Tailwind:** Tailwind v4 through `@tailwindcss/vite`, plus `tailwindcss-primeui`
  so Tailwind classes can use PrimeVue tokens.
- **CSS layer order:** `theme, base, primevue, components, utilities`. Tailwind
  utilities can override PrimeVue component styles.
- **Dark mode:** light mode only for now. Dark mode applies only if the
  `.app-dark` class is set.
- **Icons:** `primeicons` constrained to `^7.0.0` (MIT). **PrimeIcons 8.x uses the
  same commercial PrimeUI License as PrimeVue 5**, so the same rule applies:
  don't upgrade without a new decision. *(Added 2026-09-26.)*
- **PrimeVue version: 4.5.x (MIT).** `primevue` and `@primevue/nuxt-module`
  are constrained to `^4.5.5` (never 5.x), and `@primeuix/themes` to `^2.0.3`. Do not upgrade to
  PrimeVue 5.x without a new decision, because 5.x requires a PrimeUI license key.

## Alternatives Considered

- **Unstyled mode + Tailwind pass-through.** Full visual control, but every
  component needs to be styled by hand.
- **Tailwind v3 via `@nuxtjs/tailwindcss`.** An older Tailwind major version.
- **PrimeVue 5.x with a Community (free, eligibility-limited, renewed yearly) or
  Commercial (paid) license key.** Rejected for now to avoid licensing obligations
  on a client project.

## Consequences

- Positive: consistent components with little styling work, and one token
  system shared by PrimeVue and Tailwind.
- Negative: the primary color uses Aura's red scale until exact brand hex values
  are confirmed.
- Positive: every dependency stays MIT or Apache-2.0, with no license key to manage
  or hand over to the client.
- Negative: 4.x is the previous major version. Future features, and eventually
  fixes, will only ship in 5.x. Revisit if 4.x stops getting security fixes.

## Date

2026-09-25
