# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

A static wiki for the game *Monsters and Memories*, hosted on GitHub Pages. No build
step, no backend, no login system. `index.html` + `style.css` + `script.js` load content
at runtime — either Markdown pages (via marked.js) or the Item Database (via `items.json`).
See `README.md` for the full explanation written for the (non-technical) site owner.

## Adding a normal wiki page

1. Write the content as a `.md` file in `pages/`.
2. Add one entry to `pages.json`: `{ "title": ..., "file": "name.md", "category": ... }`.
3. Screenshots go in `images/`, referenced from the page as `![alt](images/file.png)`.

Do not edit `index.html`, `style.css`, or `script.js` for a normal content page — they
don't need it.

## Adding an item to the Item Database

The Item Database (`pages.json` entry with `"type": "items"`) is not a Markdown page —
it's a searchable/filterable/sortable table rendered by `script.js` from `items.json`.

1. Add an object to `items.json`. Weapons use `damage` / `delay` (ratio is computed at
   render time, don't store it). Armor/jewelry use `ac` and a `stats` object
   (`{"AGI": 1, "DEX": 2, ...}`).
2. Drop the item's screenshot in `images/items/`, filename matching the `image` field.

Filters (type/slot/class) and search are all derived from `items.json` at runtime — no
other file needs to change when items are added.

### New items come in via `images/inbox/`

The user drops new item screenshots into `images/inbox/` (may appear as `images/Inbox` on
disk — Windows paths are case-insensitive, don't create a second folder for it). This is
the *only* place to look for new/unprocessed items — do not re-scan `images/items/` or
re-read existing entries in `items.json` looking for new work; that wastes tokens on files
that haven't changed.

Workflow when asked to process new items (or "check the inbox"):

1. List `images/inbox/` — each file there is one unprocessed item screenshot.
2. For each one: read the image, extract its name and stats.
3. Check whether that item's slug (or name) already exists in `items.json` — this is a
   cheap text check against the existing entries, not the same as re-scanning every image
   in `images/items/`, and it's required every time to catch duplicates.
   - **Not a duplicate:** add an entry to `items.json`. Rename the file to the item's
     slug — lower case, spaces and punctuation replaced with dashes (e.g. "Tunic of Night"
     → `tunic-of-night.png`) — and move (don't copy) it into `images/items/` under that
     name. Use the same slug for the `image` field in the entry.
   - **Duplicate of an existing item:** do not touch `items.json`. Move the file into
     `images/duplicates/` instead, named `<slug>-duplicate.png` (append `-2`, `-3`, etc.
     if more than one duplicate of the same item shows up) so the user can identify which
     item it's a duplicate of at a glance and review it.
4. Once a file has been moved out (to either `images/items/` or `images/duplicates/`),
   `images/inbox/` should no longer contain it — an empty inbox means everything is
   processed.

## Known CSS gotcha

`.content-inner img` (in `style.css`) sets `display: block` on every image rendered inside
page content, with specificity `(0,1,1)`. A bare class selector like `.some-class` has
specificity `(0,1,0)` and will lose to it silently. If a new img-related style in the
Item Database (or a future feature) doesn't seem to apply, check this first — either raise
specificity (`.content-inner .my-class`) or, more robustly, control visibility via inline
styles set from JS rather than relying on a CSS class toggle.

## Local preview

There's no Node or Python in this environment's PATH. To preview the site locally, spin up
a throwaway static file server (e.g. a small PowerShell `HttpListener` script) rather than
assuming `python -m http.server` or `npx serve` will work — check first. Don't commit a
`.claude/launch.json` that points at a session-scoped scratchpad path; it won't survive
past the session.

## Git workflow

The user is non-technical and relies on Claude to commit and push. Changes are not pushed
automatically — wait for an explicit request (e.g. "push") before running `git push`.
