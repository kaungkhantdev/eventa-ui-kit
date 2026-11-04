# AGENTS.md

Instructions for AI coding agents in this repo. `CLAUDE.md` imports it; only Claude-specific lines go there.

- **Trust order.** The pages and the shared files in `assets/` say how things look and work; the
  `US-*` stories in eventa-docs say what the product does. Both outrank this file: when they
  disagree with it, follow them and fix this file in the same change.
- **Don't guess.** Look up a name before you use it: file, script, env var, endpoint, table, story
  ID. If you can't find it, say so instead of inventing it.
- **Counts and lists go stale.** This file has none on purpose; run the command it gives instead.

## What this is

Eventa's design kit: static HTML whose Tailwind, fonts, icons and Motion load from CDNs.
Tailwind is the v3 Play CDN, so v4 syntax does not work. It is the visual source for eventa-web,
not the app.

## Commands

```sh
python3 -m http.server 4599                     # preview from the repo root (.claude/launch.json)
grep -oE "(id|page): '[^']+'" assets/shell.js   # module and leaf ids (console: assets-console/shell.js)
```

Add `?empty=1` to a data page's URL to see its first-run state. An unknown Hugeicons slug renders
blank with no error, so check each one you add:

```sh
curl -sfL "$(grep -oE 'https://[^"]+hgi-stroke-rounded\.css' admin/events.html)" \
  | grep -oE '\.hgi-[a-z0-9-]+' | cut -c2- | LC_ALL=C sort -u > /tmp/hgi.txt
grep -qx 'hgi-cloud-server' /tmp/hgi.txt && echo OK || echo MISSING
test -s /tmp/hgi.txt || echo 'fetch failed'
```

No tests, linter or CI: open the page in light and dark, and below 1024px.

## Rules

1. Never write the **sidebar** into a page; `shell.js` injects it. Copy the `<head>` and skeleton
   of `admin/events.html` (console: `admin-console/overview.html`): `data-page` on `<body>`, a
   `[data-layout]` wrapper, `#btn-menu` in the `<main>` header, `shell.js` before any page script.
2. **`data-page`** must equal a leaf `page` id, or a childless module's `id`, in that shell's
   `MODULES`; a detail page reuses its list's id (`event-detail.html` uses `events`). `MODULES`
   hrefs stay bare (`events.html`); only cross-folder links carry `../`.
3. Every data-driven page ships both **states**. Real content carries `data-when-data`; a
   `<section data-empty hidden class="card empty">` follows the top bar holding `#btn-menu`. A
   filtered table's no-results row uses `.empty empty-sm` and a `data-clear-filters` button. Empty
   copy says what will fill the page and offers one primary next step (a ghost secondary is fine).
4. **Semantic** tokens only (`bg-surface`, `border-hair`, `text-ink`), not `bg-white`, so
   dark mode works. `text-muted`: placeholders only. A literal accent needs `.badge-*` or a `dark:`
   variant.
5. **Flat.** Surfaces differ by colour (`bg-canvas` page, `bg-surface` cards); `.card` has no
   border or shadow. Shadows belong to menus, popovers and small controls (toggle knobs, the
   active segment).
6. **Charts** are hand-built inline SVG; add no chart library. Copy them from
   `admin/dashboard.html`, including the `window.EventaOnThemeChange` redraw.
7. **Animation** never gates state. Apply the change first, clean up with `setTimeout`, never
   `await` Motion's `.finished` (it stalls in background tabs). Work without `window.Motion`.
8. Use the shell's **hooks**, not page JS: `data-open`/`data-close` for `.panel` and `.modal`,
   `data-tabs`/`data-tab`/`data-tab-panel` for tabs (copy `admin/users.html`'s, not `events.html`'s).
9. **Money** is Thai Baht (฿); every figure gets `tnum`.

## Gotchas

- `assets-console/` is a copy of `assets/`, not a link: port a fix to both, by hand.
  `diff -rq assets assets-console` must list only `shell.js`, which differs on purpose (own
  `MODULES`, flat `items`); never copy it over.
- `primary-ui/` inlines its own Tailwind config and styles, so changes in `assets/` miss it.
- The brand green is hard-coded well beyond `assets/config.js` (CSS, SVG, JS, `rgba()` tints):
  to change it, grep the repo for every form of the old value.
- Keep the `[hidden]` rule in `app.css`: without it Tailwind's `.flex` beats the `hidden`
  attribute and the empty-state swap silently breaks.
- Serve over http. Over `file://`, Chrome blocks the CSS mask that paints the logo.
- `auth/`, `portal/` and `landing/` don't load `shell.js`, so rule 8's hooks and `?empty=1` do
  nothing there unless the page wires them itself.

## Internal console (`admin-console/`)

- For Eventa staff looking across tenants, where `admin/` looks inside one workspace. MRR and
  billing are Eventa's revenue; GMV is ticket sales.
- Pages load only `../assets-console/`. Copy `admin-console/overview.html`, header included (one
  staff identity on every page).
- Namespace a page id when the word means something else here: `support-tickets`.
- eventa-api has no platform-staff identity: every role belongs to one organization. Flag any
  screen that implies cross-tenant queries.

## Where things are

- `components.html`: the component reference, except its bordered cards and first `#empty`.
- [The `US-*` stories](../eventa-docs/01-requirements-and-features/functional-requirements.md).
- [Screen inventory and user flows](../eventa-docs/03-ux-ui-design/design-reference.md); its
  "Admin console" is `admin/`.

## Sibling repos

- **eventa-web** is a 1:1 visual port ([CONVENTIONS.md](../eventa-web/CONVENTIONS.md)), so list
  every page you changed. Where kit content promises behaviour the API lacks, eventa-web departs
  (`grep -rnE "kit's (copy|.*deliberately absent)" ../eventa-web/src`); treat that as a kit bug.
- Theme **tokens** and brand colour must match eventa-web's `src/styles/tokens.css` and
  `src/index.css`. Today this prints only dark `--surface` (ask which wins):
  `diff <(grep -E '^ +--' assets/app.css) <(grep -E '^ +--' ../eventa-web/src/styles/tokens.css)`
- **eventa-website** screenshots are kit captures: the comment before each in
  `../eventa-website/index.html` names the page (hero: `admin/home.html`). Changing one means
  new shots ([how](../eventa-website/AGENTS.md)).

## Editing this file

Add a line only for something an agent got wrong that the code could not have told it. No counts,
inventories, version lists or history of past mistakes: point to the file or command instead. Keep
it under 900 words.
