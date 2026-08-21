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

Running totals (60 bait so far)
--------------------------------
- Basa: 29
- Whitefish: 71
- Grouper: 6
- Thorn Sturgeon: 1
- Tattered Cloth Boots: 9 (user's own stated total, not the screenshot-derived 6 — they
  discarded boots as they went rather than keeping every one until a screenshot, so the
  per-stack breakdown above undercounts stack 3's true boot catches; 9 is the real total)

Approximate Tattered Cloth Boots drop rate
-------------------------------------------
9 boots across 60 bait spent ≈ **15% per bait**, treating 1 Grub ≈ 1 catch attempt (not
exactly true — total items caught per stack has run somewhat higher than 20 per 20-bait
stack, so this is an approximation, not an exact rate). User also reports other fishermen at
higher skill seeing boots drop at "about the same rate," which — if accurate — argues against
this being skill-gated at all, unlike Grouper/Thorn Sturgeon.

Observations so far
--------------------
- Whitefish consistently the most common catch by a wide margin (~55-60% of every stack).
- Basa's share has held steady or grown slightly across all three stacks (not shrinking) —
  leans toward "just less common than Whitefish" rather than "skill-gated rarer under 50",
  matching the user's own revised suspicion.
- Grouper and Thorn Sturgeon both appeared for the first time in stack 3 (skill 67-79),
  despite gathering-nodes.json's source-table `minSkill` values (1 and 30 respectively)
  implying they should've been catchable from stack 1. Thorn Sturgeon's absence until now is
  explained by its own "Very Rare" tag alone — no update needed, still minSkill 30. Grouper's
  absence across 40 bait at skill 0-67, then 6 catches in one 20-bait stack at 67-79, was a
  bigger jump than "Uncommon" alone explains — promoted to the live site 2026-08-21: removed
  the source table's `minSkill: 1` (unconfirmed/wrong) and added a note that the real floor
  is somewhere between 67 and 70.
- Tattered Cloth Boots: ~15% approximate drop rate per bait, apparently flat across skill
  levels per secondhand reports from other players — unlike Grouper, nothing here suggests a
  skill gate.
