# Eventa — Event Registration UI Kit

A complete, responsive **admin + attendee** interface for an event‑registration system, built as a **multi‑page HTML/Tailwind UI kit**. No build system, no `package.json`, no dependencies to install — every page is static HTML, and all styling/behaviour loads from CDNs at runtime.

> Light & dark ready · fully responsive · flat/bordered design · compact scale · Thai Baht (฿) · brand green `#1ba770`.

---

## Quick start

Everything is static files, so any static file server works. A ready‑made config lives in [`.claude/launch.json`](.claude/launch.json):

```bash
python3 -m http.server 4599
```

Then open **http://localhost:4599/index.html** (the gallery of all screens) or jump straight to **http://localhost:4599/dashboard.html**.

> ⚠️ **Internet required to render.** Tailwind, fonts, icons and animation libraries are all loaded from CDNs at runtime — there is no bundled copy.

---

## Two design tracks

This kit contains two parallel takes on the same product:

| | **Main app** (repo root) | **`primary-ui/`** (design source) |
|---|---|---|
| Layout | Single collapsible sidebar | Double sidebar (icon rail + labelled panel) |
| Shared shell | `assets/` (`config.js`, `app.css`, `shell.js`) | **Self‑contained** — each file inlines its own config/styles/scripts |
| Icons | [Hugeicons](https://hugeicons.com) font (`hgi-*`) | [reicon](https://reicon.dev) web component (`<re-icon>`) |
| Pages | 22 screens + gallery (see below) | `home.html`, `dashboard.html` |

Both share the same visual language: semantic color tokens, Inter, brand green, compact scale, Thai Baht.

---

## Project structure

```
.
├── index.html              # Landing / gallery linking every screen
├── dashboard.html          # Reference admin dashboard (charts live here)
├── <feature>.html          # Feature pages (events, tickets, payments, …)
├── login / register / …    # Standalone auth + attendee pages (no sidebar)
├── assets/
│   ├── config.js           # Tailwind Play CDN config (semantic color tokens, darkMode:'class')
│   ├── app.css             # Theme CSS variables + component layer (.btn, .card, .badge-*, …)
│   └── shell.js            # Renders the sidebar; wires collapse / drawer / dark mode / panels / tabs
├── primary-ui/
│   ├── home.html           # Home landing (icon rail only, no sub‑nav)
│   └── dashboard.html      # Double‑sidebar dashboard (rail = modules, panel = sub‑nav)
├── .claude/launch.json     # Preview server config (python http.server on :4599)
└── CLAUDE.md               # Detailed architecture notes / contributor guide
```

### Pages (main app)

**Manage** — dashboard · events · event‑form · event‑detail · registrations · attendees · tickets · check‑in
**Finance** — payments · payouts · discounts
**Engage** — speakers · agenda · feedback
**Insights & System** — reports · notifications · users · settings
**Attendee & Auth** (standalone, no sidebar) — my‑events · login · register · forgot‑password

---

## Runtime dependencies (all via CDN)

- **Tailwind CSS** — Play CDN + inline config, `darkMode: 'class'`. Font is **Inter**.
- **Icons** — Hugeicons stroke‑rounded font (main app) / reicon web component (`primary-ui/`).
- **Motion** ([motion.dev](https://motion.dev)) — sidebar width, drawer, and dark‑mode transitions (main app).

## Design conventions

- **Semantic color tokens** drive theming so light/dark flips automatically: `canvas`, `surface`, `sidebar`, `hair`, `line`, `ink`, `muted`, `brand.soft` (defined as space‑separated RGB channels wired through `rgb(var(--x) / <alpha-value>)`). Prefer these over literal utilities (`bg-surface`, not `bg-white`).
- **Flat / bordered, not shadowed** — `.card` = `border` on `bg-surface`; shadows only on floating popovers/panels.
- **Compact scale** — ~13px base, 22px page titles & stat values, tabular numerals (`tnum`) on all figures.
- **Charts are hand‑built inline SVG** (no chart library) — smooth area line + donut, redrawn on theme change.

See [`CLAUDE.md`](CLAUDE.md) for the full shell contract, sidebar internals, and chart details.

---

*Static UI kit — HTML, Tailwind CSS, Hugeicons / reicon & Motion. No build step.*
