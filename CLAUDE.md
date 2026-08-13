# CLAUDE.md

Guidance for Claude Code working in this repo. Design-decision history/superseded-attempt
post-mortems live in `CLAUDE-HISTORY.md` instead (not auto-loaded — read on demand); this
file is current rules/schema only.

## What this is

Static wiki for *Monsters and Memories*, GitHub Pages, no build/backend/login. `index.html`
+ `style.css` + `script.js` load content at runtime — Markdown pages (marked.js) or the Item
Database (`items.json`). `README.md` has the full non-technical explanation for the site
owner.

Items/recipes are **displayed** as cards rendered from JSON, not screenshots (see "Item and
recipe cards"). As of 2026-08-04, screenshots are no longer archived for new items/recipes
(game gets rebalanced over time, so an old screenshot stops being a reliable reference) —
pre-2026-08-04 entries keep whatever `.jpg` they already have; nothing new gets saved to
`images/items/`/`images/crafting/`.

## Source-of-truth rule

User's own screenshots/chat-typed stats > external sites (unofficial wiki, MnM Quest, MnM
Classes Map, any fan resource) always. External sources fill gaps the user hasn't posted
about, never override/correct/second-guess something the user actually posted — if they
disagree, say so and ask, don't quietly go with the external source.

## The To-Do folder

`To-Do/` (repo root) = gap-tracking/prediction/"watch for this in game" lists, aimed at
future sessions. Never linked from the site, never loaded by code.

- `To-Do/items-needing-text.txt` — items.json entries missing data (not cropping issues).
- `To-Do/crafting-skill-estimates.md` — speculative skill-requirement guesses, separate from
  crafting.json's real `recipeSkillLevel` (never write a guess into that field).
- `To-Do/crafting-recipes-missing-components.txt` — recipes with no/partial `components`.
- `To-Do/predicted-missing-items.txt` — items inferred from a naming/slot pattern, not a
  screenshot.

Any future list of this kind goes in `To-Do/`, not loose at repo root or in `images/`.
Update an existing file in place rather than duplicating; only start a new file for a
genuinely distinct kind of gap.

## Adding a normal wiki page

1. `.md` file in `pages/`.
2. One `pages.json` entry: `{ "title": ..., "file": "name.md", "category": ... }`.
3. Screenshots in `images/`, referenced as `![alt](images/file.png)`.

Don't touch `index.html`/`style.css`/`script.js` for a normal content page.

## Adding an item to the Item Database

Item Database (`pages.json` `"type": "items"`) is not a Markdown page — searchable/
filterable/sortable table rendered by `script.js` from `items.json`.

1. Add an object to `items.json`. Weapons: `damage`/`delay` (ratio computed at render time,
   don't store it), `twoHanded: true` if card says "Two Handed". Armor/jewelry: `ac` + a
   `stats` object (`{"AGI": 1, "DEX": 2, ...}`). Saving-throw bonuses ("SV Fire: +2") go in a
   separate `resists` object (`{"FIRE": 2}`), not `stats`; can be negative (`{"CORRUPTION":
   -5}`), `statEntries`/`formatSigned` render the sign either way. "Haste: +6%" → top-level
   `haste` field (`"haste": 6`), not stats/resists. `race` array (usually `["ALL"]`) — set
   specific races if card shows them. Card missing Race entirely where siblings had one =
   likely cropped, not a real absence — leave `race` unset, flag in
   `To-Do/items-needing-text.txt` rather than guessing `["ALL"]`.
2. Tag line below name, above "Slot:" (e.g. "MAGIC") → `tags` array, e.g. `["MAGIC"]` or
   `["MAGIC", "UNIQUE", "NODROP"]`; `[]` if none. Known tags: MAGIC, UNIQUE, NODROP, LORE —
   same all-caps spelling/order as the card.
3. Bags/satchels/pouches/backpacks: `"type": "Container"`, `capacity` (int) + `maxSize`
   (Title Case, same values as `size`: Tiny/Small/Medium/Large/Extra Large) instead of
   `ac`/`stats`/`damage`. `slot` is `"Bag"`/`"Belt"`/`"Backpack"`/`"Saddlebag"` (mount-only,
   `race` = mount codes like `["HRS", "DNK"]`) — distinct from `"Waist"` (actual belt armor).
   Multi-slot containers use `"Bag / Belt"` format (same as `"Primary / Secondary"`). Card
   says "Tradeskill Container." → `"tradeskillContainer": true` (TRADESKILL badge).
3a. Mount equipment (saddles/saddlebags/rigging): same as any item, but `"Rigging"`/
    `"Saddlebag"` slots and `race` = mount codes off the card (`["HRS", "DNK"]`) instead of
    player classes/ALL — separate namespace, don't map to player race list.
4. **Don't archive the screenshot** — no `image` field, nothing saved to `images/items/`
   (2026-08-04). Record data into `items.json`, discard the source. Pre-2026-08-04 items
   keep whatever `image` they already have.
5. A green "Enchant..." line (e.g. "Enchant Boots: Minor Agility +1 AGI") is **not** part of
   the item's own description/effect — it's a permanent buff an Enchanting scroll applied to
   that specific item (stays with the item once applied, confirmed 2026-07-17). Leave out of
   `description`/`effect`; record other stats normally. Enchanting scrolls are their own
   `crafting.json` recipes (see "Enchanting" below) — separate from the enchant line showing
   up on an unrelated item later.
6. Food/Drink: `"type": "Food"` or `"Drink"` — no on-card tag, signal is flavor text ("This
   is a modest meal./drink."). Never show Slot/Class/Race, so omit `slot`, but still set
   `"classes": ["ALL"]`/`"race": ["ALL"]` (matches container convention). Raw materials/
   currency with no slot concept (ore, scraps, wood, coins) omit `classes`/`race` entirely
   (`"type": "Misc"`, just `weight`/`size`/`description`) — no "unrestricted" convention
   applies since they're never worn/consumed.

Filters (slot/class/race/tags/max size) and search derive from `items.json` at runtime — no
other file changes when items are added, including new tag/slot/max-size values.

### `item.gameLinkCode` — in-game chat item links

Mirrors a feature on the unofficial Miraheze wiki: linking an item in the game's own chat
box produces client-generated markup (`<link="item|<itemGUID>|<n>">...</link>`) that, pasted
into chat by anyone, renders as a clickable in-game item link/tooltip — this is a client-side
game feature, not something the wiki computes or calls an API for.

- `item.gameLinkCode` — optional, the **exact raw code** as captured from the game (own
  quotes/tags and all), stored and copied verbatim, never reconstructed/simplified by us.
  Source-of-truth is always the user's own in-game test, same as any other confirmed field.
- Item card (`renderItemCardHTML`, rendered only in the full `#item-viewer` modal now — no
  hover preview exists to gate this out of) shows a **"Copy Item Link"** button that copies
  `gameLinkCode` to the clipboard
  (`navigator.clipboard.writeText`, `.copy-game-link-btn` in `setupItemViewer`'s click
  handler) — flashes "Copied!" on success, "Copy failed" on a denied clipboard permission.
- No code yet → button renders `disabled` (grayed out) next to an **"Add a code?"** link
  (`.item-addlink-link`) that calls `goToSubmit({ kind: 'item', name, linkCode: true })` —
  reuses the existing Submit-a-Screenshot form/Worker/`community-notes/` pipeline rather than
  building new infrastructure. `linkCode: true` on the context just changes the banner text
  and shows an extra hint paragraph explaining how to get the code in-game; the Worker itself
  still only ever sees plain notes text (`Regarding: Item — <name> (in-game link code)`).
  Processing a `community-notes/` file with that Regarding line: paste the visitor's code
  into that item's `gameLinkCode` verbatim, same as any other confirmed-field community note.

**Item Database browsing:** one view, `renderItemsList` in `script.js` — search box, "Type"
dropdown (Weapon/Armor/Jewelry/Container/Food/Drink/Misc/All Types), Slot/Class/Race/Tag/Max
Size dropdowns, stat/buff checkbox dropdown, "Show only items that need info" toggle, above
a sortable table. **"Clear all filters"** re-renders via `renderItemsList(container, null)`
with `pendingItemQuery`/`pendingItemFilters` cleared, rather than resetting fields
individually — Type can't reset in place (its own option list is scoped per-type), so this
also means the button never needs updating when a new filter field is added.
`renderItemsList(container, null)` (Type = "All Types") is the default landing state, the
only case showing a "Type" column. Picking a Type re-renders scoped to that type (other
filter options narrow too), carrying *other* filter values across via `pendingItemFilters`
(consume-once, same pattern as `pendingItemQuery` — Type dropdown's change handler also
sets this from the search box, so a typed search survives switching Type) — one hop only,
doesn't follow through a second switch.

Every type uses the same `renderItemsList`. Armor additionally gets a "Material" dropdown
(Cloth/Leather/Chain/Plate/Other, from `armorIconKey`/`ARMOR_MATERIAL_ORDER`/
`ARMOR_MATERIAL_LABELS`) — same conditional-dropdown pattern as Weapon's handedness dropdown.
(See `CLAUDE-HISTORY.md` for the two drill-down UIs this replaced.) Header search box
(global) still works the same — clicking a result calls `goToItem`, which sets
`pendingItemCategory` + `pendingItemQuery` so the Item Database opens on that item's type
with search pre-filled. Recipe component/result links go through the same `goToItem` path.

**Table header cells are icons, not words** (2026-08-12, user's own request — long labels like
"Capacity / Max Size" were wrapping/stacking) — every column except Name renders a small
`currentColor` glyph (`HEADER_ICON_DEFS`/`colHeaderIcon()`, sized for an 18px `<th>`, no
colored background circle unlike `svgIcon()`'s card badges) or a bare symbol (Stats = `#`,
Ratio = `∶`), with a native `title` attribute on the `<th>` spelling out the column in plain
text on hover. Mobile's stacked-card view (<640px) hides `<thead>` entirely and reads labels
from each `<td>`'s own `data-label` instead, so these icons never had to double as the mobile
label — safe to redesign without touching that path. Add a header icon the same way for any
future column: one `HEADER_ICON_DEFS` entry + `title` on the `<th>`.

**Row cells don't split a value mid-word/mid-entry either** (2026-08-13, user-reported twice
in a row — first that narrow columns were breaking "Primary / Secondary" into "Primar-y /
Secon-dary" and the Stats list into "STA" stranded from its own "+2"; then, after a first fix
attempt forced the whole value onto one line with `overflow: hidden` + `text-overflow:
ellipsis`, that short values like "0.1 / Small" started getting truncated to "0.1 / S…" even
though they'd have fit fine wrapped onto two lines — ellipsis was hiding real data, not just
reformatting it). Landed on one consistent approach for both cases: wrap each piece that must
never split in its own `<span class="stat-entry">` (plain `white-space: nowrap`), joined by
ordinary breakable text — a line can still wrap *between* pieces, just never *inside* one,
and nothing is ever hidden behind an ellipsis.
- **Stats** (a comma list) — `formatStatsHTML()` wraps each `"Label +N"` pair in its own
  `.stat-entry`, joined by `, `. `formatStats()` itself stays plain text, still used for the
  search haystack and sort-by-stats.
- **Slot / Weight-Size / Capacity-Max-Size** (each cell is one `"X / Y"` value) —
  `noSplitSlashParts()` splits on `" / "` and wraps each side in its own `.stat-entry`,
  rejoined with a plain `" / "`. Each of these three cells also carries a `title` attribute
  with the full value, mostly redundant now but harmless to keep.
- **Weight/Size column abbreviates "Medium" to "Med"** (display-only, user's own request) —
  `item.size` itself is untouched everywhere else (filters, item cards, search); only this
  one cell's rendered text swaps it, and the cell's `title` attribute still shows the
  unabbreviated `"N / Medium"` on hover.

## Item screenshot format

New items/recipes don't get screenshots archived at all (2026-08-04) — this section now
only matters for monster/gathering-node pictures (displayed on the site) and the untouched
pre-2026-08-04 item/recipe archive.

Saved screenshots (`images/Monsters/`, `images/gathering/`, pre-2026-08-04 item/recipe
archive) are `.jpg` quality 90, not `.png` — card screenshots are flat text over noisy stone
texture, PNG compresses poorly (~350KB), JPEG q90 gets ~65KB with no visible text-legibility
loss. Convert to `.jpg` q90 as part of moving a screenshot out of the inbox.

**Map** images are the opposite: high-quality `.png`, uncompressed — viewed zoomed-in where
JPEG artifacts would show, and few enough that file size isn't a concern. No JPEG conversion
for `images/Maps/`.

## Adding a map to the Maps page

Maps page (`pages.json` `"type": "maps"`) = manifest file, not hand-written HTML. Listed
alphabetically as clickable thumbnails; click opens full-size in a viewer with scroll-zoom
and drag-pan (`renderMapsPage`, `setupMapViewer` in `script.js`).

Source images can be huge (20-40MB), so each entry has *two* images: `image` (full-size, in
viewer) and `thumbnail` (small pre-generated JPEG in the grid).

1. `maps.json` entry: `{ "name": ..., "slug": ..., "image": "images/Maps/<slug>.<ext>",
   "thumbnail": "images/Maps/thumbs/<slug>.jpg" }`. Read the image for its actual in-image
   title (frequently doesn't match filename). Two renderings of the same place (top-down vs
   isometric) → separate entries, disambiguated names, e.g. `"Infested Crypt"` /
   `"Infested Crypt (Isometric)"`.
2. Full-size image into `images/Maps/`, matching `image` field, keep original format.
3. Generate thumbnail into `images/Maps/thumbs/` via PowerShell + `System.Drawing`
   (`Add-Type -AssemblyName System.Drawing`), resize ~480px wide, JPEG quality ~80-85 (no
   Node/Python/ImageMagick in this environment).

**Multiple maps of the same area group automatically.** `groupMapsByArea` strips a trailing
`" (...)"` from `name` to get the shared base — falls out of the disambiguated-naming
convention above, nothing extra to set. Grid shows one card per group: *first* entry added
(maps.json order) as thumbnail, others as small parenthetical-labeled links. Viewer's
prev/next buttons (and arrow keys) step through the group, only render with >1 map.

**`goToMap(mapName)`** jumps to Maps page and opens a specific area's viewer directly, same
`pendingMapOpen`-then-consume-once pattern as `pendingItemQuery`, matched against
`groupMapsByArea`'s base names case-insensitively. Currently called from the Named/Regular
Monsters quick search's zone link — extend the same way for future "jump to this area's
map" needs.

## Adding a crafting recipe

Crafting page (`pages.json` `"type": "crafting"`) = tradeskill-category grid from
`tradeskills.json` (fixed list, edit directly to rename/add/remove); click shows that
tradeskill's recipes from `crafting.json` (`renderCraftingPage`, `renderCraftingCategories`,
`renderCraftingRecipes`). Tradeskill `status`: `"live"` or `"planned"` (planned shows a
badge + explanatory message, no recipe list).

Recipe schema grows as real cards come in — extend the same way for new fields:

- `weight`/`size` — crafted result's, shown on the card (Title Case size).
- `components` — array of `{ "item": "Name As Shown", "quantity": N }`, from the card's
  "Components:" list (`(N) Item Name`). Matched against `items.json` by exact
  case-insensitive name at render time — clickable link if a match exists, plain text if
  not (most raw materials don't have a card yet). Don't resolve/store the link at
  data-entry time — resolves dynamically so it becomes clickable once the item's added.
- Recipe's own `name` gets the same treatment in `renderRecipeCardHTML` — clickable if a
  matching item exists. Clicking either link type sets `pendingReturnToRecipe` before
  navigating to the Item Database, which shows a "&larr; Back to `<recipe name>`" link.
- `difficultyColor`/`difficultyText` — trivial/skill-up status, exact wording confirmed for
  all seven colors: Green "This recipe is trivial to you.", Light Blue "Your skills make
  this a simple task.", Dark Blue "...a moderate task.", White "...a complex task.", Yellow
  "...a daunting task.", Orange "...a herculean task.", Red "You will require all your
  skills to craft this." Match exact card wording; if it doesn't match, flag rather than
  guess a new color. **Still record on every recipe even though the site no longer displays
  the badge** — feeds `To-Do/crafting-skill-estimates.md`'s skill estimates (not loaded by
  code; read before adding new estimates, update it — never `recipeSkillLevel` — as new
  observations come in).
- A recipe card can arrive after a crafting-window capture and disagree — expected, not an
  error (screenshot may predate its upload). Keep freshest `difficultyColor`/
  `observedAtSkill`, but merge in whatever the card newly reveals (`weight`, `size`,
  `components` — timeless info, not a skill snapshot). If unclear which is newer, say so.
- `observedAtSkill` — user's skill in that tradeskill when the screenshot was taken (ask,
  not shown on the card) — data point for the recipe's own skill level, since MnM's exact
  trivial-skill formula isn't public.
- `recipeSkillLevel` — the recipe's exact skill requirement, when determinable precisely.
  **Never derive from a `difficultyColor` observation** — an earlier attempt to treat
  "White" as "recipe skill == crafter's current skill" was tried, found wrong (Green/Dark
  Blue/Light Blue recipes observed even at 0 skill), and fully retracted; every value
  written under that rule was removed. Color is a continuous gradient on the *gap* between
  crafter skill and requirement — relative ordering only, never an exact point. **One narrow
  exception:** Green at `observedAtSkill: 0` → safely `recipeSkillLevel: 0` (skill can't be
  negative, Green = far exceeds requirement, only way from a floor of 0). **This caution is
  about color-guessing only — doesn't apply to a stated "Trivial" number.** "Trivial" *is*
  `recipeSkillLevel` by definition — whenever a source states one concretely (card or
  reference table), write it straight in. A floor-only/vague value (`"?"`, `"90+"`) doesn't
  count.
- `listOrder` — recipe's position in the game's own crafting-window list (1 = lowest skill
  requirement) — see "Crafting window screenshots" below.
- **Skill-required sort fills gaps with a stated estimate.** `estimateRecipeSkill()`
  (computed at render time, cached per tradeskill, never written back) resolves a confirmed
  `recipeSkillLevel` where one exists, else linearly interpolates from the tradeskill's
  "anchors" (recipes with both `listOrder` and confirmed `recipeSkillLevel`) around that
  recipe's `listOrder`. Past the last anchor (or before the first): flat-extends, no slope
  extrapolation. No `listOrder`, or zero anchors in that tradeskill (Jewelcrafting/
  Fletching/Tailoring: 100% listOrder, 0% recipeSkillLevel) → no fabricated number, old
  listOrder-then-alphabetical fallback. Card shows plain number (confirmed) or `~N
  (estimated)` (interpolated) — never presented as fact. Same never-store-a-computed-value
  precedent as an item's damage/delay ratio.
- `resultQuantity` — set only when a recipe yields more than one of `name` (e.g. Tanning: a
  pelt → "24x Rawhide Scraps"), shown as "Yields". Default (no field) = exactly one.
- `effect`/`description` — free-text flavor for the crafted result (Alchemy
  potions/serums/tinctures need real use-effects like an item). Same convention as an item's
  matching fields.
- `station` — optional, which crafting device the recipe uses, when a tradeskill has >1.
  Alchemy: raw herbs grind at a **Mortar and Pestle**, powder+vial combine at a **Cauldron**
  — every Alchemy recipe gets `"station"` set to one of those two exact strings.
  `renderCraftingRecipes` groups the grid into headed sections by `station` (ordered
  `STATION_ORDER` = Mortar and Pestle before Cauldron) when ≥1 recipe has it set; other
  tradeskills render flat, unaffected. **Each station heading is also a collapse/expand
  toggle** — state in a `collapsedStations` Set local to that `renderTradeskillSection` call
  (survives search/filter re-render, resets on fresh page open). Alchemy's Mortar and Pestle
  starts collapsed; every other station starts expanded. Any future `station`-using
  tradeskill gets the toggle for free.
- **Alchemy always shows a Skill field, even with nothing to show** — every other tradeskill
  omits the field when `estimateRecipeSkill()` returns null; Alchemy shows `"Unknown"`
  instead of hiding it, so every card has a Skill row (number, `~N (estimated)`, or
  "Unknown"). A confirmed `0` already displayed correctly (object truthy even at 0).

1. `crafting.json` object with at least `name`, `slug`, `tradeskill`, plus whatever the card
   shows.
2. **Don't archive the screenshot** — same as items (2026-08-04): no `image` field, nothing
   saved to `images/crafting/`. Pre-2026-08-04 recipes keep whatever `image` they have.

### The sidebar can nest pages under a group

`pages.json` entries can carry an optional `"group"` field (e.g. `"Tradeskilling"`) — pages
sharing the same `group` render nested under one plain, non-clickable sidebar heading
(`buildSidebar`). Currently Gathering + Crafting share "Tradeskilling". Add to an existing
group by matching the string; start a new group with a new string — no other code changes,
`buildSidebar` handles any group generically. Consecutive same-`group` pages share one
heading; no-`group` pages render as before.

**Enchanting and Disenchanting are ordinary tradeskills in `crafting.json`/
`tradeskills.json`** — nothing schema-wise sets them apart from Blacksmithing/Alchemy, each
reached as an ordinary category card (Enchanting on Crafting grid, Disenchanting on
Gathering grid), not a page of their own. (Full history of how they got here in
`CLAUDE-HISTORY.md`.) Concretely:

- Enchanting: no `category` in `tradeskills.json`, picked up by `renderCraftingCategories`'s
  normal filter (`ts.category !== 'gathering'`) like any other tradeskill.
- Disenchanting: `"category": "gathering"` (same value as Mining/Lumberjacking/Herbalism/
  Fishing/Foraging), even though it's recipe-based not node-based.
  `gatheringTradeskillIsNodeBased` (shared by both grids' card-count/label and routing)
  derives actual node-based-ness rather than trusting the page-level flag — so
  Disenchanting's card shows a recipe count and routes to `renderGatheringRecipes` while
  every other card shows a node count and routes to `renderGatheringNodes`.
- `craftPageHash(tradeskillName)` decides which hash a tradeskill's recipes live at —
  `'gathering'` for Disenchanting, `'crafting'` for everything else. `goToRecipe`,
  `goToCraftingCategory`, header search links all call it rather than hard-coding a hash.
  Still hardcodes "Disenchanting" by name (harmless today; revisit if a second recipe-based
  Gathering tradeskill gets real recipes).
- Recipe-list rendering (search, needs-info toggle, station grouping, link handlers,
  highlight-on-arrival) is shared via `renderTradeskillSection` — `renderCraftingRecipes`
  and `renderGatheringRecipes` are thin wrappers passing their own grid's `onBack`.

**Disenchanting's magic-dust tier chart** shows above the recipe grid
(`renderDisenchantingDustTiersHTML`, styled like Jewelcrafting's `.gem-reference` panel),
derived from existing Disenchanting recipes (`disenchantingDustTiers()`) — no new schema
field. Each distinct recipe result name (e.g. "Enchanted Powder (x1-5) & Mote of Magic
(x0-2)") names one tier's two outputs, ordered lowest-to-highest by `listOrder`/
`recipeSkillLevel`. Each dust shows its `items.json` image via `findItemByName` when one
exists, dashed "No image yet" placeholder otherwise (most of these 8 dust items have no card
yet — add normally once a screenshot comes in, shows automatically). **What source item
yields which tier isn't confirmed** — chart shows outputs only, don't guess a source-item
mapping without the user confirming one.

### Enchanting recipes carry a slot/type filter no other tradeskill uses

Two extra fields, `Enchanting`-only:

- **`enchantSlot`** — equipment slot a scroll's buff applies to, parsed from the recipe name
  (`"Enchant <Slot>: <Effect>"` → `<Slot>`). Unset for a raw enchanted-material recipe (no
  slot).
- **`craftType`** — `"Scroll"` (buff scroll) or `"Crafting Material"` (raw enchanted
  material: Enchanted Hide/Rawhide/Wool/Cloth/Bronze/Tin/Silver/Copper Bar, fed into another
  tradeskill).

Both drive dropdown filters shown only on Enchanting's view (gated on `tradeskillName ===
'Enchanting'`), values derived from the data (no code change for a new value). A third
dropdown (skill-required vs. alphabetical sort) is on every tradeskill's recipe view now,
not just Enchanting's.

**Enchanting's own crafting-window list is not sorted by skill requirement** — unlike every
other tradeskill, it groups by difficulty *color* first, alphabetically within color second.
Position within a color band carries no finer skill signal, so `listOrder` is deliberately
**not** set on any Enchanting recipe (would misrepresent ordering to
`estimateRecipeSkill()`'s interpolation). `observedAtSkill` still recorded normally.

Most Enchanting recipe-card screenshots (~160-card batch) were cropped (missing Effect-line
tail and/or part of Components) — the boilerplate effect suffix ("(On Click. Any Slot. Cast
Time: 5s. Level: 1)") and cut-off resistance-type words were safely reconstructed since
they're invariant/redundantly confirmed by the recipe's own name — but no stat bonus
*number* was ever invented; where no card showed the actual number, it was left unset rather
than guessed from a "Minor = +1 / Lesser = +2" pattern.

### Gathering tradeskills are a separate area, not recipes

Mining, Lumberjacking, Herbalism, Fishing = **gathering** tradeskills — interact directly
with a resource node (vein, wood pile) rather than combining components, don't fit
`crafting.json`'s shape (no components/single result, but a *minimum skill to attempt* no
crafted recipe has). Own top-level page (`pages.json` `"Gathering"`, `"type": "gathering"`,
above Crafting in sidebar) and data file `gathering-nodes.json`.

- **`tradeskillsData[].category`** — optional, `"gathering"` for these four plus Foraging
  and Disenchanting, unset otherwise. What `renderCraftingCategories`/
  `renderGatheringCategories` filter on for their own grid.
- **A gathering-category tradeskill isn't automatically node-based** —
  `gatheringTradeskillIsNodeBased(name)` (shared by card count/label, click handler,
  routing) returns true if `gathering-nodes.json` has entries for that name, else defaults
  true *unless* `crafting.json` has recipes for it — so a tradeskill with data in neither
  file (Foraging) still reads node-based, renders an empty table rather than a misread
  0-recipe crafting tradeskill. Disenchanting is the one flip to recipe-based, routed to
  shared `renderGatheringRecipes(container, tradeskillName)`.
- **`gathering-nodes.json`** — flat array, one object per node: `name`, `slug`,
  `tradeskill`, `locations` (free-text array, not tied to `maps.json`), optional `minSkill`
  (to attempt) and `trivialSkill` (skill-ups stop — same concept as `recipeSkillLevel`,
  different name since separate shape). Only write an exact number when the source states
  one outright — floor-only (`"225+"`) or unknown (`"???"`) stays unset with a `note`
  capturing raw text. `results` (item names, same dynamic-linking convention as
  `components`/`drops`) optional, only when the source has a Results column.
- **Every gathering tradeskill except Disenchanting: the node's own name is also its
  result** (confirmed 2026-08-05) — set `results: ["<node's own name>"]` on every node whose
  name is confirmed (not a placeholder like "Unidentified Herb"). A `"Rich <X>"` node yields
  the same result as its plain counterpart, not a different item — it's the same material at
  higher difficulty/yield, not a distinct tier. For Herbalism this is cross-confirmed by the
  Mortar and Pestle recipes (`crafting.json`), which consume `(2) <node name>` to produce
  `<node name> Powder`. For Fishing, node names carry a `"Raw "` prefix (e.g. "Raw Whitefish")
  because the catch is uncooked, not because "Raw" is a separate qualifier — the result name
  keeps that prefix verbatim, still an exact match to the node's own name. Most of these
  result item names don't have a real `items.json` card yet and render as plain text until
  one comes in, same as any other unmatched dynamic link.
- **A `results` entry can also be a compact family reference** (2026-08-06, user's own
  request, mirrors monster `drops`' `{ "family": "Rusty Iron" }` form) —
  `{ "family": "Chipped", "label": "Chipped Gems" }` instead of spelling out all 25+
  same-prefix items. `label` is optional (defaults to the family name itself) — use it when
  the bare prefix reads awkwardly on its own (e.g. "Chipped" alone vs. "Chipped Gems").
  Renders as one link with a live count (`familyItemCount()`, same items.json-derived count
  monster families use) instead of a long comma list; clicking it jumps to the Item
  Database with that prefix pre-filled in the search box (`goToItemSearch`), same
  destination a monster's family link goes to. Mix freely with plain item-name strings in
  the same `results` array. Use this any time a node's confirmed results grow into a whole
  quality-set family (gemstones today) — don't write out the full roster by hand.
- **Mining gemstone quality-tier inference** (confirmed 2026-08-06, same idea as monster
  drops' quality-set inference): gemstones come in quality tiers — Chipped, Flawed,
  Imperfect (only three confirmed as gem-quality prefixes so far; `Cracked` is unrelated,
  used only for wood staffs) — and if a node is confirmed to yield any one gem of a given
  tier, assume it can yield every other gem of that same tier too. Applies automatically
  whenever inbox data confirms ≥1 gem drop from a node, same as the monster-drops rule —
  no need to re-request each time. Record it as a compact `results` entry (below), not by
  listing every gem name.
- **Herbalism Frond skill-threshold inference** (confirmed 2026-08-06, corrected 2026-08-08,
  precisely restated 2026-08-11 — this is the current rule, supersedes all earlier phrasings):
  a Frond tier fills the gap **between two already-confirmed same-tier nodes**, bracketed by
  `minSkill` — if a lower-`minSkill` node and a higher-`minSkill` node are *both* confirmed
  yielding the same Frond tier, every Herbalism node strictly between them (by `minSkill`)
  also gets that tier added to `results`. **Requires both endpoints confirmed** — a single
  confirmation (even the current highest-`minSkill` one for that tier) never extrapolates
  outward past itself in either direction, only inward once a second same-tier confirmation
  brackets a range. This is deliberately narrower than an earlier "≤ the highest confirmed
  node" version of the rule, which was proven wrong 2026-08-07: Whispering Sage (`minSkill`
  15) was directly observed yielding Magic Frond, not Enchanted, despite sitting below
  Gadolvine (80, Enchanted) with no lower Enchanted-tier confirmation to bracket it — a single
  high endpoint alone said nothing about the nodes below it. A node outside every bracketed
  range (below the lowest confirmed node of a tier, above the highest, or in a gap between two
  *different* tiers with no matching second endpoint) stays unconfirmed until its own
  screenshot comes in.
  **Current confirmed state**: Magic Frond — Lionleaf (1), Ghost Poppy (1), Selstie Kelp (1),
  Sylvine (1), Nomad's Grace (10), Whispering Sage (15). Enchanted Frond — Ironroot (30,
  confirmed 2026-08-10) and Gadolvine (80) bracket Moonveil (35) and Stranglevine (55),
  backfilled 2026-08-11 once both endpoints existed. Arcane Frond — Duneleaf (90) only, no
  second endpoint yet so nothing to bracket.
  **Tier supersession still applies as before**: the instant a node is confirmed yielding a
  higher tier, remove the lower tier from every node with `minSkill` >= that node's own
  `minSkill` (nothing has hit this case yet). No evidence yet of a 4th tier beyond Arcane —
  don't extrapolate ahead of actual inbox confirmation.
- **Mining Crystallized Magic skill-threshold inference** (confirmed 2026-08-07, same
  mechanic as Frond above, applied to ore veins instead of herbs): Copper Vein (`minSkill` 1)
  and Limestone Deposit (`minSkill` 40) both confirmed yielding Clouded Crystallized Magic —
  apply the same bracket-between-two-confirmed-same-tier-endpoints rule as Frond (above).
  Tin Vein (`minSkill` 75) was also confirmed yielding **Limestone** itself as a bonus result
  (a non-Crystallized-Magic cross-node material) plus **Jagged Stone** — record both
  literally rather than assuming a skill-threshold pattern, since neither is a tiered magic
  material.
- Source tables so far are fan-wiki-style reference charts, same weaker-than-a-screenshot
  caveat as the Tanning/Leatherworking/Blacksmithing tables (see `CLAUDE-HISTORY.md`) —
  supersede without hesitation if the user's own observation disagrees.
- **Rendering:** `renderGatheringNodes(container, tradeskillName)` — sortable/searchable
  table (like `renderMonstersList`), not a card grid (no components to justify one). `note`
  (when set) renders as its own row underneath.
- **Optional `image` + `needsInfo`:** node picture at `images/gathering/<slug>.jpg`, same
  convention as item/recipe screenshots. Shows as a clickable thumbnail
  (`.gathering-node-thumb`). `needsInfo: true` = same meaning as items/crafting: confirmed
  to exist but not fully identified — red "NEEDS INFO" badge + note row linking to
  `#submit`. First used for a herb spotted but not yet identified — placeholder node with
  empty `locations`, skill floor captured in `note` (not `minSkill`, floor-only) so the
  picture becomes the identifying reference.
  **When identification comes in: don't rename the placeholder — merge its picture into the
  real, already-existing node entry, then delete the placeholder** (2026-07-20 correction —
  an "Unidentified Herb" placeholder was mistakenly renamed in place even though a real
  `Duneleaf` entry already existed separately, producing two `duneleaf`-slugged entries).
  Placeholder is a proxy for a real node not yet connected, not its permanent home — a
  same-name real entry may already exist with its own confirmed data that the placeholder's
  vaguer info shouldn't overwrite.
  `.gathering-node-thumb` is `object-fit: cover`, 28x28, no inset padding — the real fix for
  a past visual bug was zeroing `margin`/`border`/`border-radius` on the `img` (a
  `.content-inner img` specificity leak, see "Known CSS gotchas"), *not* the cropping/
  object-fit changes that were tried first and reverted (full story in
  `CLAUDE-HISTORY.md` if this area gets touched again).
- **A node can have more than one picture via an optional `images` array** — extra alternate
  photos alongside `image`. `nodeImageList(node)` combines both into one ordered list
  (`image` first) that the thumbnail button and viewer both use — thumb still shows just
  `image`. Click opens `#gathering-image-viewer` (`openGatheringImageViewer`) — full-size
  lightbox with `#map-viewer`-style prev/next arrows (including once-per-open blink,
  `.map-viewer-nav-btn-play`) grafted onto `#sample-viewer`'s simpler shell, no zoom/pan.
  Arrows only render/blink with >1 picture. A future inbox file phrased as an *alternate*
  view of something already documented (not a new/replacement image) means add to `images`,
  don't overwrite `image` or treat as duplicate.
- **Columns derive per-tradeskill from the data** (`gatheringColumns()`) — Name/Min Skill
  always show; Trivial/Results/Rarity/Bait Required only if ≥1 node of that tradeskill uses
  the field (Fishing uses Rarity/Bait Required instead of Trivial/Results).
- **Herbalism**'s tradeskill `note` = the source page's own "Getting Started" paragraph.
- **Disenchanting is *not* node-based** despite living on the Gathering page — a gathering
  node consumes nothing, only gates on skill; Disenchanting consumes a specific MAGIC item
  (its "Components" list) to produce output — structurally an ordinary recipe running
  "backwards" (Disenchanting Cube in a bag slot, can fail and destroy the item, output
  quality depends on the item in some not-fully-understood way). Lives in `crafting.json` as
  ordinary recipes; Gathering-page placement is purely display/navigation.
  Flagged inconsistency: "Cinder Beetle Shield" is no longer tagged MAGIC in-game and can't
  actually be disenchanted — recorded as a `note` on that entry (`disenchant-cinder-beetle-
  shield`) rather than removing the recipe (useful historical data). `renderRecipeCardHTML`
  renders `recipe.note` (when set) as an italic line after Components — reusable for any
  recipe needing a similar caveat.

**Disenchanting's card layout is flipped** (`renderDisenchantCardHTML`, dispatched from
`renderRecipeCardHTML` when `recipe.tradeskill === 'Disenchanting'`). Every other recipe
puts crafted result (`name`) at top, inputs (`components`) at bottom; Disenchanting reverses
this — `components` holds the single MAGIC item fed in (what someone's actually looking
up), `name` holds the resulting dust. Card leads with the *source item* (thumbnail via
`findItemByName(sourceItem).image`, dashed placeholder if none — common case), lists the
dust tier under "Produces:" (parsed from `name`, quantity ranges kept intact unlike the tier
chart's own parsing). Both source item and produced dust link to the Item Database
dynamically.

### Tanning is different: no recipes, just vat processing

No crafting-window entries or recipe cards — any tier-appropriate pelt drops directly into a
tanning vat (Low→24x Rawhide Scraps, Medium→24x Hide Scraps, High→24x Leather Scraps). Live
in `crafting.json` as ordinary entries (`name`/`slug`/`tradeskill: "Tanning"`/`components`/
`resultQuantity: 24`) without `difficultyColor`/`observedAtSkill`/`listOrder` (no screenshot
to source them from). `tradeskills.json` can carry an optional `note` field (Tanning has one
explaining the vat mechanic), rendered as a callout under the tradeskill's `<h1>` — extend
to another tradeskill the same way if needed.

(Population history/source tables for Tanning, Blacksmithing, Fletching, Smelting, Survival:
`CLAUDE-HISTORY.md`.)

### New items/maps/recipes/monsters come in via `images/inbox/`

User drops new screenshots into `images/inbox/` (may appear as `images/Inbox` on disk —
Windows paths case-insensitive, don't create a second folder). This is the *only* place to
look for new/unprocessed content — don't re-scan `images/items/` or re-read existing
items.json/maps.json/crafting.json/monsters.json entries looking for new work. Filenames are
usually a random ID, not meaningful — always read the image itself.

**Zone acronyms the user uses in filenames** (e.g. to batch-name loot-log screenshots) —
expand before matching against `maps.json`/`monsters.json`, never treat the acronym itself as
the zone name: SGS = Sungreet Strand, VoZ = Vale of Zintar, NH = Night Harbor, SD = Shaded
Dunes, KB = Keeper's Bight, EW = Evershade Weald, FP = Fallen Pass.

**A filename is the user's own casual typing, not a game-data source — the rendered in-game
text inside the screenshot always wins if the two disagree** (confirmed 2026-08-10, after
"Dustrend Sacramir.png" — capitalized only because that's how the user happened to type the
filename — got mistaken for a distinct capital-letter Named monster, when every actual
con-check/loot-log line in the same batch consistently showed lowercase "a Dustrend sacramir"
with an article, i.e. an ordinary regular monster). Capitalization, spacing, and wording in a
filename can be sloppy; the same details rendered in a chat line or item card are not — trust
the pixels over the filename whenever they conflict, especially for something as
significant as a name implying Named/boss status.

Applies to *any* task involving item/map/recipe/monster screenshots (cut-off-text checks,
image-quality audits, re-verifying data), not just adding new entries. Only read/process
files in `images/inbox/`; never re-open existing files in `images/items/`, `images/Maps/`,
`images/crafting/`, `images/Monsters/`. If a task needs checking already-processed images,
say so and ask rather than re-scanning everything.

**Move the batch out of the inbox before reading anything.** The user drops new screenshots
into `images/inbox/` *while* a previous batch is still being processed — a wildcard-delete
cleanup at the end of a session once caught and permanently deleted screenshots dropped in
mid-session that were never read (`images/inbox/` isn't git-tracked, unrecoverable). To make
this race condition structurally impossible: **before reading any file, `mv` (not copy)**
every file in `images/inbox/` into `images/Processing/` (create if needed), and do all
reading/processing/deleting from `images/Processing/` for the rest of the task —
`images/inbox/` is never touched again after that one move. Anything the user drops in
afterward lands in `images/inbox/`, isolated from the current batch, becomes the start of
the *next* session's move. `images/Processing/` should always be empty between sessions — a
non-empty one at task start means a previous session ended mid-batch (crashed, interrupted);
pick up processing those files rather than re-moving from `images/inbox/`.

Workflow when asked to process new items (or "check the inbox"):

1. Move every file in `images/inbox/` into `images/Processing/` — the one and only time
   `images/inbox/` gets touched.
2. List `images/Processing/` — each file is one unprocessed screenshot (or, per below, a
   `.txt` game-link-code list).
3. For each: read and classify — **item** (stat-card popup), **map** (game map/zone image,
   no stat card), **recipe** (single crafting card, popup style + "Components:" list),
   **crafting window** (in-game tradeskill window listing many recipes, skill number at
   bottom), **vendor screenshot** (NPC buy/sell list, no stat card), **monster** (picture
   of a creature, no stat card), or **game link code list** (a `.txt` file, not an image) —
   then follow the matching path below.
4. Once a file's data is recorded (items/recipes: read and deleted, no image saved;
   maps/monsters: moved to `images/Maps/`/`images/Monsters/`) or deleted as a duplicate,
   `images/Processing/` should no longer contain it — empty = batch fully processed.

**Duplicates (items/maps/recipes alike):** if a screenshot's item/map/recipe already exists
(slug or name match), delete it from the inbox — don't save anywhere. Exception: if the new
screenshot reveals something the existing entry is missing/wrong, update the JSON with the
new info first — newest screenshot always wins.

**Items:**

1. Extract name/stats, `race`, any `tags`.
2. Check whether slug/name already exists in `items.json` (cheap text check, required every
   time).
   - **Not a duplicate:** add entry, no `image` field. Delete screenshot once recorded.
   - **Duplicate:** delete screenshot — update `items.json` first if it fills a gap.

**Maps:**

1. Extract map name.
2. Check whether slug/name already exists in `maps.json`.
   - **Not a duplicate:** add entry. Rename file to map's slug, move into `images/Maps/`.
   - **Duplicate:** delete file.

**Recipes:**

1. Extract name + tradeskill (must match `tradeskills.json` — flag if it names one not in
   that list, don't invent a category).
2. Check whether slug/name already exists in `crafting.json`.
   - **Not a duplicate:** add entry, no `image` field. Delete screenshot once recorded.
   - **Duplicate:** delete — unless the new screenshot is the first *full card* for a recipe
     that only had a minimal crafting-window entry (no `weight`/`components` yet), in which
     case fill in the fuller entry instead (still no `image`).

**Monsters:** plain creature picture (name floating over model, no stat card) — see "Adding
a monster" for the named/boss-only picture policy: most monsters won't have a picture, and
that's expected. Map/level range/drops come from what the user says in chat (authoritative,
same as a screenshot), not the image itself — **except** drops, usually shown via a
loot-window screenshot (corpse-loot UI, one icon per slot) paired with a plain item card per
icon — read the card for the exact name, process/add that item to `items.json` too (often
raw materials already referenced as unlinked plain text elsewhere — adding the real item
auto-resolves that link). A loot window can span multiple screenshots across messages — keep
adding newly-revealed drops rather than assuming one screenshot is complete.

1. Check slug/name against `monsters.json`.
   - **Not a duplicate:** add entry. If a picture was provided (Named/boss only), convert to
     `.jpg` q90, rename to the monster's slug, move into `images/Monsters/`, use that slug
     for `image` — otherwise omit `image`.
   - **Duplicate:** delete screenshot — update `monsters.json` first if it fills a gap (map,
     level range, additional drop).
2. If map/level range/drop table isn't given yet, add what's known (name/slug minimum)
   rather than blocking — every field beyond name/slug is optional.

**Crafting window screenshots** (different from a recipe card — in-game tradeskill window
listing every known recipe, name-only + color, e.g. "Leatherworking 22 / 300" at bottom):
reference source, don't get saved anywhere — process and delete, don't move to
`images/crafting/`.

1. Window's title bar names the tradeskill (more reliable than guessing from item names).
   "X / 300" at bottom = user's current skill — capture as `observedAtSkill` on every recipe
   from this screenshot. **Missing that line** → assume `observedAtSkill: 0`.
2. Per recipe name+color: if already in `crafting.json` with card-derived fields (`weight`,
   `size`, `components`, `difficultyText`), leave those alone — window is lower-detail,
   shouldn't overwrite a real card. If new: minimal entry (`name`, `slug`, `tradeskill`,
   `difficultyColor`, `observedAtSkill`), no `image`/`weight`/`components` yet.
3. `listOrder` — position in the crafting window's *whole* scrollable list (not just this
   screenshot), counting from the top. **Crafting page sorts by this field ascending**
   instead of alphabetically — the game's own order is already low-to-high skill, doubling
   as a difficulty ranking without the unreliable color-guessing in
   `To-Do/crafting-skill-estimates.md`. Capture/update on *every* recipe seen, including
   ones with a full card already (unlike `difficultyColor`, no "real card" data protects
   this field). Partial-batch screenshots: reconstruct true list-wide position by matching
   repeated rows (same name + color) between adjacent screenshots rather than assuming each
   starts fresh — a full recapture should end as one unbroken 1..N sequence. If screenshots
   don't overlap enough to confirm the join, the color trend at the boundary (should move
   steadily Green→Red, never jump back and forth) is usually enough to infer it — but flag
   the uncertainty rather than presenting a guessed join as fact.
4. Match difficulty color to the mapping above. Ambiguous shade (Light Blue vs Dark Blue) →
   say so, record the generic color, don't silently pick one.
5. Delete screenshot(s) once processed — never moved anywhere.

**Vendor screenshots** (NPC buy/sell list — names + prices only, no stat card): confirms an
item *exists* and, since 2026-08-11, is recorded persistently in `vendors.json` so the item's
own card can show where to buy it — no longer just "process for names, delete."

1. **`vendors.json`** — flat array, one object per vendor: `name`, `slug`, `location` (the
   city/zone they're found in, plain string — a vendor is one fixed NPC in one spot, unlike a
   monster's `maps` array), `sells` (array of exact item names, same dynamic-linking
   convention as a monster's `drops` — no family/quality-set grouping, just a flat name list).
   New vendor → new entry. Vendor already exists → append newly-seen names to its `sells`
   array (dedupe against what's already there) and bump `lastUpdated`. A vendor's roster
   builds up over multiple screenshot batches, same "grows over time" precedent as gathering
   nodes — a batch not showing every item the vendor sells is expected, not an error.
2. Per item name: check `items.json` (name or obvious slug match). Already exists → no data
   action needed beyond adding it to the vendor's `sells` list (note in
   `To-Do/predicted-missing-items.txt` if it confirms/contradicts a tracked prediction).
3. New name → minimal entry: `name`, `slug`, `type`, `tags: []`, `"needsInfo": true`. Only
   add more when safely inferable from an established pattern (weapon `skill`/`twoHanded`/
   `slot` matching same-type siblings; armor `slot` from piece-type name; `type: "Food"` for
   a "Cooked/Boiled/Roasted <X>" name matching an existing Cooking recipe result). **Never**
   infer `damage`/`delay`/`weight`/`size`/`ac`/`classes`/`race` — those vary by tier, a vendor
   listing gives no basis.
4. Same treatment for a recipe name on a vendor list (`crafting.json`'s minimal shape:
   `name`/`slug`/`tradeskill`/`needsInfo: true`).
5. Delete screenshot(s) once processed — same as before, `vendors.json` is the only thing
   that persists from these, never an image.

**Item card "Dropped by" line also shows vendor availability** — `findVendorsSellingItem`
does the reverse lookup (which vendor(s) have this item name in their `sells` array), folded
into the same "Dropped by" section as monster drops/gathering tradeskills (user's own
request, rather than a separate line). A single vendor renders inline as `Vendor Name
(Location)`; 2+ vendors collapse into a native `<details>`/`<summary>` toggle (`N vendors`,
expands to one `Name (Location)` per line) instead of spelling out a long name list —
`.item-card-vendor-details`/`.item-card-vendor-list` in `style.css`. `vendorsData` loads the
same way as `monstersData`/`gatheringData` (`ensureVendorsData()`, prefetched in `init()` and
awaited by `openItemViewer`).

**Game link code lists** (`.txt` file in the inbox, not a screenshot — see `item.gameLinkCode`
in "Adding an item to the Item Database"): user copies each code from linking the item in
their own in-game chat box, one item per line, expected as `Item Name: <code>` (e.g. `Torch:
<link="item|d0a1669e39e2c90767d128b3|22803122">...`). Read the whole file, don't assume the
format is perfectly clean — near-miss formatting (different separator, extra whitespace,
stray blank lines) should still be parsed rather than rejected; only flag a line if it's
genuinely ambiguous which item it names.

1. Per line: match the name against `items.json` (exact, then obvious case/whitespace
   variant). Match found → set/overwrite `gameLinkCode` with the code **verbatim** (own
   quotes/tags included, never reformatted or simplified) and bump `lastUpdated`. No match →
   list it back to the user rather than guessing/creating a new minimal item entry from a
   name alone (unlike a vendor screenshot, a link-code line has no other data to seed an
   entry with).
2. Delete the `.txt` file once every line is processed — nothing to archive.

## Adding a monster

**Named and Regular monsters are two separate top-level pages** (`pages.json`
`"Named Monsters"`/`"Regular Monsters"`, both `"type": "monsters"`, sharing `"group":
"Monsters"`). Each: category grid of zones (`renderMonstersCategories(container, named)`,
scoped to that page's subset, own quick search) drilling into a sortable/searchable table
(`renderMonstersList`) scoped to one zone. Zone drill-down uses a hash sub-route
(`#monsters-named/<zone>` or `#monsters-regular/<zone>`, not a pending variable) so Back pops
out to the category grid — `loadPage`/`hashchange`/`init()` match pages by the hash part
before the first `/`. Reuse this pattern for any future "should be Back-button-navigable"
drill-down. `goToMonster` picks `monsters-named`/`monsters-regular` from the monster's own
`named` field.

`monsters.json` schema — only `name`/`slug` required, everything else optional:

- **`named`** — boolean, `true` for confirmed named/boss monsters. Explicit field (not
  derived from casing) since several bosses use the same lowercase "a/the X" style as
  regular trash — no reliable string-pattern signal.
- `image` — creature picture, `images/Monsters/`, same `.jpg` q90 convention. Shown in the
  monster viewer modal, not the table. **Only Named monsters/bosses get a picture** — a
  generic monster with no `image` is normal, not a gap. **Replace-on-better-visibility:** a
  new screenshot showing the creature more clearly overwrites the existing file — one
  `image` slot, always an overwrite.
- `maps` — array of map names seen on (usually one). Must match a real `maps.json` entry — a
  named sub-area (e.g. "Necropolis" within "Night Harbor") goes in `areas` instead, not
  appended into the map string. **Map field no longer shown on the monster card/table** —
  redundant once you've drilled into that zone already; `maps`/`monsterZone()` still drive
  everything structural (zone bucket, `goToMonster` routing, search). The one place a
  monster's zone still shows as text is the top-level quick search, where it's a clickable
  `goToMap` link.
- `areas` — optional array of confirmed sub-areas (e.g. `["Necropolis", "North Gate"]`).
  Confirmed = user states it directly, same authority as a screenshot. Rendered as an "Area"
  field, included in search. Doesn't affect zone-grid grouping (`maps`/`monsterZone()` still
  drive that).
- `levelRange` — plain string (`"5-8"`), not min/max fields, since every value is a guess.
  **Con color reference (corrected 2026-08-10, user's own definitive list — supersedes any
  earlier "Light Green/Orange" naming):** low→high, **Trivial** (very bright green/teal, no
  XP reward — its own tier, not the same as Green), **Green** (extremely easy/low-level),
  **Light Blue** (fairly easy match), **Dark Blue** (you should win, but it might hurt a
  bit), **White** (even match, could win or lose, within your level range — pins an exact
  level), **Yellow** (tough fight, hard to win), **Red** (higher level, you will most likely
  lose). Exactly 7 tiers, no more — there is no "Orange."
  **Combat-prediction chat text is the same con system, just read as colored sentences
  instead of a nameplate color** (confirmed 2026-08-10) — e.g. considering a monster prints
  `"<mob> seethes at you, ready to strike -- <outcome phrase>."` (or `"seems indifferent to
  your presence --"` for a passive one) in the con's own color. This is actually *more*
  reliable than a nameplate (rendered chat text, not a 3D-model tooltip) — the general "con
  color read off a screenshot isn't reliably legible" caution below is about the nameplate
  variant, not this one. **The outcome phrase itself is deterministic — the same phrase always
  means the same color** (confirmed 2026-08-10, user's own statement) — so match on the phrase
  text alone, don't bother eyeballing the rendered color at all; a screenshot's exact shade is
  irrelevant once the phrase is known. Confirmed outcome-phrase → color mapping (user-confirmed
  test cases in parentheses), low→high:
  - **Trivial**: "You would almost certainly emerge victorious in battle." (a desert bat, a
    giant fire beetle)
  - **Green**: "You would likely emerge victorious in battle." (a hired sword)
  - **Light Blue**: "It might prove to be a difficult battle." (Blooper)
  - **Dark Blue**: "You would stand a fair chance in battle." (a river pirate, 2026-08-10 — the
    slot this phrase fills was unconfirmed before; by elimination, once every other tier already
    had its own distinct phrase, this had to be Dark Blue's)
  - **White**: "Battle would be quite risky." (Henryhaha)
  - **Yellow**: "You would likely be defeated in battle." (a bodyguard)
  - **Red**: "Would you like to die? You would almost certainly be defeated in battle." (Iniu)
  Player's own level always comes from the same screenshot batch (e.g. filenames stating
  "I am level 24") — same source-of-truth authority as a stated level in chat.
- **`conObservations`** (2026-08-10) — raw data feeding a real level-estimation system, same
  append-only-log shape as `coinDrops`: array of `{ "playerLevel": N, "con": "White" }`, one
  entry per screenshot+stated-con+stated-player-level the user reports. **Workflow:** user
  posts a monster screenshot, states its con color and their own current level in chat (con
  color read off the game's own nameplate/tooltip isn't reliably legible from a screenshot,
  so always take the user's stated color, same source-of-truth rule as everything else) —
  append one `conObservations` entry to that monster (create the array if it doesn't exist
  yet) and bump `lastUpdated`. Never overwritten, never averaged/merged by hand —
  `estimateMonsterLevel(monster)` (`script.js`) computes the display value at render time,
  same never-store-a-computed-value precedent as `estimateRecipeSkill`/`averageCoinDrop`.
  **Monsters spawn across a level range, not one fixed level** (confirmed 2026-08-10, user's
  own explanation) — two kills of the same species at the same player level legitimately
  conning differently (e.g. one White, one Yellow) reflects two different-level spawns of
  that species, not inconsistent/erroneous data. That means a single White observation only
  pins *that one spawn's* level, not the species' level as a whole, so the display format
  stays deliberately conservative — only two possible shapes, nothing in between:
  - **`"X-Y"`** (confirmed) — only once two *different* White-observed levels exist for
    the species, since that's direct proof it spans at least that range.
  - **`"~X"`** (estimated, card appends the literal "(estimated)" suffix too) — every other
    case: a single White observation (even repeated at the same value — still only one
    proven spawn-level, not proof that's the *only* level), or only one-sided bound info from
    non-White cons (below-White → `~(upperBound - 1)`; above-White → `~(lowerBound + 1)`;
    both sides → `~` the midpoint between them). Whether **named/boss monsters might turn out
    to have a single fixed level** (unlike regular trash mobs) is an open question — not
    confirmed either way, so treat named monsters the same conservative way until real data
    settles it one way or the other.
  - No `conObservations` yet → falls back to displaying the hand-typed `levelRange` string
    as-is, so old entries keep working unchanged.
  - **Card display re-enabled** (was hidden 2026-07 "until a more reliable conning method
    exists" — this is that method): `renderMonsterCardHTML` (full card, "Level" field) and
    `renderMonsterGridCards` (grid preview, compact "Level N" line) both call
    `estimateMonsterLevel`.
  - **The actual level-gap-per-con-color is still unknown** — the bound math above never
    needs it, deliberately conservative (only ever narrows via confirmed bounds, never
    assumes a gap size). If/when enough data accumulates to see a real pattern (e.g. Dark
    Blue consistently ~2 levels below White), that's a future refinement to
    `estimateMonsterLevel` — don't hardcode a gap from a single data point.
- `drops` — array of `{ "item": "Name As Shown" }`, same shape/dynamic-linking as a recipe's
  `components` (`findItemByName`/`goToItem`, clickable if a match exists). Sourced from a
  loot-window screenshot + item card per icon.
  **A drops entry can also be `{ "family": "Rusty Iron" }`** — compact alternative to
  writing out a quality-set family's full roster (up to 42 lines, see "Quality-set drop
  inference" below). **Use this form for every new backfill going forward.**
  `familyItemCount()` computes the displayed count from `items.json`'s current roster at
  render time — so if a family turns out bigger later, every monster referencing it via
  `family` shows the corrected count automatically, no monsters.json edit needed. Never
  partial — a monster confirmed dropping one piece is assumed to drop the *entire* family,
  so `family` always means "the complete current roster." `groupMonsterDrops()` treats old
  expanded entries and new compact ones identically for display and the item page's reverse
  "Dropped by" lookup (`findMonstersDroppingItem`) — nothing needs migrating, but don't add
  new expanded per-item entries by hand.
- **`coinDrops`** — optional array of raw per-corpse observations, `{ "silver": N, "copper":
  N }`, one per loot-log line seen. Sourced from loot-log chat screenshots (not the
  loot-window `drops` come from) — each line names the mob directly, so one screenshot with
  several corpses of the same mob yields several observations. **Always the TOTAL the corpse
  dropped, never a player's split of it** — a group loot line shows both ("You loot 4
  silver, and 15 copper coins from a Plagueborn citizen's corpse, and receive 1 silver, and
  2 copper coins as your split" → record `{"silver": 4, "copper": 15}`, the total, not the
  1s/2c split). `averageCoinDrop(monster)` computes the average at render time — never
  stored back. Shown as "Average coin drop: X silver, Y copper (N samples)"
  (`formatCoinAmount`, omits a denomination averaging to 0). No conversion assumed between
  silver/copper/gold/platinum — each denomination recorded and averaged on its own.
- `relatedMonsters` — array of `{ "label": "Display Text", "slug": "other-monsters-slug" }`,
  for a Named boss tied to an existing generic mob, confirmed either by loot flavor text or by
  another source (external wiki, user statement). **This is a universal game mechanic, not a
  rare pairing** (confirmed 2026-08-07, user's own explanation): every Named monster has a
  "placeholder" — typically a common regular mob spawning at the same location — which spawns
  far more often than the Named monster itself, making the Named spawn rare. Only add the link
  once a *specific* placeholder mob is actually confirmed for that Named monster (don't invent
  one from the mechanic alone); when confirmed, link it in both directions — the Named boss's
  own entry pointing at the placeholder, and the placeholder's entry pointing back at the boss
  (see Aide Aida / a Claw aide for the reference pair). Rendered as a "Place Holder" field
  (user's own label), link resolves dynamically via `findMonsterBySlug` — plain text if the
  slug doesn't exist yet. Optional, most monsters won't have this confirmed yet.
- **`needsInfo`** — boolean, same meaning as items/crafting: red "NEEDS INFO" badge, red
  note+Submit-link, "Show only monsters that need info" toggle. Not about a missing
  *picture* (normal for generic monsters) — for a monster barely known at all: confirmed to
  exist, nothing else recorded.

### Quality-set drop inference

**Standing rule:** "If a monster drops 1 piece of an item quality set (like Rusty weapons or
Tattered armor), assume that mob can drop any of the other items in that quality range."
Applies automatically whenever inbox data confirms ≥1 item from a recognized family — no
need to re-request each time.

A "quality set" = shared name prefix denoting a tier/material, not a literal in-game
grouping. **Confirmed families and current rosters** (check longest-prefix-first — "Rusty
Iron"/"Rusty Steel" before plain "Rusty" — so a Rusty Iron piece is never miscounted into
plain Rusty, which it also textually starts with; "Rusty" vs "Rusty Iron" vs "Rusty Steel"
are three separate families, don't merge or assume one's roster implies another's):

- **Rusty** (18, weapons + Tower Shield): Axe, Battle Axe, Dagger, Great Scythe, Greatsword,
  Kite Shield, Long Spear, Longsword, Mace, Maul, Scimitar, Scythe, Shortsword, Spear, Tower
  Shield, Trident, War Lance, Warhammer.
- **Tattered Cloth** (13, armor): Cap, Gorget, Pantaloons, Shirt, Gloves, Bracer, Boots,
  Robe, Veil, Belt, Cape, Mantle, Tunic.
- **Tattered Rawhide** (8, armor): Gorget, Belt, Mask, Gloves, Bracer, Boots, Vest,
  Shoulderpads.
- **Tattered Wool** (11, armor): Belt, Boots, Bracer, Cap, Gloves, Gorget, Mantle, Robe,
  Shirt, Tunic, Veil.
- **Tattered Hide** (11, armor): Cap, Gorget, Mask, Vest, Shoulderpads, Belt, Leggings, Bracer,
  Gloves, Cloak, Tunic.
- **Tattered Leather** (5, armor, confirmed 2026-08-10): Belt, Boots, Cloak, Bracer,
  Shoulderpads — pieces had been sitting as unlinked plain-text drops on four separate
  monsters (a grizzled raider, a Plagueborn citizen, a Plagueborn worshipper, a sand giant
  fisher) across multiple earlier sessions, never recognized as a shared family until a
  Vale of Zintar batch confirmed a second piece (Cloak) dropping from the same monster
  another family member already existed on — backfilled onto all five monsters at once
  per the standing inference rule. Only 2 of the 5 named pieces (Boots, Cloak) have a real
  items.json card so far; the rest render as plain text on the family badge until a
  screenshot comes in for each.
- **Corrupted Leather** (12 armor pieces, confirmed 2026-08-11): Cap, Mask, Gorget,
  Shoulderpads, Cloak, Tunic, Robe, Bracer, Leggings, Belt, Gloves, Boots — all 12 already
  had real items.json cards. **The family badge itself shows 13**, not 12 — unlike every
  other tracked family, this tier also has a same-prefix raw material, "Corrupted Leather
  Scraps" (recorded as a plain drop alongside the `family` reference on all four monsters
  below, same as any other tier's Scraps material), which `familyItemCount()`'s prefix match
  can't distinguish from an armor piece. Not a bug, just this family's one quirk — armor
  pieces had been wrongly consolidated under a single fictional monster,
  "the corrupted ashira" (no such singular name exists in-game — user's own correction).
  The real monsters are four separate "a corrupted `<type>`" regulars sharing the "Corrupted
  Ashira Camp" area in Vale of Zintar (a corrupted ashira, a corrupted outrider, a corrupted
  adept, a corrupted warrior) — deleted the fictional entry and redistributed its drop list
  (the family plus Corrupted Leather Scraps, Ashira War Tooth, Ashira Hunter Tooth) onto all
  four per the user's explicit statement that any of them can drop any of those items. Two
  named bosses also share that area (Onis the Elder, Seshena the Lost) but don't have
  "corrupted" in their own name, so they weren't touched. **One item from the fictional
  entry's list, Mace of Malice, was itself wrong** — the user immediately caught it and
  posted its real card, which already had a correctly-recorded "Dropped By: Demeter Stollen"
  (Fallen Pass) — removed from all four corrupted-camp monsters rather than assumed correct
  just because it came from the same source list.
- **Corroded Bronze** (42, weapons + Tower Shield + chain + plate): Axe, Battle Axe, Dagger,
  Great Scythe, Greatsword, Kite Shield, Long Spear, Longsword, Mace, Maul, Scimitar, Scythe,
  Shortsword, Spear, Tower Shield, Trident, War Lance, Warhammer; Chain Boots/Cloak/Coif/
  Gambeson/Gloves/Gorget/Leggings/Mask/Shoulderguards/Tunic/Waistguard/Wristguard; Plate
  Arming Doublet/Boots/Bracer/Breastplate/Cloak/Collar/Gauntlets/Girdle/Greaves/Helm/
  Pauldrons/Visor.
- **Rusty Iron** (42, same shape as Corroded Bronze): Axe, Battle Axe, Dagger, Great Scythe,
  Greatsword, Kite Shield, Long Spear, Longsword, Mace, Maul, Scimitar, Scythe, Shortsword,
  Spear, Tower Shield, Trident, War Lance, Warhammer; Chain Boots/Cloak/Coif/Gambeson/
  Gloves/Gorget/Leggings/Mask/Shoulderguards/Tunic/Waistguard/Wristguard; Plate Arming
  Doublet/Boots/Bracer/Breastplate/Cloak/Collar/Gauntlets/Girdle/Greaves/Helm/Pauldrons/
  Visor.
- **Rusty Steel** (41 — has a Tower Shield that Rusty Iron... has too, but no Chain
  Gambeson unlike Rusty Iron; recorded verbatim, not assumed symmetric): Axe, Battle Axe,
  Dagger, Great Scythe, Greatsword, Kite Shield, Long Spear, Longsword, Mace, Maul, Scimitar,
  Scythe, Shortsword, Spear, Tower Shield, Trident, War Lance, Warhammer; Chain Boots/Cloak/
  Coif/Gloves/Gorget/Leggings/Mask/Shoulderguards/Tunic/Waistguard/Wristguard; Plate Arming
  Doublet/Boots/Bracer/Breastplate/Cloak/Collar/Gauntlets/Girdle/Greaves/Helm/Pauldrons/
  Visor.

Treat a new shared prefix as its own family the same way. Rosters grow over time as new
screenshots turn up pieces not previously known (e.g. Corroded Bronze: 19→42, Rusty Iron
gained Tower Shield, Tattered Wool: 7→11, Tattered Hide: 7→8→9→11) — when this happens, retroactively backfill the
newly-discovered piece(s) onto every monster that already references that family.

- Backfill is **per-monster**, based on the *global* known roster (not just what that
  monster's own screenshots showed) — newly confirmed dropping 1 piece → gets every other
  known piece too. Applies retroactively: an existing monster with partial pieces gets new
  discoveries backfilled too. **Mechanically: add one `{ "family": "Name" }` entry** — not
  individual items (expensive to produce, and unlike the compact form, needs hand-correction
  on every monster whenever the roster grows).
- No confirmed-vs-inferred distinction is tracked (removed 2026-07-17, superseded by the
  Submit form's own suggestion links) — inferred pieces still get added to `drops`, just no
  longer flagged as such.
- Items still need a real screenshot for a full `items.json` entry — an inferred drop with
  no matching item renders as unlinked plain text until a card comes in.
- **A fully-backfilled family can make a drop list unreadably long** (Rusty Iron alone is 42
  items) — `renderMonsterCardHTML` collapses these into one grouped link
  (`"<Family> (<N> items)"`) via `groupMonsterDrops(drops)`, instead of listing every piece.
  A family with only one drop on a given monster still renders as a group (grouping is by
  *kind*, not count). Click calls `goToItemSearch(familyName)` — pre-fills the Item
  Database's search box with the family name (existing substring search already filters to
  exactly that family, no new filter UI needed).

Hovering a monster's name (`.monster-name-hover`, `setupMonsterTooltip`) shows its card in a
floating preview (`#monster-tooltip`, flip-above-if-no-room-below like an item's). Unlike an
item tooltip, this one's clickable — clicking anywhere opens the full `#monster-viewer`
modal (`openMonsterViewer`/`setupMonsterViewer`, same shell as `#item-viewer`); clicking a
drop or "Place Holder" link inside the tooltip jumps straight there instead. Tooltip has a
"Click for more info" hint (modal omits it, since it IS the destination). Both render via
shared `renderMonsterCardHTML(monster, opts)`. Tooltip is a DOM singleton reused across every
zone list, tracked via `tooltip._monster` property (not a closure variable, which would go
stale on a second zone list's fresh closure). Clicking a drop-linked item sets
`pendingReturnToMonster` before navigating, for a "&larr; Back to `<monster name>`" link;
`goToItem`'s second arg takes a recipe object or `{ kind: 'monster', name, slug }`.

Monsters page is wired into header search the same way Items/Crafting are — "Monsters"
results section, `goToMonster` navigates + flashes the matched row
(`pendingHighlightMonster`), sets the zone-scoped hash so results land in the right scoped
list.

**Gotcha:** `goToMonster`'s zone fallback must match `monsterZone()`'s fallback exactly
(`"Unknown Zone"`, not `null`/`undefined`) — a mismatch caused `escapeAttr(null)` to throw,
silently swallowed by `loadPage`'s catch, surfacing as blank "Page not found" instead of a
visible error. Check this if a future pending-scope feature hits the same silent-failure
shape.

## Adding a Beastmaster companion

Companions page (`pages.json` `"type": "companions"`) shows every tamed-pet type, rendered
as item-card-style cards (`renderCompanionCardHTML`, reusing the plain gold `.item-card`
style, not teal recipe variant) rather than raw screenshots.

Two flat-array data files:

- `companions.json` — one entry per animal type: `name` (e.g. "A Bear Companion"), `slug`,
  `animal` (lowercase icon key), `observedAtLevel` (recorded as an observation, not asserted
  as fixed per-species), `skills` (that companion's own unique abilities only).
- `companion-skills.json` — abilities every companion shares: **Provoke** (Martial Ability,
  threat) and **Bite** (Might Ability, physical damage). Recorded once, rendered as a
  "Shared Abilities (Every Companion)" block above the grid.

Skill object (both files): `{ name, type, description, castTime, cooldown, range }` — `type`
= "Martial Ability"/"Might Ability", `range` omitted for self-cast/no-range. Drops
boilerplate tooltip lines (Innate, Does Not Trigger Global Cooldown) true of every ability —
only what varies is captured.

**Screenshots not archived for this category** — a pet's batch is several stacked UI windows
(Pet window + one tooltip per ability), processed for data and deleted, not moved anywhere.

**Icons:** `ICON_DEFS`/`ICON_BG` keys `bear`/`rat`/`crocodile`/`spider`, same
flat-silhouette-in-circle style as everything else — card icon is `svgIcon(companion.animal)`
directly (`animal` doubles as the icon key). Add another animal key the same way for a new
type.

Own local search box, wired into header search like Monsters (`goToCompanion`,
`pendingHighlightCompanion`, `.card-flash` gold-accent animation since `.recipe-flash`'s
teal doesn't match a plain `.item-card`).

## Spells & Abilities page

Own top-level page (`pages.json` `"type": "spells"`, no group), a class-scoped lookup for
player spells/abilities — **separate concept from the class-quest starter items** covered
under "Adding an item to the Item Database" (e.g. Humble Note). Two-level like Crafting:
`renderSpellsClassCategories` shows a grid of all 18 classes (`.craft-grid`/`.craft-card`,
reused as-is — a spell card can belong to multiple classes, unlike a tradeskill card, so
there's no dedicated per-class icon; every class card uses the same `spellsicon` glyph) with
a live spell count per class; clicking one calls `renderSpellsClassList`, a flat
`.companion-grid` of `.item-card`-styled spell cards for that class (same "back to grid"
pattern as `renderCraftingRecipes`'s `onBack`, no hash sub-route).

**`spells.json`** — flat array, one object per spell/ability: `name`, `slug`, `classes`
(array of class codes, e.g. `["DRU", "RNG"]` — a spell usable by multiple classes appears
under each one), `requiredLevel`, `type` (`"Spell"` or `"Ability"` — see below), `description`
(the effect text), `lastUpdated`.

**Source is the teaching scroll, not a spellbook tooltip** — spells/abilities are learned via
a `"Scroll: <name>"` item (right-click, scribe into your Ability Book), so every spell card's
source screenshot is that scroll's own item-card popup. **Add the scroll to `items.json` too**
(`type: "Misc"`, `tags: []`, `weight`/`size`/`classes`/`race` from the card, `effect` = the
scroll's full boilerplate + description text verbatim, e.g. `"A spell scroll. Scribe this in
the Book tab of your Ability Book while a Spellbook is equipped. Required Level: 32. <effect
description>"`) — this is a real, separate `items.json` entry (not archived as an image,
2026-08-04 policy still applies), and `spells.json`'s own `description` field holds just the
effect text on its own, without the boilerplate. **Don't store the scroll link as a field** —
`renderSpellCardHTML` resolves `findItemByName('Scroll: ' + spell.name)` dynamically at render
time (clickable "Taught by:" line if a match exists, plain text otherwise), same
never-store-a-computed-reference precedent as a recipe's `components`.

**`type` comes straight from the scroll's own boilerplate line**: "A spell scroll. Scribe
this in the **Book** tab..." → `"Spell"`; "An ability scroll. Scribe this in the **Innates**
tab..." → `"Ability"`. Record verbatim, don't guess from the spell's own effect.

**`CLASS_NAMES`** (script.js) — full class-code-to-name map used only for this page's display
labels (every other item/recipe filter on the site shows the bare 3-letter code, unchanged).
**Only 8 of the 18 are actually confirmed**: CLR/DRU/ELE/ENC/NEC/SHM/WIZ from the official new
player guide's own "true caster classes" list, and RNG from this page's own Ranger spell
scrolls. The rest (ARC/BRD/BST/FTR/INQ/MNK/PAL/ROG/SHD/SPB) are standard-genre-convention
guesses, not yet confirmed by any in-game text — correct the map directly if one turns out
wrong, no schema migration needed since nothing else reads it.

Same source-of-truth caution as everywhere else applies to a scroll card missing its Class/
Race line (scrollbar-cropped vs. genuinely absent) — leave unset and flag in
`To-Do/items-needing-text.txt` rather than guessing, same as any other item.

Header search integration matches Companions' pattern exactly (`goToSpell`/
`pendingHighlightSpell`/`pendingSpellsClass` — the latter picks the spell's *first* listed
class to land on, since a multi-class spell doesn't have one canonical class page).

## Faction

Own top-level page (`pages.json` `"type": "faction"`, no group) listing which monsters raise
or lower standing with a given faction. **No dedicated data file** — reuses `monsters.json`
via an optional `factionEffects` array on a monster entry: `[{ "faction": "Faction Name",
"effect": "positive" | "negative", "zone": "Zone Name" }]` (`zone` optional — see below).
`renderFactionPage` scans every monster for this field at render time and groups the results
by faction name into two columns (raises/lowers) — nothing is precomputed or stored
elsewhere, same as `groupMonsterDrops`'s reverse lookups.

**Each monster shown in a faction's list displays which zone it's found in** (2026-08-12,
user's own request) — `renderFactionMonsterLiHTML` resolves this per entry: a `factionEffects`
entry's own `"zone"` wins if set, otherwise it falls back to the monster's own `maps` list
(joined, so a monster confirmed in several zones just shows all of them). Only worth setting
`zone` explicitly on the effect when it's needed to **disambiguate** — see next paragraph;
don't add it to every entry as a matter of course, since the `maps` fallback already covers
the unambiguous majority for free.

**Same monster name, different zone, different faction — this is a real, confirmed case, not
hypothetical.** A monster name shared across zones (per the existing "same exact name across
zones = same monster entry" convention) can genuinely give *different* faction effects
depending on which zone's spawn was actually killed — e.g. "a smuggler" exists in Shaded
Dunes/Night Harbor/Sungreet Strand/Fallen Pass, but only the **Night Harbor** one is
confirmed to affect Bends Garrison/Serpent Sashes (per the wiki's own "Zones in which you can
raise the faction: Night Harbor" on both those faction pages) while only the **Fallen Pass**
one is confirmed to affect Gilded Claw/Citizens of Night Harbor/Pyrmos Mercenaries/Steel
Talons/Vermahn's Brood (from the user's own Fallen-Pass-specific screenshots — the wiki
doesn't even list "a smuggler" on those faction pages at all). Merging all of a shared-name
monster's `factionEffects` into one undifferentiated list would silently claim the *wrong*
zone's kills raise/lower each faction. Whenever a monster has both (a) `factionEffects` and
(b) more than one entry in `maps`, check whether the effects are actually zone-universal or
zone-specific before merging — if zone-specific, set `"zone"` on each affected entry
individually rather than leaving it to the `maps` fallback (which would incorrectly imply
*every* zone the monster spawns in shares the same faction effects). Confirmed so far: **a
smuggler** (Night Harbor: Bends Garrison/Serpent Sashes; Fallen Pass: Gilded Claw/Citizens of
Night Harbor/Pyrmos Mercenaries/Steel Talons/Vermahn's Brood), **a hired tracker** (Fallen
Pass only: same Gilded-Claw-bundle as above — its Sungreet Strand spawn has no confirmed
faction effects at all), **a river pirate** (Night Harbor: Bends Garrison/Serpent
Sashes/Ten Hooks). Check any *other* multi-zone monster that later gains `factionEffects`
the same way before assuming its effects apply everywhere it spawns.

**Workflow once a faction-change screenshot/chat message comes in**: identify which monster
was killed and which faction changed (and which direction), then append one `factionEffects`
entry to that monster (create the array if it doesn't exist yet) and bump `lastUpdated` — same
append-only-per-confirmed-observation convention as `conObservations`/`coinDrops`.

**Confirmed message format** (2026-08-10): `"Your faction standing with <Faction Name> got
better."` / `"...got worse."` — one line per affected faction, printed together right after a
kill. `"got better"` → `effect: "positive"`, `"got worse"` → `effect: "negative"`. **A single
kill can print several of these at once** (one real example: killing any Dustrend-camp mob in
Vale of Zintar prints all four of Citizens of Night Harbor +, Orcs -, Pyrmos Mercenaries +,
Steel Talons + together, every time) — record every line shown, not just the first.
Confirmed so far, every Vale of Zintar Dustrend-camp/orc kill prints this same fixed set of
four; unconfirmed whether other zones/factions share it or have their own — don't assume this
exact four-faction bundle for a monster in a different camp until its own screenshot confirms it.

The page renders an empty state ("No faction data recorded yet") until the first
`factionEffects` entry exists anywhere in `monsters.json` — this is expected, not a bug, same
"structurally ready, fills in over time" precedent as `conObservations` when that system was
first added.

**Bulk-imported from the fan wiki's own per-faction pages** (2026-08-11, at the user's
request — `monstersandmemories.miraheze.org/wiki/<Faction Name>`, one page per faction,
each listing "Mobs you can kill to raise/lower the faction"). Same weaker-than-a-screenshot
caveat as every other fan-wiki source in this file: **only ever fills a gap, never touches a
monster that already has `factionEffects`** — a monster the user has directly confirmed via
their own "Your faction standing with X got better/worse" screenshot keeps that data exactly
as recorded, even if the wiki disagrees or is incomplete (e.g. the wiki's own "Steel Talons"
page doesn't list the Dustrend-camp mobs, but the user's own screenshots already confirmed
Dustrend kills raise Steel Talons — that confirmed bundle was left untouched). A same-monster
spelling mismatch between the two sources (e.g. the wiki's "Sivah Arjun" vs. this site's
already-confirmed "Sivah Arujan") was matched by hand rather than skipped, keeping this
site's spelling. Direct `WebFetch` to this domain returns 403 Forbidden — use the in-app
browser (`mcp__Claude_Browser__navigate` +
`get_page_text`) for any future visit to this wiki instead.

**Follow-up the same day: the user explicitly asked to also create monster entries for every
wiki-only name that had no match** — a deliberate, one-time exception to "monster existence
requires the user's own screenshot/statement," scoped to this specific bulk import at the
user's own direction, not a standing policy change. Added as minimal stubs (`name`, `slug`,
`named` when the naming style implies a boss — capitalized, no leading "a"/"an" — `maps`/
`areas` only where the wiki page had an explicit per-mob zone tag, `factionEffects`,
`needsInfo: true`). Slugs were checked against existing monsters first — one wiki name
("High-Priest of Muurtu") turned out to be the same monster as the already-existing "High
Priest Of Muurtu" under different punctuation (slugified to the same string); merged into
the existing entry instead of creating a duplicate.

## Leveling Suggestions page

A curated leveling guide (`pages.json` `"type": "leveling"`, own top-level sidebar entry) —
**not derived from monster/map data**, it's a standalone community-submitted guide living in
`leveling-locations.json`. Credit line ("Guide compiled by **Flourishing** (Monsters and
Memories Discord)") is hard-coded in `renderLevelingPage` — update the name there if a
different/updated source guide ever replaces this one.

- **Data shape**: flat array, one object per zone: `region`, `zone`, `zoneAbbr`, `levels`
  (array of `{ level, camps: [{ name, raid }] }`, only levels with at least one camp present —
  no padding out to a fixed 1-60 list). `level` is the bracket's floor (1, 5, 10, ... 60,
  matching the source spreadsheet's own columns), not an exact recommendation.
- **Rendering is level-bracket-first, not zone-first** (`renderLevelingPage`) — a mockup was
  shown to the user comparing this against a zone-drill-down and an interactive level-input
  filter; level-bracket-first was the one approved. One `<section>` per level (ascending),
  each grouped by region then zone. A sticky quick-jump nav bar at the top links to each
  section by anchor (`#leveling-lv-<N>`).
- **Camp names dynamically link to monsters.json** by exact case-insensitive name match, same
  convention as drops/components — most camp entries are place/trash descriptions with no
  match and render as plain text; named bosses that already exist in `monsters.json` become
  clickable (`goToMonster`). Nothing new to set on the monster side.
- `raid: true` (from a `(R)` suffix in the source) renders a small "Raid" badge next to that
  camp — stripped from the display name itself, not left in the text.
- **Source-of-truth note**: this page's data comes from a single community spreadsheet
  (`.ods`), not individual screenshots — the normal "newest screenshot wins" per-field
  correction model doesn't really apply here. If the user brings in a revised/updated version
  of the guide later, treat it as a wholesale replacement of `leveling-locations.json` (ask
  first) rather than trying to merge field-by-field.
- Parsing an `.ods` (a zip of XML files, `content.xml` holds the sheet): watch for **vertically
  merged cells** — ODF represents these as `<table:covered-table-cell>` placeholders in the
  covered rows, not a repeated/empty `<table:table-cell>`. Skipping those (e.g. an XPath that
  only selects `table:table-cell`) silently shifts every subsequent column left for any row
  under a merge, misattributing values to the wrong level bracket. Also watch for a repeated
  header/legend block appearing mid-sheet (this source had one before its second region) —
  a naive "skip this row if column 0 matches the header text" check misses it if that same
  merge-shift has pushed the header text into a different column; skipping by content match
  regardless of column position (or a defensive post-pass stripping any camp name that's
  exactly a legend string or a bare level number) is more robust than trusting column position
  alone near a header repeat.

## Sidebar "Most Visited Tradeskills"

Below main nav, shows up to 5 tradeskills by visit count (`#sidebar-visits-wrapper`, built
in `buildSidebar`, refreshed by `updateVisitedSidebarSections`). Client-side only — visits
in `localStorage` (`PAGE_VISITS_KEY = 'mnmwiki-page-visits'`), never sent anywhere, one
browser only (noted under the list). Hidden until ≥1 visit recorded, reuses the
"Tradeskilling" group's markup style.

**Tradeskills only** — every other top-level page dropped from tracking entirely (full
removal history in `CLAUDE-HISTORY.md`).

**Tracks the deepest thing actually reached, not the top-level page passed through** —
browsing the Gathering/Crafting category grid without picking a tradeskill records nothing;
drilling into e.g. Mining or Alchemy records that tradeskill specifically:

- `renderTradeskillSection` calls `recordVisit('craft', tradeskillName)` — single choke
  point for "landing on one tradeskill's own recipe list" regardless of route.
- `renderGatheringNodes` calls `recordVisit('gathering', tradeskillName)` the same way.
- `loadPage` no longer calls `recordVisit` at all — no page in its own right is tracked.

Stored entry: `{kind, id, count, lastVisited}` keyed `` `${kind}:${id}` ``. `kind: "craft"`
(`id` = tradeskill name, including Enchanting and Disenchanting — both still reach
`renderTradeskillSection` normally even though `craftPageHash` sends Disenchanting to the
Gathering page) or `kind: "gathering"`. `resolveVisitEntry` turns a stored entry into a
display title + click action per kind, returns `null` for anything else — transparently
drops any leftover `"page"`-kind entry from before 2026-07-19, no migration needed. Entries
aren't validated against `tradeskills.json` (tradeskills essentially never get
renamed/removed; a stale one just lands on an empty page, not an error).

Active-link highlighting doesn't apply here — a tradeskill's link is left permanently
non-active rather than approximated (no single top-level `baseFile` correctly highlights
just one tradeskill sharing `#crafting`/`#gathering`).

## Header search box

Searches everything, not just page titles — also `items.json` (`itemSearchHaystack`) and
`crafting.json` (name + tradeskill). Results grouped into Pages/Items/Crafting sections via
`renderSearchResults`.

Clicking an item/recipe result needs to land on a page that doesn't exist yet — two
module-level variables, `pendingItemQuery` and `pendingCraftingTradeskill`, set before
navigating, consumed (and cleared) by `renderItemsPage`/`renderCraftingPage` on render — pre-
filling the search box, or jumping straight to a tradeskill's recipe list. A future
data-driven page reachable from header search should follow the same pattern rather than
encoding state into the URL hash (hash is a plain page-file lookup elsewhere).

Items/crafting data pre-fetched during `init()` (`ensureItemsData()`/`ensureCraftingData()`)
so header search works before the user visits those pages.

## Item and recipe cards

**Items/recipes are *displayed* as cards rendered entirely from JSON — not screenshots**
(original design, not modeled on any other site's popup).

**As of 2026-08-04, screenshots are no longer saved for new items/recipes** — game gets
rebalanced over time, an old screenshot stops reliably representing current state, and
archiving cost real disk/repo space. Pre-2026-08-04 entries keep whatever `image` they have.
Cut-off/truncated screenshot text is a data-completeness question (did the missing text make
it into the JSON before the source was discarded?) — see `To-Do/items-needing-text.txt`.

**The renderer:** `renderItemCardHTML(item)`/`renderRecipeCardHTML(recipe)` build each
card's HTML from scratch — header (type icon, name, badges), field grid (Slot/AC/Weight/
Size etc., or Weight/Size for recipes), stat chips (`statEntries(item)`, also used by the
table's `formatStats()`), Class/Race line, description/effect, items-only "Dropped by" line.
Recipes list Components, each linked to the Item Database when a match exists.

**`needsInfo`** (items and recipes) = confirmed to exist, no real data yet. Shows a red "This
item/recipe needs more info" note linking to `#submit`, plus a red "NEEDS INFO" badge on the
table/card header. Item Database and Crafting page both have a needs-info toggle filter.
Only set fields genuinely confirmed (weapon `skill`/`twoHanded`/`slot` can often be inferred
from an established sibling type — never `damage`/`delay`/`weight`/`ac`).

**Icon system:** header icon = colored circular badge — `ICON_DEFS[key]` glyph SVG, parallel
`ICON_BG[key]` background hex, `svgIcon(key)` assembles both. Icon key derived from existing
fields (no new schema field):
- **Weapon** — `weaponIconKey(item)`: `skill` + `twoHanded` → 1H/2H ×
  Bludgeoning/Slashing/Piercing, plus Archery/Throwing/Ammo, falls back to `slashing1h`.
- **Armor** — `armorIconKey(item)`: name keyword "Plate"/"Chain"/"Rawhide"/"Hide"/"Leather"/
  "Cloth" → material icon (shared tunic base, per-material texture layer); `slot ===
  "Secondary"` or name containing "Shield"/"Buckler" → Shield icon instead (own category,
  not a Material-dropdown option — a shield isn't a material tier). No keyword match →
  generic armor icon.
- **Jewelry** — `jewelryIconKey(item)`: Ring/Earring/Necklace from `slot` (Finger/Ear/Neck).
- **Food/Drink/Container** — one fixed icon each.
- **Misc (crafting materials)** — `craftingIconKeys(item)`: one icon per linked tradeskill in
  `crafting.json`, left to right. No recipe link → generic raw-material icon.
- **`TRADESKILL_ICON`** — every tradeskill in `tradeskills.json` (38) — recipe cards' header
  icon uses this, falling back to the tradeskill's initial letter if none.
- **`NAV_ICON`** — maps a `pages.json` `file` to one of the icons above, shown at 16px before
  each sidebar link and "Most Visited" entry (a "craft"/"gathering" entry looks itself up in
  `TRADESKILL_ICON` by tradeskill name instead). Most reuse an existing icon (Maps →
  `navigation`, Crafting → its own glyph, Monsters → `boss`/`paw`, Companions → `wolf`) —
  `links`/`itemdb`/`gatheringicon`/`submiticon` are the only four drawn from scratch. No
  `NAV_ICON` entry → renders without an icon, no gap left (true for Enchanting/Disenchanting
  now that they're cards, not separate pages).

**Gotcha:** a filled ring/hoop drawn via one SVG arc sweeping almost 360° renders broken in
Chrome — use two-arc-per-circle construction (`M (cx-r) cy A r r 0 1 0 (cx+r) cy A r r 0 1 0
(cx-r) cy Z`, outer+inner each from two semicircle arcs) with `fill-rule="evenodd"` instead
(what `ring`/`earring` use). (Icon system's redesign history: `CLAUDE-HISTORY.md`.)

**Category label:** small muted line under the item name (e.g. "Greataxe", "Plate Armor") —
`itemCategoryLabel(item)` reuses the same `itemIconKeys(item)` the icon is built from (via
`ICON_LABELS`), so icon and label can never disagree. Items only.

**Item cards use gold `--accent`; recipe cards use teal `--accent-craft`**, recipe name
colored teal, tradeskill shown as a badge where an item card shows tags — only thing keeping
the two visually distinct (`.item-card` base, `item-card-recipe`/`item-card-icon-recipe`/
`item-card-name-recipe`/`badge-tag-craft` modifiers).

**Where cards appear:**
- Clicking an item name anywhere on the site (Item DB row, linked recipe name/component,
  monster drop, gathering result, spell scroll) → `#item-viewer` modal
  (`openItemViewer`/`setupItemViewer`), full card + "Crafted via"/"Used to craft"
  (`findRecipeForItem`/`findRecipesUsingItem`). `#item-viewer-panel` caps `max-height: 88vh`
  + `overflow-y: auto`. Close button on the overlay (no separate header bar). **No hover
  preview anymore** — removed site-wide 2026-08-11 (started 2026-08-10 as an Item-Database-
  only change, then extended everywhere at the user's request). `renderItemCardHTML(item)`
  no longer takes an `opts` param — the old `opts.interactive`-gated sections (gamelink,
  suggest-a-correction) always render now, since the only remaining caller (`openItemViewer`)
  always wanted them; the removed `opts.isTooltip` hint text doesn't apply anywhere anymore.
  If a hover preview is ever wanted back for items, `setupMonsterTooltip` is the pattern to
  copy from — it's the one hover-card shell still on the site.
- Every Crafting-page recipe renders as its own card directly in the grid.

**`item.foundAt`** — optional free-text ("Quest reward: `<quest name>`", any non-monster
source) on the card's **"Dropped by"** line — always renders ("not yet known" when absent).
**This line leads with a live reverse lookup:** `findMonstersDroppingItem(itemName)` scans
every monster's `drops` for this item (same convention as the crafting reverse lookups just
above it), lists each match as a clickable link. Any `foundAt` text still appears too,
appended after monster links. Purely a render-time lookup, nothing new to set on the monster
side.

**No `rumor` field** (removed site-wide 2026-07-17) — used to hold unconfirmed guesses
separately from confirmed fields, rendered as an amber line. Superseded by the Submit
form's drop/spawn suggestion path — don't add a `rumor` field or reintroduce
`.item-card-section-rumor` styling. Genuinely unconfirmed info belongs in a form submission,
not written directly onto the card.

**`item.readText`** — full text of a readable note/letter, distinct from `description`
(short flavor line) — only revealed after reading the note in-game. Own section
(`.item-card-section-note`, italic quoted-letter style with left accent border), labeled
"Note text", right after flavor/effect. Preserve paragraph breaks via literal `\n` in the
JSON string (`renderItemCardHTML` converts to `<br>` after escaping — the one field where
this matters). Included in `itemSearchHaystack`. Use for any future readable book/letter.

### `lastUpdated` — a "Last updated" badge, plus a site-wide "Recently Updated" list

Optional plain `"YYYY-MM-DD"` string on an entry in `items.json`, `monsters.json`,
`crafting.json`, or `companions.json`.

- **Set to today's date whenever you add a new entry or edit an existing one's real data**
  (stats, drops, components, description, image — anything beyond the field itself). Applies
  to normal add-entry workflows and inbox-batch processing.
- **Don't** bump for a change not about the entry's own content (reformatting, a
  schema-wide script.js/CSS change touching how every card renders).
- Rendered as "Last updated: `<date>`" (`formatLastUpdated()`, `.last-updated-badge`) under
  the name on every card — absent entries render nothing (most pre-2026-07-19 entries have
  none and won't get a backfilled date).
- **Sidebar's "Recently Updated" box** (`updateRecentlyUpdatedSidebar()`, own bordered box
  below History — site-wide content freshness, not per-visitor tracking) lists the 6 newest
  `lastUpdated` entries across all four files, each a clickable link. Ties break on position
  within the data file, later = more recent. Hidden entirely if nothing has `lastUpdated`.
- **Backfilled once, retroactively, for recent history only** — mining exact dates from git
  history is only reliable for a commit that added an entry (new `"slug"` line in the diff);
  an edit to other fields doesn't necessarily touch the slug line. Initial rollout backfilled
  entries touched by the two commits immediately preceding this feature; everything older has
  no `lastUpdated` rather than a guessed one. Same "starts fresh, builds up over time"
  precedent as visit tracking — don't try to backfill further if this area gets touched
  again, just keep setting the field going forward.

## Known CSS gotchas

`.content-inner img` sets `display: block` at specificity `(0,1,1)`. A bare class selector
like `.some-class` is `(0,1,0)` and loses silently. If a new img-related style doesn't seem
to apply, check this first — raise specificity (`.content-inner .my-class`) or control
visibility via inline styles from JS instead of a CSS class toggle.

**`overflow-x`/`overflow-y` can't be set independently to `visible` vs. non-`visible`.** Per
the CSS overflow spec, if one axis is anything other than `visible` (e.g. `auto`), the other
axis's computed value becomes `auto` too — **even if it's explicitly declared `visible` in the
source**, the declaration is silently overruled (confirmed by testing: `.items-table-wrap`
had `overflow-x: auto` + an explicit `overflow-y: visible`, and `getComputedStyle` still
reported `overflowY: "auto"`). This has bitten two absolutely-positioned tooltips so far —
`.sidebar` (`overflow-y: auto` alone) and `.items-table-wrap` (`overflow-x: auto` alone) —
both silently clip anything positioned outside their own box on the *other* axis. Two known
fixes, pick whichever fits: (1) if the element truly never needs to scroll on either axis in
the relevant state, set the `overflow` shorthand to `visible` outright (both axes at once —
this is what the sidebar's collapsed-rail tooltip does); (2) if one axis's scroll is load-
bearing (like `.items-table-wrap`'s horizontal scroll), don't fight the ancestor at all —
reposition the popover to stay *inside* the ancestor's own box instead (the Item Database
header tooltips now render `top: 100%` instead of `bottom: 100%`, overlapping the table's own
first row rather than exceeding the wrap's top edge, so no clipping is possible regardless of
overflow). Check this first any time a `position: absolute` popover renders partially (a
border/corner peeking through but the content itself invisible) inside a scrollable ancestor.

**`.layout` needs an explicit `width: 100%`.** `.layout` is `display: flex` +
`align-items: flex-start` (desktop sidebar+content row) + `margin: 0 auto` (1600px
desktop-centering) while itself a flex item of `<body>` (sticky-footer trick). Per the
flexbox spec, left/right `auto` margins on a flex item suppress cross-axis `align-items:
stretch` — width falls back to shrink-to-fit based on children's content, unstable
especially right after a client-side re-render swaps `.content-inner` HTML. Fixed with an
explicit `width: 100%` (a definite width isn't subject to the ambiguity). Any element
needing `margin: 0 auto` centering while also a flex item needs the same explicit width —
don't rely on `align-items: stretch` alone once auto margins are involved.

**A sticky sidebar needs its own height capped to the viewport, not just `position:
sticky`.** `.layout`'s height (flex row, `align-items: flex-start`) is the *taller* of
`.sidebar`/`.content`, doesn't grow to accommodate the sidebar atop content's own height.
`position: sticky` can only pin for as long as the containing block is taller than the
element by at least its `top` offset — when the sidebar's height approaches/exceeds
content's, that room shrinks toward zero and sticky stops almost immediately. Reproduced on
the Crafting page's short category grid (sidebar taller than content left ~zero sticky
room). Fixed via `.sidebar { max-height: calc(100vh - 76px - 20px); overflow-y: auto; }`
(themed scrollbar via `scrollbar-color`/`::-webkit-scrollbar-*`) — guarantees the sidebar
itself can never exceed viewport height, the one thing fully within its own control
regardless of content height on either side. `align-self: flex-start` added alongside as
harmless hardening (not shown to be part of the actual cause).

## Mobile / narrow-viewport layout

Three changes, scoped to media queries (desktop >900px untouched):

- **Structural breakpoint at 900px** (`.layout { flex-direction: column }`, sidebar
  stacking, table/column-width tweaks) — raised from 780px, which left a dead zone where the
  sidebar still took its fixed 230px column alongside content.
- **The `.layout` width fix above** — the actual root cause of a narrow-format layout bug,
  not just the breakpoint threshold.
- **Sidebar nav in stacked mode = rounded pill chips** (`.sidebar-link` gets background +
  `border-radius: 20px`) instead of plain wrapped text, reads as tappable buttons.
- **`@media (max-width: 480px)`** for phone widths: tighter padding at every layer
  (`.layout`, `.sidebar`, `.content`, `.content-inner`, `.header-inner`), plus
  `background-attachment: scroll` (fixed background is janky on mobile browsers, pointless
  once panels fill nearly the whole viewport anyway).

## Wide portrait screens (e.g. a 1080x1920 monitor)

A screen can be wide enough for the normal desktop side-by-side layout (>900px, so none of
the width breakpoints above fire) yet still be *portrait* — the fixed 230px sidebar eats a
bigger relative share of that width than it would on a landscape monitor, leaving wide data
tables (Item Database) cramped despite the window being "desktop width." Confirmed 2026-08-13
via a user report on a 1080x1920 monitor.

**Explicit user requirement: never change anything for landscape users, at any width** — an
earlier attempt at this fix (raising the *width* breakpoint itself to 1150px) was rejected
outright ("i don't like those changes at all, revert") specifically because it also changed
behavior for landscape windows in the 900-1150px range. The orientation-based fix below was
approved instead, specifically because `orientation: portrait` only matches when height >
width — it cannot fire for a landscape window at any size, by construction, not just by
choice of numbers.

**`@media (orientation: portrait) and (min-width: 900px)`** (separate from, and evaluated
alongside, the width-based queries above — `min-width: 900px` keeps phones out, since a
portrait phone is already narrow enough to hit the width breakpoints' stacked/card layout
instead):
- Sidebar narrows from 230px to 190px, `.layout` gap 32px -> 24px — frees width for content
  without changing the sidebar's own vertical-list design (still side-by-side with content,
  never switches to the stacked pill-nav — the user explicitly wants to keep the sidebar
  exactly as it behaves on desktop).
- Item Database table reuses the same icon/column sizing already proven at the ~850px table
  width of the `max-width: 900px` tablet block (a 1080px portrait window with the trimmed
  sidebar lands in a similar ~800-850px content width): smaller header icons
  (`.col-header-icon-wrap`/`.col-header-svg`/`.col-header-symbol`), rebalanced `<col>`
  percentages, reduced table font-size/padding.

**Collapsible icon-rail sidebar** (2026-08-13, user's own request, same `orientation:portrait
and min-width:900px` query as above) — a click-toggle button (`.sidebar-toggle-btn`, built in
`setupSidebarCollapseToggle`/`buildSidebar` in `script.js`, prepended as the sidebar's first
child) shrinks `.sidebar` from 190px to a 52px icon-only rail. State lives in
`localStorage` (`mnmwiki-sidebar-collapsed`) and is applied as a `sidebar-collapsed` class on
`<body>` — but **every actual style change is nested inside the same portrait+wide media
query**, so a landscape visitor never sees the toggle button (`display:none` outside that
query) and the stored class has zero visual effect for them regardless of what's in their
localStorage. This was a direct, explicit requirement ("but only make this change for the
portrait version of the site, the landscape version has more than enough room") — don't move
any of this CSS outside that media query.

- Collapsing hides text labels (`.sidebar-link-text`) and group headings, but never hides a
  *destination* — every page (including ones nested under Tradeskilling/Monsters) already has
  its own `NAV_ICON`, so nested groups are forced open (`.sidebar-group.sidebar-group-collapsed
  { display: block }`, 3-class specificity beats the base 2-class rule with no `!important`
  needed) rather than adding a second collapse layer inside an already-collapsed rail.
- Hovering a collapsed link shows its title via the same instant `::before` + `data-tooltip`
  CSS tooltip pattern as the Item Database header icons (`link.dataset.tooltip = page.title`,
  set unconditionally in `buildSidebar`'s page loop — costs nothing when expanded, since the
  tooltip CSS itself is also scoped inside `body.sidebar-collapsed`).
- **Gotcha:** `.sidebar` sets `overflow-y: auto` but never `overflow-x` — per the CSS overflow
  spec, setting only one axis to non-`visible` computes the *other* axis to `auto` too, not
  `visible`. That silently clips anything positioned outside the sidebar's own box (the hover
  tooltips above, and an earlier draft of the toggle button that tried `position:absolute;
  right:-14px`). Fixed two ways: the toggle button stays in normal document flow (prepended,
  not absolutely positioned) so it never needs to exceed the box; the collapsed state sets
  `.sidebar { overflow: visible }` outright, safe because the collapsed rail's content (~13
  page icons, no History/Recently boxes) is short enough not to need its own scroll in
  practice.
- **Most Visited Tradeskills / Recently Updated hide entirely while collapsed** — their
  entries are dynamically generated (visit counts / `lastUpdated` dates) with no per-item icon
  to fall back on, so there's nothing sensible to show in a 52px rail. Still fully available by
  expanding.

## Splash screen

Full-viewport gate (`#splash-screen` in `index.html`) on every fresh load — site's actual
name "Petrichor's Monsters and Memories Wiki" lives here (header/`<title>` still say "Game
Wiki", untouched). Background: `images/splash-hero.jpg`.
**Note for future `.webp` input:** `System.Drawing` (GDI+) can't load `.webp` at all ("Out of
memory" is the misleading error) — use `System.Windows.Media.Imaging.BitmapDecoder` (WPF,
`Add-Type -AssemblyName PresentationCore`) instead, goes through OS WIC codecs
(`BitmapDecoder` to load, `JpegBitmapEncoder` to save).

Clicking **Enter** adds `.site-entered` to `<body>` (`setupSplashScreen()`) — everything else
driven off that class in CSS: splash fades out while sidebar slides in from the left
(`transform`, not display/layout, so no content-column jump). `body:not(.site-entered) {
overflow: hidden }` blocks background scrolling while splash is up.

**Shows on every load, not just once per visitor** — no session/localStorage "already
entered" check (deliberate simplest reading of the original request; revisit only if the
user says the repetition is annoying).

## Layout width

`.layout`/`.header-inner` cap at 1600px (uses most of the screen on normal monitors, doesn't
stretch edge-to-edge on huge ones). `.content-inner` caps ~820px for prose pages (readable
line length); data-driven pages (Item Database, Maps, Crafting, Monsters) get a
`content-wide` class toggled from `loadPage()` that removes the cap — extend the same
`page.type` check for any future full-width page.

Item Database table: `table-layout: fixed` + explicit `<colgroup>` (percentage widths in
`renderItemsPage`), no `white-space: nowrap` — long cells (Classes, Stats) wrap instead of
forcing horizontal scroll. Adding a column needs a proportional `<col>`, not auto-sizing
(auto-sizing caused the original horizontal-scroll problem).

## Back to top button

Single floating button (`#back-to-top-btn`, bottom-right), built once site-wide in
`setupBackToTopButton()` (called from `init()`). Built as one global button since the whole
site scrolls the window itself (no per-page inner scroll container) — one
`window.addEventListener('scroll', ...)` toggling `.visible` covers every page. Appears once
`window.scrollY > 400`, smooth-scrolls to top on click.

## Local preview

No Node/Python in this environment's PATH. Spin up a throwaway static file server (e.g. a
small PowerShell `HttpListener` script) rather than assuming `python -m http.server`/`npx
serve` work — check first. Don't commit a `.claude/launch.json` pointing at a
session-scoped scratchpad path; won't survive past the session.

## Git workflow

User is non-technical, relies on Claude for all commits/pushes. **Changes are not pushed
automatically — wait for an explicit request (e.g. "push") before `git push`.**

**Every push adds one `changelog.json` entry first** (2026-08-13, user's own request — see
"Home page" below for where it's displayed). Before running `git push`, prepend one `{
"timestamp": "YYYY-MM-DDTHH:MM", "summary": "..." }` object to the *top* of the array (get
the real current time via `date "+%Y-%m-%dT%H:%M"` in Bash, don't guess it). One entry per
push covering everything in that push, not one per file/commit. `summary` is plain language
about what changed on *this site* — "added new fishing info", "fixed Item Database header
icons overlapping on narrow screens" — **never name an external source site** even if the
underlying data came from one (e.g. a fan-wiki import is "added faction info for Bends
Garrison", not "imported from Miraheze"). No cap on how many entries accumulate in the file
— see Home page below for how the growing list is actually displayed.

## Home page

First entry in `pages.json` (`"type": "home"`, `renderHomePage` in `script.js`) — a static
welcome heading plus the "Latest Changes" list read from `changelog.json`. Being first in
`pages.json` makes it both the top sidebar link and, for free, `init()`'s existing landing
page: `init()` already falls back to `allPages[0]` whenever the URL's hash doesn't match a
real page (e.g. a bare visit to the site), so putting Home first was the only change needed
to make it "land here on a fresh visit" — a reload on a specific page (`#items` etc.) still
stays there, nothing new needed for that half either.

**"Latest Changes" shows the 20 most recent entries** (`HOME_CHANGELOG_PREVIEW`), each with a
`formatChangelogTimestamp()`-formatted date+time and its plain-language summary. If more than
20 exist, a "Show all N updates" button reveals the complete remaining history in place (no
second page, no further pagination — deliberate, see CLAUDE-HISTORY.md-style reasoning: an
entry costs nothing to store or render even at a few hundred, so a second arbitrary cap would
just be more to maintain for no benefit). `changelog.json` itself has no size cap — see Git
workflow above for the one-entry-per-push convention that grows it.

## Community submissions

**Visitors submit through a real form on the wiki — never linked out to GitHub, no GitHub
account needed.**

- **`pages.json`** has `"Submit a Screenshot"`, `"type": "submit"`, in its own "Contribute"
  sidebar category — same `type`-driven routing as other pages, narrower reading-width (not
  `content-wide`).
- **`renderSubmitPage(container)`** builds the form: drag-and-drop/click-to-browse
  screenshot field (optional, see below) with live preview + Remove button, notes textarea,
  a honeypot field hidden off-screen (`.submit-honeypot`, real bot-filter not a stray field),
  submit button POSTs `FormData` to a Cloudflare Worker via `fetch`. Client-side error
  handling distinguishes a real API error from a raw network failure (never shows raw
  browser wording like "Failed to fetch" — friendly fallback instead).
- **Screenshot not required** — notes alone are enough (e.g. "no card, but I know this drops
  off X"). Client validation requires ≥1 of screenshot/notes; Worker enforces the same
  server-side (defense in depth — a direct script/curl call bypasses client JS).
- **Two more optional fields fold into the same `notes` text**, not separate Worker fields: a
  "Which map/zone?" `<select>` (`#submit-zone`, options from `ensureMapsData()` +
  `groupMapsByArea`) and a "Regarding: `<name>`" banner (`#submit-context-banner`,
  dismissible) shown when arriving from an item's/monster's "Wrong or missing info?" link.
  Folded in as labeled lines (`Regarding: Item — <name>` / `Zone/Map: <name>`) ahead of
  whatever the visitor typed.
- **"Wrong or missing info?"** (items and named monsters) jumps to Submit with context
  pre-filled via `goToSubmit(context)` (`pendingSubmitContext`, consume-once). Item card:
  only ever rendered in the full `#item-viewer` modal now (no hover preview exists to gate
  this out of). Monster card: shown in both the hover tooltip and the modal (monster tooltip
  is already fully interactive), gated on `monster.named` — regular monsters don't get this
  link. Clickable part is a separate "Click here" `<a>` after the plain-text question, not
  the question itself.
- **Why a Worker at all:** GitHub Pages serves static files only, can't hold a GitHub token
  safely (embedded page JS would expose it to anyone). A small serverless function is the
  minimum infrastructure that can hold that secret while keeping the form on-site.
- **`cloudflare-worker/submit-worker.js`** — not deployed by GitHub Pages, kept in-repo for
  reference/diffing only. **Deploying/updating requires pasting into the Worker's own
  Cloudflare dashboard editor — a manual step only the site owner can do; Claude can't
  deploy it, only edit the file.** Receives `FormData`, checks honeypot, and — given
  screenshot or notes — uses the GitHub REST API (`GITHUB_TOKEN` Worker *secret*) to create a
  branch, commit either the screenshot into `images/Inbox/` (type/size validated) or, for
  notes-only, a `note-<timestamp>.md` into `community-notes/`, then open a PR — never commits
  to `main` directly. **Merging the PR = accept; closing without merging = deny** — nothing
  reaches the live site without a human decision. A merged screenshot lands in the inbox for
  the normal "check inbox" workflow; a merged note needs its own next step (below).
- **`community-notes/`** holds notes-only submissions (`note-<timestamp>.md`, one new file
  per PR, no concurrent-submission conflicts possible). Not covered by the `images/inbox/`
  workflow. Processing: read the file; a `Regarding: Item — <name>`/`Regarding: Monster —
  <name>` line (auto-set from a "suggest" link) identifies the entry, else read the note to
  figure it out; `Zone/Map: <name>` (if present) is the visitor's zone answer. Anonymous,
  unverified — no `rumor` field exists anymore to park it in: either the user directly
  confirms it (goes into a real confirmed field) or it doesn't get written into the data at
  all. Ask before treating a visitor's note as confirmed; when in doubt, leave the file alone
  rather than delete an unconfirmed lead.
- **`SUBMIT_WORKER_URL`** (top of the Submit-page section in `script.js`) = the real deployed
  `workers.dev` URL — page shows a "not set up yet" notice only when this is empty. Don't
  guess/invent a URL if it ever needs changing.
- **One-time setup outside this repo** (site owner's own cost, not something Claude builds):
  free Cloudflare account, paste Worker script via dashboard, mint a GitHub fine-grained PAT
  scoped to only this repo (Contents + Pull requests, read/write), save as `GITHUB_TOKEN`
  Worker secret, copy the deployed URL into `SUBMIT_WORKER_URL`. Creating accounts/minting
  tokens is outside what Claude should do unattended. **The same manual redeploy step is
  needed again any time `submit-worker.js` changes** — editing the file in-repo alone doesn't
  affect the live Worker.
- Kept deliberately mechanical — no LLM call, no auto-generated JSON, just moving the
  screenshot into the repo safely. Auto-drafting the actual items.json/monsters.json entry
  would be a future, separate step if ever wanted.
- **Confirmed working end to end** with a real test submission (curl POST straight to the
  deployed Worker, bypassing the browser — CORS only restricts browser callers) that
  successfully created a real PR. That test predates the optional-screenshot/
  `community-notes/` update — the *deployed* Worker won't behave the new way until
  redeployed, and the notes-only path hasn't had its own live end-to-end test yet.
- **Security posture:** `GITHUB_TOKEN` never leaves the Worker (not logged, not returned),
  scoped to only Contents+PRs on this one repo — worst-case exposure can't touch other repos
  or account settings. Worker code is hard-coded to only ever create a new branch + one file
  + one PR, can't touch `main` or other files no matter what a caller sends.
  `ALLOWED_ORIGIN`/CORS is *not* real access control (only stops browser-based JS from other
  sites reading the response — a direct script/curl call can still reach the endpoint); the
  honeypot filters unsophisticated bots, but a determined scripted caller could still spam
  junk PRs — a nuisance (manual cleanup), not a security hole, since nothing reaches the live
  site without a manual merge. Rate-limiting would close that gap if it ever becomes a real
  problem — deliberately deferred until needed.
- **`images/samples/`** — a few example screenshots on the Submit page (`SUBMIT_EXAMPLES`)
  showing what a *complete* submission looks like. Unlike every other inbox image, these are
  **permanent site content the page displays**, not archival/pending-review material — own
  folder, `.jpg` q90 same as any screenshot. Click opens `#sample-viewer` (minimal lightbox,
  same shell as `#monster-viewer`, plain `<img>` no card data). Copy emphasizes capturing the
  *entire* card/window, to cut down on cropped-off-text submissions.
  **A `SUBMIT_EXAMPLES` entry can carry an optional `note`** — short line under the label
  for instructions specific to that submission type (the gathering-node example tells
  submitters to name the file after the resource itself, e.g. `"Lionleaf.jpg"`, matching
  `gathering-nodes.json`'s filename convention). Sample images are *copies* of real
  screenshots, not references in place, so `images/samples/` stays self-contained. Add
  another example the same way (drop a `.jpg`, add a `SUBMIT_EXAMPLES` entry).
