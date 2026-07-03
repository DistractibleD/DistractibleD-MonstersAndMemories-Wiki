# Crafting recipe skill-level estimates (internal notes)

Not shown anywhere on the site — this is Claude's working notes for guessing each
recipe's real underlying skill requirement, per the user's 2026-07-03 request to keep
calculating this "in the background" now that the colored difficulty badge has been
removed from the public Crafting page (the color is only meaningful for the one user's
skill level at the moment the screenshot was taken, so showing it live was misleading).

`crafting.json` still stores `difficultyColor` / `observedAtSkill` / `recipeSkillLevel`
for every recipe — this file is a derived, speculative layer on top of that data, not a
replacement for it. Don't copy the numbers below into `crafting.json`'s `recipeSkillLevel`
field — that field is reserved for values confirmed exact via a White observation (see
CLAUDE.md). Everything here is a guess of varying confidence.

## What we know for certain

Only a White observation pins down a recipe's skill level exactly (user-confirmed rule).
So far that's happened twice, both at skill 56:

- **Enchanted Rawhide Leggings: exactly 56**
- **Rawhide Tunic: exactly 56**

## The estimate method (and why it's shaky)

Both of the exact-56 recipes were also observed **Red at skill 22** in an earlier session.
Assuming a recipe's skill requirement doesn't change between sessions and colors are
spaced in even steps around the exact match, that gives one calibration:

```
Red (skill 22) -> White (skill 56, exact)
gap = 56 - 22 = 34, spanning 3 color-steps (Red -> Orange -> Yellow -> White)
=> ~11.3 skill points per color-step
```

Using that step size, ordinal position relative to White (Green +3, Light Blue +2,
Dark Blue +1, White 0, Yellow -1, Orange -2, Red -3), and each recipe's most recent
observation, `estimated T = observedAtSkill - (ordinal * 11.3)`.

**This does not hold up cleanly.** Applying it to recipes with two data points produces
contradictions — e.g. Enchanted Rawhide Canvas was Red at skill 22 (implying a skill
requirement near 56+) but Green at skill 56 (implying a requirement near 22 or below).
Both can't be true under one fixed step size for the same recipe. Likely explanations,
in no particular order: the color bands aren't evenly spaced, they're ratio-based rather
than flat-gap-based, per-recipe modifiers exist, or the game rebalanced recipe difficulty
between the skill-22 and skill-56 screenshots (this game is in active development). Treat
every number below as a rough midpoint guess, not a real calculation — useful for sorting
recipes by roughly how far off they are, not for predicting an exact skill-up.

## Estimates (Leatherworking, as of skill 56 recapture, 2026-07-03)

| Recipe | Latest color (skill) | Estimated skill | Confidence |
|---|---|---|---|
| Enchanted Rawhide Leggings | White (56) | **56 (exact)** | Confirmed |
| Rawhide Tunic | White (56) | **56 (exact)** | Confirmed |
| Enchanted Rawhide Cap | Dark Blue (56) | ~45 | Low |
| Rawhide Backpack | Dark Blue (56) | ~45 | Low |
| Rawhide Leggings | Light Blue (56) | ~33 | Low |
| Enchanted Rawhide Canvas | Green (56), was Red (22) | ~22, possibly higher — contradicts the Red(22) reading, see above | Very low |
| Rawhide Cap | Green (56), was Red (22) | ~22, same caveat | Very low |
| Rawhide Saddle | Green (56), was Red (22) | ~22, same caveat | Very low |
| Rawhide Saddlebag | Green (56), was Red (22) | ~22, same caveat | Very low |
| Rawhide Shoulderpads | Green (56), was Red (22) | ~22, same caveat | Very low |
| Rawhide Boots | Green (56), was Yellow (22) | ~22, same caveat (smaller contradiction than the Red ones) | Very low |
| Rawhide Belt | Green (56), was Blue (22, shade unmeasured) | ~22 or lower | Very low |
| Rawhide Mask | Green (56), was Blue (22, shade unmeasured) | ~22 or lower | Very low |
| Rawhide Bracelet | Green at both 22 and 56 | Likely well under 22 — was already trivial at the lowest skill we've seen | Low-medium (only recipe-derived estimate with two *consistent* readings) |
| Rawhide Canvas | Green at both 22 and 56 | Likely well under 22, same reasoning | Low-medium |
| Rawhide Cloak | Green at both 22 and 56 | Likely well under 22, same reasoning | Low-medium |
| Rawhide Gloves | Green at both 22 and 56 | Likely well under 22, same reasoning | Low-medium |
| Rawhide Gorget | Green at both 22 and 56 | Likely well under 22, same reasoning | Low-medium |
| Rawhide Strap | Green at both 22 and 56 | Likely well under 22, same reasoning | Low-medium |
| Hide Canvas | Orange (56) | ~79 | Very low (no second data point yet) |
| Hide Strap | Orange (56) | ~79 | Very low |
| Hide Bracelet | Red (56) | ~90+ | Very low, floor only — Red may just mean "well above 56," not a specific number |
| Hide Gorget | Red (56) | ~90+ | Very low, floor only |
| Hide Cloak | Red (56) | ~90+ | Very low, floor only |
| Hide Gloves | Red (56) | ~90+ | Very low, floor only |
| Hide Belt | Red (56) | ~90+ | Very low, floor only |
| Hide Mask | Red (56) | ~90+ | Very low, floor only |

## What would sharpen this

More White observations — especially for recipes currently Green/Red at both known skill
points, and especially at *different* skill values than 22/56 — would let the step size
get re-derived from independent data instead of one pair of (coincidentally identical)
recipes. Recapturing the Leatherworking crafting window again as the user's skill climbs
further (particularly whenever a recipe flips to White) is the most useful thing to log
going forward; update this file rather than guessing further without new data.
