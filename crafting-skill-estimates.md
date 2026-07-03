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
Confirmed so far:

- **Rawhide Cloak: exactly 5** (Leatherworking)
- **Rawhide Gloves: exactly 5** (Leatherworking)
- **Enchanted Rawhide Leggings: exactly 56** (Leatherworking)
- **Rawhide Tunic: exactly 56** (Leatherworking)
- **Fine Cloth Cape: exactly 5** (Tailoring)
- **Fine Cloth Gloves: exactly 5** (Tailoring)

## The estimate method (revised 2026-07-03 — additive step size abandoned)

The original approach (see git history for the abandoned version) assumed a fixed number
of skill points per color step and derived ~11.3 from the one Red(22)->White(56) pair.
A second inbox batch on 2026-07-03 supplied crafting-window recaptures of the same first
8 Leatherworking recipes (Rawhide Canvas/Strap/Bracelet/Gorget/Cloak/Gloves/Belt/Mask) at
skill 1, 2, 3, 4, and 5 — and that data breaks the fixed-step model outright:

```
Skill 1-4 (unchanged across all four): Canvas/Strap = Light Blue, Bracelet/Gorget = Dark Blue,
                                        Cloak/Gloves = Yellow, Belt/Mask = Red
Skill 5:                               Canvas/Strap = Green,      Bracelet/Gorget = Light Blue,
                                        Cloak/Gloves = White (exact = 5), Belt/Mask = Orange
```

Four pairs of recipes each jumped a full color band in a single skill point (4 -> 5). If
color bands were a fixed ~11 points wide (as the skill-22/56 pair suggested), that couldn't
happen. The most likely explanation: **band width scales with the recipe's own skill
requirement, not a flat number of points** — i.e. colors are probably ratio-based (something
like your-skill / recipe-skill), so a T=5 recipe has ~1-point-wide bands while a T=56 recipe
has ~11-point-wide bands. This isn't confirmed, just the hypothesis that now fits *all*
observed data instead of contradicting half of it. Keep testing it against new data before
trusting it further.

## What this changes for Rawhide Belt / Rawhide Mask specifically

These two now have four data points each, all consistent with one fixed T:

```
skill 1-4: Red    (T > 4, recipe still harder than a skill-4 crafter)
skill 5:   Orange (T > 5, but close — one step past Red)
skill 22:  Dark Blue (T < 22, recipe now slightly easier than a skill-22 crafter)
skill 56:  Green  (T well under 56)
```

That brackets both recipes' real skill requirement to **somewhere between 6 and 21**, most
likely in the high teens given Dark Blue (a band close to White, not Light Blue or Green)
is what skill 22 produced. Call it ~18-21 as a working guess — still a guess, but a much
tighter one than "somewhere under 22."

## Estimates (Leatherworking, as of skill 56 recapture, 2026-07-03)

| Recipe | Data points | Estimated skill | Confidence |
|---|---|---|---|
| Rawhide Cloak | White (5) | **5 (exact)** | Confirmed |
| Rawhide Gloves | White (5) | **5 (exact)** | Confirmed |
| Enchanted Rawhide Leggings | White (56) | **56 (exact)** | Confirmed |
| Rawhide Tunic | White (56) | **56 (exact)** | Confirmed |
| Rawhide Canvas | Light Blue (1-4), Green (5, 22, 56) | ~4, just under the skill-5 Green threshold | Medium |
| Rawhide Strap | Light Blue (1-4), Green (5, 22, 56) | ~4, same reasoning | Medium |
| Rawhide Bracelet | Dark Blue (1-4), Light Blue (5), Green (22, 56) | ~4-5 | Medium |
| Rawhide Gorget | Dark Blue (1-4), Light Blue (5), Green (22, 56) | ~4-5 | Medium |
| Rawhide Belt | Red (1-4), Orange (5), Dark Blue (22), Green (56) | ~18-21 | Medium |
| Rawhide Mask | Red (1-4), Orange (5), Dark Blue (22), Green (56) | ~18-21 | Medium |
| Enchanted Rawhide Cap | Dark Blue (56), Red (skill-22-era card) | between 23 and 55, no tighter bound yet | Low |
| Rawhide Backpack | Dark Blue (56), Red (skill-22-era card) | between 23 and 55 | Low |
| Rawhide Leggings | Light Blue (56), Red (skill-22-era card) | between 23 and 55, likely toward the lower end (Light Blue is further from White than Dark Blue) | Low |
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
| Fine Cloth Cape | White | **5 (exact)** | Confirmed |
| Fine Cloth Gloves | White | **5 (exact)** | Confirmed |
| Bolt of Cloth | Green | under 5 | Low |
| Cloth Padding | Green | under 5 | Low |
| Bat Fur Braid | Light Blue | likely 3-4 | Low |
| Fine Cloth Bracer | Light Blue | likely 3-4 | Low |
| Fine Cloth Gorget | Light Blue | likely 3-4 | Low |
| Cloth Pouch | Yellow | likely 6-7 | Low |
| Fine Cloth Belt | Orange | above 5, no upper bound yet | Very low |
| Fine Cloth Veil | Orange | above 5 | Very low |
| Cloth Satchel | Red | well above 5 | Very low, floor only |
| Fine Cloth Boots | Red | well above 5 | Very low, floor only |
| Enchanted Bolt of Cloth | Red | well above 5 | Very low, floor only |
| Fine Cloth Cap | Red | well above 5 | Very low, floor only |
| Fine Cloth Mantle | Red | well above 5 | Very low, floor only |

## What would sharpen this

More White observations at skill values we haven't sampled yet (especially somewhere in
the 6-55 range for Leatherworking, and above 5 for Tailoring) would let the
ratio-vs-flat-step question actually get resolved instead of guessed at. Recapturing a
tradeskill's crafting window as skill climbs — especially right when a recipe visibly
flips color — is the single most useful thing to log going forward; update this file
rather than guessing further without new data.
