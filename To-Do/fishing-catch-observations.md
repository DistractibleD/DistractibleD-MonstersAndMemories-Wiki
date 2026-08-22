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

Running totals (80 bait so far)
--------------------------------
- Basa: 33
- Whitefish: 84
- Grouper: 9
- Thorn Sturgeon: 1
- Tattered Cloth Boots: 9 (user's own stated total as of stack 3, not re-confirmed since —
  see stack 3's note on why the per-stack breakdown undercounts it)

Approximate Tattered Cloth Boots drop rate
-------------------------------------------
9 boots across 60 bait through stack 3 ≈ **15% per bait** (see stack 3 for caveats on this
being an approximation). Stack 4 caught zero — consistent with normal variance at this
sample size, not necessarily a change. User also reports other fishermen at higher skill
seeing boots drop at "about the same rate," which — if accurate — argues against this being
skill-gated at all, unlike Grouper/Thorn Sturgeon.

Observations so far
--------------------
- Whitefish consistently the most common catch by a wide margin (~55-65% of every stack).
- Basa's share has held steady across all four stacks (not shrinking) — leans toward "just
  less common than Whitefish" rather than "skill-gated rarer under 50", matching the user's
  own revised suspicion.
- Grouper first appeared in stack 3 (skill 67-79, 6 catches) and appeared again in stack 4
  (skill 79-82, 3 more) — two stacks in a row now, despite 40 bait at skill 0-67 catching
  none. Reinforces that it's reliably catchable past ~70, not just a fluke. Thorn Sturgeon
  only appeared once so far (stack 3, skill 77); its own "Very Rare" tag already explains an
  irregular catch pattern — no update needed, still minSkill 30.
  Grouper's minSkill was promoted to the live site 2026-08-21: removed the source table's
  `minSkill: 1` (confirmed wrong). Updated again 2026-08-22 to `minSkill: 70` outright — the
  bracket (67, 70] only has one multiple-of-5 candidate, and every other confirmed skill
  threshold on this site lands on a multiple of 5, so 70 is a confident inference even though
  it's not a directly-confirmed number from a card/tooltip. Noted as inferred on the live
  site rather than presented as a flat fact.
- Tattered Cloth Boots: ~15% approximate drop rate per bait, apparently flat across skill
  levels per secondhand reports from other players — unlike Grouper, nothing here suggests a
  skill gate.
