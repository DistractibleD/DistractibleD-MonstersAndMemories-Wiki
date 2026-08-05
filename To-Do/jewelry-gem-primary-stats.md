# Jewelcrafting gem primary-stat reference

Confirmed 2026-08-05 from a Jewelcrafting in-game reference table (not a guess/prediction —
same confidence as any other confirmed field). Each gem's "primary stat" — the stat an
`Inlaid <Gem> <Metal> <Slot>` item made from it grants:

| Gem            | Stat |
|----------------|------|
| Cat's Eye Agate | AGI |
| Diamond        | CHA  |
| Emerald        | STA  |
| Peridot        | DEX  |
| Sapphire       | INT  |
| Jade           | WIS  |
| Ruby           | STR  |

Confirms observed items so far: Emerald → STA (Inlaid Emerald Platinum Necklace, STA+7).

**Use for sanity-checking, not for guessing a number.** This only tells you *which* stat a
gem grants, never the magnitude (that depends on the metal tier — e.g. Platinum so far always
seen at +7, Bronze at +2, but that's only two data points). Never write a stat into
items.json for one of these gems without a real card — this table just flags if a captured
card's stat looks inconsistent with the gem shown, worth a double-check rather than assuming
either is wrong.

**Gems not in this table** (Topaz, Onyx, Bloodstone, Hematite, Black Sapphire, etc.) still
need their primary stat confirmed from a real item card the normal way — this table only
covers the seven gems it showed.
