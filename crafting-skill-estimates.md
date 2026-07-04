# Crafting recipe skill-level estimates (internal notes)

Not shown anywhere on the site — this is Claude's working notes for guessing each
recipe's real underlying skill requirement, per the user's 2026-07-03 request to keep
calculating this "in the background" now that the colored difficulty badge has been
removed from the public Crafting page (the color is only meaningful for the one user's
skill level at the moment the screenshot was taken, so showing it live was misleading).

`crafting.json` still stores `difficultyColor` / `observedAtSkill` for every recipe — this
file is a derived, speculative layer on top of that data, not a replacement for it. Don't
copy the numbers below into `crafting.json`'s `recipeSkillLevel` field. Everything here is
a guess of varying confidence — see the retraction below for why nothing here counts as
exact anymore.

## Retraction (2026-07-04): White is not an exact pin

The 2026-07-03 rule "a White recipe means the recipe's skill level exactly equals the
crafter's current skill" is wrong — caught by the user themselves. If it were true, White
would always be the *lowest* color a 0-skill crafter could ever see (nothing can be "easier
than 0"), but Green/Dark Blue/Light Blue recipes are observed even at 0 skill. That's only
possible if White doesn't mark a single exact point at all — it's presumably just another
band, like every other color, that happens to straddle the crafter's current skill rather
than pin it exactly.

Every recipe below that was previously listed as "exact"/"Confirmed" from a White
observation has been downgraded — the underlying color+skill data point is still real and
still recorded, only the "this means the exact value" interpretation has been removed.
`crafting.json`'s `recipeSkillLevel` field has been cleared out entirely (see CLAUDE.md) and
won't be repopulated until a real confirmed method exists — with one narrow exception below.

## The one case that *is* exact: Green at 0 skill

The user confirmed (2026-07-04) the color scale is a continuous gradient tied to the gap
between the crafter's skill and the recipe's requirement — e.g. a recipe requiring skill 50
would show Red at 0 skill, some moderate color around skill 50, and Green once skill climbs
well past 50 (their own example: "a craft that requires 50 skill will be Red if I am level
0, ... and if I have 300 skill it will surely be Trivial green"). Combined with the axiom
that skill requirements can't be negative, this pins down exactly one case: **a recipe
observed as Green at `observedAtSkill: 0` must have `recipeSkillLevel: 0`** — Green means
"far exceeds the requirement," and the only way to far-exceed something from a floor of 0 is
if that something is also 0. This does NOT extend to White/Dark Blue/Light Blue at 0 skill —
per the gradient model, a recipe with even a modest requirement (their example used 50)
would already show as Red at 0 skill, not a moderate color, so seeing White at 0 skill just
suggests a low requirement, it doesn't prove one exactly.

None of the currently-recorded data has a Green observation at skill 0 yet (the Jewelcrafting
batch below was White/Orange/Red at skill 0, not Green) — this rule is ready to apply the
moment one shows up. The 13 Jewelcrafting Ring recipes observed as White at skill 0 (see
table below) are worth flagging as *probably* low, by the same reasoning — a recipe with a
real requirement of, say, 50 wouldn't show White for a skill-0 crafter — but "probably low"
isn't the same as "exactly 0," so they stay unset in `crafting.json`.

Nothing in this file should be read as more certain than "a reasonable band, given the
color-ordering rule that's still
believed to hold" (Green < Light Blue < Dark Blue < White < Yellow < Orange < Red, easier to
harder relative to the crafter's own skill at observation time).

## The estimate method (revised 2026-07-03, further weakened 2026-07-04)

The original approach (see git history) assumed a fixed number of skill points per color
step and derived ~11.3 from one Red(22)->White(56) pair — treating White as an exact anchor.
A second inbox batch on 2026-07-03 supplied crafting-window recaptures of the same first 8
Leatherworking recipes (Rawhide Canvas/Strap/Bracelet/Gorget/Cloak/Gloves/Belt/Mask) at
skill 1, 2, 3, 4, and 5:

```
Skill 1-4 (unchanged across all four): Canvas/Strap = Light Blue, Bracelet/Gorget = Dark Blue,
                                        Cloak/Gloves = Yellow, Belt/Mask = Red
Skill 5:                               Canvas/Strap = Green,      Bracelet/Gorget = Light Blue,
                                        Cloak/Gloves = White,      Belt/Mask = Orange
```

Four pairs of recipes each jumped a full color band in a single skill point (4 -> 5). A
fixed ~11-point band width couldn't produce that jump, so the working hypothesis became
"band width scales with the recipe's own skill requirement" (roughly ratio-based). That
hypothesis was built partly on treating the two White observations above as exact anchors
(5 and 56) — with White's exactness now retracted, the ratio-vs-flat-step question is back
to genuinely open. Treat the numbers below as illustrative, not derived with any rigor.

## What this changes for Rawhide Belt / Rawhide Mask specifically

These two now have four data points each, all consistent with one fixed underlying skill
requirement T:

```
skill 1-4: Red    (T > 4, recipe still harder than a skill-4 crafter)
skill 5:   Orange (T > 5, but close — one step past Red)
skill 22:  Dark Blue (T < 22, recipe now slightly easier than a skill-22 crafter)
skill 56:  Green  (T well under 56)
```

That still brackets both recipes' real skill requirement to somewhere between 6 and 21
(this part doesn't depend on White at all, just the harder/easier relative ordering) — no
tighter guess than that without more data.

## Estimates (Leatherworking, as of skill 56 recapture, 2026-07-03)

| Recipe | Data points | Estimated skill | Confidence |
|---|---|---|---|
| Rawhide Cloak | White (5) | somewhere near 5 | Low (was "exact 5", retracted 2026-07-04) |
| Rawhide Gloves | White (5) | somewhere near 5 | Low (was "exact 5", retracted 2026-07-04) |
| Enchanted Rawhide Leggings | White (56) | somewhere near 56 | Low (was "exact 56", retracted 2026-07-04) |
| Rawhide Tunic | White (56) | somewhere near 56 | Low (was "exact 56", retracted 2026-07-04) |
| Rawhide Canvas | Light Blue (1-4), Green (5, 22, 56) | under ~5 | Low |
| Rawhide Strap | Light Blue (1-4), Green (5, 22, 56) | under ~5 | Low |
| Rawhide Bracelet | Dark Blue (1-4), Light Blue (5), Green (22, 56) | under ~5, above Canvas/Strap | Low |
| Rawhide Gorget | Dark Blue (1-4), Light Blue (5), Green (22, 56) | under ~5, above Canvas/Strap | Low |
| Rawhide Belt | Red (1-4), Orange (5), Dark Blue (22), Green (56) | between 6 and 21 | Medium (relative-ordering bound, doesn't depend on White) |
| Rawhide Mask | Red (1-4), Orange (5), Dark Blue (22), Green (56) | between 6 and 21 | Medium (relative-ordering bound, doesn't depend on White) |
| Enchanted Rawhide Cap | Dark Blue (56), Red (skill-22-era card) | between 23 and 55, no tighter bound yet | Low |
| Rawhide Backpack | Dark Blue (56), Red (skill-22-era card) | between 23 and 55 | Low |
| Rawhide Leggings | Light Blue (56), Red (skill-22-era card) | between 23 and 55 | Low |
| Enchanted Rawhide Canvas | Green (56), Red (22) | under 56, no tighter bound | Low |
| Rawhide Cap | Green (56), Red (22) | under 56 | Low |
| Rawhide Saddle | Green (56), Red (skill-22-era card) | under 56 | Low |
| Rawhide Saddlebag | Green (56), Orange (skill-22-era card) | under 56, but the card's Orange (harder than the skill-56 Green) is odd for a "well under" recipe — flag for re-check if a fresher card comes in | Low |
| Rawhide Shoulderpads | Green (56), Red (skill-22-era card) | under 56 | Low |
| Rawhide Boots | Green (56), Yellow (skill-22-era card) | under 56 | Low |
| Hide Canvas | Orange (56) | above 56, no upper bound yet | Very low |
| Hide Strap | Orange (56) | above 56 | Very low |
| Hide Bracelet | Red (56) | well above 56 | Very low, floor only |
| Hide Gorget | Red (56) | well above 56 | Very low, floor only |
| Hide Cloak | Red (56) | well above 56 | Very low, floor only |
| Hide Gloves | Red (56) | well above 56 | Very low, floor only |
| Hide Belt | Red (56) | well above 56 | Very low, floor only |
| Hide Mask | Red (56) | well above 56 | Very low, floor only |

## Estimates (Tailoring, as of skill 5 capture, 2026-07-03)

Only one data point per recipe so far (all from the same skill-5 snapshot), so these are
much softer than the Leatherworking table above.

| Recipe | Color (skill 5) | Estimated skill | Confidence |
|---|---|---|---|
| Fine Cloth Cape | White | somewhere near 5 | Low (was "exact 5", retracted 2026-07-04) |
| Fine Cloth Gloves | White | somewhere near 5 | Low (was "exact 5", retracted 2026-07-04) |
| Bolt of Cloth | Green | under 5 | Low |
| Cloth Padding | Green | under 5 | Low |
| Bat Fur Braid | Light Blue | under 5 | Low |
| Fine Cloth Bracer | Light Blue | under 5 | Low |
| Fine Cloth Gorget | Light Blue | under 5 | Low |
| Cloth Pouch | Yellow | above 5 | Low |
| Fine Cloth Belt | Orange | above 5, no upper bound yet | Very low |
| Fine Cloth Veil | Orange | above 5 | Very low |
| Cloth Satchel | Red | well above 5 | Very low, floor only |
| Fine Cloth Boots | Red | well above 5 | Very low, floor only |
| Enchanted Bolt of Cloth | Red | well above 5 | Very low, floor only |
| Fine Cloth Cap | Red | well above 5 | Very low, floor only |
| Fine Cloth Mantle | Red | well above 5 | Very low, floor only |

## What would sharpen this

Since White no longer pins anything down exactly, the single most useful thing to log going
forward is the same recipe recaptured across a wide spread of skill values, watching for
exactly when/where it changes color — that's the only way left to bound a recipe's real
skill requirement without leaning on an assumption that's already broken once. Recapturing
a tradeskill's crafting window as skill climbs, especially right when a recipe visibly
flips color, remains the best source of new data; update this file rather than guessing
further without it.
