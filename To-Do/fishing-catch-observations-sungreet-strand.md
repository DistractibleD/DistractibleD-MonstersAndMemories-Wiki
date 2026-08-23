Fishing catch-rate observations (Sungreet Strand, Grub bait)
================================================================

Companion file to `fishing-catch-observations.md` (Night Harbor) and
`fishing-catch-observations-shaded-dunes.md` (Shaded Dunes) — same purpose and same
"not visitor-facing, not loaded by the site" rules apply here. Started 2026-08-22, purpose-
built to test the user's zone-skill-cap theory (see below), not just to catalogue species.

**Why this zone, specifically:** the user's theory (developed from Night Harbor + Shaded
Dunes data) is that each zone has its own fishing skill cap tied to that zone's intended
adventuring-level range — Shaded Dunes (content mostly under level 20, little above) plateaus
around skill 45; Night Harbor (content up into the 50s) never plateaued even by skill 114.
Sungreet Strand is adventuring level ~5+, another relatively low-level zone across from Night
Harbor — if the cap-tracks-zone-level idea is right, Sungreet Strand should also have a cap
somewhere in reach, plausibly lower than Distracted (skill 114+)'s current level.

**Test plan, as stated by the user:**
1. Fish a stack of Grub bait in Sungreet Strand with **Distracted first** (currently 114+
   from Night Harbor). If Distracted gains **zero** skill from a full stack, that's a second
   zone independently showing "already past this zone's cap" — meaningful support for the
   theory. If Distracted *does* gain skill, that's a real problem for "starter zones have
   low caps," not just noise.
2. If Distracted plateaus (as predicted), follow up with a lower-skill character
   (Distractoid, or a new third character if Distractoid's already past the cap) to find
   Sungreet Strand's actual cap value, same approach as the Shaded Dunes test.

**Open question not addressed by this test:** Distractoid's Grouper
catches declined stack-to-stack (3, 2, 1) while stuck at the *same* flat skill (45) — that's
not explained by "distance above cap" (which was unchanged between those stacks). This test
doesn't resolve that on its own; keep watching for whether a similar within-plateau decline
shows up here too, if Distractoid (or another low-skill character) gets tested here later.

**Multiples-of-5 pattern (user's own observation, 2026-08-22):** suspected skill caps so far
land on round multiples of 5 (Shaded Dunes: 45). This matters — a clean round number is much
more consistent with an intentional, designed cap than a random Beta bug/incomplete system,
which pushes back somewhat on the "this might just be unfinished game systems" skepticism
raised earlier. Same multiples-of-5 pattern already established site-wide for other skill
thresholds (recipeSkillLevel, minSkill, trivialSkill — see CLAUDE.md). If Sungreet Strand's
cap (once found) also lands on a multiple of 5, that's a third independent data point
supporting real, deliberate per-zone caps.

Stack 1 — Distracted (skill 114, unchanged — result confirms the prediction)
-----------------------------------------------------------------------------
**Skill stayed at exactly 114, zero gain from this full stack.** This is the predicted
result — a second zone (after Shaded Dunes) where Distracted's skill is already past
whatever the local cap is. Meaningful support for the zone-cap theory, per the test plan
above (this was the "if this character gains zero skill" branch).

Row order confirmed by the user, top to bottom: **Basa, River Trout, Grouper** — notably
different from Night Harbor/Shaded Dunes (Basa, Whitefish, Grouper). River Trout replaces
Whitefish here — a genuinely different species mix, not just the same three fish again.
River Trout was previously only recorded at Keeper's Bight; added Sungreet Strand to its
`locations`, along with Basa and Grouper (all three promoted immediately to the live site).

Catches:
- Basa: 6
- River Trout: 2
- Grouper: 12

Grouper was the single most-caught fish this stack (12 of 20, 60%) — even higher than its
share in Distracted's Shaded Dunes stack (9 of 20, 45%). Consistent with the broader pattern
across all three zones so far: a high-skill character sees a lot of the zone's "rare" fish
once well past whatever the local cap is. Doesn't yet tell us Sungreet Strand's actual floor
for Grouper (or River Trout) — that needs the planned lower-skill follow-up character.

Next step per the test plan: follow up with a lower-skill character (Distractoid, or a new
one) to find Sungreet Strand's real cap value and see whether it's also a multiple of 5.

Stack 1 — Distrac (in progress)
----------------------------------
Third character, rolled specifically as the lower-skill follow-up for this zone (same role
Distractoid played in Shaded Dunes). Fishing skill 1 as of 2026-08-22.

**Mid-stack update 1:** at skill 33, only 2 of 20 bait spent so far (18 remain), zero catches
yet. With only 2 attempts, unremarkable on its own.

**Mid-stack update 2 — first catch of the stack:** at skill 46, first-ever catch for this
character, and it's a **Grouper**. Notable on two counts: (1) the cold start extended well
past skill 33 (up to somewhere between 33 and 46) before *anything* was caught, longer than
Distractoid's near-immediate first catch in Shaded Dunes; (2) the very first fish caught
wasn't a "common" species — it was Grouper, the one we've been treating as the zone's rarer
catch. Both are still just one character's early data — could be normal variance (a
Grouper landing first by chance among a low overall catch rate) rather than a real pattern,
but worth watching whether River Trout/Basa show up before or after further Grouper catches
as this stack continues.

**Cross-zone comparison, user's own observation:** Distrac was at *higher skill (46) before
landing a single fish* in Sungreet Strand than Distractoid ever reached across all 3 full
Shaded Dunes stacks combined (plateaued at 45, 60 bait total). That's a real difference in
how hard it is to get going in each zone, not just a difference in the eventual skill cap —
suggests Sungreet Strand may have a genuinely slower/harder catch rate at low skill than
Shaded Dunes, not just a similar curve with a different ceiling. Worth keeping in mind for
the zone-cap theory: the two "starter" zones aren't behaving identically at low skill, even
if they turn out to share the multiples-of-5 cap pattern.

**Second catch:** skill 52 (up from 46 at the first catch — only ~2 more bait used, only 4
of 20 spent total so far, 16 remain), and it's **another Grouper**. So both of Distrac's
first two catches are Grouper — no Basa or River Trout yet at all. Combined with skill
jumping fast per bait right now (33→46→52 across just a handful of bait), this still looks
like the character is in a fast-early-leveling phase, same shape as Distractoid's early
climb in Shaded Dunes, just starting from a slower/later first catch. Two Groupers with zero
of the "common" species so far is a notable order-of-appearance pattern, but still a small
sample (n=2) — could flip once Basa/River Trout show up.

**Third catch:** skill 56, first-ever **Basa** for this character. Catch order so far:
Grouper (46), Grouper (52), Basa (56) — River Trout still hasn't appeared. Basa finally
breaking the Grouper streak fits "just a small sample flipping," per the note above, rather
than anything more dramatic.

**Fourth catch:** skill 64, first-ever **River Trout** — the last of the three known
Sungreet Strand species to show up for this character. Full catch order: Grouper (46),
Grouper (52), Basa (56), River Trout (64).

**"This zone feels harder to catch anything in" — checked against the numbers, not just
taken on feel:** Distrac used only ~5 bait to go from skill 1 to 56 (1→33 in the first 2
bait alone), but landed just 3 catches in that span. Distractoid's entire Shaded Dunes stack
1 landed 17 catches out of 20 bait (85% hit rate) while skill climbed far more slowly (1→45
over the *whole* stack). So there's a real, opposite-direction pattern, not superstition:
Sungreet Strand is giving much faster skill gains per bait, but a much lower catch success
rate per bait, than Shaded Dunes did. Still one character's partial first stack — a real
pattern so far, not yet a confirmed one.

**Underlying mechanic, explained by the user 2026-08-22 — important for interpreting all
the skill-per-bait framing above and in the other two zone files:** a single fishing attempt
is a multi-step minigame (cast → nibble → bite/start reeling → one or more "continue
reeling" steps → outcome), and the player is a passive participant once it starts. Each step
can independently grant a skill-up. Possible outcomes: no catch + keep bait, no catch + lose
bait, catch + lose bait (most common if you catch), or catch + keep bait (rare). So "skill
per bait" isn't a clean 1:1:1 relationship — one bait spent can correspond to several skill-
up rolls depending on how many minigame steps that attempt ran through, independent of
whether it ended in a catch. This is likely why skill-gain rate and catch-success rate can
move in opposite directions (fast skill climb + low catch rate, as seen here) without being
contradictory — they're separate outcomes of the same multi-step process, not the same
thing measured two ways. Don't need step-by-step minigame logs — skill number at each
notable event + species caught + running bait count (what's already being reported) is the
right level of detail.

**Stack 1 complete — skill 1 → 67.** Row order for this screenshot, confirmed by the user
top to bottom: **Basa, Grouper, River Trout** — note this is a *different* row order than
Distracted's Sungreet Strand screenshot (Basa, River Trout, Grouper). Row order isn't
assumed to carry over between characters/sessions; always confirm fresh.

Final totals:
- Basa: 11
- Grouper: 4
- River Trout: 1

(16 catches from 20 bait — consistent with the multi-step-minigame mechanic above, not
every bait ends in a catch.)

Interesting reversal from the catch *order*: the first four catches were Grouper, Grouper,
Basa, River Trout — Grouper led 2-0 early on — but by the end of the stack Basa dominates
heavily (11 vs. Grouper's 4). Early catch order isn't a reliable preview of final
proportions, at least not in this one stack.

Running totals (Distrac, 1 stack, 20 bait, skill 1→67)
-----------------------------------------------------------
- Basa: 11
- Grouper: 4
- River Trout: 1

**Sungreet Strand's skill cap, user's own observation mid-stack-2:** appears to be **70** —
Distrac's skill stopped climbing there. This is a third independent data point landing on a
multiple of 5 (Shaded Dunes: 45, now Sungreet Strand: 70), continuing to support the
"intentional design value, not a Beta bug" read over random chance.

**Correction (assistant's own error, caught by the user):** earlier framed this as
Sungreet Strand having a *higher* cap despite being the *lower*-starting zone — backwards.
Per the user's own original description: Shaded Dunes is playable from adventuring level 1,
Sungreet Strand from around level 5+ — so Sungreet Strand actually starts *higher*. A
higher-starting zone having a higher fishing cap (70 vs. 45) is exactly what the theory
predicts, not a wrinkle in it — this cleanly fits "cap tracks zone level range" rather than
complicating it. Not yet promoted to the live site or treated as fully confirmed — one
character reaching a plateau once is the same strength of evidence Distractoid gave for
Shaded Dunes' 45, worth watching for continued flatness across further bait before calling
it settled.

Stack 2 complete — skill 67 → 70 (matches the suspected cap)
------------------------------------------------------------------
Cumulative screenshot, same row order as stack 1 (Basa, Grouper, River Trout). Shown totals:
20 Basa, 12 Grouper, 3 River Trout. Stack-2-only catch is the difference from stack 1's
11/4/1:
- Basa: 20 − 11 = 9
- Grouper: 12 − 4 = 8
- River Trout: 3 − 1 = 2

Skill ended this stack at exactly 70 — **the cap held**, first real confirmation beyond the
initial "mid-stack" observation. Two stacks now support Sungreet Strand's cap being 70.

Running totals (Distrac, 2 stacks, 40 bait, skill 1→70)
-----------------------------------------------------------
- Basa: 20
- Grouper: 12
- River Trout: 3

**No Tattered Cloth Boots in Sungreet Strand** — user's own note, zero found across both of
Distrac's stacks (40 bait). Consistent with the live-site entry, which only lists "Night
Harbor" as a location for that catch — no reason yet to add Sungreet Strand. Not proof it
can never happen there (40 bait is a modest sample for something that was only ~15% per bait
even in Night Harbor), but a real zero worth having on record.

Stack 3 complete — skill stayed at 70 (third stack running, cap confirmed)
--------------------------------------------------------------------------------
Cumulative screenshot, split stacks this time (each species now shown across 2 slots since
totals passed 20): Basa 20+10=30, Grouper 20+3=23, River Trout 4. Stack-3-only catch is the
difference from stack 2's 20/12/3:
- Basa: 30 − 20 = 10
- Grouper: 23 − 12 = 11
- River Trout: 4 − 3 = 1

**Skill stayed at exactly 70 through this whole stack too** — three stacks running at the
cap now (well, two flat + one that reached it partway through). Treat 70 as confirmed for
Sungreet Strand, same confidence level Shaded Dunes' 45 has.

**This resolves the open question from Shaded Dunes — and resolves it in the opposite
direction.** Grouper's share of total catches, stack by stack: 25% (stack 1, still
climbing to the cap) → 42% (stack 2, reached the cap partway through) → **50%** (stack 3,
flat at the cap the whole time). It kept climbing even while skill was completely flat.
Compare to Distractoid in Shaded Dunes, where Grouper's share *declined* while flat at 45
(18% → 9.5% → 5%, stacks 1-3, recalculated the same way). Two zones, both showing a
plateau, showing opposite trends in what happens to the rare-fish rate once flat. That's a
genuine puzzle for the theory as stated — "distance above cap drives the rate" doesn't
explain either the Shaded Dunes decline or, on its own, why Sungreet Strand would trend the
opposite way while equally flat. Worth thinking about what differs between the two
characters/zones beyond just "at the cap or not."

Running totals (Distrac, 3 stacks, 60 bait, skill 1→70)
-----------------------------------------------------------
- Basa: 30
- Grouper: 23
- River Trout: 4
