## Brand and UI Relationship

The client-provided gym logo is the primary brand reference.

The logo contains strong red, yellow/gold, black, and illustrated
bodybuilding elements.

The application UI must NOT reproduce the logo's visual style literally.

Use the logo to inform brand recognition, primarily through controlled
use of its dominant colors and visual identity.

The application should use a modern, clean, professional SaaS dashboard
aesthetic appropriate for a membership management system.

Prefer neutral backgrounds and surfaces with the brand red used
strategically for primary actions, active navigation, important emphasis,
and selected states.

Use yellow/gold sparingly as a secondary brand accent.

Black/dark tones may be used for typography and strong contrast, but
should not dominate the interface unless justified by the design.

Do not use the logo's red background as the application's default
background.

Do not reproduce the logo's illustrated bodybuilding style as a UI
pattern.

Do not use the logo's colors equally throughout the interface.

The goal is to preserve brand recognition while producing a modern,
professional software interface.

## Established Patterns

**App shell** (`app/layouts/default.vue`)

- A white top bar with a bottom border, containing the logo (32px), the "707 Gym"
  wordmark, the signed-in staff name (hidden on small screens) and a text-style
  "Sign out" button.
- Page content goes in a centered container (`max-w-6xl`, 16px side padding) on the
  neutral `surface-50` background.

**Standalone pages** (e.g. sign in)

- `layout: false`, with a single centered card (`max-w-sm`, white, thin border,
  no shadow) on `surface-50`.
- The logo appears at full size (64px) only on the sign-in card. Elsewhere it stays small.

**Forms**

- A visible label above each field. Fields are full width (`fluid`).
- Field errors show as small red text directly under the field, and the field gets
  PrimeVue's `invalid` state.
- Form-level errors (e.g. wrong credentials) show as a PrimeVue `Message`
  (severity `error`) at the top of the form.
- The primary submit button is full width in narrow forms and shows its loading
  state while submitting.

**Navigation**

- The top bar has text links (Dashboard, Members). The active link gets a light
  brand tint (`bg-primary-50 text-primary-700`) and `aria-current="page"`.
- Detail and form pages start with a small "← Back" text link above the page title.

**List pages** (e.g. Members)

- The title sits on the left with the primary action button ("Add member") on the right.
- Below it: a search input on the left, and a `SelectButton` view toggle
  (e.g. Active / Archived) on the right. They stack on mobile.
- A PrimeVue `DataTable` in a white bordered panel, with server-side pagination.
  The first column is a link to the record. Secondary columns hide on small
  screens (`hidden md:table-cell`).
- Empty states explain why the list is empty (no search matches, no archived
  records, no records yet).
- The error state shows a `Message` plus a "Try again" button.

**Detail pages**

- The title, with a status `Tag` if needed (e.g. "Archived"). Actions sit on the
  right: secondary outlined buttons for Archive/Restore, and a primary Edit button.
- Fields appear as a two-column definition list in a white bordered panel.
  Empty values show a muted "—".

**Record forms** (e.g. add/edit member)

- Group fields into white bordered sections with small headings. Use two columns
  from `sm` upward.
- Use `LabeledField` for the label, the "(optional)" marker and the error text.
  Mark optional fields, not required ones.
- Actions go at the bottom right: text "Cancel", then the primary submit button.

**Feedback**

- Success after save, archive or restore: a PrimeVue `Toast` (bottom right, 3s).
- Archiving (hiding a record) asks for confirmation with `ConfirmDialog`. Actions
  that can be undone right away (restore) don't.
