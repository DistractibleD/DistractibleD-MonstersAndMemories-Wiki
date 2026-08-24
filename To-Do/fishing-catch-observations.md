Fishing catch-rate observations (Night Harbor, Grub bait)
=========================================================

Character: **Distracted** (the user's main/high-skill fisherman, 114+ by the end of this
dataset), plus **Fishdata** (4th character overall, see below). Raw per-stack haul data from
the user's own fishing sessions, all in Night Harbor (at the harbor), all using 20x Grub
bait per stack, same fishing rod throughout. Tracked here rather than as `note` text on
gathering-nodes.json entries — those notes render live on the public Gathering page, and
running research tallies like this aren't visitor-facing info (see CLAUDE.md's "note is
visitor-facing content" rule). This file is not loaded by the site.

**2026-08-23 — Fishdata, a 4th character, skill 1 in Night Harbor:** before rolling out any
Fishing page changes from the Shaded Dunes/Sungreet Strand findings (per-zone minSkill,
zone-cap note — see the Sungreet Strand file for the pending recommendation), the user wants
one more control test: this brand-new skill-1 character fishing in Night Harbor, to see
whether Grouper stays locked out until ~skill 70 the same way it did for Distracted's own
leveling history here, or whether that was itself just one noisy run. Expect this to reuse
Night Harbor's established conventions (row order Basa/Whitefish/Grouper/Thorn Sturgeon)
unless told otherwise, but confirm rather than assume, same caution as every other new
character.

**First catch:** skill 15, a **Whitefish** — unsurprising given Whitefish's minSkill: 1 and
"most common fish in Night Harbor" note; consistent with Distracted's own early Night Harbor
stacks, which also caught Whitefish/Basa freely from very low skill. The real test is
whether Grouper stays absent through a much longer stretch (Distracted's own history: 0
Grouper across 40 bait at skill 0-67) — one early Whitefish catch doesn't confirm or
contradict that yet.

**Second catch:** skill 28, a **Basa** — also expected (Basa: minSkill 1, present since
Distracted's own stack 1). Still no Grouper. Watching for whether it stays absent past
Distracted's own skill-67 mark.

**Third catch — breaks the pattern: skill 53, a Grouper.** This directly contradicts
Distracted's own Night Harbor history (0 Grouper across 40 bait at skill 0-67 there) and is
well below even the Shaded-Dunes-derived headline `minSkill: 30` currently on the live site.
This is exactly the result the control test was designed to check for — it strongly suggests
Distracted's original "Grouper locked out until ~70 in Night Harbor" pattern was itself just
one character's noisy run, not a real Night-Harbor-specific threshold. Combined with
Sungreet Strand and Shaded Dunes both showing Grouper reachable well under 70, Night
Harbor's "70" now looks like the outlier that needs explaining, not the other zones' lower
numbers. Worth revisiting the live site's Grouper note (currently says Night Harbor's is
"much higher (70)") once more of this stack is in — this may need walking back rather than
just re-flipping the headline number again.

**Environmental conditions, noted by the user for this Fishdata session (2026-08-23):**
night time, raining. User's own hedge: probably doesn't matter for any of the species seen
so far, but worth having on record given Sunscale Skimmer is already confirmed day-only
(Shallow Shoals) — if a pattern involving time-of-day/weather ever shows up, this session's
conditions are already captured rather than lost. No action taken on this alone; just a
data point to have if it becomes relevant later.

Fishdata — Stack 1 complete, skill 1 → 53 (fresh, not cumulative)
------------------------------------------------------------------
Row order confirmed by the user, same convention as Distracted: Basa, Whitefish, Grouper.
Final totals:
- Basa: 3
- Whitefish: 14
- Grouper: 1

The single Grouper here is the same skill-53 catch already logged above (third catch of the
stack) — no additional Groupers after it. So this stack's real signal is just the one early
catch, not a growing trend yet. Still a clean break from Distracted's Night Harbor history:
Distracted's own first ~2.5 stacks (0-67, roughly 50+ bait) caught zero Grouper, while
Fishdata got one within a single 20-bait stack. One character, one stack — not enough to
redraw Night Harbor's Grouper minSkill on its own, but a real data point pointing away from
"~70" as a hard floor. Keep fishing Fishdata to see whether more Groupers show up at
similarly low skill, which would settle this more firmly.

Running totals (Fishdata, 1 stack, 20 bait, skill 1→53)
------------------------------------------------------------
- Basa: 3
- Whitefish: 14
- Grouper: 1

Fishdata — Stack 2 complete, skill 53 → 62 (cumulative, not cleared)
-----------------------------------------------------------------------
Shown totals: 9 Basa, 24 Whitefish (20+4), 4 Grouper. Stack-2-only catch is the difference
from stack 1's cumulative 3/14/1:
- Basa: 9 − 3 = 6
- Whitefish: 24 − 14 = 10
- Grouper: 4 − 1 = 3

**3 more Grouper this stack, at skill 53-62** — not a one-off fluke catch, Grouper is
genuinely present and repeatable at this skill range for Fishdata. This is now a real
pattern (4 Grouper total across 2 stacks, skill 1-62), not just the single early catch from
before. Strengthens the case that Distracted's original "locked out until ~70" result was
that character's own noisy run rather than a real Night Harbor floor.

Running totals (Fishdata, 2 stacks, 40 bait, skill 1→62)
--------------------------------------------------------------
- Basa: 9
- Whitefish: 24
- Grouper: 4

**User's theory (2026-08-23): the real minSkill is 30 everywhere (matching the original
external-wiki claim and the independently-confirmed Shaded Dunes value), and Night Harbor
just has a lower effective catch rate at low skill on top of the same floor** — not a
different, higher minSkill. Plausible and parsimonious, but not yet confirmed: Fishdata's
first Night Harbor Grouper was at skill 53, not close to 30, so the data only tells us
Night Harbor's real floor is *somewhere ≤53* — it's equally consistent with "floor 30, rare
30-53 here" and "floor genuinely somewhere in the 30s-50s, just not as extreme as 70."

**Multiples-of-5 tightening (user's own follow-up, same day):** since every confirmed skill
threshold on this site lands on a multiple of 5, a catch at 53 rules out any threshold of 55
or higher — the real Night Harbor floor must be **50 or lower**. Doesn't pin the exact value
(still consistent with 30, 35, 40, 45, or 50), but narrows the upper bound from "≤53" to a
clean "≤50."

Would need either an earlier catch (closer to 30) or a lot of zero-catch bait spent
specifically in the 30-50 range to pin the exact value. Live site updated to reflect what
*is* confirmed (70 is dead, real floor ≤50) without asserting the unconfirmed part (that
Night Harbor's floor is exactly 30) — Grouper's note now says the Night Harbor floor is "50
or lower (a catch was confirmed at skill 53)."

**New discovery, mid-stack 3: Soggy Marble Rye, skill 64.** A food item ("This is a light
snack.") caught while fishing in Night Harbor — same "non-fish junk catch" category as
Tattered Cloth Boots, but food instead of equipment. Genuinely new to the wiki (didn't exist
anywhere). Added both an items.json card (type Food, weight 0.1/Small, no stats/effect shown
on the card) and a gathering-nodes.json entry mirroring the boots' pattern, with a note
that it was first confirmed at skill 64 — not asserting that as a minSkill, just the one
observation so far, same caution as boots got before enough data came in to set minSkill 1
there.

Fishdata — Stack 3 complete, skill 62 → 67 (fresh, bags cleared)
---------------------------------------------------------------------
Totals dropped below the previous cumulative total (Whitefish 24 → 7), confirming bags were
cleared before this stack even though the user didn't say so explicitly — inferred from the
numbers themselves (a cumulative total can't decrease). Same row order as before.
- Basa: 8
- Whitefish: 7
- Grouper: 5

**5 more Grouper**, now 9 total across 3 stacks (60 bait) for Fishdata, all at skill ≤67 —
continuing to firmly contradict the old "locked out until 70" result. Also notable: this is
the first stack where Grouper's raw count (5) isn't dramatically behind Whitefish's (7) —
close to even, unlike Distracted's early Night Harbor stacks where Whitefish dominated by a
wide margin. Small sample, but worth watching whether this holds.

Running totals (Fishdata, 3 stacks, 60 bait, skill 1→67)
----------------------------------------------------------------
- Basa: 17
- Whitefish: 31
- Grouper: 9

Fishdata — Stack 4 complete, skill 67 → 70 (cumulative again, not cleared)
-------------------------------------------------------------------------------
Shown totals: 14 Basa, 17 Whitefish, 8 Grouper — all higher than stack 3's fresh totals, so
cumulative this time (39 total would be impossible for a fresh 20-bait stack). Stack-4-only
catch is the difference from stack 3's 8/7/5:
- Basa: 14 − 8 = 6
- Whitefish: 17 − 7 = 10
- Grouper: 8 − 5 = 3

Skill ended at exactly 70 — same number as Sungreet Strand's confirmed cap. Worth watching
whether Night Harbor also plateaus here, or keeps climbing past it (Distracted's own history
already shows Night Harbor skill climbing well past 70, so a genuine plateau here would be
surprising — more likely just passing through on the way up, but flagging in case).

Running totals (Fishdata, 4 stacks, 80 bait, skill 1→70)
----------------------------------------------------------------
- Basa: 23
- Whitefish: 41
- Grouper: 12

**First-ever Thorn Sturgeon for Fishdata, skill 73** (mid-stack 5, after clearing inventory
again per the last message). Consistent with Thorn Sturgeon's "Very Rare" tag and its own
existing note (first encountered at skill 77 for Distracted) — a skill-73 first catch is in
the same ballpark, not a contradiction like Grouper's old "70" was. No live-site change
needed from this alone.

Fishdata — Stack 5 complete, skill 70 → 74 (fresh, bags cleared)
---------------------------------------------------------------------
Four rows this time — Thorn Sturgeon joins the row order as a 4th row, same convention as
Distracted's. Final totals:
- Basa: 6
- Whitefish: 10
- Grouper: 3
- Thorn Sturgeon: 1 (the skill-73 catch already logged above)

Running totals (Fishdata, 5 stacks, 100 bait, skill 1→74)
----------------------------------------------------------------
- Basa: 29
- Whitefish: 51
- Grouper: 15
- Thorn Sturgeon: 1

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

**2026-08-24 — back to Distracted, testing for a Night Harbor skill cap:** after Fishdata
(see above) reached 100 bait (5 stacks) and confirmed the old Grouper minSkill: 70 was wrong
(real floor ≤50, exact value still unknown), the user is resuming fishing on **Distracted**
specifically to test whether Night Harbor has a skill cap at all — neither character has
found one yet (Distracted was already at 114, Fishdata still climbing at 74), unlike Shaded
Dunes (45) and Sungreet Strand (70). Distracted has the most room to climb before hitting
any plausible cap, so is the more efficient character for this specific question. Watch for
skill plateauing; if it does, note the value (check whether it's a multiple of 5, same as
the other two zones). Pinning Night Harbor's exact Grouper floor is a separate, lower-
priority open question that would need a fresh low-skill character watching closely through
skill 30-50 specifically — not what this round of testing is for.

Distracted — Cap-test Stack 1, skill 114 → 118 (fresh — bags cleared, inferred from the
numbers, not explicitly stated)
--------------------------------------------------------------------------------------------
Row order: Basa, Whitefish, Grouper (no Thorn Sturgeon row this time). Totals far below the
previous 200-bait cumulative tally (80/129/36), so this must be a fresh stack, not
cumulative with the earlier milestone.
- Basa: 7
- Whitefish: 11
- Grouper: 4

**Skill moved from 114 to 118 — no plateau yet.** Still climbing, same as before. Keep
watching.

**Mechanic note (user's own observation):** the last Whitefish catch of this stack happened
with **zero bait remaining** — an extra click past the last Grub in the stack still resolved
into a catch. Suggests bait may be consumed *after* a catch resolves (or checked at cast
time rather than pre-validated), meaning one "free" cast beyond your last bait is possible.

**Follow-up speculation (user's own, explicitly labeled as pure speculation):** if high
skill allows catching fish with no bait at all, and higher skill also biases toward rarer
fish, maybe bait-less fishing specifically catches *more common* fish — a way to reverse the
skill-driven rarity shift. Interesting idea, but the current data (n=1 bait-less catch, a
Whitefish) can't actually test it — Whitefish is already the most common fish regardless of
bait, so this one data point doesn't distinguish "bait-less catches skew common" from "bait-
less catches are just normal catches that happened to be common, like most catches are
anyway." Also connects to something already in the data model: the original (now-cleared,
2026-08-22) source-table claim that Whitefish becomes bait-free "at fishing skill 50" —
Distracted is well past that, so this could be the first real evidence that specific claim
was right, independent of the rarity-reversal question. To actually test the rarity idea:
deliberately fish with zero bait for a stretch and compare the species mix against a normal
baited stack at the same skill — if Grouper never shows up bait-less while showing up
normally with bait, that would support it. Not enough data yet either way.
