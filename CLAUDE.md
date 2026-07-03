# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

A static wiki for the game *Monsters and Memories*, hosted on GitHub Pages. No build
step, no backend, no login system. `index.html` + `style.css` + `script.js` load content
at runtime — either Markdown pages (via marked.js) or the Item Database (via `items.json`).
See `README.md` for the full explanation written for the (non-technical) site owner.

## The user's screenshots are the source of truth

Everything the user posts (item/map/recipe screenshots, or stats typed directly in chat) is
taken straight from the live game, right now. If it conflicts with anything found on an
external site (the unofficial wiki, MnM Quest, MnM Classes Map, or any other fan resource
looked up during research), the user's own screenshot wins — external wikis can easily be
outdated (the unofficial wiki is already flagged as such on the Welcome page) or simply
wrong for this game specifically. External sources are still useful for filling in gaps the
user hasn't posted about yet (e.g. the tradeskill difficulty-color wording), but never use
one to override, "correct," or second-guess something the user actually posted a screenshot
of — if the two disagree, say so and ask rather than quietly going with the external source.

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
   render time, don't store it) and `twoHanded: true` if the screenshot says "Two Handed".
   Armor/jewelry use `ac` and a `stats` object (`{"AGI": 1, "DEX": 2, ...}`). Saving-throw
   bonuses (e.g. "SV Fire: +2") go in a separate `resists` object (`{"FIRE": 2}`), not in
   `stats`. A "Haste: +6%" line goes in its own top-level `haste` field (e.g. `"haste": 6`),
   not in `stats` or `resists` — it's a percentage, not a flat bonus. `race` is an array
   (usually `["ALL"]`) — set it to the specific races listed on the card if it isn't ALL.
2. Check the card for a tag line directly below the item name and above "Slot:" — e.g.
   "MAGIC". Capture every such tag (not just MAGIC) in a `tags` array, e.g. `["MAGIC"]` or
   `["MAGIC", "LORE"]`; use `[]` if there's no tag line. Known tags seen so far: MAGIC.
   Others the game is known to use but not yet seen on a card: LORE, NODROP, UNIQUE — if one
   shows up, add it to the item's `tags` array using the same all-caps spelling as the card.
3. Bags/satchels/pouches/backpacks use `"type": "Container"` instead of Armor/Weapon/
   Jewelry/Misc, with `capacity` (integer) and `maxSize` (`"Small"`/`"Medium"`/`"Large"`,
   same Title Case as the item's own `size`) instead of `ac`/`stats`/`damage`. Their `slot`
   is one of `"Bag"`, `"Belt"`, or `"Backpack"` — distinct from `"Waist"`, which is for
   actual belt armor, not a container-carrying slot. Some containers can go in more than
   one slot (e.g. `"Bag / Belt"`), same `"X / Y"` format used for `"Primary / Secondary"`.
4. Item screenshots are saved as `.jpg` (quality 90), not `.png` — see "Item screenshot
   format" below. Drop it in `images/items/`, filename matching the `image` field.

Filters (type/slot/class/race/tags/max size) and search are all derived from `items.json`
at runtime — no other file needs to change when items are added, including when a new tag,
slot, or max-size value shows up for the first time (those dropdowns are populated from
whatever values exist in the data).

## Item screenshot format

Item screenshots (`images/items/`, `images/duplicates/` for items) are stored as `.jpg` at
quality 90, not `.png`. The popup card screenshots are mostly flat text over a noisy stone
texture, which PNG compresses poorly (~350KB/file) — JPEG at q90 gets the same image down
to ~65KB with no visible loss of text legibility, tested by comparing re-encoded crops
against the originals. When moving a screenshot out of the inbox, convert it to `.jpg`
(quality 90) as part of the move rather than keeping the original `.png`/other format.

**Map** images are the opposite: keep them as high-quality `.png`, uncompressed — they're
viewed zoomed-in in the map viewer (see below) where JPEG artifacts would actually be
visible, and they're few enough in number that file size isn't a concern. Do not apply the
JPEG conversion to anything in `images/Maps/`.

## Adding a map to the Maps page

The Maps page (`pages.json` entry with `"type": "maps"`) works the same way as the Item
Database: a manifest file, not hand-written HTML. Maps are listed alphabetically as
clickable thumbnails; clicking one opens the full-size image in a viewer with scroll-to-
zoom and click-and-drag panning (see `renderMapsPage`, `setupMapViewer` in `script.js`).

Source map images can be huge (some are 20-40MB) since they need to stay high-quality for
the zoom viewer. To avoid the grid page downloading every full-size map just to show small
thumbnails, each entry has *two* images: `image` (full-size, opened in the viewer) and
`thumbnail` (a small pre-generated JPEG shown in the grid).

1. Add an object to `maps.json`: `{ "name": ..., "slug": ..., "image": "images/Maps/<slug>.<ext>", "thumbnail": "images/Maps/thumbs/<slug>.jpg" }`.
   Read the map image itself to get its actual in-image title (map titles frequently don't
   match their filename — e.g. a file named `Valeofzintarmap.png` turned out to be titled
   "Vale of Zintar" and `WyrmsbaneCombined_v0.91.png` was actually "Tomb of the Last
   Wyrmsbane"). If two source files are different renderings of the same place (e.g. a
   top-down layout vs. an isometric render), keep both as separate entries and disambiguate
   the names, e.g. `"Infested Crypt"` / `"Infested Crypt (Isometric)"`.
2. Drop the full-size map image in `images/Maps/`, filename matching the `image` field.
   Keep whatever format it already arrived in — don't force it to PNG or re-encode it;
   the "don't JPEG-compress maps" rule above is about not throwing away quality on the
   full-size image, not about normalizing formats.
3. Generate the thumbnail into `images/Maps/thumbs/` — there's no Node/Python/ImageMagick
   in this environment, so use PowerShell + `System.Drawing` (`Add-Type -AssemblyName
   System.Drawing`) to resize to ~480px wide and save as JPEG quality ~80-85. This gets a
   ~40MB map down to well under 100KB with no visible loss at thumbnail size.

## Adding a crafting recipe

The Crafting page (`pages.json` entry with `"type": "crafting"`) shows a grid of tradeskill
categories (from `tradeskills.json` — a fixed list, edit it directly to rename/add/remove a
tradeskill); clicking one shows that tradeskill's recipes from `crafting.json` (see
`renderCraftingPage`, `renderCraftingCategories`, `renderCraftingRecipes` in `script.js`).
Each tradeskill has a `status` of `"live"` or `"planned"` — planned ones show a "Planned"
badge and an explanatory message instead of a recipe list, since they exist in the game's
design but aren't usable yet.

The recipe schema in `crafting.json` grew once real recipe cards started coming in (same
pattern as the item schema growing tags/race/description/effect from real cards) — keep
extending it the same way as new fields show up on future cards, rather than guessing ahead:

- `weight` / `size` — the crafted result's weight/size, shown directly on the recipe card
  same as an item card (Title Case size, matching `items.json`'s convention).
- `components` — array of `{ "item": "Name As Shown On Card", "quantity": N }`, parsed from
  the card's "Components:" list (format on the card is `(N) Item Name`). Component names are
  matched against `items.json` by exact name (case-insensitive) at render time — if a
  matching item exists, `renderCraftingRecipes` makes it a clickable link to the Item
  Database (via `findItemByName`/`goToItem`); if not (most raw materials don't have an item
  card yet), it just renders as plain text. Don't try to resolve/store this link at data-entry
  time — leave it to resolve dynamically so components automatically become clickable later,
  the moment someone adds that material to `items.json`.
- `difficultyColor` / `difficultyText` — the recipe's trivial/skill-up status, shown as
  colored text on the card (e.g. green "This recipe is trivial to you."). The full color →
  message mapping (from the unofficial wiki, since MnM doesn't publish exact skill-up odds):
  Green "This recipe is trivial to you.", Light Blue "...simple task.", Dark Blue "...moderate
  task.", White "...complex task.", Yellow "...daunting task.", Orange "...herculean task.",
  and (not yet confirmed on a real card) Red "You will require all your skills to craft
  this." Match the card's exact wording to a color from this list; if it doesn't match any of
  these, flag it to the user rather than guessing a new one.
- `observedAtSkill` — the user's skill in that tradeskill at the time the screenshot was
  taken (ask them, since it's not shown on the card itself). This isn't a property of the
  recipe — it's a data point for figuring out the recipe's own underlying skill level, since
  MnM's exact trivial-skill formula isn't publicly documented anywhere (unlike EverQuest,
  which this game is inspired by but doesn't necessarily share numbers with).
- `recipeSkillLevel` — the recipe's own exact underlying skill requirement, when it can be
  determined precisely. **Confirmed rule (from the user, 2026-07-03): a White recipe means
  the recipe's skill level exactly equals the crafter's current skill.** So whenever a recipe
  is observed as White, set `recipeSkillLevel` = `observedAtSkill` for that same
  observation — that's an exact value, not a guess. For any other color, leave
  `recipeSkillLevel` unset (null/absent) rather than estimating one, until either (a) that
  same recipe is later observed as White at some skill, or (b) enough White observations
  across many recipes reveal the color-band width (how many skill points separate each color
  tier from White), letting non-white observations be converted to exact/ranged values too.
  Colors above White (Yellow/Orange/Red) mean the recipe's skill level is *higher* than the
  crafter's current skill (harder than you); colors below White (Dark Blue/Light Blue/Green)
  mean it's *lower* (easier than you, Green being the most-exceeded/trivial end). Don't
  invent the band width — just keep recording data points.

1. Add an object to `crafting.json` with at least `name`, `slug`, `tradeskill`, plus whatever
   of the above the card shows.
2. Recipe screenshots are saved as `.jpg` (quality 90), same as item screenshots — see
   "Item screenshot format" above. Drop it in `images/crafting/`, filename matching the
   `image` field.

### New items/maps/recipes come in via `images/inbox/`

The user drops new screenshots into `images/inbox/` (may appear as `images/Inbox` on
disk — Windows paths are case-insensitive, don't create a second folder for it). This is
the *only* place to look for new/unprocessed content — do not re-scan `images/items/` or
re-read existing entries in `items.json`/`maps.json`/`crafting.json` looking for new work;
that wastes tokens on files that haven't changed. Files are usually named with a random ID
(from a screenshot tool), not the item/map/recipe name — the filename is not meaningful,
always read the image itself.

This rule isn't limited to adding new entries — it applies to *any* task involving
item/map/recipe screenshots (e.g. checking for cut-off/truncated text, auditing image
quality, re-verifying data). Only ever read/process files sitting in `images/inbox/`; never
re-open every existing file in `images/items/`, `images/Maps/`, or `images/crafting/` to go
looking for problems. If a task requires checking already-processed images, say so and ask
the user rather than re-scanning everything.

Workflow when asked to process new items (or "check the inbox"):

1. List `images/inbox/` — each file there is one unprocessed screenshot.
2. For each one: read the image and figure out whether it's an **item** (the stat-card
   popup style used elsewhere in this doc), a **map** (a game map/zone image, no stat
   card), or a **recipe** (a tradeskill/crafting window screenshot) — then follow the
   matching path below.
3. Once a file has been moved out (to `images/items/`, `images/Maps/`, `images/crafting/`,
   or `images/duplicates/`), `images/inbox/` should no longer contain it — an empty inbox
   means everything is processed.

**Items:**

1. Extract the item's name and stats, including `race` and any `tags` (see the tag/race
   guidance in "Adding an item to the Item Database" above).
2. Check whether that item's slug (or name) already exists in `items.json` — this is a
   cheap text check against the existing entries, not the same as re-scanning every image
   in `images/items/`, and it's required every time to catch duplicates.
   - **Not a duplicate:** add an entry to `items.json`. Convert the screenshot to `.jpg`
     (quality 90, see "Item screenshot format" above) and rename it to the item's slug —
     lower case, spaces and punctuation replaced with dashes (e.g. "Tunic of Night" →
     `tunic-of-night.jpg`) — and move (don't copy) it into `images/items/` under that name.
     Use the same slug for the `image` field in the entry.
   - **Duplicate of an existing item:** do not touch `items.json`. Convert the screenshot
     to `.jpg` (quality 90) and move it into `images/duplicates/` instead, named
     `<slug>-duplicate.jpg` (append `-2`, `-3`, etc. if more than one duplicate of the same
     item shows up) so the user can identify which item it's a duplicate of at a glance and
     review it.

**Maps:**

1. Extract the map's name.
2. Check whether that map's slug (or name) already exists in `maps.json`.
   - **Not a duplicate:** add an entry to `maps.json`. Rename the file to the map's slug
     and move it into `images/Maps/`, matching the `image` field.
   - **Duplicate of an existing map:** move the file into `images/duplicates/`, named
     `<slug>-duplicate.png` (append `-2`, `-3`, etc. as needed), same as items.

**Recipes:**

1. Extract the recipe's name and which tradeskill it belongs to (must match a name in
   `tradeskills.json` — if the card names a tradeskill not in that list, flag it to the user
   rather than inventing a new category). See "Adding a crafting recipe" above for the
   current (minimal, still-evolving) schema.
2. Check whether that recipe's slug (or name) already exists in `crafting.json`.
   - **Not a duplicate:** add an entry to `crafting.json`. Convert the screenshot to `.jpg`
     (quality 90) and rename it to the recipe's slug, and move it into `images/crafting/`.
     Use the same slug for the `image` field in the entry.
   - **Duplicate of an existing recipe:** move the file into `images/duplicates/`, named
     `<slug>-duplicate.jpg` (append `-2`, `-3`, etc. as needed), same as items.

## Header search box

The search box in the header (`#search-box`, wired up in `init()`) searches everything on
the wiki, not just page titles — it also matches against `items.json` (reusing
`itemSearchHaystack`, the same haystack the Item Database's own search box uses) and
`crafting.json` (matching against recipe name + tradeskill). Results are grouped into
Pages/Items/Crafting sections in the sidebar via `renderSearchResults`.

Clicking an item or recipe result needs to land the user on the right spot on a page that
doesn't exist yet (the Item Database or Crafting page haven't rendered). This is done with
two module-level variables, `pendingItemQuery` and `pendingCraftingTradeskill`, set right
before navigating and consumed (and cleared) by `renderItemsPage`/`renderCraftingPage` once
they render — pre-filling the Item Database's own search box, or jumping straight to a
specific tradeskill's recipe list instead of the category grid. If you add another
data-driven page that should be reachable from header search, follow the same pattern
rather than trying to encode extra state into the URL hash (the hash is a plain page-file
lookup elsewhere in the code, so cramming query info into it would break that).

Items/crafting data is pre-fetched in the background during `init()` (via
`ensureItemsData()`/`ensureCraftingData()`, the same helpers `renderItemsPage`/
`renderCraftingPage` use) so header search works immediately, without requiring the user to
have visited those pages first.

## Known CSS gotcha

`.content-inner img` (in `style.css`) sets `display: block` on every image rendered inside
page content, with specificity `(0,1,1)`. A bare class selector like `.some-class` has
specificity `(0,1,0)` and will lose to it silently. If a new img-related style in the
Item Database (or a future feature) doesn't seem to apply, check this first — either raise
specificity (`.content-inner .my-class`) or, more robustly, control visibility via inline
styles set from JS rather than relying on a CSS class toggle.

## Layout width

`.layout`/`.header-inner` cap at 1600px so the site doesn't stretch edge-to-edge on huge
monitors, but still uses most of the screen on normal ones. `.content-inner` is capped at
~820px for prose pages (readable line length), but data-driven pages (Item Database, Maps,
Crafting) get a `content-wide` class toggled from `loadPage()` in `script.js` that removes
the cap — add that class (or extend the same `page.type` check) for any future full-width
page rather than raising the prose cap.

The Item Database table uses `table-layout: fixed` with an explicit `<colgroup>` (percentage
widths, set in `renderItemsPage`) and no `white-space: nowrap`, so long cells (Classes,
Stats) wrap onto multiple lines instead of forcing horizontal scroll. If you add a column,
add a proportional `<col>` for it rather than letting the browser auto-size columns —
auto-sizing is what caused the original horizontal-scroll problem.

## Local preview

There's no Node or Python in this environment's PATH. To preview the site locally, spin up
a throwaway static file server (e.g. a small PowerShell `HttpListener` script) rather than
assuming `python -m http.server` or `npx serve` will work — check first. Don't commit a
`.claude/launch.json` that points at a session-scoped scratchpad path; it won't survive
past the session.

## Git workflow

The user is non-technical and relies on Claude to commit and push. Changes are not pushed
automatically — wait for an explicit request (e.g. "push") before running `git push`.
