# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

A static wiki for the game *Monsters and Memories*, hosted on GitHub Pages. No build
step, no backend, no login system. `index.html` + `style.css` + `script.js` load content
at runtime — either Markdown pages (via marked.js) or the Item Database (via `items.json`).
See `README.md` for the full explanation written for the (non-technical) site owner.

Items and crafting recipes are **displayed** as cards rendered entirely from JSON data —
not screenshots (see "Item and recipe cards" below). The screenshot itself is still saved
as a `.jpg` for every item/recipe — archival/reference material, not something the site
shows anyone.

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

## The To-Do folder

`To-Do/` (repo root) is where every gap-tracking / prediction / "things to look for in game"
list lives — content aimed at the user and future Claude sessions, never linked from the site
and never loaded by any code (`script.js` doesn't fetch anything from this folder).

- `To-Do/items-needing-text.txt` — items.json entries with missing/incomplete data (not
  screenshot-cropping issues — see the file's own header). Referenced from "Adding an item
  to the Item Database" below and occasionally from a monster's own `rumor` text.
- `To-Do/crafting-skill-estimates.md` — speculative numeric skill-requirement guesses for
  crafting recipes, kept separate from `crafting.json`'s real `recipeSkillLevel` field
  (never write a guess into that field — see "Adding a crafting recipe" below).
- `To-Do/crafting-recipes-missing-components.txt` — crafting.json recipes with no (or a
  partial) `components` list yet.
- `To-Do/predicted-missing-items.txt` — items inferred to probably exist from a naming/slot
  pattern already seen elsewhere in items.json (e.g. a material tier that's missing a piece
  every sibling tier has), not from any screenshot. Revisited most recently 2026-07-15 after
  a large vendor-screenshot batch confirmed several predicted tiers directly.

**Any future list of this kind — missing data, predicted-but-unconfirmed items, anything
framed as "watch for this in game" — goes in `To-Do/` too**, not loose at the repo root or
tucked into `images/`. Update an existing file in place when it already covers the topic
rather than creating a near-duplicate; only start a new file for a genuinely distinct kind of
gap.

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
   `stats`. A resist can be negative (e.g. "SV Corruption: -5") — store it as a negative
   number (`{"CORRUPTION": -5}`); `statEntries`/`formatSigned` in `script.js` render the sign
   correctly either way. A "Haste: +6%" line goes in its own top-level `haste` field (e.g.
   `"haste": 6`), not in `stats` or `resists` — it's a percentage, not a flat bonus. `race`
   is an array (usually `["ALL"]`) — set it to the specific races listed on the card if it
   isn't ALL. If a card is missing its Race line entirely where every other card in the
   batch had one, that's more likely a cropped screenshot than a real absence — leave `race`
   unset and flag it in `To-Do/items-needing-text.txt` rather than guessing `["ALL"]`.
2. Check the card for a tag line directly below the item name and above "Slot:" — e.g.
   "MAGIC". Capture every such tag (not just MAGIC) in a `tags` array, e.g. `["MAGIC"]` or
   `["MAGIC", "UNIQUE", "NODROP"]`; use `[]` if there's no tag line. Known tags seen so far
   (all confirmed on real cards): MAGIC, UNIQUE, NODROP, LORE — use the same all-caps
   spelling and order as shown on the card.
3. Bags/satchels/pouches/backpacks use `"type": "Container"` instead of Armor/Weapon/
   Jewelry/Misc, with `capacity` (integer) and `maxSize` (Title Case, same value set as the
   item's own `size` field — Tiny/Small/Medium/Large/Extra Large all seen on real cards)
   instead of `ac`/`stats`/`damage`. Their `slot` is one of `"Bag"`, `"Belt"`, `"Backpack"`,
   or `"Saddlebag"` (mount-only, `race` will be mount codes like `["HRS", "DNK"]` rather than
   player races/ALL — see below) — distinct from `"Waist"`, which is for actual belt armor,
   not a container-carrying slot. Some containers can go in more than one slot (e.g.
   `"Bag / Belt"`), same `"X / Y"` format used for `"Primary / Secondary"`. A container whose
   card says "Tradeskill Container." gets `"tradeskillContainer": true` — shown on its card
   as a "TRADESKILL" badge alongside any real tags.
3a. Mount equipment (saddles, saddlebags, rigging) works the same as any other item, just
    with slots the game doesn't use for players — `"Rigging"` for the saddle itself,
    `"Saddlebag"` for its cargo container — and a `race` array of mount codes read straight
    off the card (e.g. `["HRS", "DNK"]`) instead of player classes/ALL. Don't try to map
    these to the player race list; they're a separate namespace on the same field.
4. Still save the screenshot — convert to `.jpg` (quality 90, see "Item screenshot format"
   below) into `images/items/`, filename matching the `image` field. **This is archival
   only:** the site displays a card rendered from the JSON fields, not the screenshot
   itself, so the saved file is never shown to a visitor — it exists purely so the data can
   be re-verified against the original card later if something's ever in doubt.
5. A green line starting with "Enchant" (e.g. "Enchant Boots: Minor Agility +1 AGI") is
   **not** part of the item's own description or effect — it's a temporary buff applied to
   that specific item by an Enchanter-tradeskill scroll, not a fixed property of the base
   item. Leave it out of `description`/`effect` entirely; record the item's other stats as
   normal. Revisit only if/when enchantment scrolls themselves become their own trackable
   thing (e.g. Enchanter recipes in `crafting.json`).
6. Food and drink use `"type": "Food"` or `"Drink"` — there's no on-card tag for either, only
   the flavor text ("This is a modest meal."/"...modest drink."), so that's the signal to
   use. These cards never show Slot/Class/Race at all (they're not equippable), so leave
   `slot` out entirely, but still set `"classes": ["ALL"]`/`"race": ["ALL"]` — matching the
   existing convention for containers (see above), which also never show Class/Race on
   their cards but are understood to be unrestricted rather than actually missing that data.
   Raw crafting materials/currency with no slot concept at all (ore, scraps, wood, coins —
   e.g. "Copper Ore", "Rawhide Scraps") are the one case that *does* omit `classes`/`race`
   entirely (`"type": "Misc"`, just `weight`/`size` and a `description` if the card has
   flavor text) — there's no equivalent "always unrestricted" convention for them since
   they're never worn or consumed by a class/race at all. The Item Database table and item
   cards already handle items with no `slot`/`classes`/`race` gracefully (blank Slot field,
   no Class/Race section on the card) — no code changes needed when adding more of either kind.

Filters (slot/class/race/tags/max size) and search are all derived from `items.json` at
runtime — no other file needs to change when items are added, including when a new tag,
slot, or max-size value shows up for the first time (those dropdowns are populated from
whatever values exist in the data).

**Item Database browsing:** the page opens on a category grid, one card per `item.type`
(Weapon/Armor/Jewelry/Container/Food/Drink/Misc) with its item count — `renderItemsCategories`
in `script.js`, same pattern as the Crafting page's tradeskill grid. A filter row (Slot/
Class/Race/Tag/Max Size/a "Show only items that need info" toggle — see `needsInfo` note
under "Item and recipe cards" below — computed from all of `items.json`) sits above the
category grid. Picking a filter jumps straight to a filtered, unscoped "All Items" list
(`renderItemsList(container, null)` — the one case that shows a "Type" column, since there's
no single category to imply it from). Clicking a category card instead carries the grid's
*current* filter values into that category's own scoped list (`pendingItemFilters`,
consume-once-on-render, same pattern as `pendingItemQuery`) — this carry-over is one hop
only (grid → the category you land in), it doesn't follow you again if you then switch to a
different category from inside a scoped list.

Every category (including Armor) goes straight from its card to `renderItemsList`, scoped to
just that type, with slot/class/race/tag/max-size dropdowns scoped to just that category's
items. Armor additionally gets a "Material" dropdown (Cloth/Leather/Chain/Plate/Other,
derived from `armorIconKey`/`ARMOR_MATERIAL_ORDER`/`ARMOR_MATERIAL_LABELS`) — same
conditional-dropdown pattern the Weapon category's handedness dropdown uses. (Armor used to
force a two-level material→slot card drill-down before reaching this table; removed
2026-07-15 since a dropdown does the same job in one click.) The header search box (global,
searches everything regardless of category) still works the same — clicking an item result
calls `goToItem`, which sets `pendingItemCategory` (alongside `pendingItemQuery`) so the Item
Database opens directly on that item's category list with the search box pre-filled. Recipe
component/result links into the Item Database go through the same `goToItem` path.

## Item screenshot format

Item/recipe screenshots (`images/items/`, `images/crafting/`) are stored as `.jpg` at
quality 90, not `.png` — reference material for re-verifying data later, not something
displayed on the site (see "Item and recipe cards" below). The popup card screenshots are
mostly flat text over a noisy stone texture, which PNG compresses poorly (~350KB/file); JPEG
at q90 gets the same image down to ~65KB with no visible loss of text legibility. When
moving a screenshot out of the inbox, convert it to `.jpg` (quality 90) as part of the move
rather than keeping the original `.png`/other format.

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
   "Vale of Zintar"). If two source files are different renderings of the same place (e.g. a
   top-down layout vs. an isometric render), keep both as separate entries and disambiguate
   the names, e.g. `"Infested Crypt"` / `"Infested Crypt (Isometric)"`.
2. Drop the full-size map image in `images/Maps/`, filename matching the `image` field.
   Keep whatever format it already arrived in — don't force it to PNG or re-encode it.
3. Generate the thumbnail into `images/Maps/thumbs/` — there's no Node/Python/ImageMagick
   in this environment, so use PowerShell + `System.Drawing` (`Add-Type -AssemblyName
   System.Drawing`) to resize to ~480px wide and save as JPEG quality ~80-85. This gets a
   ~40MB map down to well under 100KB with no visible loss at thumbnail size.

**Multiple maps of the same area are grouped automatically — no extra field needed.**
`groupMapsByArea` in `script.js` strips a trailing `" (...)"` from each map's `name` to get
its shared base (e.g. `"Infested Crypt"` from both `"Infested Crypt"` and `"Infested Crypt
(Isometric)"`), so this falls directly out of the disambiguated-naming convention in step 1
above — nothing to set explicitly when adding the second-or-later entry for an area. The
grid shows one card per group: the *first* entry added (maps.json order, not alphabetical)
as the thumbnail, with any others listed as small text links underneath (labeled with just
their parenthetical, e.g. "Isometric") that jump straight to that variant in the viewer.
Inside the viewer, prev/next buttons (and left/right arrow keys) step through every map in
the group — they only render when the group has more than one map, so a plain single-map
area shows no navigation arrows at all.

## Adding a crafting recipe

The Crafting page (`pages.json` entry with `"type": "crafting"`) shows a grid of tradeskill
categories (from `tradeskills.json` — a fixed list, edit it directly to rename/add/remove a
tradeskill); clicking one shows that tradeskill's recipes from `crafting.json` (see
`renderCraftingPage`, `renderCraftingCategories`, `renderCraftingRecipes` in `script.js`).
Each tradeskill has a `status` of `"live"` or `"planned"` — planned ones show a "Planned"
badge and an explanatory message instead of a recipe list, since they exist in the game's
design but aren't usable yet.

The recipe schema in `crafting.json` grows as real recipe cards come in (same pattern as the
item schema growing tags/race/description/effect from real cards) — keep extending it the
same way as new fields show up on future cards, rather than guessing ahead:

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
  recipe name itself becomes a clickable link to it. Clicking either kind of link
  (component or result) sets `pendingReturnToRecipe` before navigating to the Item Database,
  which shows a "&larr; Back to \<recipe name\>" link at the top of that page — see "Header
  search box" below for the same pending-variable-consumed-on-render pattern.
- `difficultyColor` / `difficultyText` — the recipe's trivial/skill-up status. The full
  color → message mapping is confirmed exact wording for all seven colors, straight from
  real cards: Green "This recipe is trivial to you.", Light Blue "Your skills make this a
  simple task.", Dark Blue "Your skills make this a moderate task.", White "Your skills make
  this a complex task.", Yellow "Your skills make this a daunting task.", Orange "Your
  skills make this a herculean task.", Red "You will require all your skills to craft
  this." Match the card's exact wording to a color from this list; if it doesn't match any
  of these, flag it to the user rather than guessing a new one. **Still record these fields
  on every recipe (from a recipe card or a crafting-window screenshot) even though the site
  no longer displays them** (the colored badge was removed from the Crafting page — a color
  is only accurate for whichever one user's skill it was captured at, so showing it as a
  fixed property of the recipe was misleading) — they're the raw data the skill estimates in
  `To-Do/crafting-skill-estimates.md` are calculated from. That file is not linked from the
  site and not loaded by any code; read it before adding new estimates, and update it (never
  `crafting.json`'s `recipeSkillLevel`) whenever new observations come in.
- **A recipe card can arrive well after the fact and disagree with the most recent
  crafting-window capture — that's expected, not an error** (a screenshot can be taken long
  before it's uploaded). When this happens: keep the freshest `difficultyColor`/
  `observedAtSkill` (don't let an older card overwrite a newer window reading), but still
  merge in whatever the card newly reveals (`image`, `weight`, `size`, `components`) since
  that's timeless information about the recipe, not a skill snapshot. If it's unclear
  whether a card is old or current, say so rather than guessing.
- `observedAtSkill` — the user's skill in that tradeskill at the time the screenshot was
  taken (ask them, since it's not shown on the card itself). This isn't a property of the
  recipe — it's a data point for figuring out the recipe's own underlying skill level, since
  MnM's exact trivial-skill formula isn't publicly documented anywhere.
- `recipeSkillLevel` — the recipe's own exact underlying skill requirement, when it can be
  determined precisely. **Never derive this from a `difficultyColor` observation** — an
  earlier attempt to treat "White" as meaning "recipe skill exactly equals crafter's current
  skill" was tried and found wrong (Green/Dark Blue/Light Blue recipes are observed even at
  0 skill, which couldn't happen if White were the lowest possible color at 0 skill) and was
  fully retracted; every value written under that rule was removed from `crafting.json`. The
  color scale is a continuous gradient tied to the *gap* between crafter skill and the
  recipe's requirement (Green ↔ far easier, Red ↔ far harder) — colors tell you relative
  ordering only, never an exact point. **The one narrow exception:** a recipe observed as
  **Green at `observedAtSkill: 0`** can safely get `recipeSkillLevel: 0`, since skill can't
  be negative and Green means "far exceeds the requirement" — the only way to far-exceed
  something from a floor of 0 is if that something is also 0.
  **This caution is about color-based guessing specifically — it does not apply to an
  actual stated "Trivial" number.** "Trivial" *is* `recipeSkillLevel` by definition (the
  skill at which a recipe stops giving skill-ups), not a guess derived from it. Whenever a
  source states a concrete Trivial number (a recipe card, or a reference table like the ones
  used for Tanning/Leatherworking/Blacksmithing), write it straight into `recipeSkillLevel`.
  A vague Trivial value (`"?"`, or a `"90+"`/`"120+"` floor-only value) still doesn't count —
  only write in an exact stated number.
- `listOrder` — an integer giving the recipe's position in the game's own crafting-window
  list (1 = first/lowest skill requirement) — see the "Crafting window screenshots" workflow
  below for how it's derived and kept as one unbroken sequence per tradeskill.
- **Skill-required sort fills gaps with a stated estimate.** The recipe grid sorts by a
  recipe's real skill requirement, not just `listOrder` — `estimateRecipeSkill()` in
  `script.js` (computed at render time, cached per tradeskill, never written back into this
  file) resolves each recipe to a confirmed `recipeSkillLevel` where one exists, or failing
  that, linearly interpolates from the tradeskill's own "anchors" — recipes that have *both*
  `listOrder` and a confirmed `recipeSkillLevel` — surrounding that recipe's `listOrder`
  position. A recipe past the last anchor (or before the first) flat-extends from the
  nearest one rather than extrapolating a slope. Recipes with no `listOrder` at all, or
  belonging to a tradeskill with zero anchors (Jewelcrafting/Fletching/Tailoring have 100%
  `listOrder` coverage but 0% `recipeSkillLevel` — nothing to anchor an estimate to), get no
  fabricated number and keep the old `listOrder`-then-alphabetical fallback. `renderRecipeCardHTML`
  shows the result as a "Skill" field: a plain number when confirmed, or `~N (estimated)`
  when interpolated, so an estimate is never presented as fact. This is purely a display/
  sort computation on top of `recipeSkillLevel` — it never writes into that field, matching
  the same never-store-a-computed-value precedent as an item's damage/delay ratio.
- `resultQuantity` — set only when a recipe produces more than one of its named result (e.g.
  Tanning, where a single pelt processes into "24x Rawhide Scraps") — shown on the card as a
  "Yields" field. Every recipe without this field is still assumed to produce exactly one of
  `name`.
- `effect` / `description` — free-text flavor for the crafted result itself (needed for
  Alchemy potions/serums/tinctures, which have real use-effects the way an item does). Same
  convention as the matching fields on an item: `effect` for the mechanical "On Click. Any
  Slot. Cast Time: Xs, Level: N" line, `description` for pure flavor text. Most recipes (a
  sword, a bar of metal) have neither and won't show this section at all.
- `station` — optional, which in-game crafting device the recipe is combined at, when a
  tradeskill actually uses more than one. Alchemy is the current example: raw herbs/reagents
  grind into powder at a **Mortar and Pestle**, then the powder combines with a vial at a
  **Cauldron** to produce the final potion/serum/tincture; every Alchemy recipe gets
  `"station"` set to one of those two exact strings. `renderCraftingRecipes` groups a
  tradeskill's recipe grid into headed sections by `station` (ordered `STATION_ORDER` =
  Mortar and Pestle before Cauldron) whenever at least one of its recipes has the field set —
  every other tradeskill renders as the original flat grid, unaffected.

1. Add an object to `crafting.json` with at least `name`, `slug`, `tradeskill`, plus whatever
   of the above the card shows.
2. Still save the screenshot — same as items (see above), convert to `.jpg` (quality 90)
   into `images/crafting/`, filename matching the `image` field. Archival only — not
   something the site ever displays.

### The sidebar can nest pages under a group, and Enchanting/Disenchanting use it

`pages.json` entries can carry an optional `"group"` field (e.g. `"Tradeskilling"`) — pages
sharing the same `group` render nested under one plain, non-clickable heading in the sidebar
instead of the normal flat top-level list (`buildSidebar` in `script.js`). Currently only
Gathering, Crafting, and Enchanting and Disenchanting use this, grouped under
"Tradeskilling". Add a page to an existing group the same way (set the same `group` string);
start a new group by picking a new `group` string on the pages that should share it — no
other code changes needed, `buildSidebar` handles any group generically. Consecutive
same-`group` pages share one heading; a page with no `group` renders exactly as before.

Enchanting and Disenchanting are ordinary tradeskills in `crafting.json`/`tradeskills.json`
(nothing schema-wise sets them apart from Blacksmithing or Alchemy), but they render on
their own page (`pages.json`'s `"Enchanting and Disenchanting"` entry, `"type": "enchanting"`)
instead of being two of the ~30 category cards on the main Crafting page. This is driven by
`tradeskillsData[].category: "enchanting"` on both their `tradeskills.json` entries, the same
mechanism `"gathering"` already uses to split Mining/Lumberjacking/Herbalism/Fishing out of
the main Crafting grid — `renderCraftingCategories` excludes both category values from its
grid. The page itself (`renderEnchantingDisenchantingPage` in `script.js`) still shows a
2-card tradeskill grid (`renderEnchantingDisenchantingCategories`, reusing `tradeskillGridHTML`
— the exact same card markup as the main Crafting page) rather than dumping both
tradeskills' recipes directly on one page — an earlier version did that and was reverted
2026-07-16 because it meant scrolling past all of one tradeskill's recipes to reach the
other. Clicking a card shows just that tradeskill's own recipe list
(`renderEnchantingDisenchantingRecipes`), with a "back" link returning to the 2-card grid.
The actual recipe-list rendering (search box, needs-info toggle, station grouping, item link
handlers, highlight-on-arrival) is shared with the main Crafting page via
`renderTradeskillSection` — both pages' "show one tradeskill's recipes" views are just
different callers of the same function. Every existing way of reaching a recipe (header
search, an item's "crafted via"/"used to craft" links, a recipe search result) still works
unchanged — `goToRecipe`/`goToCraftingCategory` check the tradeskill and redirect to the
Enchanting and Disenchanting page automatically when it's one of these two (setting
`pendingEnchantingTradeskill`, the same "jump straight past the grid" pattern
`pendingCraftingTradeskill` uses on the main Crafting page), so nothing that links to a
recipe needs to know about the split.

**Disenchanting's magic-dust tier chart:** rather than the lengthy explanatory `note` this
tradeskill used to carry (removed 2026-07-16 — the user found it too much to read on the
page), Disenchanting's own recipe view shows a small reference chart of its magic-dust tiers
at the top, above the recipe grid (`renderDisenchantingDustTiersHTML`, styled like the
`.gem-reference` panel Jewelcrafting's gemstone tables already use). This is derived
straight from `crafting.json`'s existing Disenchanting recipes (`disenchantingDustTiers()`)
rather than a new schema field: each distinct recipe result name (e.g. "Enchanted Powder
(x1-5) & Mote of Magic (x0-2)") names one tier's two possible outputs — a common "Powder"
and a rarer "of Magic" essence — and tiers are ordered lowest-to-highest by the same
`listOrder`/`recipeSkillLevel` the recipes already carry. Each dust shows its real
`items.json` image via `findItemByName` when one exists, or a dashed "No image yet"
placeholder (`.dust-tier-placeholder`) otherwise — most of these 8 dust items don't have a
card yet (only "Enchanted Powder" does so far), so the placeholder is the common case, not
an error state; add the item normally (see "Adding an item to the Item Database" above) once
a screenshot comes in and it'll start showing automatically, no code change needed. **What
source item yields which tier isn't confirmed** (the user is unsure of the exact formula), so
the chart only shows what a tier produces, not what feeds into it — don't guess or add a
source-item mapping without the user confirming one first.

### Enchanting recipes carry a slot/type filter no other tradeskill uses

A large batch of ~160 Enchanting recipe-card screenshots (2026-07-16) established two extra
fields, both `Enchanting`-only:

- **`enchantSlot`** — the equipment slot a scroll recipe's buff applies to, parsed straight
  from the recipe's own name (`"Enchant <Slot>: <Effect>"` → `<Slot>`, e.g. `"Gloves"`).
  Unset for a raw enchanted-material recipe (e.g. `"Enchanted Hide"`), which has no slot.
- **`craftType`** — `"Scroll"` for a buff-scroll recipe, or a category describing which
  other tradeskill actually uses a raw enchanted-material recipe's output: `"Armor"` for
  materials that only ever go into armor (Enchanted Hide/Rawhide/Wool/Cloth — Leatherworking/
  Tailoring make armor exclusively in this game), or `"Armor / Weapon"` for materials
  Blacksmithing uses for both (Enchanted Bronze/Tin/Silver/Copper Bar — this game's metal
  bars aren't earmarked for one or the other, see "Blacksmithing was populated from
  reference tables too" below). No enchanted material has surfaced yet that's Jewelry-only;
  add a `"Jewelry"` value the same way (by which tradeskill actually consumes it) if one
  ever does — don't force an existing material into that bucket without real evidence.

Both fields drive dropdown filters shown only on the Enchanting tradeskill view
(`renderTradeskillSection` in `script.js`, gated on `tradeskillName === 'Enchanting'`) —
values are derived from whatever's actually in the data, same "no code change needed for a
new value" convention as every other filter dropdown on the site. A third dropdown lets the
recipe grid switch from the default skill-required sort to alphabetical; every other
tradeskill still only ever sorts by skill-required, with no user-facing override.

**Enchanting's own crafting-window list is not sorted by skill requirement** — unlike every
other tradeskill (whose window list order the site relies on for `listOrder`, see "Crafting
window screenshots" below), Enchanting's window groups recipes by difficulty *color* first,
alphabetically within each color group second. Position within a color band carries no
finer-grained skill signal beyond the color itself, so `listOrder` was deliberately **not**
set on any Enchanting recipe from this batch — recording it would misrepresent relative
skill ordering to `estimateRecipeSkill()`'s interpolation. `observedAtSkill: 25` (the skill
shown at the bottom of every window screenshot in this batch) was still recorded on every
recipe, same as any other tradeskill.

One name — `"Enchant Belt: Minor Electric Resistance"` — turned up only in a window
screenshot, no card yet; it got the usual minimal stub shape (`name`/`slug`/`tradeskill`/
`enchantSlot`/`craftType`/`difficultyColor`/`observedAtSkill`/`needsInfo: true`, no image/
weight/components — see "Crafting window screenshots" below). Most of the ~160 source
screenshots were cropped (missing the tail of the Effect line and/or part of the Components
list) — the boilerplate effect suffix (`"(On Click. Any Slot. Cast Time: 5s. Level: 1)"`)
and cut-off resistance-type words (e.g. completing `"SV Elect…"` to `"SV Electric"`) were
safely reconstructed since they're 100% invariant/redundantly confirmed by the recipe's own
name on every fully-visible card seen — but no stat **bonus number** was ever invented; where
no screenshot of a given recipe showed the actual number, the recipe was left without one
rather than guessed from a "Minor = +1 / Lesser = +2" pattern that only looked consistent by
coincidence.

### Gathering tradeskills are a separate area, not recipes

Mining, Lumberjacking, Herbalism, and Fishing are **gathering** tradeskills — you interact
directly with a resource node in the world (a vein, a wood pile, etc.) rather than combining
components into a crafted result, so they don't fit `crafting.json`'s recipe shape at all
(no components, no single named result, but a *minimum skill to even attempt the node* that
no crafted recipe has). They get their own top-level page (`pages.json`'s `"Gathering"`
entry, `"type": "gathering"`, above "Crafting" in the sidebar) and data file,
`gathering-nodes.json`.

- **`tradeskillsData[].category`** — an optional field in `tradeskills.json`, `"gathering"`
  for exactly these four tradeskills, unset for everything else. This is what
  `renderCraftingCategories`/`renderGatheringCategories` each filter on to build their own
  page's tradeskill grid.
- **`gathering-nodes.json`** — a flat array, one object per node: `name`, `slug`,
  `tradeskill`, `locations` (array of free-text location strings — these are gathering spots
  named by a source table, not tied to `maps.json` the way a monster's `maps` field is),
  and two optional skill fields: `minSkill` (skill required to even attempt the node) and
  `trivialSkill` (the point where it stops giving skill-ups — same "Trivial" concept as
  `crafting.json`'s `recipeSkillLevel`, just named differently since this is a separate file/
  shape). Only write an exact number into `minSkill`/`trivialSkill` when the source states
  one outright — a floor-only value (`"225+"`, `">92"`) or a fully unknown value (`"???"`)
  gets left unset with a `note` field capturing the raw text instead. `results` (array of
  item names, same dynamic-linking-by-exact-name convention as a recipe's `components` or a
  monster's `drops`) is optional — only include it when the source table actually has a
  Results column.
- **Source tables so far are fan-wiki-style reference charts** (dated "As of 5/26 Closed
  Beta" for Mining), same weaker-than-a-screenshot caveat as the Tanning/Leatherworking/
  Blacksmithing tables elsewhere in this file — good enough to seed real numbers, but
  supersede it without hesitation if the user's own in-game observation ever disagrees.
- **Rendering:** `renderGatheringNodes(container, tradeskillName)` in `script.js` — a
  sortable/searchable table, same structural pattern as `renderMonstersList`'s table rather
  than the recipe-card grid, since a node has no components to justify a full card. A node's
  `note` (when set) renders as its own small row directly under it.
- **Optional `image` + `needsInfo`:** a node can carry a picture of the actual plant/vein/
  etc. — `images/gathering/<slug>.jpg`, same `.jpg` quality-90 convention as everything
  else, referenced via an `image` field. When set, `gatheringCellHTML`'s Name cell shows a
  small clickable thumbnail (`.gathering-node-thumb`) that opens the existing
  `#sample-viewer` lightbox (the same minimal image-only modal the Submit page's examples
  use — no separate viewer built). `needsInfo: true` is the same flag/meaning as
  `items.json`/`crafting.json`'s (see "Item and recipe cards" below): confirmed to exist but
  not fully identified/documented yet — renders a red "NEEDS INFO" badge next to the name
  and a red note row linking to `#submit`. First used for a herb spotted in-game but not yet
  identified at all — recorded as a placeholder node with an empty `locations` array and the
  known skill floor captured in `note` (not `minSkill`, since it's floor-only) so the
  picture itself becomes the identifying reference once a real name comes in.
- **Columns are derived per-tradeskill from the data, not fixed** (`gatheringColumns()` in
  `script.js`) — Name and Min Skill always show; Trivial/Results/Rarity/Bait Required each
  only appear if at least one node of that tradeskill actually uses that field (Fishing uses
  Rarity/Bait Required instead of Trivial/Results, for example). Extend the same way if a
  future tradeskill needs a column none of the existing ones have.
- **Herbalism**'s tradeskill `note` (in `tradeskills.json`) is the source page's own "Getting
  Started" paragraph (trainer location, early-leveling herbs) — general how-to info rather
  than a specific node's data, same idea as Lumberjacking's equip-axe-and-right-click note.
- **Disenchanting is *not* a gathering tradeskill**, despite consuming a specific item like a
  gathering node consumes a resource — the distinction: a gathering node consumes nothing
  and only gates on skill, while Disenchanting consumes a specific MAGIC item (its card's own
  "Components" list) to produce output, which is structurally an ordinary recipe just
  running "backwards" (requires a Disenchanting Cube placed in a bag slot, can fail and
  destroy the item with nothing gained, and the output powder's quality depends on the item
  disenchanted in some not-yet-understood way). It lives in `crafting.json` as ordinary
  recipes — `tradeskills.json`'s own Disenchanting entry no longer carries an explanatory
  `note` (a lengthy one covering this same mechanic was removed 2026-07-16 as too much to
  read on the page; see "Disenchanting's magic-dust tier chart" below for what replaced it).
  One flagged inconsistency worth knowing: "Cinder Beetle Shield" is no longer tagged MAGIC
  in-game and can't actually be disenchanted anymore — recorded as a `note` field on that one
  `crafting.json` entry (`disenchant-cinder-beetle-shield`) rather than removing the recipe,
  since it's still useful historical/reference data. `renderRecipeCardHTML` renders
  `recipe.note` (when set) as an italic line at the bottom of the card, right after
  Components — extend this same field to any other recipe that needs a similar caveat.

### Tanning is different: no recipes, just vat processing

Confirmed by the user: Tanning has no crafting-window entries or recipe cards at all —
instead, any tier-appropriate pelt is dropped directly into a tanning vat to produce scrap
material (Low-Quality pelt → 24x Rawhide Scraps, Medium-Quality → 24x Hide Scraps,
High-Quality → 24x Leather Scraps, one entry per pelt type). These still live in
`crafting.json` as ordinary entries (`name`/`slug`/`tradeskill: "Tanning"`/`components`/
`resultQuantity: 24`), just without `difficultyColor`/`observedAtSkill`/`listOrder` — there's
no in-game screenshot to source those from, so they're left unset rather than guessed.

Since a Tanning "recipe" card would otherwise look like any other simple one-component
recipe, with nothing explaining *why* there's no image/difficulty/list order, a tradeskill
can carry an optional `note` field in `tradeskills.json` (Tanning has one, explaining the vat
mechanic) rendered as a callout right under the tradeskill's `<h1>` in
`renderCraftingRecipes` — extend to another tradeskill the same way if it ever needs a
similar structural explanation.

The pelt→scrap mapping itself came from a fan-wiki-style table (sortable-column styling,
hyperlinked names), not the live game — per "The user's screenshots are the source of truth"
above, that makes it weaker than a normal capture for anything *not* stated outright. Its
exact Trivial values (25 for Low-Quality, 50 for Medium-Quality) were written straight into
`recipeSkillLevel`; the `>50` High-Quality value stays a floor-only note in the estimates
file since it isn't an exact number.

### Blacksmithing was populated from reference tables too

Same fan-wiki-style tables as Leatherworking/Tanning (sortable columns, hyperlinked names,
"Crafting Bench"/"Scrapping" columns) gave the full Copper→Bronze→Iron→Steel progression:
chain/plate armor, weapons, shields, base materials, sharpening/weight stones, mount
barding, and a repair chain (Corroded/Rusty gear + metal scraps → "Tarnished" gear). Exact
Trivial numbers went straight into `recipeSkillLevel`; `"?"` or `"200?"`-style uncertain
values were left unset rather than guessed.

The "Hammer and Chisel Master List" table (worn gear + Hammer and Chisel → raw scraps) is in
`crafting.json` as 93 ordinary-shaped Blacksmithing recipes — salvaging a crafted item back
into its materials, `components` is `[{ the worn item, quantity 1 or 2 }, { "Hammer and
Chisel", quantity 1 or 2 }]`, `name` is the scrap result. A handful of source items salvage
into *two* different scrap types in different quantities, which the existing `resultQuantity`
field can't express (it's one number for one named result) — those recipes fold both into
the `name` string itself, `"<Item> (xN) & <Item> (xM)"`, the same workaround used for
Disenchanting's variable-output recipes. Many of the 93 share an identical `name` (e.g.
dozens are just "Iron Scraps") since the *source* item differs, not the result — `slug`
still disambiguates each one (`<result>-from-<source>`).

**Don't silently "correct" an inconsistent-looking row from these reference tables without a
re-confirming screenshot** — recorded verbatim even where a row looks internally
inconsistent, e.g. "Copper Plate Boots"/"Copper Longsword" salvage into *Bronze* Scraps
rather than Copper Scraps like every other Copper item in the table, and "Tarnished Bronze
Mace" is the only weapon in its tier that doesn't also yield Rawhide Scraps. The table might
just be wrong, or the game might genuinely be inconsistent here — don't guess which.

### New items/maps/recipes/monsters come in via `images/inbox/`

The user drops new screenshots into `images/inbox/` (may appear as `images/Inbox` on
disk — Windows paths are case-insensitive, don't create a second folder for it). This is
the *only* place to look for new/unprocessed content — do not re-scan `images/items/` or
re-read existing entries in `items.json`/`maps.json`/`crafting.json`/`monsters.json` looking
for new work; that wastes tokens on files that haven't changed. Files are usually named with
a random ID (from a screenshot tool), not the item/map/recipe/monster name — the filename is
not meaningful, always read the image itself.

This rule isn't limited to adding new entries — it applies to *any* task involving
item/map/recipe/monster screenshots (e.g. checking for cut-off/truncated text, auditing image
quality, re-verifying data). Only ever read/process files sitting in `images/inbox/`; never
re-open every existing file in `images/items/`, `images/Maps/`, `images/crafting/`, or
`images/Monsters/` to go looking for problems. If a task requires checking already-processed
images, say so and ask the user rather than re-scanning everything.

**Move the batch out of the inbox before reading anything.** The user regularly drops new
screenshots into `images/inbox/` *while* a previous batch is still being processed — earlier
this caused a real incident: a session listed the inbox, spent several minutes reading/
processing that batch, and then cleared the inbox with a wildcard delete at the end, which
caught screenshots the user had dropped in mid-session that were never read at all,
permanently deleting them (`images/inbox/` isn't git-tracked, so there was no way to recover
them). To make this race condition structurally impossible instead of just being careful:
**before reading any file, `mv` (not copy) every file currently in `images/inbox/` into
`images/Processing/`** (create it if it doesn't exist), and do all reading/processing/
deleting from `images/Processing/` for the rest of the task — `images/inbox/` is never
touched again after that one move. Any screenshot the user drops in afterward lands in
`images/inbox/`, completely isolated from the batch already being worked on, and simply
becomes the start of the *next* session's move instead of being caught by this one's
cleanup. `images/Processing/` should always be empty between sessions — a non-empty one
when a task starts means a previous session ended mid-batch (crashed, was interrupted,
etc.); pick up processing those files rather than re-moving from `images/inbox/` again.

Workflow when asked to process new items (or "check the inbox"):

1. Move every file currently in `images/inbox/` into `images/Processing/` (see above) —
   this is the one and only time `images/inbox/` gets touched during the task.
2. List `images/Processing/` — each file there is one unprocessed screenshot.
3. For each one: read the image and figure out whether it's an **item** (the stat-card
   popup style used elsewhere in this doc), a **map** (a game map/zone image, no stat
   card), a **recipe** (a single crafting card, same popup style as an item but with a
   "Components:" list), a **crafting window** (the in-game tradeskill window listing
   many known recipes at once, e.g. titled "Leatherworking" with a skill number at the
   bottom), a **vendor screenshot** (an NPC's buy/sell list — item names + prices, no stat
   card at all — see "Vendor screenshots" below), or a **monster** (a picture of a
   creature, no stat card at all — see "Adding a monster" below) — then follow the matching
   path below.
4. Once a file has been moved out (to `images/items/`, `images/Maps/`, `images/crafting/`,
   or `images/Monsters/`) or deleted as a duplicate, `images/Processing/` should no longer
   contain it — an empty `images/Processing/` means everything from this batch is processed.

**Duplicates (items/maps/recipes alike):** if a screenshot's item/map/recipe already exists
(matched by slug or name), just delete it from the inbox — don't save it anywhere. The one
exception: if the new screenshot reveals something the existing entry is missing or gets
wrong (a stat that was cut off before, a corrected number), still update
`items.json`/`maps.json`/`crafting.json` with that new information before deleting the
screenshot — the user's newest screenshot always wins.

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

**Monsters:** a plain picture of the creature (its name floating over the model, no stat
card) — see "Adding a monster" below for the named/boss-only picture policy: most monsters
(generic "a desert bat"/"a large rat"-style mobs) won't have a picture at all, and that's
expected, not a gap to fill. Map, level range, and drops come from whatever the user says
directly in chat alongside the picture (counts as authoritative, same as a screenshot), not
from the image itself — **except** drops, which are usually shown directly via a
loot-window screenshot (the in-game corpse-loot UI, one item icon per slot) paired with a
plain item card for each icon — read the item card to get the exact name rather than
guessing from the icon alone, and process/add that item to `items.json` the same as any
other new item in the same inbox batch (these are very often raw materials already
referenced as plain-text, unlinked components elsewhere — adding the real item makes that
link resolve automatically). A monster's loot window can take more than one screenshot
across separate messages to show every slot; keep adding newly-revealed drops to that
monster's `drops` array rather than assuming one screenshot is the complete list.

1. Check whether that monster's slug (or name) already exists in `monsters.json`.
   - **Not a duplicate:** add an entry (see "Adding a monster" below for the schema). If a
     picture was actually provided (Named/boss only, per the policy above), convert it to
     `.jpg` (quality 90), rename it to the monster's slug, move it into `images/Monsters/`,
     and use that slug for the `image` field — otherwise just omit `image` entirely.
   - **Duplicate:** delete the screenshot from the inbox (see "Duplicates" above) — update
     `monsters.json` first if the new screenshot/chat message fills a gap (e.g. a map, level
     range, or an additional drop that wasn't known before).
2. If the user hasn't given a map, level range, or drop table yet, just add what's known
   (name/slug at minimum, since image is optional even for a finished entry) rather than
   blocking on the rest — every field beyond name/slug is optional, see "Adding a monster"
   below.

**Crafting window screenshots** (a different thing from a recipe card — this is the
in-game tradeskill window listing every known recipe for one tradeskill, name-only with a
color per recipe, e.g. "Leatherworking 22 / 300" at the bottom): these are a reference
source, not a recipe card, and don't get saved anywhere — process them and delete them from
the inbox, don't move them into `images/crafting/`.

1. The window's title bar names the tradeskill directly (more reliable than guessing from
   item names). The "X / 300" line at the bottom is the user's current skill in that
   tradeskill — capture it as `observedAtSkill` on every recipe pulled from this screenshot.
   **If that line is missing from the screenshot**, assume `observedAtSkill: 0` rather than
   leaving it unset or asking.
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
   in `script.js`) — the game's own list order is already sorted by real skill requirement,
   low to high, so this position doubles as a difficulty ranking without needing the
   (unreliable) color-based guessing in `To-Do/crafting-skill-estimates.md`. Capture/update
   `listOrder` on *every* recipe seen in the window, including ones that already have a full
   card (unlike `difficultyColor` above, this field isn't something a real recipe card ever
   shows, so there's no "actual card" data to protect from being overwritten). If a
   screenshot batch only covers a portion of the full list, reconstruct the true list-wide
   position by matching up rows that repeat between adjacent screenshots (same name *and*
   same color in both) rather than assuming each screenshot starts a fresh count — a full
   recapture of a tradeskill's list should end with `listOrder` values forming one unbroken
   1..N sequence with no gaps or repeats. If the screenshots don't overlap enough to confirm
   the exact join between two batches, the color trend at the boundary (colors should move
   steadily from Green at the low end toward Red at the high end, never jump back and forth)
   is usually enough to infer the join — but say so and flag the uncertainty to the user
   rather than presenting a guessed join as confirmed fact.
4. Match the recipe's difficulty color to the mapping in "Adding a crafting recipe" above.
   If a color looks ambiguous (e.g. telling Light Blue from Dark Blue apart is genuinely
   hard from a screenshot), say so and record the generic color rather than guessing which
   shade — don't silently pick one.
5. Delete the screenshot(s) from `images/inbox/` once processed — they don't get moved
   anywhere, since nothing about them (aside from the extracted data) belongs on the wiki.

**Vendor screenshots** (an NPC's buy or sell list — item names + prices only, no stat card,
no components, nothing else): like a crafting window, this is a reference source that
confirms an item *exists* but reveals none of its real data — process it for names, then
delete it, don't save it anywhere.

1. For each item name in the list, check whether it already exists in `items.json` (by name
   or an obvious slug match). Already-exists items need no action; note in
   `To-Do/predicted-missing-items.txt` if the sighting confirms or contradicts a prediction
   already tracked there.
2. For a name that doesn't exist yet, add a minimal `items.json` entry: `name`, `slug`,
   `type`, `tags: []`, and `"needsInfo": true` (see `needsInfo` under "Item and recipe
   cards" below for how this renders). Only add fields beyond that when they're safely
   inferable from the name itself matching an already-established pattern — e.g. a weapon's
   `skill`/`twoHanded`/`slot` from its type matching every other same-type weapon already in
   `items.json` (a "Dagger" is always Stabbing/1H in this game's data so far), or an armor
   piece's `slot` from its piece-type name (every "Chain Coif" across every material tier is
   Head). **Never** infer `damage`/`delay`/`weight`/`size`/`ac`/`classes`/`race` this way —
   those actually vary by material/tier and a vendor listing gives no basis to guess them.
3. The same treatment applies to a recipe name spotted on a vendor list, using
   `crafting.json`'s equivalent minimal shape (`name`/`slug`/`tradeskill`/`needsInfo: true`).
4. Delete the screenshot(s) from `images/inbox/` once processed — same as a crafting window,
   nothing about the image itself belongs on the wiki once its names are extracted.

## Adding a monster

The Monsters page (`pages.json` entry with `"type": "monsters"`) is a two-level drill-down —
a top-level category grid (`renderMonstersCategories`) split into Named (boss) vs. Regular,
each subdivided by zone, then a sortable/searchable table (`renderMonstersList`) scoped to
one area + zone at a time. Zone drill-down uses a hash sub-route (`#monsters/named/<zone>`
or `#monsters/regular/<zone>`, not a pending variable) so the browser's Back button can pop
out of a zone list to the category grid — `loadPage`/the `hashchange` listener and `init()`'s
startup routing all match pages by the part of the hash *before* the first `/`. This is the
pattern to reuse if a future drill-down needs the same "should be Back-button-navigable"
behavior.

`monsters.json` schema — only `name`/`slug` are required, everything else is optional and
fills in as the user provides it:

- **`named`** — boolean, `true` for confirmed named/boss monsters. Has to be an explicit
  field rather than derived from name casing, because several confirmed bosses use the exact
  same lowercase "a/the X" naming style as regular trash mobs — there's no reliable
  string-pattern signal to key off.
- `image` — picture of the creature, dropped into `images/Monsters/`, same `.jpg`
  quality-90 convention as item/recipe screenshots. Shown in the monster viewer modal, not
  the table. **Only Named monsters/bosses get a picture** — screenshotting one for every
  generic mob is too much ongoing effort for too little payoff; a generic monster having no
  `image` is the normal case, not a gap to flag. **Replace-on-better-visibility:** if a new
  screenshot comes in for a monster that already has an `image`, and the new one shows the
  creature more clearly (better lighting, less obstructed, less distant/blurry), overwrite
  the existing file rather than discarding it as a duplicate — a monster only has one
  `image` slot, so this is always an overwrite, never a second field.
- `maps` — array of map names the monster's been seen on (usually one, kept as an array in
  case the same monster spawns in more than one zone). Must match a real top-level map (a
  `maps.json` entry) — a named sub-area within a map (e.g. "Necropolis" within "Night
  Harbor") is **not** a map of its own and goes in `areas` instead, not appended into the map
  string (e.g. `"maps": ["Night Harbor"], "areas": ["Necropolis"]`, not `"Necropolis (Night
  Harbor)"`).
- `areas` — optional array of confirmed sub-area names within the monster's `maps` (e.g.
  `["Necropolis", "North Gate"]` for a monster seen in more than one). A more specific
  single-spot callout is finer-grained still and belongs in `rumor`/prose instead — `areas`
  is for the coarser, confirmed subdivision the user actually names. Treated as confirmed
  (the user states it directly, same authority as a screenshot), so it's its own field
  rather than folded into the unverified-styled `rumor` text. Rendered on the monster card
  as an "Area" field right below "Map", and included in `monsterSearchHaystack` so it's
  searchable. Does not affect zone-grid grouping on the Monsters page — that's still driven
  by `maps` (specifically `monsterZone()`, which reads `maps[0]`), not `areas`.
- `levelRange` — a plain string like `"5-8"`, not a structured min/max, since every level
  range the user adds is a guess, not a confirmed in-game value — kept as a free string
  rather than numeric fields. **Con color reference:** in this game a White con means the
  monster is the same level as the player looking at it — if the user reports a monster
  conning White to a character of known level, that pins down that monster's level exactly,
  strong enough to write directly into `levelRange` as a single number. The exact
  level-difference each *other* con color represents isn't known yet (don't assume it maps
  1:1 to EverQuest's scale) — a monster conning Yellow (higher level) to a character of
  known level N is recorded as `"N+"` (an open lower bound), not a guessed exact number or
  span. **Full con-color order confirmed:** low to high, Light Green, Light Blue, Dark Blue,
  White, Yellow, Orange, Red — the same seven colors used for crafting recipe difficulty,
  with "Light Green" standing in for that scale's plain "Green" as the trivial end. Confirmed
  meanings: **Light Green** is trivial (no XP for the kill); **White** is same level as the
  player (pins down an exact level); **Red** is much higher level, close to impossible to
  solo. Light Blue/Dark Blue/Yellow/Orange's exact level-difference isn't known yet — record
  what's actually known, don't invent a number a color alone doesn't confirm.
  **`levelRange` display is currently hidden** on the site until a more reliable conning
  method is found (same reasoning as the crafting difficulty badge removal) — the "Level
  Range" column/sort/viewer-field are all gone from rendering, but **keep recording
  `levelRange` in `monsters.json` as before** — this is a display-only removal, not a data
  one. Revisit showing it again once/if a more reliable conning method exists.
- `drops` — array of `{ "item": "Name As Shown" }`, exactly the same shape and dynamic-
  linking convention as a recipe's `components`: matched against `items.json` by exact name
  at render time (`findItemByName`/`goToItem`), clickable if a matching item exists yet,
  plain text if not. Sourced from a loot-window screenshot paired with a plain item card per
  icon — see the inbox workflow above.
- `relatedMonsters` — array of `{ "label": "Display Text", "slug": "other-monsters-slug" }`,
  for a Named boss whose loot flavor text ties it to an existing generic mob (e.g. a wing
  item whose flavor text names the bat boss it's said to come from). Rendered on the monster
  card as a "Place Holder" field (the user's own label for this — literal display label, not
  a placeholder in the "TODO" sense) with each `label` as a link to that other monster's own
  viewer, same dynamic-resolves-at-render-time convention as `drops`/`components` (via
  `findMonsterBySlug`) — renders as plain text if the referenced slug doesn't exist yet.
  Optional; most monsters won't have this.
- `rumor` — same field/semantics as `item.rumor` (see "Item and recipe cards" below): a
  free-text, explicitly unverified note (spawn conditions, believed source, anything the
  user *thinks* but hasn't confirmed). Rendered only when set, in the same amber/italic
  `.item-card-section-rumor` style as an item's rumor line, labeled "Rumor (unverified)" so
  it's never confused with confirmed fields like `maps`/`levelRange`/`drops`. Never promote a
  monster's `rumor` into a confirmed field yourself — only the user saying it's confirmed
  does that.

### Quality-set drop inference

**Standing rule, stated by the user:** "If a monster drops 1 piece of an item quality set
(like Rusty weapons or Tattered armor), assume that mob can drop any of the other items in
that quality range." Applies automatically whenever new inbox data confirms a monster drops
at least one item from a recognized quality-set family — doesn't need to be re-requested
each time.

- A "quality set" is identified by a shared name prefix denoting a tier/material, not a
  literal in-game grouping. Confirmed families and their current known rosters:
  - **Rusty** (18 pieces, weapons + Tower Shield): Dagger, Shortsword, Throwing Dagger, Axe,
    Battle Axe, Scimitar, Scythe, Longsword, Spear, Long Spear, Trident, Mace, Warhammer,
    Great Scythe, War Lance, Greatsword, Maul, Tower Shield.
  - **Tattered Cloth** (9 pieces, armor): Cap, Gorget, Pantaloons, Shirt, Gloves, Bracer,
    Boots, Robe, Veil.
  - **Tattered Rawhide** (8 pieces, armor): Gorget, Belt, Mask, Gloves, Bracer, Boots, Vest,
    Shoulderpads.
  - **Corroded Bronze** (19 pieces, weapons + armor): Shortsword, Scythe, Battle Axe,
    Longsword, Axe, Dagger, Trident, Maul, Great Scythe, Scimitar, Greatsword, Long Spear,
    Tower Shield, Kite Shield, Plate Collar, Plate Boots, Chain Gloves, Chain Waistguard,
    Chain Mask.

  Treat a new shared prefix as its own family the same way if one shows up.
- The backfill is **per-monster**, based on the *global* known roster of a family (not just
  what that one monster's own screenshots have shown) — if a monster is newly confirmed
  dropping one piece of a family, it gets every *other* piece of that family already known
  from *any* monster, not just pieces it's personally been seen dropping. This also applies
  retroactively: an existing monster that already dropped some pieces of a family gets any
  newly-discovered pieces backfilled too, once those pieces become known via a different
  monster's screenshot.
- Every monster with inferred drops gets a `rumor` note listing exactly which of its drops
  were directly screenshot-confirmed vs. inferred by this rule, so the distinction stays
  visible on the page (not silently blended into the confirmed drop list).
- Items still need a real screenshot before getting a full `items.json` entry (stats aren't
  guessed) — an inferred drop with no matching item just renders as unlinked plain text
  until a card comes in, same as any other not-yet-added item name.

Clicking a monster's name (`.monster-name-hover`, `setupMonsterClickToView`) opens
`#monster-viewer`, a modal built by `openMonsterViewer`/`setupMonsterViewer` — same modal
shell/close-button pattern as `#item-viewer`, just showing the real screenshot (`<img>`)
instead of a data-rendered card, since a monster's picture has no card fields it could be
rebuilt from the way an item's can. Clicking a drop that links to an item sets
`pendingReturnToMonster` before navigating to the Item Database (mirroring
`pendingReturnToRecipe`) so that item's page shows a "&larr; Back to &lt;monster name&gt;"
link; `goToItem`'s second argument takes either a recipe object (untagged, the original
case) or `{ kind: 'monster', name, slug }`, distinguished by the `kind` tag so the two "back
to" links never collide.

The Monsters page is wired into the header search box the same way Items/Crafting are — a
"Monsters" results section, `goToMonster` navigating to the page and flashing the matched
row (`pendingHighlightMonster`, same `row-flash` mechanism as an Item Database search
result), also setting the zone-scoped hash so a search result lands directly in the right
scoped list instead of the top-level category grid.

**Gotcha worth remembering:** `goToMonster`'s zone fallback must match `monsterZone()`'s
fallback exactly (`"Unknown Zone"`, not `null`/`undefined`) — a mismatch there caused
`renderMonstersList` to call `escapeAttr(null)`, which throws and gets silently swallowed by
`loadPage`'s catch block, surfacing as a blank "Page not found" instead of a visible JS
error. Worth checking if a future pending-scope-style feature hits the same silent-failure
shape.

## Adding a Beastmaster companion

The Companions page (`pages.json` entry with `"type": "companions"`) shows every tamed-pet
type the Beastmaster class can summon, rendered as item-card-style cards
(`renderCompanionCardHTML` in `script.js`, reusing the plain gold `.item-card` styling — not
the teal recipe variant, since companions aren't a crafted/tradeskill thing) rather than raw
screenshots.

Two data files, both flat arrays like every other `*.json` in this repo:

- `companions.json` — one entry per tamed animal type: `name` (e.g. "A Bear Companion"),
  `slug`, `animal` (a lowercase icon key), `observedAtLevel` (the pet's level in the
  screenshot it was captured from — recorded as an observation, not asserted as a fixed
  per-species level), and `skills` — an array of that companion's *own* unique ability/
  abilities only.
- `companion-skills.json` — the abilities every companion shares regardless of animal type:
  **Provoke** (Martial Ability, threat generation) and **Bite** (Might Ability, physical
  damage). Recorded once here instead of repeated on every companion entry, rendered as a
  "Shared Abilities (Every Companion)" reference block above the companion grid.

A skill object (used in both files) is `{ name, type, description, castTime, cooldown, range
}` — `type` is "Martial Ability" or "Might Ability" as shown on the ability tooltip, `range`
is omitted for self-cast/no-range abilities. This intentionally drops boilerplate tooltip
lines (Innate, Does Not Trigger Global Cooldown, etc.) true of every companion ability seen
so far — only the fields that actually vary/matter for a reader are captured.

**Screenshots are not archived for this category, unlike items/recipes/monsters** — a pet's
screenshot batch is several stacked UI windows (the Pet window plus one tooltip per ability),
a reference capture rather than one clean per-entry card, so these are processed for their
data and deleted from `images/inbox/` rather than moved anywhere (same precedent as a
crafting-window screenshot).

**Icons:** four `ICON_DEFS`/`ICON_BG` keys (`bear`, `rat`, `crocodile`, `spider`) in the same
flat-silhouette-in-a-colored-circle style as every other icon — a companion's card icon is
just `svgIcon(companion.animal)`, no separate lookup table needed since `animal` doubles as
the icon key directly. Add another animal key the same way when a new companion type comes in.

The Companions page has its own local search box and is wired into the header search box the
same way Monsters is (`goToCompanion`, `pendingHighlightCompanion`, `.card-flash` — a
gold-accent flash animation, since `.recipe-flash`'s teal doesn't match a plain `.item-card`).

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

**Items and recipes are *displayed* as cards rendered entirely from JSON data — not
screenshots.** The user compared the site to mnmquest.com's item popups, liked that
approach better, and asked for an original (not copied) equivalent built from
`items.json`/`crafting.json` instead of the game screenshot.

**The screenshot itself is still saved as a `.jpg`** — it's just no longer shown to
visitors. Think of it as "the screenshot is the receipt": still filed in
`images/items/`/`images/crafting/`, still referenced by the entry's `image` field, still
useful if a stat's ever in doubt and needs re-checking against the original card — just not
rendered anywhere on the page. Follow "Item screenshot format" above and the inbox
workflow's Items/Recipes sections as before; nothing about *saving* screenshots is affected,
only *displaying* them.

Drawing a card from the same JSON that already drives the table/filters/search loses
nothing on the display side while the saved screenshot keeps the verification value. Cut-
off/truncated screenshot text is now purely a data-completeness question (did the missing
text make it into the JSON?), not a display problem — see `To-Do/items-needing-text.txt`,
which tracks exactly that.

**The renderer:** `renderItemCardHTML(item)` (items) and `renderRecipeCardHTML(recipe)`
(recipes) in `script.js` build the card's HTML from scratch each time it's shown — header
(a type icon, the name, tag/tradeskill badges), a field grid (Slot/AC/Weight/Size/etc., or
Weight/Size for recipes), a row of stat chips (STR/AC bonuses, resists, haste — via the
shared `statEntries(item)` helper, also used by the table's plain-text `formatStats()`), a
Class/Race line, description/effect text, and — items only — a "Found at" line (see below).
Recipes additionally list Components, each one a link to the Item Database when a matching
item exists (same `findItemByName` dynamic-linking pattern as before).

**`needsInfo`** (items and recipes both) marks an entry that's confirmed to exist — usually
from a vendor listing or crafting-window sighting that gave only a name, no full stat card —
but doesn't have real data yet. `renderItemCardHTML`/`renderRecipeCardHTML` show a red "This
item/recipe needs more info" note (`.item-card-needs-info` in `style.css`) with a blue link
to `#submit` (the submit link is deliberately blue rather than matching the surrounding red
warning text, so it still reads as a clickable link), and the Item Database table/recipe
card header both show a small red "NEEDS INFO" badge (`.badge-needs-info`) next to the name.
The Item Database and Crafting page each have a red-styled toggle ("Show only items/recipes
that need info" — `.needsinfo-toggle` in `style.css`) to filter down to just these entries.
Only ever set fields that are genuinely confirmed on a `needsInfo` entry (e.g. a weapon's
`skill`/`twoHanded`/`slot` can often be inferred safely from its name matching an already-
established sibling weapon type — never its `damage`/`delay`/`weight`/`ac`, which actually
vary and have no such safe inference).

**Icon system:** each card's header icon is a colored circular badge — `ICON_DEFS[key]` holds
glyph-only SVG markup, a parallel `ICON_BG[key]` map holds each icon's background hex color,
and `svgIcon(key)` assembles the two into `<svg><circle fill="${bg}"/><g fill="#f3e9d6">
${glyph}</g></svg>`. The icon key is picked by sub-type, derived entirely from fields items
already have (no new schema field to keep in sync):
- **Weapon** — `weaponIconKey(item)` reads `skill` + `twoHanded` to pick one of 1H/2H ×
  Bludgeoning/Slashing/Piercing, plus Archery/Throwing/Ammo — falls back to `slashing1h` if
  nothing matches.
- **Armor** — `armorIconKey(item)` checks the name for "Plate"/"Chain"/"Rawhide"/"Hide"/
  "Leather"/"Cloth" to pick a material icon (all four materials share a tunic-silhouette
  base shape with a per-material treatment layered on top — chain gets a dot-grid texture,
  plate gets a center groove + belt line, cloth gets longer sleeves and a flared hem,
  leather is the plain short-sleeve tunic); `slot === "Secondary"` or a name containing
  "Shield"/"Buckler" gets the Shield icon instead (shields are their own category, not a
  material tier — deliberately *not* listed as a Material-dropdown option either, see
  "Adding an item to the Item Database" above, since a shield isn't a material tier the way
  Cloth/Leather/Chain/Plate are). Anything matching no keyword falls back to a plain armor
  icon.
- **Jewelry** — `jewelryIconKey(item)` picks Ring/Earring/Necklace from the existing `slot`
  field (Finger/Ear/Neck).
- **Food / Drink / Container** — one fixed icon each.
- **Misc (crafting materials)** — `craftingIconKeys(item)` looks up every tradeskill the
  item is linked to in `crafting.json` and shows one icon per tradeskill, left to right. A
  material with no recipe link at all gets a generic raw-material icon.
- **`TRADESKILL_ICON`** covers every tradeskill in `tradeskills.json` (all 38) — recipe
  cards' own header icon uses the same lookup keyed by the recipe's tradeskill, falling back
  to the tradeskill's initial letter if a tradeskill somehow has no dedicated icon.

The icon set went through four visual redesign passes (silhouette → outline → solid →
colored-badge, chasing a series of increasingly precise reference sheets the user provided)
before landing on the current colored-badge system above — only the final state matters
going forward. One gotcha from that process worth remembering for any future icon work:
drawing a filled ring/hoop via a single SVG arc that sweeps *almost* 360° (a common
"full circle from one arc" trick) renders incorrectly in Chrome (a broken/partial shape) —
use the two-arc-per-circle construction (`M (cx-r) cy A r r 0 1 0 (cx+r) cy A r r 0 1 0
(cx-r) cy Z`, outer and inner circle each built from two semicircle arcs) with
`fill-rule="evenodd"` instead, which is what `ring`/`earring` use now.

**Category label:** a small muted line under the item's name on its card shows the same
sub-type in words (e.g. "Greataxe", "Plate Armor", "Blacksmithing Material") —
`itemCategoryLabel(item)` reuses the exact same `itemIconKeys(item)` the icon itself is
built from (via a shared `ICON_LABELS` lookup), so the icon and the text label can never
disagree with each other. Items only — recipe cards don't get this, since their tradeskill
is already shown as a badge.

**Item cards use the gold `--accent`; recipe cards use the teal `--accent-craft`, with the
recipe's own name colored teal and its tradeskill shown as a badge where an item card would
show its tags.** Keep this color split if you touch either card type, since it's the only
thing keeping the two visually distinct given they otherwise share the exact same card
structure (`.item-card` base class, with `item-card-recipe`/`item-card-icon-recipe`/
`item-card-name-recipe`/`badge-tag-craft` modifiers for the recipe variant).

**Where cards appear:**
- Hovering any `.item-name-hover` element (an Item Database row, a linked recipe name, or a
  linked recipe component) shows the matched item's card in a floating tooltip
  (`#item-tooltip`, positioned by `setupItemTooltip` — flip-above-if-no-room-below), looked
  up by name (`data-alt` + `findItemByName`) every time, never a cached image path.
- Clicking an item's name in the Item Database opens `#item-viewer`, a modal built by
  `openItemViewer`/`setupItemViewer`, showing the same card at a larger size plus the
  "Crafted via" / "Used to craft" section (two reverse lookups against `crafting.json`,
  `findRecipeForItem`/`findRecipesUsingItem`). `#item-viewer-panel` caps at `max-height: 88vh`
  with `overflow-y: auto` as a safety net, since a rendered card can't be taller than its
  content. The close button lives on the overlay itself, since the card has no separate
  header bar to anchor it to.
- Every recipe on the Crafting page renders as its own card directly in the page (no
  hover/click needed — weight/size/components are always visible in the grid).

**`item.foundAt`** is an optional free-text string ("Dropped by \<mob name\>", "Quest
reward: \<quest name\>") shown as a "Found at" line on every item card — present or not, the
line always renders (as "not yet known" when absent), so the field's existence is visible
and the layout doesn't shift once it's filled in.

**`item.rumor`** is a separate optional free-text field for where the user *thinks* an item
comes from, before it's confirmed — a guess, someone else's claim, or a hunch, as opposed to
`foundAt` which is only ever set once the user has confirmed the source themselves.
Explicitly **not** the same field and never conflated: don't write a guess into `foundAt`,
and don't promote `rumor` into `foundAt` unless the user explicitly says it's now confirmed.
Unlike `foundAt`, an item card only shows the rumor line at all when `rumor` is actually set
(no "not yet known" placeholder), rendered in a distinct italic/amber style
(`.item-card-section-rumor`) labeled "Rumor (unverified)" so it can never be mistaken for a
confirmed `foundAt` line at a glance.

**`item.readText`** is the full text of a readable note/letter item, distinct from
`description` (the card's own short flavor line) — `readText` is the longer content revealed
only after actually reading the note in-game. Rendered as its own section
(`.item-card-section-note`, quoted-letter style: italic with a left accent border) labeled
"Note text", right after the flavor/effect section. Preserve the note's own paragraph breaks
by embedding literal `\n` characters in the JSON string — `renderItemCardHTML` converts each
`\n` to `<br>` after escaping (this is the one field where that matters). Also included in
`itemSearchHaystack` so note contents are searchable. Use this same field for any future
readable book/letter/scroll item.

## Known CSS gotchas

`.content-inner img` (in `style.css`) sets `display: block` on every image rendered inside
page content, with specificity `(0,1,1)`. A bare class selector like `.some-class` has
specificity `(0,1,0)` and will lose to it silently. If a new img-related style in the
Item Database (or a future feature) doesn't seem to apply, check this first — either raise
specificity (`.content-inner .my-class`) or, more robustly, control visibility via inline
styles set from JS rather than relying on a CSS class toggle.

**`.layout` needs an explicit `width: 100%`.** `.layout` is `display: flex` with
`align-items: flex-start` (needed for the desktop sidebar+content row so the sidebar column
doesn't stretch to content's height), and also has `margin: 0 auto` for its `max-width: 1600px`
desktop-centering trick, while itself being a flex item of `<body>` (the sticky-footer
trick). Per the flexbox spec, **left/right `auto` margins on a flex item suppress cross-axis
`align-items: stretch`** — with stretch suppressed, `.layout`'s width falls back to
shrink-to-fit sizing based on its children's content instead of filling `body`'s width,
which is unstable and most visible right after a client-side re-render swaps in different
`.content-inner` HTML (clicking through Item Database → Armor → Cloth reproduced it
reliably; a fresh page load usually looked fine, which made this hard to pin down). Fixed by
giving `.layout` an explicit `width: 100%` — a definite width isn't subject to the
stretch-vs-shrink-to-fit ambiguity at all. If any other element ever needs `margin: 0 auto`
centering while also being a flex item of a flex container, give it an explicit `width: 100%`
(or a definite width) for the same reason — don't rely on `align-items: stretch` alone once
auto margins are involved. (An earlier, narrower patch — `align-items: stretch` inside the
mobile media query only — masked the symptom at ≤900px without addressing the same bug at
wider widths; it's harmless and still in place, but the `width: 100%` fix above is what
actually matters.)

## Mobile / narrow-viewport layout

Three changes, all scoped to media queries so desktop (>900px) is untouched:

- **Structural breakpoint at 900px** (`.layout { flex-direction: column }`, sidebar
  stacking, table/column-width tweaks) — raised from an earlier 780px, which left an awkward
  dead zone where the sidebar still took its fixed 230px desktop column width alongside
  content, squeezing everything into a cramped single column even at widths that weren't
  really "mobile" by any reasonable definition.
- **The `.layout` width fix above** — the actual root cause of a "looks absolutely awful in
  tall narrow format" report, not just the breakpoint threshold.
- **Sidebar nav in stacked mode restyled as rounded pill chips** (`.sidebar-link` gets a
  background + `border-radius: 20px` inside the mobile query) instead of plain wrapped
  text, so the flex-wrap nav row reads as tappable buttons rather than loose floating words.
- **`@media (max-width: 480px)` tier** for real phone widths: tighter padding at every layer
  (`.layout`, `.sidebar`, `.content`, `.content-inner`, `.header-inner`) so panels sit close
  to the screen edges instead of floating as small islands surrounded by background art,
  plus `background-attachment: scroll` (the site-wide fixed background is known to be
  janky/inconsistent on mobile browsers, and pointless once panels fill nearly the whole
  viewport anyway).

## Splash screen

A full-viewport gate (`#splash-screen` in `index.html`) shows in front of everything on
every fresh page load — the site's actual name, "Petrichor's Monsters and Memories Wiki",
lives here (the header/`<title>` still just say "Game Wiki", untouched). Background art is
`images/splash-hero.jpg`, converted from a `.webp` the user dropped in `images/Inbox/` —
**note for future sessions: `System.Drawing` (GDI+) cannot load `.webp` at all ("Out of
memory" is the misleading error it throws for an unsupported format), but
`System.Windows.Media.Imaging.BitmapDecoder` (WPF, `Add-Type -AssemblyName
PresentationCore`) can, since it goes through the OS's WIC codecs instead — use that path
(`BitmapDecoder` to load, `JpegBitmapEncoder` to save) for any future `.webp` input instead
of the usual `System.Drawing` crop/convert helper.**

Clicking **Enter** adds a single `.site-entered` class to `<body>` (`setupSplashScreen()` in
`script.js`) — everything else is driven off that one class in CSS: the splash fades out
while the sidebar simultaneously slides in from the left (`transform`, not `display`/layout
properties, so there's no content-column jump — the splash screen is what hides the
mid-animation state from view). `body:not(.site-entered) { overflow: hidden }` blocks
background scrolling while the splash is up.

**Deliberately shows on every load, not just once per visitor** — no `sessionStorage`/
`localStorage` "already entered" check. This was the simplest reading of the request;
revisit only if the user says the repetition is annoying.

## Layout width

`.layout`/`.header-inner` cap at 1600px so the site doesn't stretch edge-to-edge on huge
monitors, but still uses most of the screen on normal ones. `.content-inner` is capped at
~820px for prose pages (readable line length), but data-driven pages (Item Database, Maps,
Crafting, Monsters) get a `content-wide` class toggled from `loadPage()` in `script.js` that
removes the cap — add that class (or extend the same `page.type` check) for any future
full-width page rather than raising the prose cap.

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

## Community submissions

**Visitors submit through a real form directly on the wiki — never linked out to GitHub,
never need a GitHub account.** This replaced an earlier GitHub-Issue-template-based version
the user rejected specifically because it sent visitors to github.com and required an
account.

- **`pages.json`** has a `"Submit a Screenshot"` entry, `"type": "submit"`, in its own
  `"Contribute"` sidebar category — same `type`-driven routing as Items/Maps/Crafting/
  Monsters/Companions (`loadPage` in `script.js`), just narrower reading-width rather than
  `content-wide` since a form doesn't need the full page.
- **`renderSubmitPage(container)`** in `script.js` builds the actual form: a drag-and-drop/
  click-to-browse screenshot field with a live preview, an optional notes textarea, a
  honeypot field hidden via CSS (`.submit-honeypot`, off-screen rather than
  `display:none` — a real bot-filtering technique, not just a stray unused field), and a
  submit button that POSTs a `FormData` (image + notes + honeypot value) straight to a
  Cloudflare Worker via `fetch`. Client-side error handling distinguishes a real API-
  provided error message from a raw network/fetch failure — the latter never shows the
  browser's own wording (e.g. "Failed to fetch") to a non-technical visitor, always a
  friendly fallback instead.
- **Why a Worker at all:** GitHub Pages only serves static files — it cannot run any code,
  so it can't hold the GitHub token needed to open a pull request. A token embedded in the
  page's own JavaScript would be visible to anyone via dev tools, which would let a
  stranger do anything that token can do to the repo. A small serverless function is the
  minimum piece of infrastructure that can hold that secret safely while still giving
  visitors a form that lives entirely on the wiki.
- **`cloudflare-worker/submit-worker.js`** is that function — not deployed by GitHub Pages
  at all (kept in the repo purely for reference/version history/diffing). To actually
  deploy or update it, its contents get pasted into the Worker's own editor in the
  Cloudflare dashboard. It receives the form's `FormData`, validates the file (type/size)
  and checks the honeypot, then uses the GitHub REST API (with a `GITHUB_TOKEN` stored as a
  Worker *secret*, never a plain variable) to create a branch, commit the screenshot into
  `images/Inbox/`, and open a pull request — it never commits to `main` directly. **Merging
  that PR is the accept, closing it (without merging) is the deny** — either way nothing on
  the live site changes until a human decides, and a merged submission still just lands in
  the inbox to go through the normal "check inbox" workflow above, exactly like a
  screenshot the user posts directly.
- **`SUBMIT_WORKER_URL`** (top of the Submit-a-Screenshot section in `script.js`) is left
  empty (`''`) until the Worker is actually deployed — the page detects this and shows a
  plain "not set up yet" notice instead of a broken/silently-failing form. This is a
  one-line edit once the real `workers.dev` URL exists; don't guess or invent a URL here.
- **Setup that has to happen outside this repo** (the site owner's one-time cost, not
  something to build here): a free Cloudflare account, pasting the Worker script in via
  their dashboard, minting a GitHub fine-grained Personal Access Token scoped to *only* this
  repo (Contents + Pull requests, read/write) and saving it as the Worker's `GITHUB_TOKEN`
  secret, then copying the deployed Worker's URL into `SUBMIT_WORKER_URL`. None of this is
  something Claude can do on the user's behalf — creating third-party accounts and minting
  auth tokens are both outside what an assistant should do unattended.
- Kept deliberately mechanical — no LLM call, no auto-generated JSON, just moving the
  screenshot into the repo safely. Extending it to also draft the actual
  `items.json`/`monsters.json` entry automatically would be a future, separate step if ever
  wanted.
- **Confirmed working end to end** with a real test submission (a plain curl POST straight
  to the deployed Worker, bypassing the browser entirely, since CORS only restricts
  *browser* callers — see the security note below) that successfully created a real pull
  request on the repo.
- **Security posture, in case it's asked about again later:** the `GITHUB_TOKEN` never
  leaves the Worker (not logged, not returned in any response), and it's scoped to only
  Contents+PRs on this one repo, so worst-case token exposure can't touch other repos or
  account settings. The Worker's own code is hard-coded to only ever create a new branch +
  one file + one PR — it can't be made to touch `main` or other files no matter what a
  caller sends it. `ALLOWED_ORIGIN`/CORS is *not* real access control (it only stops
  browser-based JS from other sites reading the response; a direct script/curl call can
  still reach the endpoint) — the honeypot field filters unsophisticated bots, but a
  determined scripted caller could still spam junk PRs. That's a nuisance (manual cleanup),
  not a security hole, since nothing reaches the live site without a manual merge. Rate-
  limiting the Worker would close that gap if it ever becomes a real problem — not built
  yet, deliberately deferred until it's actually needed.
- **`images/samples/`** holds a few example screenshots shown directly on the Submit page
  (`SUBMIT_EXAMPLES` in `script.js`) so visitors can see what a *complete* submission looks
  like before they send one. Unlike every other inbox image covered elsewhere in this file,
  these are **permanent site content the page displays**, not archival/pending-review
  material, so they get a folder of their own rather than `images/items/`,
  `images/Monsters/`, etc. Converted to `.jpg` quality 90 same as any other screenshot.
  Clicking a thumbnail opens `#sample-viewer`, a minimal image lightbox (same overlay/
  close-button shell as `#monster-viewer`, just a plain `<img>` with no card data). The
  accompanying copy deliberately emphasizes capturing the *entire* card/window, to cut down
  on submissions with cropped-off text.
  **A `SUBMIT_EXAMPLES` entry can carry an optional `note`** — a short line rendered under
  the label (`.submit-example-note` in `style.css`) for instructions specific to that one
  submission type rather than the shared caption below the whole grid. The gathering-node
  example's note tells submitters to name the file after the node/resource itself (e.g.
  `"Lionleaf.jpg"`), matching the filename-matching convention `gathering-nodes.json`
  images already use. Its sample image is a *copy* of an existing real gathering-node
  picture rather than a reference to it in place, keeping `images/samples/` self-contained
  so a future edit/removal of the real entry can't silently break the Submit page's example.
  Add another example the same way (drop a `.jpg` into `images/samples/`, add an entry to
  `SUBMIT_EXAMPLES`) if a new submission type needs its own sample.
