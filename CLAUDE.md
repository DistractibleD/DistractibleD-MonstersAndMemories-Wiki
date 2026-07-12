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
   `stats`. A resist can be negative (e.g. "SV Corruption: -5", first seen 2026-07-06 on
   "Corrupted Leather Tunic") — store it as a negative number (`{"CORRUPTION": -5}`);
   `statEntries`/`formatSigned` in `script.js` render the sign correctly either way, so
   nothing else needs to change for a negative value. A "Haste: +6%" line goes in its own
   top-level `haste` field (e.g. `"haste": 6`), not in `stats` or `resists` — it's a
   percentage, not a flat bonus. `race` is an array (usually `["ALL"]`) — set it to the
   specific races listed on the card if it isn't ALL. If a card is missing its Race line
   entirely where every other card in the batch had one, that's more likely a cropped
   screenshot than a real absence — leave `race` unset and flag it in
   `images/items-needing-text.txt` rather than guessing `["ALL"]` (see "Lunar Festival
   Trousers", 2026-07-06).
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

Filters (slot/class/race/tags/max size) and search are all derived from `items.json` at
runtime — no other file needs to change when items are added, including when a new tag,
slot, or max-size value shows up for the first time (those dropdowns are populated from
whatever values exist in the data).

**Item Database browsing (2026-07-05):** the page opens on a category grid, one card per
`item.type` (Weapon/Armor/Jewelry/Container/Food/Drink/Misc) with its item count —
`renderItemsCategories` in `script.js`, the same pattern as the Crafting page's tradeskill
grid (`renderCraftingCategories`). Clicking a category drills into `renderItemsList`, which
is the actual search/filter/sort table, scoped to just that category — the old flat
all-items table and its "Type" column/filter are gone, since type is now implied by which
category you're in; the slot/class/race/tag/max-size dropdowns are also scoped to just the
items in that category (so e.g. Weapons' class dropdown doesn't list Jewelry-only classes).
The header search box (global, searches everything regardless of category) still works the
same as before — clicking an item result calls `goToItem`, which now also sets
`pendingItemCategory` (alongside the existing `pendingItemQuery`) so the Item Database opens
directly on that item's category list with the search box pre-filled, instead of landing on
the category grid. Recipe component/result links into the Item Database go through the same
`goToItem` path, so they land in the right category too.

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

  **This retraction is about color-based guessing specifically — it does not apply to an
  actual stated "Trivial" number (2026-07-07).** The user confirmed directly: "Trivial" is
  the skill at which a recipe stops giving skill-ups — i.e. it *is* `recipeSkillLevel` by
  definition, not a guess derived from it. Whenever a source states a concrete Trivial number
  (a recipe card, or a reference table like the ones used for Tanning/Leatherworking/
  Blacksmithing), write it straight into `recipeSkillLevel`. A vague Trivial value (`"?"`, or
  a `"90+"`/`"120+"` floor-only value) still doesn't count — only write in an exact stated
  number. This retroactively upgraded every exact Trivial figure already sitting in
  `crafting-skill-estimates.md` from Tanning and Leatherworking into `recipeSkillLevel` — see
  those tradeskills' entries in `crafting.json`.
- `listOrder` — an integer giving the recipe's position in the game's own crafting-window
  list (1 = first/lowest skill requirement). This is what the Crafting page actually sorts
  by now instead of alphabetically — see the "Crafting window screenshots" workflow below
  for how it's derived and kept as one unbroken sequence per tradeskill.
- `resultQuantity` — set only when a recipe produces more than one of its named result (first
  needed 2026-07-06 for Tanning, see below, where a single pelt processes into "24x Rawhide
  Scraps") — shown on the card as a "Yields" field. Every recipe without this field is still
  assumed to produce exactly one of `name`, same as before this field existed.
- `effect` / `description` — free-text flavor for the crafted result itself (first needed
  2026-07-07 for Alchemy potions/serums/tinctures, which have real use-effects the way an
  item does). Same convention as the matching fields on an item: `effect` for the mechanical
  "On Click. Any Slot. Cast Time: Xs, Level: N" line, `description` for pure flavor text.
  Rendered on the recipe card the same way an item card shows its flavor text — most recipes
  (a sword, a bar of metal) have neither and won't show this section at all.

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

### Tanning is different: no recipes, just vat processing (2026-07-06)

Confirmed by the user: Tanning has no crafting-window entries or recipe cards at all —
instead, any tier-appropriate pelt is dropped directly into a tanning vat to produce scrap
material (Low-Quality pelt → 24x Rawhide Scraps, Medium-Quality → 24x Hide Scraps,
High-Quality → 24x Leather Scraps, one entry per pelt type). These still live in
`crafting.json` as ordinary entries (`name`/`slug`/`tradeskill: "Tanning"`/`components`/
`resultQuantity: 24`), just without `difficultyColor`/`observedAtSkill`/`listOrder` — there's
no in-game screenshot to source those from, so they're left unset rather than guessed.

Since a Tanning "recipe" card would otherwise look like any other simple one-component
recipe, with nothing on the page explaining *why* there's no image/difficulty/list order, a
tradeskill can carry an optional `note` field in `tradeskills.json` (Tanning has one,
explaining the vat mechanic) rendered as a callout right under the tradeskill's `<h1>` in
`renderCraftingRecipes` — extend to another tradeskill the same way if it ever needs a
similar structural explanation.

The only source available for the pelt→scrap mapping itself was a screenshot that looks like
a fan-wiki table (sortable-column styling, hyperlinked names), not the live game or an
in-game window — per "The user's screenshots are the source of truth" above, that makes it
weaker than a normal capture for anything *not* stated outright. Its "Trivial" skill column
was originally recorded only in `crafting-skill-estimates.md` rather than `recipeSkillLevel`,
but per the 2026-07-07 clarification above (Trivial *is* recipeSkillLevel, not a guess), the
two exact values from that table (25 for Low-Quality, 50 for Medium-Quality) have since been
promoted into `crafting.json` directly; the `>50` High-Quality value stays a floor-only note
in the estimates file since it isn't an exact number.

### Blacksmithing was populated from reference tables too (2026-07-07)

Same fan-wiki-style tables as Leatherworking/Tanning (sortable columns, hyperlinked names,
"Crafting Bench"/"Scrapping" columns) gave the full Copper→Bronze→Iron→Steel progression:
chain/plate armor, weapons, shields, base materials (chain links/plate/fasteners/tread/
stirrups/cauldron), sharpening/weight stones, mount barding, and a repair chain (Corroded/
Rusty gear + metal scraps → "Tarnished" gear, all confirmed Trivial 20 in these tables).
Exact Trivial numbers went straight into `recipeSkillLevel` per the clarification above;
`"?"` or `"200?"`-style uncertain values were left unset rather than guessed.

One thing from that same batch was deliberately **not** turned into a recipe card:
- A "Tarnished Weapon Upgrades" table literally titled "(Needs Updates)" in the source and
  using generic placeholder names ("Rusty Weapon" → "Tarnished Weapon") instead of real item
  names — the source itself flags it as incomplete.

If this turns out to matter later, the screenshot would need to be re-requested since it was
deleted from `images/inbox/` once the rest of the batch's usable data was extracted (per the
usual rule below).

**Reversed 2026-07-08:** the "Hammer and Chisel Master List" table (worn gear + Hammer and
Chisel → raw scraps) was originally excluded from `crafting.json` for the reason above —
salvaging an item you already made for its materials back doesn't fit the normal
components-produce-a-new-item recipe model. The user explicitly asked to add it anyway
("these recipes are for dismantling crafted gear and weapons to their components, and is a
part of the Blacksmithing crafting"), so it's now in `crafting.json` as 93 ordinary-shaped
Blacksmithing recipes: `components` is `[{ the worn item, quantity 1 or 2 }, { "Hammer and
Chisel", quantity 1 or 2 }]`, and `name` is the scrap result. Since a handful of source items
salvage into *two* different scrap types in different quantities (e.g. a weapon giving both
tier-metal scraps and tier-hide scraps) — which the existing `resultQuantity` field can't
express (it's one number for one named result) — those recipes fold both into the `name`
string itself, `"<Item> (xN) & <Item> (xM)"`, the same workaround already used for
Disenchanting's variable-output recipes (see above). Many of the 93 share an identical `name`
(e.g. dozens are just "Iron Scraps") since the *source* item differs, not the result — this
is expected, not a data error; `slug` still disambiguates each one (`<result>-from-<source>`).
The source table is a fan-wiki-style reference (see the "weaker than a normal capture" caveat
elsewhere in this file), and it was recorded verbatim even where a row looks internally
inconsistent — e.g. "Copper Plate Boots" and "Copper Longsword" salvage into *Bronze* Scraps
rather than Copper Scraps like every other Copper item in the table, and "Tarnished Bronze
Mace" is the only weapon in its tier that doesn't also yield Rawhide Scraps. Don't
"correct" these to match the surrounding pattern without a re-confirming screenshot — the
table might just be wrong, or the game might genuinely be inconsistent here.

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

Workflow when asked to process new items (or "check the inbox"):

1. List `images/inbox/` — each file there is one unprocessed screenshot.
2. For each one: read the image and figure out whether it's an **item** (the stat-card
   popup style used elsewhere in this doc), a **map** (a game map/zone image, no stat
   card), a **recipe** (a single crafting card, same popup style as an item but with a
   "Components:" list), a **crafting window** (the in-game tradeskill window listing
   many known recipes at once, e.g. titled "Leatherworking" with a skill number at the
   bottom), or a **monster** (a picture of a creature, no stat card at all — see "Adding a
   monster" below) — then follow the matching path below.
3. Once a file has been moved out (to `images/items/`, `images/Maps/`, `images/crafting/`,
   or `images/Monsters/`) or deleted as a duplicate, `images/inbox/` should no longer contain
   it — an empty inbox means everything is processed.

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

**Monsters:** a plain picture of the creature (its name floating over the model, no stat
card) — see "Adding a monster" below for the **2026-07-07 named/boss-only picture policy**:
most monsters (generic "a desert bat"/"a large rat"-style mobs) won't have a picture at all,
and that's expected, not a gap to fill. Map, level range, and drops come from whatever the
user says directly in chat alongside the picture (counts as authoritative, same as a
screenshot — see "The user's screenshots are the source of truth" above), not from the image
itself — **except** drops, which are usually shown directly via a loot-window screenshot
(the in-game corpse-loot UI, one item icon per slot) paired with a plain item card for each
icon (first seen 2026-07-07 for "a desert bat"/"a large rat"/"a young crypt scarab"/"a rotting
skeleton") — read the item card to get the exact name rather than guessing from the icon
alone, and process/add that item to `items.json` the same as any other new item in the same
inbox batch (these are very often raw materials already referenced as plain-text, unlinked
components elsewhere, e.g. "Raw Rat Meat" in a Cooking recipe — adding the real item makes
that link resolve automatically). A monster's loot window can take more than one screenshot
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
   (name/slug at minimum, since image is now optional even for a finished entry) rather than
   blocking on the rest — every field beyond name/slug is optional, see "Adding a monster"
   below.

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

## Adding a monster

Introduced 2026-07-06 as a new main category, alongside Items/Maps/Crafting. The Monsters
page (`pages.json` entry with `"type": "monsters"`) is a two-level drill-down as of
2026-07-11 (see "Named vs. regular, browse-by-zone restructure" below for why) — a
top-level category grid (`renderMonstersCategories`) split into two areas, then a
sortable/searchable table (`renderMonstersList`) scoped to one area + zone at a time. Each
list is sorted alphabetically by name by default; click the Map column header to sort by
that instead.

`monsters.json` schema — only `name`/`slug` are required, everything else is optional and
fills in as the user provides it:

- `image` — picture of the creature, dropped into `images/Monsters/` (see that folder's
  README.txt), same `.jpg` quality-90 convention as item/recipe screenshots. Shown in the
  monster viewer modal, not the table. **The user's explicit call (2026-07-07): only Named
  monsters/bosses get a picture** — screenshotting and uploading one for every generic mob
  ("a desert bat", "a large rat," etc.) is too much ongoing effort for too little payoff.
  A generic monster is expected to have no `image` at all; that's the normal case, not a gap
  to flag or ask about. `openMonsterViewer` already renders fine with no picture (no broken
  `<img>`, per the existing "everything beyond name/slug is optional" design) so this needed
  no code change, just a data-entry convention. Only prompt for/expect a screenshot when the
  monster is clearly a unique/Named spawn or boss.
- `maps` — array of map names the monster's been seen on (usually one, but kept as an array
  in case the same monster template turns out to spawn in more than one zone). Not
  necessarily tied to a `maps.json` entry — just plain text naming the zone. Must match a
  real top-level map (i.e. a `maps.json` entry) — a named sub-area within a map (e.g.
  "Necropolis" within "Night Harbor") is **not** a map of its own and goes in `areas` instead
  (see below), not appended into the map string. This was a real mistake, corrected
  2026-07-12: several monsters had `"Necropolis (Night Harbor)"` as their map, which the user
  clarified was misleading — Necropolis isn't its own map, just an area inside Night Harbor —
  so those entries were fixed to `"maps": ["Night Harbor"], "areas": ["Necropolis"]`. The user
  warned they'd keep reporting other Night Harbor monsters by their sub-area the same way, and
  this was confirmed the same day: a second batch (2026-07-12) added a "North Gate" area, and
  two monsters already known from Necropolis (desert bat, large rat) turned out to also spawn
  at North Gate — hence `areas` being an array from the start rather than a single string.
  Applied the same way 2026-07-12 to a different map: "In Infected Crypt 1.png"/"Broodmother
  boss from Infected Crypt.png" named a location "Infected Crypt" that isn't its own
  `maps.json` entry, but "Ancient Crypt" already is — by the same reasoning as Necropolis, this
  was treated as `"maps": ["Ancient Crypt"], "areas": ["Infected Crypt"]` rather than inventing
  a new top-level map, flagged with a rumor note since (unlike Necropolis) the user hasn't
  explicitly confirmed this particular relationship yet.
- `areas` — optional array of confirmed sub-area names within the monster's `maps` (e.g.
  `["Necropolis"]`, or `["Necropolis", "North Gate"]` for a monster seen in more than one).
  Same idea as `maps` being an array for multi-zone monsters. A more specific single-spot
  callout ("The Concourse of Souls", say) is finer-grained still and belongs in `rumor`/prose
  instead — `areas` is for the coarser, confirmed subdivision the user actually names.
  Unlike `rumor`, this is treated as confirmed (the user states it directly, same authority
  as a screenshot — see "The user's screenshots are the source of truth" above), so it's its
  own field rather than being folded into the unverified-styled `rumor` text. Rendered on the
  monster card as an "Area" field right below "Map" (`openMonsterViewer` in `script.js`,
  comma-joined), and included in `monsterSearchHaystack` so it's searchable. Does not affect
  zone-grid grouping on the Monsters page — that's still driven by `maps` (specifically
  `monsterZone()`, which reads `maps[0]`), not `areas`.
- `levelRange` — a plain string like `"5-8"`, not a structured min/max. The user's own
  explicit call (2026-07-06): every level range they add is a guess, not a confirmed in-game
  value, so the page says so directly in its intro text rather than presenting them as fact.
  Kept as a free string rather than numeric fields since nothing currently needs to filter by
  level, only display/sort it loosely (`renderMonstersPage` sorts by the leading number via a
  regex, monsters with no range at all sort last). **Con color reference (2026-07-07):** in
  this game a White con means the monster is the same level as the player looking at it — if
  the user reports a monster conning White to a character of a known level, that pins down
  (not just estimates) that monster's level exactly, and is strong enough to write directly
  into `levelRange` as a single number rather than a guessed span. **Other con colors
  (2026-07-07):** the exact level-difference each non-White color represents isn't known yet
  (don't assume it maps 1:1 to EverQuest's scale — same caution as the tradeskill
  trivial-skill formula elsewhere in this file). A monster conning Yellow (higher level) to a
  character of known level N is recorded as `"N+"` (e.g. Yellow to a level-1 character →
  `"2+"`) — an open lower bound, not a guessed exact number or span. Revisit this once/if the
  user provides the actual color-to-level-difference scale for this game. **Full con-color
  order confirmed (2026-07-07):** low to high, it's Light Green, Light Blue, Dark Blue,
  White, Yellow, Orange, Red — the same seven colors already used for crafting recipe
  difficulty (see the `difficultyColor` bullets under "Adding a crafting recipe" above),
  just with "Light Green" standing in for that scale's plain "Green" as the trivial end.
  Confirmed meanings so far: **Light Green** is trivial — the player gets no XP for killing
  that monster; **White** is the same level as the player (see above, pins down an exact
  level); **Red** is much higher level than the player, close to impossible to solo. The
  exact level-difference each color (Light Blue/Dark Blue/Yellow/Orange) represents isn't
  known yet — same rule as Yellow's `"N+"` above applies to any of these when a specific
  monster's con comes in: record what's actually known, don't invent a number a color alone
  doesn't confirm.

  **`levelRange` display hidden (2026-07-07):** the user asked to stop showing level range
  anywhere on the site until a more reliable conning method is found — same reasoning, and
  the same pattern, as the crafting difficulty badge removal above (a value derived from an
  unreliable/unconfirmed method shouldn't be presented as if it were fact). The "Level
  Range" column is gone from the Monsters table (`renderMonstersPage`/`renderMonsterRows`,
  now 2 columns instead of 3, `col-monster-level` removed from `style.css`), its sort option
  is gone (`monsterSortValue` no longer has a `'level'` case), and the "Level Range" field is
  gone from the monster viewer card (`openMonsterViewer`). **Keep recording `levelRange` in
  `monsters.json` as before** (per the White/Yellow/Light-Green/Red con-color notes above) —
  this is a display-only removal, not a data one, exactly like `difficultyColor` for crafting
  recipes. Revisit showing it again once/if the user has a more reliable conning method.
- `drops` — array of `{ "item": "Name As Shown" }`, exactly the same shape and the same
  dynamic-linking convention as a recipe's `components` (see "Adding a crafting recipe"
  above): matched against `items.json` by exact name at render time
  (`findItemByName`/`goToItem`), clickable if a matching item exists yet, plain text if not —
  don't resolve/store the link at data-entry time, let it resolve automatically once/if that
  item gets added. Sourced from a loot-window screenshot (the in-game corpse-loot UI) paired
  with a plain item card per icon — see the inbox workflow below.
- `relatedMonsters` — array of `{ "label": "Display Text", "slug": "other-monsters-slug" }`,
  first added 2026-07-07 for a Named boss whose loot flavor text ties it to an existing
  generic mob (e.g. Night Terror's Wing: "A wing from the giant bat known as Night Terror" —
  the user asked to cross-link it to "a desert bat"). Rendered on the monster card as a
  "Place Holder" field (the user's own label for this — not a placeholder in the "TODO" sense,
  it's the literal display label) with each `label` as a link to that other monster's own
  viewer, same dynamic-resolves-at-render-time convention as `drops`/`components` (via
  `findMonsterBySlug`) — if the referenced slug doesn't exist (yet), it just renders as plain
  text instead of a link. Optional; most monsters won't have this.
- `rumor` — same field/semantics as `item.rumor` (see "Item and recipe cards" below): a
  free-text, explicitly unverified note (spawn conditions, believed source, anything the
  user *thinks* but hasn't confirmed), first added 2026-07-07 for Night Terror ("Spawns in
  The Concourse of Souls (Necropolis/Night Harbor), only at night, after the Desert Bat
  placeholder mobs there are killed" — from a user-marked map snip). Rendered on the
  monster card only when set, in the same amber/italic `.item-card-section-rumor` style as
  an item's rumor line, labeled "Rumor (unverified)" so it's never confused with confirmed
  fields like `maps`/`levelRange`/`drops`. Never promote a monster's `rumor` into a
  confirmed field yourself — only the user saying it's confirmed does that.

**A `drops` entry can be name-only, inferred rather than screenshot-confirmed, when the
user explicitly asks for that (2026-07-07):** "a rotting skeleton" originally had 4
confirmed "Rusty [Weapon]" drops from loot-window screenshots (Great Scythe, Battle Axe,
Maul, War Lance). The user then asked to add "the rest of the rusted weapons," inferring
the names from the naming pattern of the game's Bronze/Iron/Steel Blacksmithing weapon
tiers (`crafting.json`), which all share the same 16 weapon types (Dagger, Shortsword,
Throwing Dagger, Axe, Battle Axe, Scimitar, Scythe, Longsword, Spear, Trident, Mace,
Warhammer, Great Scythe, War Lance, Greatsword, Maul) — the 12 not already confirmed were
added the same way (`"Rusty [Type]"`, no material prefix, per the user's separate
confirmation that Rusty weapons never carry a material name like the Rusty Iron/Rusty
Copper armor-repair components do). These 12 have no matching `items.json` entry yet (no
stats known), so they render as plain, unlinked text until a real card comes in — same as
any other not-yet-added component/drop name. This was originally a one-off exception to
"only the user's screenshots/chat are authoritative," but the user generalized it into a
standing rule on 2026-07-12 (see "Quality-set drop inference" below) — the exception note
above is kept for historical context (it's what the rule was first modeled on) but the rule
itself is no longer one-off.

### Quality-set drop inference (2026-07-12)

**Standing rule, stated by the user:** "If a monster drops 1 piece of an item quality set
(like Rusty weapons or Tattered armor), assume that mob can drop any of the other items in
that quality range." Unlike the Rusty-weapon bulk-add above, this doesn't need to be
re-requested each time — apply it automatically whenever new inbox data confirms a monster
drops at least one item from a recognized quality-set family.

- A "quality set" is identified by a shared name prefix denoting a tier/material, not a
  literal in-game grouping — confirmed families so far: **Rusty** (weapons + Rusty Tower
  Shield), **Tattered Cloth** (armor), **Tattered Rawhide** (armor). Treat a new shared
  prefix as its own family the same way if one shows up.
  - Known Rusty pieces (18): Dagger, Shortsword, Throwing Dagger, Axe, Battle Axe, Scimitar,
    Scythe, Longsword, Spear, Long Spear, Trident, Mace, Warhammer, Great Scythe, War Lance,
    Greatsword, Maul, Tower Shield. "Long Spear" (added 2026-07-12, from "a smuggler"'s own
    loot window) is a distinct, separate 2H weapon from "Spear" (1H) — not a naming variant of
    it — but still counts as the same Rusty-prefixed quality-set family per this rule's own
    prefix-based definition.
  - Known Tattered Cloth pieces (8): Cap, Gorget, Pantaloons, Shirt, Gloves, Bracer, Boots, Robe.
  - Known Tattered Rawhide pieces (7): Gorget, Belt, Mask, Gloves, Bracer, Boots, Vest. Gloves/
    Bracer/Boots/Vest were all added 2026-07-12, sourced from Toma the Two-Faced's and "a
    wererat"'s own loot-window screenshots.
- The backfill is **per-monster**, based on the *global* known roster of a family (not just
  what that one monster's own screenshots have shown) — if Monster A is newly confirmed
  dropping one Tattered Cloth piece, it gets every *other* Tattered Cloth piece already known
  from *any* monster, not just pieces it's personally been seen dropping. First applied
  2026-07-12: "an ashira warrior" (confirmed dropping Rusty Warhammer/Axe and Tattered Cloth
  Cap/Pantaloons) got the full remaining Rusty and Tattered Cloth rosters backfilled; "an
  ashira lookout" (confirmed dropping one Rusty Trident) got the rest of the Rusty roster;
  and two *existing* monsters that already dropped some Tattered Cloth pieces — "a rotting
  skeleton" and "a Bloodynose quarreler" — retroactively got the pieces they were missing
  (Cap/Gorget/Boots and Cap/Pantaloons/Shirt/Gloves/Bracer/Boots respectively) once those
  pieces became known via a different monster's screenshot.
- **Second wave, 2026-07-12 (same day):** "a wererat" (new monster, Shaded Dunes/Smugglers
  Camp) had loot-window screenshots confirming Rusty Dagger/Scythe/Warhammer/Tower Shield,
  Tattered Rawhide Bracer/Boots/Vest (three brand-new Rawhide pieces), and Tattered Cloth
  Pantaloons — it got the full Rusty (18), Tattered Rawhide (7), and Tattered Cloth (8)
  rosters. "a smuggler" (new monster, same area) confirmed one brand-new Rusty piece, Rusty
  Long Spear, and got the full Rusty roster. Toma the Two-Faced got a loot-window screenshot
  confirming Tattered Rawhide Gloves (a fourth brand-new Rawhide piece, alongside
  Bracer/Boots/Vest above) and was backfilled the full Rawhide roster. Every *existing*
  monster already carrying a full Rusty roster ("a rotting skeleton", "an ashira warrior",
  "an ashira lookout", "an exiled researcher", "a grave robber", "a disgraced friar") got
  Rusty Long Spear appended retroactively; the three of those that already had some Tattered
  Rawhide pieces ("an ashira warrior", "a grave robber", "a disgraced friar") got the four new
  Rawhide pieces (Gloves/Bracer/Boots/Vest) backfilled too.
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
`pendingReturnToRecipe` — see "Header search box" below for the shared
pending-variable-consumed-on-render pattern) so that item's page shows a "&larr; Back to
&lt;monster name&gt;" link; `goToItem`'s second argument now takes either a recipe object
(untagged, the original case) or `{ kind: 'monster', name, slug }`, distinguished by the
`kind` tag so the two "back to" links never collide.

The Monsters page is wired into the header search box the same way Items/Crafting are (see
"Header search box" below) — a "Monsters" results section, `goToMonster` navigating to the
page and flashing the matched row (`pendingHighlightMonster`, same `row-flash` mechanism as
an Item Database search result). As of 2026-07-11, `goToMonster` also sets
`pendingMonsterScope` (`{ named, map }`, derived from the target monster's own `named` flag
and first `maps` entry) so a search result lands directly in the right scoped list instead
of the top-level category grid — same idea as `pendingItemCategory` on the Item Database.

### Named vs. regular, browse-by-zone restructure (2026-07-11)

The user asked for the same category-grid-first browsing pattern Items and Crafting already
have: a separate area for named (boss) monsters vs. regular ones, each subdivided by zone.
This replaced the single flat table + map dropdown from the original 2026-07-06 version.

- **`monster.named`** — a new optional boolean, `true` for confirmed named/boss monsters.
  This has to be an explicit field rather than derived from name casing, because several
  confirmed bosses use the exact same lowercase "a/the X" naming style as regular trash mobs
  (e.g. "a corrupted ashira", "a shimmering shadow", "a pale lieutenant", "a cunning
  privateer" are all bosses per their source reference tables) — there's no reliable
  string-pattern signal to key off. A monster with no `named` field (or `named: false`) is
  treated as regular; every monster added before this date was retroactively marked
  `"named": true` if it came from a table the user explicitly called a boss/named-monster
  list (Vale of Zintar, Shaded Dunes, Night Harbor "rumored" bosses, Night Terror), and left
  unmarked otherwise (the original desert-bat-family regular mobs).
- **`renderMonstersCategories(container)`** — the new top-level view. Two sections, "Named
  Monsters (Bosses)" (skull icon) and "Regular Monsters" (paw-print icon), each a grid of
  zone cards reusing the Item Database's `.items-category-card` styling. A zone card's zone
  is a monster's first `maps` entry, or a fallback `"Unknown Zone"` bucket for the handful of
  monsters with no map recorded yet (`monsterZone()` helper) — clicking a card calls
  `renderMonstersList(container, { named, map })`. Also has its own quick-search box
  (`#monsters-quick-search-box`), same pattern as the Item Database's and Crafting's.
- **`renderMonstersList(container, scope)`** — the original table (search box, sortable
  Name/Map columns, click-to-view modal), just filtered down to
  `monster.named === scope.named && monsterZone(monster) === scope.map`, with a back link
  to the category grid instead of a map filter dropdown (redundant now that zone is fixed by
  the scope).
- Two new icons, `boss` (skull) and `paw` (paw print), added to `ICON_DEFS`/`ICON_BG` — used
  once per section heading and once per zone card within that section (zones themselves
  don't have their own icons, so every card in a section shares its section's icon).
- **Gotcha hit while building this:** `goToMonster`'s zone fallback must match
  `monsterZone()`'s fallback exactly (`"Unknown Zone"`, not `null`/`undefined`) — using a
  different fallback there caused `renderMonstersList` to call `escapeAttr(null)`, which
  throws (`.replace` on `null`) and gets silently swallowed by `loadPage`'s catch block,
  surfacing as a blank "Page not found" instead of a visible JS error. Worth remembering if
  a future pending-scope-style feature hits the same silent-failure shape.

**Zone drill-down uses a hash sub-route, not a pending variable (2026-07-12 fix).** The
first version of this feature used a `pendingMonsterScope` variable (matching the
`pendingItemCategory` pattern elsewhere) to jump straight into a zone list. The user then
pointed out a real UX problem: since switching between the category grid and a zone list
never changed the URL, the browser's own Back button had no "Monsters" state to pop to —
pressing Back from a zone list skipped straight past the category grid to whatever page was
open *before* Monsters (e.g. Maps), instead of letting the user pick a different zone.

Fixed by encoding the zone scope directly in the hash as a sub-route —
`#monsters/named/<url-encoded map>` or `#monsters/regular/<url-encoded map>` — so drilling
into a zone is a real navigation the browser tracks, not just an in-page function call.
`pendingMonsterScope` is gone entirely; `goToMonster`, the zone-card click handler in
`renderMonstersCategories`, and the "back to categories" link all just set `location.hash`
now, and `renderMonstersPage(container, file)` parses the sub-route (`file.split('/')`) to
decide whether to render the category grid or a scoped list. This required two other spots
to learn about the sub-route too: `loadPage`/the `hashchange` listener now match pages by
the part of the hash *before* the first `/` (so `"monsters/named/X"` still resolves to the
Monsters page entry), and `init()`'s startup routing does the same so a direct link/reload
into a zone URL still lands on the right zone instead of falling back to the first page. No
other page currently uses a hash sub-route, but this is the pattern to reuse if one needs
the same "drill-down should be Back-button-navigable" behavior later.

## Adding a Beastmaster companion

Introduced 2026-07-10 as a new main category alongside Items/Maps/Crafting/Monsters. The
Companions page (`pages.json` entry with `"type": "companions"`) shows every tamed-pet type
the Beastmaster class can summon, rendered as item-card-style cards (`renderCompanionCardHTML`
in `script.js`, reusing the plain gold `.item-card` styling — not the teal recipe variant,
since companions aren't a crafted/tradeskill thing) rather than the raw screenshots they were
sourced from. This was an explicit user request: "Use the same style as we did with items, no
need to use actual screenshots."

Two data files, both flat arrays like every other `*.json` in this repo:

- `companions.json` — one entry per tamed animal type: `name` (e.g. "A Bear Companion"),
  `slug`, `animal` (a lowercase icon key — see below), `observedAtLevel` (the pet's level in
  the screenshot it was captured from — recorded as an observation, not asserted as a fixed
  per-species level, since the four companions seen so far are at four different levels with
  no indication they're pinned to a fixed value), and `skills` — an array of that companion's
  *own* unique ability/abilities only (see below).
- `companion-skills.json` — the abilities every companion shares regardless of animal type.
  Confirmed identical (same name/description/cooldown/range) across every companion's pet
  window so far: **Provoke** (Martial Ability, threat generation) and **Bite** (Might Ability,
  a physical damage attack). Recorded once here instead of being repeated on every companion
  entry — the user's own words: "i think that all pets have Provoke and Bite so i will only
  link the last pet-skill for each pet." Rendered as a "Shared Abilities (Every Companion)"
  reference block above the companion grid (`renderCompanionsPage`), same idea as
  `renderGemstoneTablesHTML`'s Jewelcrafting gem table — general knowledge not tied to one
  entry, shown once rather than duplicated on every card.

A skill object (used in both files) is `{ name, type, description, castTime, cooldown, range
}` — `type` is "Martial Ability" or "Might Ability" as shown on the ability tooltip, `range`
is omitted for self-cast/no-range abilities (e.g. Mighty Roar). This intentionally drops some
of the pet-ability tooltip's boilerplate lines (Innate, Does Not Trigger Global Cooldown,
Requires Line of Sight on Cast, Cannot Fizzle, Resist Element) — true of every companion
ability seen so far, so not worth a field each; only the fields that actually vary/matter
for a reader are captured, the same curation `renderItemCardHTML` already applies to item
stats.

**Screenshots are not archived for this category, unlike items/recipes/monsters.** A pet's
screenshot batch is several stacked UI windows (the Pet window plus one tooltip per ability)
captured across multiple messages — a reference capture, not one clean per-entry card — so
per the user's explicit "no need to use actual screenshots" instruction, and matching the
existing precedent for a crafting-window screenshot (see "Crafting window screenshots" under
"Adding a crafting recipe" above: processed for data, then deleted, never saved), these are
processed for their data and deleted from `images/inbox/` rather than moved anywhere.

**Icons:** four new `ICON_DEFS`/`ICON_BG` keys (`bear`, `rat`, `crocodile`, `spider`) in the
same flat-silhouette-in-a-colored-circle style as every other icon (see "Item and recipe
cards" below) — a companion's card icon is just `svgIcon(companion.animal)`, no separate
lookup table needed since `animal` doubles as the icon key directly. Add another animal key
the same way when a new companion type comes in (dog, wolf, snake, etc. are all plausible
future Beastmaster pets going by the class's usual EverQuest-inspired kit, though nothing
about this game's actual roster is confirmed beyond the four seen so far).

The Companions page has its own local search box (name/animal/ability text — same
`companionSearchHaystack` + substring-filter pattern used everywhere else in this file) and
is wired into the header search box the same way Monsters is (`goToCompanion`,
`pendingHighlightCompanion`, `.card-flash` — a new gold-accent flash animation, since
`.recipe-flash`'s teal doesn't match a plain `.item-card`).

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
of 2026-07-04 and said they'd bring a different reference later for another pass.

**Second pass (2026-07-06):** the user brought a new, much more detailed reference sheet (a
full "Monsters & Memories" equipment icon chart — weapons, armor by slot/material, shields,
tradeskills, etc.) and asked to switch back to solid silhouettes, matching that sheet's
style, but keep the existing color scheme (`currentColor`, so gold on item cards / teal on
recipe cards — no new colors introduced). Scope was deliberately kept to redrawing the
*existing* icon categories only (not the sheet's extra granularity like per-slot armor
icons, magical foci, shield subtypes, or its full 24-icon tradeskill set — those remain
future options if the user asks to expand coverage later). All of `ICON_DEFS` is now plain
filled `<path>`/`<rect>`/`<circle>` shapes with no `stroke`; `.type-icon` in style.css sets
`fill: currentColor` directly (the old `.ic-fill` sub-class from the outline era is gone,
since every shape fills by default now). One gotcha hit while building this pass, worth
remembering for any future icon work: drawing a filled ring/hoop (used for the ring/earring
icons) via a single SVG arc command that sweeps *almost* 360° (endpoint offset by a tiny
epsilon from the start point, a common "full circle from one arc" trick) renders incorrectly
in Chrome — it produced a broken/partial shape instead of a clean donut. The fix was the
standard two-arc-per-circle construction (`M (cx-r) cy A r r 0 1 0 (cx+r) cy A r r 0 1 0
(cx-r) cy Z`, outer and inner circle each built from two semicircle arcs) combined with
`fill-rule="evenodd"` across both — reliable, and what `ring`/`earring` use now. Treat the
current `ICON_DEFS` as settled for the categories it covers unless the user asks to revisit
the style again or expand coverage.

**Third pass (2026-07-08) — supersedes the second pass above.** The user posted another
copy of the "Monsters & Memories" reference sheet and explicitly said to ignore every
earlier icon-design instruction and start fresh from it, covering both item categories and
crafting categories, inventing a matching-style icon for anything the sheet doesn't show.
Two concrete changes from the second pass:
- **Melee weapons are now tilted ~45°** (`<g transform="rotate(45 12 12)">` wrapping an
  otherwise-upright shape) instead of drawn straight up-and-down — the sheet draws every
  one-handed/two-handed weapon on a dynamic diagonal, and this was the most visually obvious
  trait to match. Armor, shields, jewelry, and most tradeskill tool icons stay upright,
  matching the sheet (only a few naturally "swung tool" tradeskill icons — Carpentry,
  Tailoring, Mining, Skinning, Lumberjacking, Stone Cutting, Archaeology — also got the
  diagonal treatment, for the same reason).
- **`TRADESKILL_ICON` now covers every tradeskill in `tradeskills.json`, not just
  Blacksmithing/Tailoring** — about half were drawn straight from the sheet by name match
  (Alchemy, Brewing, Carpentry, Cooking, Fletching, Jewelcrafting, Leatherworking, Masonry,
  Mining, Fishing, Skinning, Enchanting, Tinkering, Woodworking, and "Poison Making" mapped
  to the sheet's "Poisoncrafting" flask+skull icon); the rest of the sheet's tradeskill icons
  had no matching tradeskill in this game's data and were left unused (Baking, Botany,
  Scribing, Engineering, Prospecting, Appraisal, Packing — though Packing's backpack shape
  was reused for the `container` item-type icon, and Botany's leaf shape informed the new
  `herbalism` icon). Every tradeskill this game actually has that the sheet didn't cover
  (Animal Taming, Archaeology, Disenchanting, Farming, Fermenting, First Aid, Foraging,
  Navigation, Pottery, Riding, Smelting, Spellcrafting, Spinning, Spycraft, Stone Cutting,
  Survival, Tanning, Wagoneering, Wilderness) got an original icon in the same flat
  gold/teal-silhouette language, per the user's "create one that fits" instruction — see
  `ICON_DEFS` in `script.js` for the full set.
- A new `scimitar` weapon icon was added (curved blade, distinct from the straight-bladed
  `sword`) since the sheet draws it as its own weapon and this game already has a real
  scimitar item ("Rusty Scimitar") — `weaponIconKey` now checks the name for "scimitar"
  before falling through to the generic sword shapes.
- **The Crafting page's tradeskill grid (`renderCraftingCategories`) shows an icon per card
  for the first time** (`.craft-card-icon`, styled like `.items-category-card-icon` but with
  the teal `--accent-craft`) — previously that grid had no icons at all, name/count only.
  `TRADESKILL_ICON` covering every tradeskill (previous bullet) is what made this possible.
- Armor material icons (`plate`/`chain`/`leather`/`cloth`/`armor`) were redrawn as a shared
  tunic silhouette (shoulders, V-neck, two sleeves) with a per-material treatment layered on
  top — `chain` gets a dot-grid texture, `plate` gets an evenodd-cut center groove + belt
  line, `cloth` gets longer sleeves and a flared hem (robe), `leather` is the plain short-
  sleeve tunic, `armor` (the no-material-match fallback) drops the sleeves entirely — instead
  of each material being an unrelated one-off shape like the second pass.
- Jewelry, food, drink, and the generic crafting-material fallback (`ring`/`earring`/
  `necklace`/`food`/`drink`/`material`) were **not** on the reference sheet and were left
  unchanged from the second pass — they already followed the same flat-silhouette language,
  so redrawing them from scratch wasn't needed to "match" a sheet that doesn't cover them.

**Fourth pass (2026-07-08, same day) — supersedes the third pass above.** The user posted a
second, much more precise reference sheet the same day and said they really liked its look
and to match it as closely as possible. Unlike the third pass's sheet, this one showed **all
38 tradeskills by their exact in-game names** (no inventing needed for any of them) and
rendered every icon as **a colored circular badge** (a muted, material-associated background
color per category — stone grey, leather brown, slate blue, etc. — with a cream glyph on
top), not a flat single-color silhouette. This changed the actual rendering architecture, not
just individual shapes:
- **`ICON_DEFS[key]` is now glyph-only markup; a parallel `ICON_BG[key]` map holds each
  icon's background hex color; `svgIcon(key)` assembles the two** into
  `<svg><circle fill="${bg}"/><g fill="#f3e9d6">${glyph}</g></svg>`. Icons no longer inherit
  `currentColor` from their card — the gold-items/teal-recipes distinction from earlier
  passes is now moot for icon *color* specifically (card names, badges, and borders still use
  gold/teal elsewhere, so items vs. recipes are still visually distinct by those cues).
  `.type-icon { fill: currentColor }` in `style.css` is now vestigial for icon coloring
  (harmless to leave; the `<circle>`/`<g>` elements' own `fill` attributes win) but nothing
  currently relies on removing it.
- **Weapon icons collapsed to the sheet's own coarser categories** — 1H/2H × Bludgeoning/
  Slashing/Piercing, plus Archery and Throwing — since that's all this sheet draws (no
  separate axe/mace/hammer/dagger/scythe/scimitar shapes the way the third pass had).
  `weaponIconKey` was simplified accordingly (`bludgeoning1h`/`bludgeoning2h`/`slashing1h`/
  `slashing2h`/`piercing1h`/`piercing2h`/`archery`/`throwing`/`ammo`), trading away the third
  pass's per-weapon-name visual specificity (a mace no longer looks different from a hammer)
  for fidelity to this sheet — an explicit, deliberate tradeoff per the user's instruction to
  match the sheet as closely as possible, not a regression to fix later.
- Several tradeskill icons changed concept to match this sheet's actual drawings, replacing
  third-pass guesses that turned out to depict something else once the exact sheet was seen:
  Navigation is a ship's wheel (was a compass), Riding is a horse head (was a horseshoe),
  Wagoneering is a covered wagon (was a wagon wheel), Wilderness is mountains (was a pine
  tree), Smelting is a goblet/crucible (was a furnace), Poison Making is a bottle with a
  skull-and-crossbones and a drip (was a plain skull flask), Spinning is a spinning wheel
  (was a thread-wrapped spool), Spycraft is a hooded figure (was an eye-holed mask), Skinning
  is two crossed knives (was one diagonal knife), Farming is a wheat sheaf (was a sprout),
  Survival is a tent (was a campfire), Herbalism is a mortar and pestle (was a leaf), and
  Lumberjacking is a single log (was a log-plus-axe combo, since the sheet's icon is just a
  log — Woodworking already covers tool-in-use imagery).
- **The armor material shapes (`plate`/`chain`/`leather`/`cloth`/`armor`), shields, jewelry,
  food/drink/container, and the generic material fallback kept their third-pass shapes** —
  only their color changed (a background circle was added per `ICON_BG`) — since this sheet's
  Armor/Held sections show the same four materials + shield the third pass had already drawn
  reasonably close to.
- The `craft-card`/`items-category-card` CSS (`.craft-card-icon`/`.items-category-card-icon`
  `color: var(--accent-craft)`/`var(--accent)`) is also now vestigial for the same
  currentColor reason above — left in place, harmless.

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

**`item.rumor`** (added 2026-07-07) is a separate optional free-text field for where the
user *thinks* an item comes from, before it's confirmed — e.g. a guess based on partial
information, someone else's claim, or a hunch, as opposed to `foundAt` which is only ever
set once the user has confirmed the source themselves. Explicitly **not** the same field
and never conflated: don't write a guess into `foundAt`, and don't promote `rumor` into
`foundAt` unless the user explicitly says it's now confirmed. Unlike `foundAt`, an item
card only shows the rumor line at all when `rumor` is actually set (no "not yet known"
placeholder — most items will simply never have one), rendered in a distinct
italic/amber style (`.item-card-section-rumor` in `style.css`) labeled "Rumor
(unverified)" so it can never be mistaken for a confirmed `foundAt` line at a glance.

**`item.readText`** (added 2026-07-12) is the full text of a readable note/letter item —
first needed for "Note from Ariblast" (NODROP, dropped by "a disgraced friar" in Night
Harbor's North Gate area), whose card shows a green "Right-click to read." line in-game; the
user opened it and asked for that revealed text to show on the item's page. Distinct from
`description` (the card's own short flavor line, e.g. "A note from Ariblast to his disgraced
group.") — `readText` is the longer content revealed only after actually reading the note.
Rendered as its own section (`.item-card-section-note` in `style.css`, quoted-letter style:
italic with a left accent border) labeled "Note text", right after the flavor/effect section.
Preserve the note's own paragraph breaks by embedding literal `\n` characters in the JSON
string — `renderItemCardHTML` converts each `\n` to `<br>` after escaping (this is the one
field where that matters; `description`/`effect` have never needed internal line breaks so
far). Also included in `itemSearchHaystack` so note contents are searchable. Use this same
field for any future readable book/letter/scroll item, not just notes specifically.

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
