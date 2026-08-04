# CLAUDE-HISTORY.md

Design-decision history and superseded-attempt post-mortems for this repo — moved out of
CLAUDE.md (2026-08-04) so the auto-loaded instructions file stays lean. Not auto-loaded;
read on demand when CLAUDE.md points here or when touching an area with known past churn.
Not linked from the site, not loaded by any code.

## Item Database: dropped the category-grid drill-down

Item DB used to open on a clickable category grid (`renderItemsCategories`) you drilled
into. Dropped 2026-07-19 in favor of a Type dropdown in the same toolbar as every other
filter — reaches the same place in one fewer click. Armor additionally had its own
two-level material→slot card drill-down, removed 2026-07-15 the same way (replaced by the
Material dropdown). Both changes: same end-state, just reached via a dropdown instead of a
nested page.

## Enchanting/Disenchanting: three shapes before landing on cards-in-existing-grids

First stacked on one shared page; then each got its own 2-card-grid page; then each got a
fully separate top-level `pages.json` entry (2026-07-17); finally folded back into the
Crafting/Gathering grids as ordinary cards (2026-07-19, user's own request: "move Enchanting
into Crafting, and Disenchanting into Gathering"). Current state (see CLAUDE.md) is the
fourth and (so far) final shape.

`craftType`'s material-recipe values also went through a revision: an earlier version split
them into `"Armor"` vs `"Armor / Weapon"` by which other tradeskill consumes the material,
collapsed back to one `"Crafting Material"` value (2026-07-17) since the split wasn't
reliably knowable (Blacksmithing's metal bars serve both armor and weapon recipes).

## Gathering-node-thumb: three failed fixes before the real root cause

`.gathering-node-thumb` went through a 2026-07-20 same-day round-trip that made things
worse each time, per the user's repeated report ("gets worse and worse... incapable of
fixing"):
1. Square-cropped each source image around its own geometric center — insufficient, the
   subject usually occupies only a fraction of the frame, rendered as a smudge at 26x26.
2. Cropped tighter around the subject's own bounding box instead — better, still imperfect
   for a low-contrast subject like Lionleaf.
3. Switched to `object-fit: contain` to show the whole uncropped image — but for non-square
   sources this left visible letterboxed gaps showing the button's dark background, which
   the user found worse than a crop.

All three, and the source-image re-crops that went with them, were reverted back to the
plain `cover`-based original in the same session. The *actual* root cause (found 2026-07-30,
see CLAUDE.md's current entry) had nothing to do with cropping or object-fit at all — it was
a CSS specificity leak from `.content-inner img`. Worth remembering so this isn't
re-attempted blindly if a similar-looking thumbnail issue ever comes up elsewhere.

## Sidebar visit-tracking: dropped ordinary page tracking

An earlier version tracked ordinary page visits (Item Database, Maps, Monsters, etc.) under
a `"page"` kind, alongside a second "Recently Visited" (by last-visited-time) list next to
"Most Visited" (by count). Both were removed: "Recently Visited" first (2026-07-17, though
its data kept recording in case it came back), then page-tracking itself (2026-07-19) after
the user reported visiting Herbalism a lot but never seeing it show up — diagnosed by
reproducing it: everyday page browsing racked up counts fast enough to crowd tradeskills out
of a shared top-5 list. Current state (tradeskills only) is in CLAUDE.md.

## Icon system: four visual redesign passes

Went silhouette → outline → solid → colored-badge, chasing a series of increasingly precise
reference sheets the user provided, before landing on the current colored-badge system (see
CLAUDE.md for the SVG-arc gotcha this process surfaced, which is still live/actionable).

## Tanning/Leatherworking/Blacksmithing/Fletching/Smelting/Survival: populated from fan-wiki reference tables

Same fan-wiki-style tables (sortable columns, hyperlinked names) filled in most of these
tradeskills' `components`/`recipeSkillLevel` fields, weaker-sourced than a real screenshot
per "the user's screenshots are the source of truth" (CLAUDE.md) — superseded without
hesitation if the user's own in-game observation ever disagrees.

- **Tanning**: pelt→scrap mapping (Low-Quality→24x Rawhide Scraps, Medium→24x Hide Scraps,
  High→24x Leather Scraps). Trivial values: 25 (Low), 50 (Medium); High stayed a `>50`
  floor-only note in the estimates file.
- **Blacksmithing**: full Copper→Bronze→Iron→Steel progression (chain/plate armor, weapons,
  shields, base materials, sharpening/weight stones, mount barding, a Corroded/Rusty→
  "Tarnished" repair chain). The "Hammer and Chisel Master List" table added 93
  Blacksmithing recipes for salvaging worn gear back into raw scraps (`components` =
  `[{worn item}, {"Hammer and Chisel"}]`, `name` = scrap result) — a few source items
  salvage into two different scrap types/quantities, folded into the `name` string itself
  (`"<Item> (xN) & <Item> (xM)"`, same workaround as Disenchanting's variable outputs).
  Recorded verbatim even where a row looked internally inconsistent (e.g. "Copper Plate
  Boots"/"Copper Longsword" salvage into *Bronze* Scraps unlike every other Copper item;
  "Tarnished Bronze Mace" is the only weapon in its tier with no Rawhide Scraps yield) —
  don't silently "correct" a reference-table row without a re-confirming screenshot.
- **Fletching**: 15 existing crafting-window stubs got `components`/`recipeSkillLevel`.
  Pitch-Wrapped/Net/Smoke Bomb Arrow were new, all "Requires recipe purchase" (recorded as
  a `note`). Net Arrow's second component recorded verbatim as ambiguous "Rope, Hempen, 50
  Length" text; Smoke Bomb Arrow/Vial of Smoke had "(item)"/"(reagent)" table-artifact
  suffixes stripped. Several recipes' Trivial stayed unset where the table itself showed
  "??".
- **Smelting**: one row added late ("Adamantium Bar", components unknown — bare
  `needsInfo: true` stub).
- **Survival**: 7 existing stubs filled in; Campfire (Trivial "Innate", recorded as a `note`
  not a fake number) and Heavy Cotton Bandage were new.

## Community submissions: wording iteration

"Wrong or missing info?" was originally two different, narrower questions — "Know where
this drops?" (items) / "Know where this spawns?" (monsters) — reworded 2026-07-19 since the
user felt they undersold the link's purpose (a card can be fully correct today and still
need the escape hatch later). Same-day follow-up: the clickable part was narrowed to just
"Click here" after the question itself, since the user wanted an explicit call-to-action
rather than expecting readers to infer the whole question was clickable.

## Splash screen background source

`images/splash-hero.jpg` was converted from a `.webp` the user dropped in `images/Inbox/`.
