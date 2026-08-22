Fishing catch-rate observations (Shaded Dunes, Grub bait)
===========================================================

Companion file to `fishing-catch-observations.md` (Night Harbor) — same purpose and same
"not visitor-facing, not loaded by the site" rules apply here. Started 2026-08-22 once the
user began fishing in Shaded Dunes specifically to compare species/rarity against Night
Harbor's results.

**Notable starting point:** none of the 16 existing Fishing entries in `gathering-nodes.json`
list Shaded Dunes as a location at all — the original fan-wiki source table apparently never
covered fishing there. So this isn't just filling in a location gap on known species; species
caught here may be entirely new to the wiki. Check each catch against the full Fishing list
before assuming it's a new species — a match against an existing entry (e.g. one already
tagged for a different zone) just needs Shaded Dunes added to its `locations` array; a
genuinely new name needs a brand new gathering-nodes.json entry (and an items.json card once
a real item screenshot comes in).

Screenshot conventions: check the latest chat / this file for whether hauls are cumulative
or fresh, and what row order fish are appearing in — these aren't guaranteed to match Night
Harbor's conventions (Basa/Whitefish/Grouper/Thorn Sturgeon rows) since the fish themselves
may differ entirely.

Stack 1 — skill 114 (fresh, 1 stack of Grub bait)
----------------------------------------------------
Same species as Night Harbor so far, no new species yet. User confirmed row order top to
bottom: Basa, Whitefish, Grouper (same convention as Night Harbor). Promoted immediately to
the live site: added "Shaded Dunes" to Basa/Whitefish/Grouper's `locations` in
gathering-nodes.json (Bay Crab was NOT touched — it happened to share the exact same
locations array text as these three, so a careless replace-all almost added Shaded Dunes to
it too; caught and reverted before this was logged).
- Basa: 5
- Whitefish: 6
- Grouper: 9

Running totals (1 stack, 20 bait)
------------------------------------
- Basa: 5
- Whitefish: 6
- Grouper: 9

Observations so far
--------------------
- Small sample, but notably Grouper (9) outnumbered both Basa (5) and Whitefish (6) in this
  one stack — very different mix from Night Harbor, where Whitefish was always dominant.
  Could be normal variance at this sample size, or could reflect a real per-zone rarity
  difference. Needs more stacks before drawing a conclusion.
- No new species (no Thorn Sturgeon, no boots, nothing unknown) — everything caught so far
  already exists in gathering-nodes.json from Night Harbor.
