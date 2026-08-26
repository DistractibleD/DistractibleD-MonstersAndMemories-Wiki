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

Distracted — Stack 1 (skill 114, fresh, 1 stack of Grub bait)
----------------------------------------------------------------------
Same species as Night Harbor so far, no new species yet. User confirmed row order top to
bottom: Basa, Whitefish, Grouper (same convention as Night Harbor). Promoted immediately to
the live site: added "Shaded Dunes" to Basa/Whitefish/Grouper's `locations` in
gathering-nodes.json (Bay Crab was NOT touched — it happened to share the exact same
locations array text as these three, so a careless replace-all almost added Shaded Dunes to
it too; caught and reverted before this was logged).
- Basa: 5
- Whitefish: 6
- Grouper: 9

Distracted — Stack 2 (skill already deep past cap from Night Harbor grinding — zero skill
gain in Shaded Dunes, fresh stack)
------------------------------------------------------------------------------------------------
Long gap since stack 1 — this stack happened somewhere in Distracted's ongoing Night Harbor
cap-test climb (skill in the 171-177 range around this point; exact number the instant this
Shaded Dunes stack was fished isn't pinned down, but every skill number reported this whole
session is far past Shaded Dunes' confirmed 45 cap either way, so the exact figure doesn't
change the conclusion). All skill gained this session is credited to Night Harbor fishing,
not this stack. Row order confirmed by the user: Basa, Whitefish, Grouper. Totals don't fit
cumulative with stack 1 (Grouper 9 → 1 would mean a decrease, impossible), so this is a
fresh stack.
- Basa: 6
- Whitefish: 13
- Grouper: 1

**Zero skill-ups from this Shaded Dunes stack — exactly as predicted**, and consistent with
the user's own report that their Night Harbor skill (177) is unaffected by this session.
Second independent confirmation (after Distracted's original 1-stack visit here at skill
114, which also gained nothing) that a character already past Shaded Dunes' cap gains no
further skill from fishing there. Also confirms fishing skill is a single, shared/global
stat across zones, not tracked separately per zone — Distracted's Night Harbor skill carried
over directly and immediately hit Shaded Dunes' independent cap, rather than Shaded Dunes
having its own separate skill counter starting fresh.

Distracted — Stack 3 (skill 177, still unchanged — zero skill gain, fresh stack, 1 stack)
------------------------------------------------------------------------------------------------
Same row order confirmed by the user (Basa, Whitefish, Grouper). Skill still 177 — third
straight confirmation this character gains nothing from fishing in Shaded Dunes anymore.
- Basa: 4
- Whitefish: 10
- Grouper: 6

Running totals (3 stacks, 60 bait)
------------------------------------
- Basa: 15
- Whitefish: 29
- Grouper: 16

Observations so far
--------------------
- Small sample, but notably Grouper (9) outnumbered both Basa (5) and Whitefish (6) in this
  one stack — very different mix from Night Harbor, where Whitefish was always dominant.
  Could be normal variance at this sample size, or could reflect a real per-zone rarity
  difference. Needs more stacks before drawing a conclusion.
- No new species (no Thorn Sturgeon, no boots, nothing unknown) — everything caught so far
  already exists in gathering-nodes.json from Night Harbor.

Distractoid — Stack 1 (skill 1 → 45, complete)
-------------------------------------------------------------
The user created a brand-new character (fishing skill 1) fishing in Shaded Dunes,
specifically to see whether the catchable species/rarity differ at minimum skill vs. the
Distracted (who only ever fished here starting at skill 114). This is a real test of
whether Grouper's `minSkill: 70` (inferred from Night Harbor data) holds here too. Separate
tally from the "Distracted" stacks above — different character, track independently.

Mid-stack notes (kept for the exact-skill data points, more precise than the final count
alone): at 6 bait spent, skill 30, catches so far 4 Whitefish + 1 Grouper — the Grouper came
in at skill 30, within the character's first 5 catches, not after a long grind. At 10 bait
spent, skill 34 — first-ever Basa catch for this character.

**Final stack total, skill 1→45:**
- Whitefish: 8
- Basa: 6
- Grouper: 3
(Basa/Grouper split confirmed by the user directly, since they share an icon.)

This directly contradicts Night Harbor's `minSkill: 70` for Grouper — 3 catches within the
first 20 bait of Distractoid (skill 1), vs. 0 catches across 40 bait at skill 0-67 in Night
Harbor. Much earlier and much easier here.

Distractoid — Stack 2 (skill stayed at 45, cumulative, not emptied)
------------------------------------------------------------------------------
Bags not cleared after stack 1 — cumulative screenshot, same row convention as Night Harbor
(top to bottom: Basa, Whitefish, Grouper). Shown totals: 9 Basa, 24 Whitefish (20+4), 5
Grouper. Stack-2-only catch is the difference from stack 1's 6/8/3:
- Basa: 9 − 6 = 3
- Whitefish: 24 − 8 = 16
- Grouper: 5 − 3 = 2

Skill stayed at 45 for this whole stack (no skill-up between stacks 1 and 2) — consistent
with the same fast-early/slows-down pattern seen on Distracted, just compressed into
fewer bait since this is a fresh character.

Distractoid — Stack 3 (skill still 45, cumulative, not emptied)
------------------------------------------------------------------------------
Shown totals: 13 Basa, 39 Whitefish (20+19), 6 Grouper. Stack-3-only catch is the difference
from stack 2's cumulative 9/24/5:
- Basa: 13 − 9 = 4
- Whitefish: 39 − 24 = 15
- Grouper: 6 − 5 = 1

Skill still hasn't moved past 45 — third stack in a row at the plateau (see the skill-up
plateau note below).

Running totals (3 stacks, 60 bait, skill 1→45)
--------------------------------------------------
- Basa: 13
- Whitefish: 39
- Grouper: 6

Grouper per stack so far: 3, 2, 1 — trending downward, though 6 total is still a small
sample to call a real trend rather than variance. Keep watching; if this keeps dropping
while skill stays flat, that's a different pattern than "rare but steady."

**Skill-up plateau, noticed 2026-08-22:** this character's skill stopped climbing after
stack 1 (stayed flat at 45 through all of stack 2), and separately Distracted
gained *zero* skill from its own 1 stack in Shaded Dunes (labeled skill 114 both before and
after). Both point at some kind of skill-up ceiling rather than random bad luck. User's own
take: not worth chasing a bait-tier or fishing-rod explanation for this — "this is the Beta,
and features are still being worked on," i.e. don't assume gear tier matters yet, and don't
read too much into a plateau that might just be unfinished game systems rather than a real,
stable mechanic worth documenting on the wiki.

Two competing explanations (not yet distinguished):
1. Grouper's real minSkill is zone-specific — much lower in Shaded Dunes than Night Harbor.
2. There's no hard minSkill at all — catch probability just scales continuously with skill,
   and Night Harbor's 0-in-40 was bad luck at a low-but-nonzero rate rather than proof of a
   gate (would mean the "minSkill: 70" inference there was likely wrong to begin with).

Testing plan: keep fishing Distractoid in Shaded Dunes and watch whether Grouper
catches stay steady as skill climbs further (supports a real low/no threshold) or get
noticeably more frequent at higher skill (supports a continuous scaling curve, which would
undercut Night Harbor's "70" too). Screenshots with the skill-up notification (like the one
that caught this Grouper) are the most useful — they pin the exact skill at each catch,
better than a post-stack inventory count.

**Live-site status:** Grouper's `minSkill: 70` is now known to be wrong for at least one
zone. Not yet reverted — waiting for more of this character's data before deciding whether
to walk it back to unconfirmed, or to see if the trend clarifies things first.

**Possible Fishing page restructure (2026-08-22, user's own idea, deliberately deferred until
there's a bigger dataset):** if it turns out species/rarity/minSkill genuinely differ by
zone (not just Night Harbor vs. Shaded Dunes location tags on the same shared roster, but
actually different *effective* thresholds and rates per zone), the current one-row-per-
species table structure — a single `minSkill`/`rarity` per species shared across all its
zones — stops being able to represent that. Would need either per-zone rows/fields, or a
rethink of how the Fishing page presents this. **Do not act on this until the dataset
actually supports it** — right now it's Distractoid's first 6 bait in one zone,
nowhere near enough to justify a structural change. Revisit once both zones (and ideally a
third data point) have enough hauls to see whether the pattern holds.
