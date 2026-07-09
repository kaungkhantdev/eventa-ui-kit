# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Eventa** — a multi-page HTML/Tailwind UI kit for an event-registration admin system (organizer-facing), plus attendee/auth pages. **No build system, no package.json, no dependencies to install.** Everything is static HTML served by a plain file server; all styling/behavior loads from CDNs at runtime (needs internet to render).

Pages share a small **shell** in `assets/` so they stay consistent:
- `assets/config.js` — the Tailwind (Play CDN) config (`darkMode:'class'` + semantic color tokens). Loaded right after the Tailwind CDN script.
- `assets/app.css` — theme CSS variables, sidebar-collapse rules, and the **component layer** (`.btn`, `.card`, `.input`/`.select`/`.textarea`/`.label`, `.badge-*`, `.data-table`, `.avatar`, `.segmented`, `.panel`/`.modal`, `.tab`).
- `assets/shell.js` — renders the sidebar, wires collapse/drawer/dark-mode, and provides **declarative** slide-over panels/modals and tabs.

`dashboard.html` is the reference page (charts live there). Feature pages: `events`, `event-form`, `event-detail`, `registrations`, `attendees`, `tickets`, `check-in`, `payments`, `payouts`, `discounts`, `reports`, `notifications`, `users`, `settings`, `speakers`, `agenda`, `feedback`. Standalone (no sidebar): `login`, `register`, `forgot-password`, `my-events` (attendee portal).

## Running / previewing

Preview server in `.claude/launch.json` (config `ui-kit`): `python3 -m http.server 4599`; open `http://localhost:4599/dashboard.html`. No tests, linter, or build step.

## How a page is put together (the shell contract)

An admin page is just a `<head>` block + a `<main>`; **the sidebar is injected by `shell.js`, never written per-page**. Minimum shape:
- `<head>`: the shared block — a tiny inline "boot" script that sets `.dark` before paint (no theme flash), Google **Inter**, the Hugeicons font, Tailwind CDN, Motion CDN, then `assets/config.js` and `assets/app.css`.
- `<body ... data-page="events">` — **`data-page` must equal a nav id** so `shell.js` highlights the right item.
- `<div class="flex h-full min-h-screen" data-layout>` — `shell.js` prepends `#backdrop` + `#sidebar` here.
- `<main class="min-w-0 flex-1 overflow-y-auto px-5 py-4 lg:px-7">` — page header (with `#btn-menu` hamburger) + content.
- `<script src="assets/shell.js"></script>`, then an optional page-local `<script>`.

Copy an existing page (e.g. `events.html`) as the template. The nav model lives in the `NAV` array in `shell.js`; add pages/sections there.

**Declarative interactions (no per-page JS needed):**
- Slide-over / modal: a trigger `[data-open="ID"]` opens the `.panel`/`.modal` with that `id`; `[data-close]` or the auto overlay (or `Esc`) closes it.
- Tabs: `<div data-tabs="#content">` with `[data-tab="x"]` buttons + `[data-tab-panel="x"]` sections inside `#content`.
- Pages that must repaint on theme flip set `window.EventaOnThemeChange = fn` (dashboard uses it to re-render its chart).

Standalone pages (auth, attendee portal) omit `shell.js`/sidebar and carry their own tiny theme-toggle button.

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
- **Motion (motion.dev)** global UMD build (`motion@11.18.2/dist/motion.js`) → `window.Motion`. Animates the sidebar width on collapse/expand, the drawer backdrop, and the dark-mode "circular reveal".
  - **Robustness rule:** animations must never gate state or visibility. Motion's `.finished` does **not** resolve while the tab is backgrounded (rAF paused), so code applies the real change immediately and uses `setTimeout` to guarantee cleanup/resting state. Never `await animation.finished` before a state change. Respects `prefers-reduced-motion`; degrades if `window.Motion` is absent.

## Sidebar (in `shell.js`)

One `#sidebar` (no separate rail). Nav labels/wordmark/profile are wrapped in `.side-label` spans so they collapse. Collapse/expand state persists in `localStorage['eventa-collapsed']`.
- **Desktop (`lg`+):** in-flow. `setCollapsed(bool)` toggles `.collapsed` (which holds the resting state via CSS — width 14rem⇄3.5rem via an `#sidebar` id rule, `.side-label`→`max-width:0`, `.section-label`→its `data-short` letter, and swaps the `<`/`>` arrows) and **animates the width** with Motion. A constant `px-2.5` keeps the 36px icon slot centered in the 56px rail so icons don't jump.
- **Mobile (`<lg`):** off-canvas drawer (`-translate-x-full`⇄`translate-x-0`) via `#btn-menu` + `#backdrop`. A `matchMedia` listener clears collapsed/inline width across the breakpoint.

## Charts are hand-built inline SVG (no chart library) — `dashboard.html` / `reports.html`

- **Area line chart** (`renderChart`): builds an SVG string; smooth curve via `smoothPath()` (Catmull-Rom→cubic-bezier); `vector-effect="non-scaling-stroke"` keeps the line crisp while the SVG scales. It reads `document.documentElement.classList.contains('dark')` and picks gridline/axis/tooltip/ring colors per theme, so **any theme change must call `renderChart(currentRange)`** (wired via `window.EventaOnThemeChange`).
- **Donut**: SVG `<circle>` arcs, radius `15.915` (circumference = 100 → dasharray == percentage), `stroke-linecap="round"` + a `GAP`, `stroke-dashoffset = 25 - cumulative`. Center total is an HTML overlay.

## Design conventions to preserve

- **Flat/bordered, not shadowed:** `.card` = `border border-hair` on `bg-surface`; page is `bg-canvas`, sidebar `bg-sidebar`. Only intentional shadows: floating popovers/panels.
- **Compact scale:** ~13px base, 11px labels, 15px section headings, 22px page titles & stat values; `tnum` on all figures.
- Currency **Thai Baht (฿)**.
- Percentage deltas pair `hgi-arrow-up-right-01` (green `text-brand`) with positive, `hgi-arrow-down-right-01` (`text-red-500`) with negative.
