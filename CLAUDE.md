# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

A static wiki for the game *Monsters and Memories*, hosted on GitHub Pages. No build
step, no backend, no login system. `index.html` + `style.css` + `script.js` load content
at runtime — either Markdown pages (via marked.js) or the Item Database (via `items.json`).
See `README.md` for the full explanation written for the (non-technical) site owner.

Items and crafting recipes are **displayed** as cards rendered entirely from JSON data —
not screenshots. This changed 2026-07-04 (previously the site showed the user's actual item
screenshot); see "Item and recipe cards" below for the current system. The screenshot itself
is still saved as a `.jpg` for every item/recipe (confirmed by the user 2026-07-04) — it's
just archival/reference material now, not something the site shows anyone.

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
   `["MAGIC", "UNIQUE", "NODROP"]`; use `[]` if there's no tag line. Known tags seen so far
   (all confirmed on real cards): MAGIC, UNIQUE, NODROP (first seen together on the same
   card, "Platinum Badge of the Living City", 2026-07-03), LORE (first seen on "Dagger of
   the Damned", 2026-07-04) — use the same all-caps spelling and order as shown on the card.
3. Bags/satchels/pouches/backpacks use `"type": "Container"` instead of Armor/Weapon/
   Jewelry/Misc, with `capacity` (integer) and `maxSize` (Title Case, same value set as the
   item's own `size` field — Tiny/Small/Medium/Large/Extra Large all seen on real cards, Tiny
   first seen 2026-07-04 on several Blacksmithing components) instead
   of `ac`/`stats`/`damage`. Their `slot` is one of `"Bag"`, `"Belt"`, `"Backpack"`, or
   `"Saddlebag"` (mount-only, `race` will be mount codes like `["HRS", "DNK"]` rather than
   player races/ALL — see below) — distinct from `"Waist"`, which is for actual belt armor,
   not a container-carrying slot. Some containers can go in more than one slot (e.g.
   `"Bag / Belt"`), same `"X / Y"` format used for `"Primary / Secondary"`. A container whose
   card says "Tradeskill Container." (first seen on "Smuggler's Damaged Logbook", 2026-07-04)
   gets `"tradeskillContainer": true` — shown on its card as a "TRADESKILL" badge alongside
   any real tags.
3a. Mount equipment (saddles, saddlebags, rigging) works the same as any other item, just
    with slots the game doesn't use for players — `"Rigging"` for the saddle itself,
    `"Saddlebag"` for its cargo container — and a `race` array of mount codes read straight
    off the card (e.g. `["HRS", "DNK"]`) instead of player classes/ALL. Don't try to map
    these to the player race list; they're a separate namespace on the same field.
4. Still save the screenshot — convert to `.jpg` (quality 90, see "Item screenshot format"
   below) into `images/items/`, filename matching the `image` field. **This is archival
   only:** the site displays a card rendered from the JSON fields, not the screenshot
   itself (see "Item and recipe cards" below), so the saved file is never shown to a
   visitor — it exists purely so the data can be re-verified against the original card
   later if something's ever in doubt. Keep setting `image` on new entries the same way as
   before 2026-07-04.
5. A green line starting with "Enchant" (e.g. "Enchant Boots: Minor Agility +1 AGI", seen on
   "Copper Plate Boots", 2026-07-04) is **not** part of the item's own description or effect
   — it's a temporary buff applied to that specific item by an Enchanter-tradeskill scroll,
   not a fixed property of the base item. Leave it out of `description`/`effect` entirely;
   record the item's other stats as normal (the card's Slot/AC/Weight/Size/Class/Race lines
   describe the base item same as any other card). Revisit only if/when enchantment scrolls
   themselves become their own trackable thing (e.g. Enchanter recipes in `crafting.json`).
6. Food and drink use `"type": "Food"` or `"Drink"` (first added 2026-07-04) — there's no
   on-card tag for either, only the flavor text ("This is a modest meal."/"...modest
   drink."), so that's the signal to use. These cards never show Slot/Class/Race at all
   (they're not equippable), so leave `slot` out entirely, but still set
   `"classes": ["ALL"]`/`"race": ["ALL"]` — matching the existing convention for containers
   (see above), which also never show Class/Race on their cards but are understood to be
   unrestricted rather than actually missing that data. Raw crafting materials/currency
   with no slot concept at all (ore, scraps, wood, coins — e.g. "Copper Ore", "Rawhide
   Scraps") are the one case that *does* omit `classes`/`race` entirely (`"type": "Misc"`,
   just `weight`/`size` and a `description` if the card has flavor text) — there's no
   equivalent "always unrestricted" convention for them since they're never worn or
   consumed by a class/race at all. The Item Database table and item cards already handle
   items with no `slot`/`classes`/`race` gracefully (blank Slot field, no Class/Race
   section on the card) — no code changes needed when adding more of either kind.

Filters (type/slot/class/race/tags/max size) and search are all derived from `items.json`
at runtime — no other file needs to change when items are added, including when a new tag,
slot, or max-size value shows up for the first time (those dropdowns are populated from
whatever values exist in the data).

## Item screenshot format

Item/recipe screenshots (`images/items/`, `images/crafting/`) are stored as `.jpg` at
quality 90, not `.png` — this hasn't changed with the
2026-07-04 switch to rendered cards, only *why* they're saved has (reference material for
re-verifying data later, not something displayed on the site — see "Item and recipe
cards" below). The popup card screenshots are mostly flat text over a noisy stone texture,
which PNG compresses poorly (~350KB/file) — JPEG at q90 gets the same image down to ~65KB
with no visible loss of text legibility, tested by comparing re-encoded crops against the
originals. When moving a screenshot out of the inbox, convert it to `.jpg` (quality 90) as
part of the move rather than keeping the original `.png`/other format.

**Map** images are the opposite: keep them as high-quality `.png`, uncompressed — they're
viewed zoomed-in in the map viewer (see below) where JPEG artifacts would actually be
visible, and they're few enough in number that file size isn't a concern. Do not apply any
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
- The recipe's own `name` (the crafted result) gets the same treatment inside
  `renderRecipeCardHTML` — if an item with that exact name exists in `items.json`, the
  recipe name itself becomes a clickable link to it (this already connects several existing
  recipes to items added in earlier batches, e.g. "Rawhide Belt"/"Rawhide Boots"/"Rawhide
  Backpack").
  Clicking either kind of link (component or result) sets `pendingReturnToRecipe` before
  navigating to the Item Database, which shows a "&larr; Back to \<recipe name\>" link at the
  top of that page — see "Header search box" above for the same
  pending-variable-consumed-on-render pattern.
- `difficultyColor` / `difficultyText` — the recipe's trivial/skill-up status, shown as
  colored text on the card. The full color → message mapping is now confirmed exact wording
  for all seven colors, straight from real cards: Green "This recipe is trivial to you.",
  Light Blue "Your skills make this a simple task." (confirmed 2026-07-04), Dark Blue "Your
  skills make this a moderate task.", White "Your skills make this a complex task." (confirmed
  2026-07-04), Yellow "Your skills make this a daunting task.", Orange "Your skills make this
  a herculean task.", Red "You will require all your skills to craft this." Match
  the card's exact wording to a color from this list; if it doesn't match any of these, flag
  it to the user rather than guessing a new one. **Still record these fields on every recipe
  (from a recipe card or a crafting-window screenshot) even though the site no longer
  displays them** (removed 2026-07-03, see below) — they're the raw data the skill estimates
  in `crafting-skill-estimates.md` are calculated from.
- **A recipe card can arrive well after the fact and disagree with the most recent
  crafting-window capture — that's expected, not an error.** E.g. a batch of individual
  Leatherworking recipe cards processed 2026-07-03 showed Red/Yellow/Dark Blue for several
  recipes that the *latest* window recapture had already shown as Green at a higher skill —
  the cards matched the *original* skill-22 session's colors exactly, meaning they were just
  screenshots taken back then and uploaded later. When this happens: keep the freshest
  `difficultyColor`/`observedAtSkill` (don't let an older card overwrite a newer window
  reading), but still merge in whatever the card newly reveals (`image`, `weight`, `size`,
  `components`) since that's timeless information about the recipe, not a skill snapshot. If
  it's unclear whether a card is old or current, say so rather than guessing.
- `observedAtSkill` — the user's skill in that tradeskill at the time the screenshot was
  taken (ask them, since it's not shown on the card itself). This isn't a property of the
  recipe — it's a data point for figuring out the recipe's own underlying skill level, since
  MnM's exact trivial-skill formula isn't publicly documented anywhere (unlike EverQuest,
  which this game is inspired by but doesn't necessarily share numbers with).
- `recipeSkillLevel` — the recipe's own exact underlying skill requirement, when it can be
  determined precisely. **Retracted (2026-07-04): the "a White recipe means the recipe's
  skill level exactly equals the crafter's current skill" rule from 2026-07-03 is wrong.**
  The user caught the flaw themselves: if that were true, White would always be the lowest
  possible color for a crafter with 0 skill (nothing can be "easier than 0"), but Green/Dark
  Blue/Light Blue recipes are observed even at 0 skill — meaning White never pinned down an
  exact value at all. Every `recipeSkillLevel` value previously written under this rule has
  been removed from `crafting.json` (they were all `White` observations, so all of them were
  affected). **Leave `recipeSkillLevel` unset for every recipe until a real confirmed method
  is found** — don't write a number into this field on a hunch, and don't assume White has
  any special exactness the other colors don't. Colors above White (Yellow/Orange/Red) still
  mean the recipe is harder than the crafter's current skill, and colors below White (Dark
  Blue/Light Blue/Green) still mean it's easier — that relative ordering isn't in question,
  only the idea that White marks an exact single point rather than another band like the
  rest. Keep recording `difficultyColor`/`observedAtSkill` data points as always; see
  `crafting-skill-estimates.md` (also corrected 2026-07-04) for the speculative-estimate
  side of this.

  **One narrow exception that *is* safe to set exactly (confirmed 2026-07-04):** a recipe
  observed as **Green ("trivial") at `observedAtSkill: 0`** must have `recipeSkillLevel: 0`.
  This isn't a claim about what Green means in general — it's just that a skill requirement
  can't be negative, and Green means the crafter's skill *far exceeds* the requirement. At 0
  skill, the only way to "far exceed" something is if that something is also 0. The user
  confirmed the color scale is a continuous gradient tied to the gap between crafter skill
  and requirement (e.g. a skill-50 recipe would show Red at 0 skill, not White) — so this
  logic does **not** extend to White/Dark Blue/Light Blue at skill 0 the way the retracted
  rule assumed; those colors just suggest a low requirement, they don't prove one exactly.
  Only Green-at-0 is airtight enough to write into `recipeSkillLevel`.
- `listOrder` — an integer giving the recipe's position in the game's own crafting-window
  list (1 = first/lowest skill requirement). This is what the Crafting page actually sorts
  by now instead of alphabetically — see the "Crafting window screenshots" workflow below
  for how it's derived and kept as one unbroken sequence per tradeskill.

**The colored difficulty badge itself was removed from the Crafting page on 2026-07-03**
(the user's call — a color is only accurate for whichever one user's skill it was captured
at, so displaying it as if it were a fixed property of the recipe was misleading to anyone
else, or to the same user later once their skill changes). `difficultyColor`/`difficultyText`/
`observedAtSkill`/`recipeSkillLevel` still get recorded on every recipe as before — see the
bullets above — they're just not rendered anywhere on the site anymore. In the same request,
the user asked to keep trying to guess/calculate each recipe's real numeric skill
requirement "in the background." That speculative work lives entirely in
`crafting-skill-estimates.md` at the repo root (not linked from the site, not loaded by any
code) — read it before adding new estimates, and update it (not `crafting.json`) whenever
new observations come in, especially a recapture at a different skill level, since that's
what actually sharpens the estimate. Never write a guessed (or, per the 2026-07-04
retraction above, even a seemingly-"confirmed" White) number into `crafting.json`'s
`recipeSkillLevel` — leave it unset until a real confirmed method exists. If the difficulty
badge ever comes back (e.g. a "type in your
skill" personalized calculator, which the accumulating estimates would make possible), the
CSS for it is still in `style.css` (`.badge-difficulty*`) even though nothing references it
right now.

1. Add an object to `crafting.json` with at least `name`, `slug`, `tradeskill`, plus whatever
   of the above the card shows.
2. Still save the screenshot — same as items (see above), convert to `.jpg` (quality 90)
   into `images/crafting/`, filename matching the `image` field. Archival only, per "Item
   and recipe cards" below — not something the site ever displays.

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
   card), a **recipe** (a single crafting card, same popup style as an item but with a
   "Components:" list), or a **crafting window** (the in-game tradeskill window listing
   many known recipes at once, e.g. titled "Leatherworking" with a skill number at the
   bottom) — then follow the matching path below.
3. Once a file has been moved out (to `images/items/`, `images/Maps/`, `images/crafting/`)
   or deleted as a duplicate, `images/inbox/` should no longer contain it — an empty inbox
   means everything is processed.

**Duplicates (items/maps/recipes alike, confirmed 2026-07-04):** if a screenshot's item/map/
recipe already exists (matched by slug or name), just delete it from the inbox — don't save
it anywhere. There's no more `images/duplicates/` folder; the user decided that archive
wasn't worth keeping. The one exception: if the new screenshot reveals something the
existing entry is missing or gets wrong (a stat that was cut off before, a corrected
number), still update `items.json`/`maps.json`/`crafting.json` with that new information
before deleting the screenshot — the user's newest screenshot always wins (see "The user's
screenshots are the source of truth" above).

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
   - **Duplicate of an existing item:** delete the screenshot from the inbox (see
     "Duplicates" above) — update `items.json` first if the new screenshot fills a gap.

**Maps:**

1. Extract the map's name.
2. Check whether that map's slug (or name) already exists in `maps.json`.
   - **Not a duplicate:** add an entry to `maps.json`. Rename the file to the map's slug
     and move it into `images/Maps/`, matching the `image` field.
   - **Duplicate of an existing map:** delete the file from the inbox (see "Duplicates"
     above).

**Recipes:**

1. Extract the recipe's name and which tradeskill it belongs to (must match a name in
   `tradeskills.json` — if the card names a tradeskill not in that list, flag it to the user
   rather than inventing a new category). See "Adding a crafting recipe" above for the
   current schema.
2. Check whether that recipe's slug (or name) already exists in `crafting.json`.
   - **Not a duplicate:** add an entry to `crafting.json`. Convert the screenshot to `.jpg`
     (quality 90) and rename it to the recipe's slug, and move it into `images/crafting/`.
     Use the same slug for the `image` field in the entry.
   - **Duplicate of an existing recipe:** delete the screenshot from the inbox (see
     "Duplicates" above) — unless the new screenshot is the first *full card* for a recipe
     that previously only had a minimal crafting-window entry (no `image`/`weight`/
     `components` yet), in which case it's not really a duplicate — treat it like "not a
     duplicate" above and fill in the fuller entry instead.

**Crafting window screenshots** (a different thing from a recipe card — this is the
in-game tradeskill window listing every known recipe for one tradeskill, name-only with a
color per recipe, e.g. "Leatherworking 22 / 300" at the bottom): these are a reference
source, not a recipe card, and don't get saved anywhere — process them and delete them from
the inbox, don't move them into `images/crafting/`.

1. The window's title bar names the tradeskill directly (more reliable than guessing from
   item names, unlike the individual Rawhide Canvas/Strap cards which didn't state one).
   The "X / 300" line at the bottom is the user's current skill in that tradeskill —
   capture it as `observedAtSkill` on every recipe pulled from this screenshot. **If that
   line is missing from the screenshot** (confirmed by the user, 2026-07-04 — e.g. a window
   screenshot that only shows the "Fletching" title with no "X / 300" line below it),
   assume `observedAtSkill: 0` rather than leaving it unset or asking.
2. For each recipe name+color in the list: if it already exists in `crafting.json` (e.g. a
   recipe that already has a full card), leave its card-derived fields alone (`image`,
   `weight`, `size`, `components`, `difficultyText`) — this window is a secondary,
   lower-detail source and shouldn't overwrite data from an actual card. If it's new, add a
   minimal entry: `name`, `slug`, `tradeskill`, `difficultyColor`, `observedAtSkill` — no
   `image`/`weight`/`components` yet, since the window doesn't show those (they fill in
   later if/when a full card for that recipe comes in).
3. `listOrder` — the recipe's position in the crafting window's list, counting from the very
   top of the whole scrollable list (not just the top of one screenshot). **The Crafting page
   sorts recipes by this field, ascending, instead of alphabetically** (`renderCraftingRecipes`
   in `script.js`) — the user confirmed 2026-07-03 that the game's own list order is already
   sorted by real skill requirement, low to high, so this position doubles as a difficulty
   ranking without needing the (unreliable) color-based guessing in
   `crafting-skill-estimates.md`. Capture/update `listOrder` on *every* recipe seen in the
   window, including ones that already have a full card (unlike `difficultyColor` above, this
   field isn't something a real recipe card ever shows, so there's no "actual card" data to
   protect from being overwritten). If a screenshot batch only covers a portion of the full
   list (scrolled to show 8 rows at a time, say), reconstruct the true list-wide position by
   matching up rows that repeat between adjacent screenshots (same name *and* same color in
   both) rather than assuming each screenshot starts a fresh count — a full recapture of a
   tradeskill's list should end with `listOrder` values forming one unbroken 1..N sequence
   with no gaps or repeats. If the screenshots don't overlap enough to confirm the exact
   join between two batches, the color trend at the boundary (colors should move steadily
   from Green at the low end toward Red at the high end, never jump back and forth) is
   usually enough to infer the join — but say so and flag the uncertainty to the user rather
   than presenting a guessed join as confirmed fact.
4. Match the recipe's difficulty color to the mapping in "Adding a crafting recipe" above.
   If a color looks ambiguous (e.g. telling Light Blue from Dark Blue apart is genuinely
   hard from a screenshot), say so and record the generic color rather than guessing which
   shade — don't silently pick one.
5. Delete the screenshot(s) from `images/inbox/` once processed — they don't get moved
   anywhere, since nothing about them (aside from the extracted data) belongs on the wiki.

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

## Item and recipe cards

**As of 2026-07-04, items and recipes are *displayed* as cards rendered entirely from JSON
data — not screenshots.** The user compared the site to mnmquest.com's item popups, liked
that approach better, and asked for an original (not copied) equivalent built from
`items.json`/`crafting.json` instead of the game screenshot. This replaced the old system
where the site displayed the user's actual screenshot on hover/click.

**The screenshot itself is still saved as a `.jpg`, same as always** (confirmed by the user
2026-07-04, right after this change) — it's just no longer shown to visitors. Think of it as
moving from "the screenshot is the display" to "the screenshot is the receipt": still filed
in `images/items/`/`images/crafting/`, still referenced by the entry's `image` field, still
useful if a stat's ever in doubt and needs re-checking against the original card — just not
rendered anywhere on the page anymore. Follow "Item screenshot format" above and the inbox
workflow's Items/Recipes sections as before; nothing about *saving* screenshots changed,
only *displaying* them.

Why swapping the display to a rendered card is a strict improvement, not just a reskin: the
screenshot was always a secondary preview, never the source of truth for what's shown (the
JSON already had every fact needed for the table, filters, and search) — so drawing a card
from that same JSON instead of showing a picture loses nothing on the display side, while
the saved screenshot keeps the verification value. It also eliminates a whole category of
*display* problems this file used to carry workarounds for: the two-screenshot-merge dance
for an oversized card, and the item-image-vs-recipe-image proxy rule (a recipe's result
with no item-card screenshot yet had to borrow the recipe card's picture as a stand-in just
to have something to show) — a card never needs to scroll or borrow another entry's picture,
since its layout just wraps to fit whatever fields exist. Cut-off/truncated screenshot text
is now purely a data-completeness question (did the missing text make it into the JSON?),
not a display problem — see `images/items-needing-text.txt`, which tracks exactly that.

**The renderer:** `renderItemCardHTML(item)` (items) and `renderRecipeCardHTML(recipe)`
(recipes) in `script.js` build the card's HTML from scratch each time it's shown — header
(a type icon, the name, tag/tradeskill badges), a field grid (Slot/AC/Weight/
Size/etc., or Weight/Size for recipes), a row of stat chips (STR/AC bonuses, resists,
haste — via the shared `statEntries(item)` helper, also used by the table's plain-text
`formatStats()`), a Class/Race line, description/effect text, and — items only — a
"Found at" line (see below). Recipes additionally list Components, each one a link to the
Item Database when a matching item exists (same `findItemByName` dynamic-linking pattern
as before, unchanged).

**Item card icon (2026-07-04):** the header icon square used to just show a letter for the
item's `type` (A/W/J/etc.); it's now an original outline icon (`ICON_DEFS` in `script.js`)
picked by a more specific sub-type, entirely derived from fields items already have — no new
schema field to keep in sync:
- **Weapon** — `weaponIconKey(item)` reads `skill` + `twoHanded` + a name-keyword check
  (`axe`/`scythe`/`hammer`/`dagger`) to pick one of: sword, 2H sword, dagger, axe, 2H axe
  (greataxe — single-bladed, not double, per the reference sheet the user provided
  2026-07-04), mace, hammer (distinct from mace — also from that sheet), maul (2H blunt),
  spear, scythe, bow, throwing. Falls back to a plain sword if nothing matches.
- **Armor** — `armorIconKey(item)` checks the name for "Plate"/"Chain"/"Rawhide"/"Hide"/
  "Leather"/"Cloth" to pick a material icon; `slot === "Secondary"` or a name containing
  "Shield"/"Buckler" gets the Shield icon instead (shields are their own category, not a
  material tier). Anything that matches no keyword (most unique-named items) falls back to
  a plain armor icon rather than guessing a material wrong.
- **Jewelry** — `jewelryIconKey(item)` picks Ring/Earring/Necklace from the existing `slot`
  field (Finger/Ear/Neck).
- **Food / Drink / Container** — one fixed icon each.
- **Misc (crafting materials)** — `craftingIconKeys(item)` looks up every tradeskill the
  item is linked to in `crafting.json` (its own recipe's tradeskill, plus any tradeskill
  that uses it as a component elsewhere) and shows one icon per tradeskill, left to right.
  `TRADESKILL_ICON` only needs an entry for tradeskills that actually have a linked
  material right now (Blacksmithing, Tailoring) — same extend-as-it-comes-up pattern as
  tags/sizes elsewhere in this file. A material with no recipe link at all (most raw gems/
  bars before their recipe exists) gets a generic raw-material icon.
Recipe cards' own header icon (`item-card-icon-recipe`) uses the same `TRADESKILL_ICON`
lookup keyed by the recipe's tradeskill, falling back to the tradeskill's initial letter for
any tradeskill without a dedicated icon yet.

**Category label (2026-07-05):** a small muted line under the item's name on its card shows
the same sub-type in words (e.g. "Greataxe", "Plate Armor", "Blacksmithing Material") —
`itemCategoryLabel(item)` in `script.js` reuses the exact same `itemIconKeys(item)` the icon
itself is built from (via a shared `ICON_LABELS` lookup), so the icon and the text label can
never disagree with each other. Items only — recipe cards don't get this, since their
tradeskill is already shown as a badge.

The icon set went through several rounds with the user before landing (solid silhouettes →
outline strokes → shape corrections against a reference sheet the user provided showing the
game's actual equipment icons). The user was still not fully happy with the outline style as
of 2026-07-04 and said they'd bring a different reference later for another pass — treat the
current `ICON_DEFS` as a placeholder implementation, not a settled final design, if asked to
touch this area again.

**Item cards use the gold `--accent`; recipe cards use the teal `--accent-craft`, with the
recipe's own name colored teal and its tradeskill shown as a badge where an item card would
show its tags.** This was a deliberate, explicit request from the user ("make a small
adjustment to the recipes so they are not confused with items") — keep this color split
if you touch either card type, since it's the only thing keeping the two visually distinct
given they otherwise share the exact same card structure (`.item-card` base class, with
`item-card-recipe`/`item-card-icon-recipe`/`item-card-name-recipe`/`badge-tag-craft`
modifiers for the recipe variant).

**Where cards appear:**
- Hovering any `.item-name-hover` element (an Item Database row, a linked recipe name, or a
  linked recipe component) shows the matched item's card in a floating tooltip
  (`#item-tooltip`, positioned by `setupItemTooltip` — same flip-above-if-no-room-below
  logic as before, just rendering a card's `innerHTML` instead of setting an `<img src>`).
  The lookup is always by name (`data-alt` + `findItemByName`) — nothing caches an image
  path anymore, so this always reflects the current data.
- Clicking an item's name in the Item Database opens `#item-viewer`, a modal built by
  `openItemViewer`/`setupItemViewer`, showing the same card at a larger size plus the
  "Crafted via" / "Used to craft" section (two reverse lookups against `crafting.json`,
  `findRecipeForItem`/`findRecipesUsingItem`, unchanged from before). Since a rendered card
  can't be taller than its content, the modal doesn't need the old scroll-within-a-fixed-
  height trick — `#item-viewer-panel` just caps at `max-height: 88vh` with a plain
  `overflow-y: auto` as a safety net. The close button lives on the overlay itself (like
  the Maps viewer's), since the card has no separate header bar to anchor it to anymore.
- Every recipe on the Crafting page renders as its own card directly in the page (no
  hover/click needed to see a recipe's own weight/size/components — they're always visible
  in the grid, see `renderCraftingRecipes`).

**`item.foundAt`** is an optional free-text string ("Dropped by \<mob name\>", "Quest
reward: \<quest name\>") shown as a "Found at" line on every item card — present or not, the
line always renders (as "not yet known" when absent), by design, so the field's existence
is visible and the layout doesn't shift once it's filled in. No item has this populated yet;
add it directly to the relevant `items.json` entry when that data starts coming in, no code
changes needed. Revisit this as a structured field (e.g. with a link) only if/when enough
data comes in to warrant it, same as every other schema field in this file.

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
