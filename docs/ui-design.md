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

**Status tags** (`StatusTag`)

- Membership and member statuses use PrimeVue `Tag` with semantic colors:
  - Active: success
  - Near expiry: warn
  - Expired: danger
  - Scheduled: info
  - No membership: secondary
- Tags never wrap. Long text in the neighboring column wraps instead
  (`wrap-anywhere` on names).

**Sub-records on a detail page** (e.g. memberships)

- A bordered section with the heading and "Add …" button in a header row. Items
  appear as a divided list, not a table, so they stack naturally on mobile.
- Add and edit happen in a modal `Dialog` (`max-w-md`), with the form's submit
  button in the dialog footer.
- Values the server calculates (e.g. the expiry date) are shown as a live preview
  in the dialog. They aren't editable.

**Dashboard stat tiles**

- A KPI row of stat tiles: 2 columns on mobile, 4 from `lg`. Each tile is a white
  bordered card, and the whole tile is a link to the matching filtered member list.
- The label is small, in sentence case, in `surface-600`. The value is `text-3xl
  font-semibold` in `surface-900` with normal (proportional) figures. The number
  is never colored by status.
- Status tiles show a small dot in the status color next to the text label. The
  color is never the only signal.
- No charts for single numbers. A chart only earns its place when there's a trend
  or a comparison to show.

**Filters in the URL**

- A list filter that other pages link to (e.g. `/members?status=expired`) is kept
  in the URL query and updated with `router.replace`.

**Icons** (`primeicons` 7, MIT; see ADR-004)

- Used on navigation, primary and secondary actions (Add, Renew, Edit, Archive,
  Restore, Sign out), dashboard tiles and panels, the search field and status tags.
- Every icon sits next to a text label. Icon-only buttons need an `aria-label`.
- Status icons (`app/utils/status.ts`): Active = check-circle, Near expiry = clock,
  Expired = times-circle, Scheduled = calendar, No membership = minus-circle.

**Follow-up panels** (dashboard "Expiring this week" / "Recently expired")

- Each is a bordered panel with an icon + title header and a count.
- Rows show the name link, relative expiry text ("Expires in 3 days",
  "Expired yesterday"), plan and phone, plus an outlined **Renew** button that
  opens the renewal dialog (`/members/:id?renew=1`).
- A footer link goes to the full filtered list. The panel says "Showing 8 of N"
  when the list is longer.

**Renewal**

- On a member page, the membership action is **Renew** once the member has any
  membership, otherwise **Add membership**.
- The dialog pre-fills the latest plan and the next start date (BR-H3).

**Branding**

- The favicon and home-screen icon come from the client logo
  (`public/favicon.png`, `public/apple-touch-icon.png`).

**Membership history**

- The most recent membership shows its real status tag. Older periods that have
  a newer membership after them show a neutral **"Ended"** tag (secondary, check
  icon) instead of a red "Expired", so a loyal member's history doesn't look alarming.

**Phone numbers**

- In follow-up lists, phone numbers are `tel:` links (tap to call on mobile) and never wrap.

**Loading** (render first, fill in data)

- Pages load their data with `useApi(url, { lazy: true })`. On client-side
  navigation the page (title, controls, layout) renders immediately and shows
  PrimeVue `Skeleton` placeholders shaped like the content. A full page load still
  arrives server-rendered with data.
- Show empty states ("No members yet") only after data has loaded (`data` is set),
  never while it's loading.
- A table's own loading overlay is for **refreshing** data already on screen
  (`loading && !!data`), not the first load.
- Independent requests on one page start together (`Promise.all([...useApi()])`).
- A brand-colored top bar (`NuxtLoadingIndicator`) shows during route changes.
