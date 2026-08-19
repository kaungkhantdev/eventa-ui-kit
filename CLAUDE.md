# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Eventa** — a multi-page HTML/Tailwind UI kit for an event-registration admin system (organizer-facing), plus attendee/auth pages. **No build system, no package.json, no dependencies to install.** Everything is static HTML served by a plain file server; all styling/behavior loads from CDNs at runtime (needs internet to render).

Pages share a small **shell** in `assets/` so they stay consistent:
- `assets/config.js` — the Tailwind (Play CDN) config (`darkMode:'class'` + semantic color tokens). Loaded right after the Tailwind CDN script.
- `assets/app.css` — theme CSS variables, the double-sidebar helpers (`.rail-tip` tooltip, `.no-scrollbar`), and the **component layer** (`.btn`, `.card`, `.input`/`.select`/`.textarea`/`.label`, `.badge-*`, `.data-table`, `.avatar`, `.segmented`, `.panel`/`.modal`, `.tab`).
- `assets/shell.js` — renders the **double sidebar** (icon rail = modules, labeled panel = the active module's sub-nav), wires the mobile drawer / dark-mode, and provides **declarative** slide-over panels/modals and tabs.

**Files are grouped by area** (relative links depend on this):
- `admin/` — the 18 sidebar pages: `dashboard` (reference page, charts live there), `events`, `event-form`, `event-detail`, `registrations`, `attendees`, `tickets`, `check-in`, `payments`, `payouts`, `discounts`, `reports`, `notifications`, `users`, `settings`, `speakers`, `agenda`, `feedback`.
- `auth/` — `login`, `register`, `forgot-password`.
- `portal/` — `my-events` (attendee portal).
- Root — `index.html` (gallery), `assets/` (shared shell), and `primary-ui/` (a self-contained alternative design that uses the [reicon](https://reicon.dev) web component instead of Hugeicons; `home.html` + `dashboard.html`).

Because pages live one level down, they reference the shared shell as `../assets/…`. `shell.js`'s `NAV` hrefs stay **bare** (`events.html`) — they resolve correctly since every sidebar page shares `admin/`; only **cross-folder** links carry a prefix (e.g. the logout link → `../auth/login.html`).

## Running / previewing

Preview server in `.claude/launch.json` (config `ui-kit`): `python3 -m http.server 4599`; open `http://localhost:4599/index.html` (gallery) or `http://localhost:4599/admin/dashboard.html`. No tests, linter, or build step.

## How a page is put together (the shell contract)

An admin page is just a `<head>` block + a `<main>`; **the sidebar is injected by `shell.js`, never written per-page**. Minimum shape:
- `<head>`: the shared block — a tiny inline "boot" script that sets `.dark` before paint (no theme flash), Google **Inter**, the Hugeicons font, Tailwind CDN, Motion CDN, then `../assets/config.js` and `../assets/app.css`.
- `<body ... data-page="events">` — **`data-page` must equal a leaf `page` id** in `shell.js`'s `MODULES` so it maps to the right module + highlights the right sub-nav leaf.
- `<div class="flex h-full min-h-screen" data-layout>` — `shell.js` prepends `#backdrop` + `#sidenav` (the icon rail + labeled panel) here.
- `<main class="min-w-0 flex-1 overflow-y-auto px-5 py-4 lg:px-7">` — page header (with `#btn-menu` hamburger) + content.
- `<script src="../assets/shell.js"></script>`, then an optional page-local `<script>`.

Copy an existing page (e.g. `admin/events.html`) as the template. The nav model lives in the `MODULES` array in `shell.js` (each module → its accordion groups → leaf pages); add pages/modules there.

**Empty states.** Every data-driven admin page ships *both* states. Its real content carries
`data-when-data`; a first-run block sits alongside it as `<section data-empty hidden class="card empty">`,
placed straight after the page `</header>`. `shell.js` swaps them when the URL carries **`?empty=1`**
(e.g. `admin/events.html?empty=1`) and drops a small pill bottom-right to get back — so a brand-new
workspace is reviewable without duplicating pages. `.empty`/`.empty-icon`/`.empty-title`/`.empty-text`/
`.empty-actions` live in `app.css`; both variants (first-run vs no-results) are documented in
`components.html` → Feedback → Empty states. The no-results block adds **`.empty-sm`** (tighter padding for a table cell) and a **`data-clear-filters`** button handled globally in `shell.js` — it resets the page's search boxes, filter selects and pill tabs and re-fires `input`/`change`, so no page needs its own handler. Paginator controls are deliberately skipped (page size is not a filter). Copy should explain *what will fill the page* and offer
the one real next step — Attendees points at publishing an event, not at a non-existent "add attendee".
`app.css` also forces `[hidden]{display:none!important}` because Tailwind's `.flex`/`.grid` would
otherwise beat the bare `hidden` attribute and silently break the swap.

**Declarative interactions (no per-page JS needed):**
- Slide-over / modal: a trigger `[data-open="ID"]` opens the `.panel`/`.modal` with that `id`; `[data-close]` or the auto overlay (or `Esc`) closes it.
- Tabs: `<div data-tabs="#content">` with `[data-tab="x"]` buttons + `[data-tab-panel="x"]` sections inside `#content`.
- Pages that must repaint on theme flip set `window.EventaOnThemeChange = fn` (dashboard uses it to re-render its chart).

Standalone pages in `auth/` and `portal/` omit `shell.js`/sidebar and carry their own tiny theme-toggle button; they still pull shared styles via `../assets/`.

## Runtime dependencies (all CDN)

- **Tailwind CSS via Play CDN** with `assets/config.js`, `darkMode: 'class'`. Font is **Inter** — "same font" means Inter.
  - **Semantic color tokens drive theming.** Colors reference CSS variables so light/dark flip automatically: `canvas` (page bg), `surface` (cards), `sidebar`, `hair` (borders), `line` (dividers/gridlines/hover), `ink` (primary text), `muted` (secondary text), `brand.soft`. Defined as space-separated RGB channels in `:root` / `html.dark` in `app.css`, wired as `rgb(var(--x) / <alpha-value>)` so opacity modifiers (`text-muted/80`) work. `brand`/`brand.dark` stay fixed hex.
  - **Prefer semantic tokens over literal utilities** (`bg-surface` not `bg-white`, `border-hair` not `border-gray-200`) so new elements are dark-mode-ready. Literal accents (amber/red/blue via `.badge-*` or explicit `dark:` variants) are the exception.
- **Hugeicons stroke-rounded icon *font*** (`cdn.hugeicons.com/font/hgi-stroke-rounded.css`). Icons: `<i class="hgi-stroke hgi-<name>">`, sized with `text-[Npx]`, colored via `currentColor`.
  - **Critical gotcha:** an unknown icon name renders a blank/"tofu" glyph, not an error. **Verify a slug exists before using it:**
    ```
    curl -sL https://cdn.hugeicons.com/font/hgi-stroke-rounded.css | grep -oE '\.hgi-[a-z0-9-]+' | sort -u
    ```
    (Exception: the Eventa logo mark is hand-authored where present.)
- **Motion (motion.dev)** global UMD build (`motion@11.18.2/dist/motion.js`) → `window.Motion`. Animates the drawer backdrop and the dark-mode "circular reveal".
  - **Robustness rule:** animations must never gate state or visibility. Motion's `.finished` does **not** resolve while the tab is backgrounded (rAF paused), so code applies the real change immediately and uses `setTimeout` to guarantee cleanup/resting state. Never `await animation.finished` before a state change. Respects `prefers-reduced-motion`; degrades if `window.Motion` is absent.

## Double sidebar (in `shell.js`)

`#sidenav` holds two asides: a black **icon rail** (`#rail`, w-16 = **main nav / modules**) + a **labeled panel** (`#panel`, w-64 = the active module's **sub-nav**). Both use Hugeicons (matching page content). A master–detail model built from the `MODULES` array:
- **Rail** — one tile per module, generated by `railBtn()`. The active module (the one whose leaf `page` === `data-page`) is highlighted `bg-brand-soft text-brand`; hover is brand-green. Each tile has a `.rail-tip` hover tooltip. A module with `href` (Dashboard) renders as an `<a>` that navigates; modules with `groups` render as `<button data-mod>` that **swap the panel client-side** (`selectModule`) so you can browse a module's sub-nav without leaving the page. Logo (top) + theme toggle + profile avatar (`mt-auto`, bottom).
- **Panel** — the selected module's `groups` as a collapsible accordion (chevron rotates via `rotate-180`); leaves are page links, with the one matching `data-page` highlighted. Modules with no `groups` (Dashboard) **hide the panel** (`#panel.hidden`).
- **Mobile (`<lg`):** the whole `#sidenav` is an off-canvas drawer (`-translate-x-full`⇄`translate-x-0`) via `#btn-menu` + `#backdrop`; a real nav link closes it, a module-switch button does not.
- **Portal** (`portal/my-events.html`) is standalone (no `shell.js`) but reuses the same rail/panel markup + `.rail-tip` styles inline, with attendee-oriented modules and a flat (non-accordion) panel.

## Charts are hand-built inline SVG (no chart library) — `dashboard.html` / `reports.html`

- **Area line chart** (`renderChart`): builds an SVG string; smooth curve via `smoothPath()` (Catmull-Rom→cubic-bezier); `vector-effect="non-scaling-stroke"` keeps the line crisp while the SVG scales. It reads `document.documentElement.classList.contains('dark')` and picks gridline/axis/tooltip/ring colors per theme, so **any theme change must call `renderChart(currentRange)`** (wired via `window.EventaOnThemeChange`).
- **Donut**: SVG `<circle>` arcs, radius `15.915` (circumference = 100 → dasharray == percentage), `stroke-linecap="round"` + a `GAP`, `stroke-dashoffset = 25 - cumulative`. Center total is an HTML overlay.

## Design conventions to preserve

- **Flat/bordered, not shadowed:** `.card` = `border border-hair` on `bg-surface`; page is `bg-canvas`, sidebar `bg-sidebar`. Only intentional shadows: floating popovers/panels.
- **Compact scale:** ~13px base, 11px labels, 15px section headings, 22px page titles & stat values; `tnum` on all figures.
- Currency **Thai Baht (฿)**.
- Percentage deltas pair `hgi-arrow-up-right-01` (green `text-brand`) with positive, `hgi-arrow-down-right-01` (`text-red-500`) with negative.
