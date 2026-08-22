Fishing catch-rate observations (Night Harbor, Grub bait)
=========================================================

Raw per-stack haul data from the user's own fishing sessions, all in Night Harbor (at the
harbor), all using 20x Grub bait per stack, same fishing rod throughout. Tracked here rather
than as `note` text on gathering-nodes.json entries — those notes render live on the public
Gathering page, and running research tallies like this aren't visitor-facing info (see
CLAUDE.md's "note is visitor-facing content" rule). This file is not loaded by the site.

Purpose: watch for patterns in relative catch rarity / effective skill gates that the
fan-wiki source table's numbers (`minSkill`, `rarity`, `baitRequired`) may have gotten wrong,
same spirit as `crafting-skill-estimates.md` for tradeskill recipes. Only promote a finding
to the live site (rarity tag, a genuinely useful note) once it's confirmed enough to be
worth a visitor's time — see CLAUDE.md for what counts.

**Screenshot conventions, updated 2026-08-22 (stacks 5-6 cumulative, stack 7 fresh, stacks
8-10 will be bulk-cumulative):** stacks 5 and 6 were cumulative (bags not emptied between
them) — a stack's own catch was the difference from the previous cumulative total. Before
stack 7, the user emptied their bags and did one fresh stack (7 Basa/11 Whitefish/2
Grouper/0 Thorn Sturgeon). **The user then said they will NOT empty bags again and will do 3
more stacks (8, 9, 10) in bulk before the next screenshot** — targeting 200 total bait as a
"decent dataset for Night Harbor" (10 stacks × 20). So the next screenshot should be read as
cumulative since stack 7's baseline, covering stacks 8-10 *combined* (not per-stack) —
subtract stack 7's totals (7/11/2/0) from whatever the next screenshot shows to get the
8-10 combined catch. After that, 200 bait may be treated as the end of this Night Harbor
dataset (check chat for confirmation before assuming more stacks are coming). Fish are kept
in fixed inventory rows regardless of whether bags are emptied, top to bottom: Basa,
Whitefish, Grouper (Thorn
Sturgeon joined as a 4th row once it started appearing, stack 6 onward) — this resolves the
shared-icon ambiguity (Basa/Grouper share one icon, and Thorn Sturgeon turns out to share
Whitefish's icon) without having to ask each time, as long as the row position is known.
**Boots are no longer tracked** — the user discards them on the spot, so the running total
below is frozen and future hauls won't include a boot count.

Stack 1 — skill 0 → 42
-----------------------
- Basa: 5
- Whitefish: 15
- Tattered Cloth Boots: 2 (non-fish equipment catch, see gathering-nodes.json)

Stack 2 — skill 42 → 67
------------------------
- Basa: 9
- Whitefish: 25
- Tattered Cloth Boots: 4

Stack 3 — skill 67 → 79
------------------------
- Basa: 15
- Whitefish: 31
- Grouper: 6 (first-ever catch this stack, at skill 70)
- Thorn Sturgeon: 1 (first-ever catch this stack, at skill 77)
- Tattered Cloth Boots: 0

Stack 4 — skill 79 → 82
------------------------
Bags fully emptied before this stack, so this is a clean, complete read (not undercounted
like stack 3's boots were). Correction: Basa and Grouper share the same inventory icon, so
the initial read (7 Basa) mistook a second species for a split Basa stack — the real
breakdown is 4 Basa + 3 Grouper.
- Basa: 4
- Whitefish: 13
- Grouper: 3
- Thorn Sturgeon: 0
- Tattered Cloth Boots: 0

Stack 5 — skill 82 → 84
------------------------
Screenshot was cumulative with stack 4 (bags not emptied first) — totals shown were 12
Basa/23 Whitefish/5 Grouper, so the stack-5-only catch is the difference from stack 4's
4/13/3. Basa and Grouper again shared the round-blue icon; user confirmed the split by chat
(12 Basa, 5 Grouper) rather than reading it off the picture.
- Basa: 12 − 4 = 8
- Whitefish: 23 − 13 = 10
- Grouper: 5 − 3 = 2
- Thorn Sturgeon: 0
- Tattered Cloth Boots: 0

Stack 6 — skill 84 → 92
------------------------
Cumulative screenshot again — totals shown were 21 Basa (20+1, two stacks)/27 Whitefish
(20+7)/11 Grouper/1 Thorn Sturgeon, so the stack-6-only catch is the difference from stack
5's cumulative 12/23/5/0. Thorn Sturgeon's second-ever catch, sharing Whitefish's icon —
user identified it by chat (bottom row, a new species) rather than the picture alone.
- Basa: 21 − 12 = 9
- Whitefish: 27 − 23 = 4
- Grouper: 11 − 5 = 6
- Thorn Sturgeon: 1 − 0 = 1 (second-ever catch, first was stack 3 at skill 77)

Stack 7 — skill 92 → 95
------------------------
Bags emptied before this stack (back to a fresh read, not cumulative — see the conventions
note above). Only 3 rows shown, no Thorn Sturgeon row this time.
- Basa: 7
- Whitefish: 11
- Grouper: 2
- Thorn Sturgeon: 0

Stacks 8-10 (combined) — skill 95 → 114
-----------------------------------------
Bulk run as planned — user did 3 stacks without emptying bags, one screenshot at the end.
Cumulative since stack 7's baseline (7 Basa/11 Whitefish/2 Grouper/0 Thorn Sturgeon): shown
totals were 30 Basa (20+10)/31 Whitefish (20+11)/19 Grouper/2 Thorn Sturgeon.
- Basa: 30 − 7 = 23
- Whitefish: 31 − 11 = 20
- Grouper: 19 − 2 = 17
- Thorn Sturgeon: 2 − 0 = 2

**This reaches 200 total bait (10 stacks) — the target the user set for a "decent dataset
for Night Harbor."** Check with the user before assuming more Night Harbor stacks are coming.

Running totals (200 bait total — target reached)
---------------------------------------------------
- Basa: 80
- Whitefish: 129
- Grouper: 36
- Thorn Sturgeon: 4
- Tattered Cloth Boots: 9 (frozen as of stack 3 — user has stopped tracking/keeping boots as
  of stack 5 onward, so this total won't grow further; minSkill promoted to 1 on the live
  site since it was caught since stack 1)

Approximate Tattered Cloth Boots drop rate
-------------------------------------------
9 boots across 60 bait through stack 3 ≈ **15% per bait** (see stack 3 for caveats on this
being an approximation). This is now a fixed data point — boots aren't tracked past stack 5,
so this rate won't be refined further.

Observations so far
--------------------
- Whitefish consistently the most common catch by a wide margin (~55-65% of every stack).
- Basa's share has held steady across all four stacks (not shrinking) — leans toward "just
  less common than Whitefish" rather than "skill-gated rarer under 50", matching the user's
  own revised suspicion.
- Grouper first appeared in stack 3 (skill 67-79, 6 catches) and has appeared in every stack
  since (3 in stack 4, 2 in stack 5, 6 in stack 6) — four stacks in a row now, despite 40
  bait at skill 0-67 catching none. Reinforces that it's reliably catchable past ~70, not
  just a fluke. Grouper's minSkill was promoted to the live site 2026-08-21: removed the
  source table's `minSkill: 1` (confirmed wrong). Updated again 2026-08-22 to `minSkill: 70`
  outright — the bracket (67, 70] only has one multiple-of-5 candidate, and every other
  confirmed skill threshold on this site lands on a multiple of 5, so 70 is a confident
  inference even though it's not a directly-confirmed number from a card/tooltip. Noted as
  inferred on the live site rather than presented as a flat fact.
- Thorn Sturgeon has now been caught twice (stack 3 at skill 77, stack 6 somewhere in
  84-92), and stayed at 2 through stack 7 — its own "Very Rare" tag already explains the
  gaps. 2026-08-22: removed the source table's unconfirmed `minSkill: 30` outright (unlike
  Grouper, we don't have a clean not-caught-below-X bracket to infer a real number from —
  only 2 total catches, both well above 30, isn't enough to say where the true floor is) and
  replaced it with a plain note that it was first encountered at skill 77.
- Tattered Cloth Boots: ~15% approximate drop rate per bait through stack 3, apparently flat
  across skill levels per secondhand reports from other players — unlike Grouper, nothing
  here suggested a skill gate. No longer tracked past stack 5, so this is the final figure.
- Thorn Sturgeon caught a 3rd and 4th time in stacks 8-10 (skill 95-114) — 4 total now,
  consistent with "Very Rare" and no reason to suspect a wrong minSkill.

200-bait milestone (2026-08-22) — final tallies for this Night Harbor dataset
-------------------------------------------------------------------------------
Basa 80, Whitefish 129, Grouper 36, Thorn Sturgeon 4, Boots 9 (frozen at stack 3).
Whitefish:Basa ratio narrowed from ~3:1 in the earliest stacks to ~1.6:1 by the end — Basa's
relative share grew throughout, continuing to support "just less common," not skill-gated.
Both currently tagged Common/Uncommon on the live site; worth a look at whether that gap
still feels right now that the ratio's this close, though rarity tagging is ultimately a
judgment call for the site owner, not something to change unilaterally from this data alone.
