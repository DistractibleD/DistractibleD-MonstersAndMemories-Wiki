Fishing catch-rate observations (Shallow Shoals, bait TBD)
===========================================================

Companion file to `fishing-catch-observations.md` (Night Harbor), `-shaded-dunes.md`, and
`-sungreet-strand.md` — same purpose and same "not visitor-facing, not loaded by the site"
rules apply here. Started 2026-08-26 once Distracted began fishing in Shallow Shoals as part
of the ongoing multi-zone skill-cap testing.

Distracted — first catch (skill 179)
----------------------------------------
First fish caught in this zone: a Raw Bay Crab (already listed on the live site with
Shallow Shoals as a confirmed location — this catch corroborates that, doesn't newly
establish it).

**Notable skill-progression detail:** Distracted's skill was 177 and flat across all three
Shaded Dunes stacks just before this (confirmed capped there). Now reading 179 here in
Shallow Shoals — a 2-point increase since the last Shaded Dunes reading. Since skill is a
single global/shared stat (confirmed via the Shaded Dunes zero-skill-gain stacks), this
means the gain happened either during Shallow Shoals fishing itself or some untracked
fishing in between. If it happened here, that's a meaningful data point: unlike Shaded Dunes
(capped at 45) and Sungreet Strand (capped at 70), Shallow Shoals has NOT yet shown a skill
ceiling below Distracted's current level (179) — consistent with it being a higher-level
zone than either of those two, supporting the "cap roughly tracks zone level range" theory
rather than contradicting it. Not confirmed yet whether the gain came specifically from this
zone — worth asking/confirming on the next update.

Watch for: does skill keep climbing here, or does it plateau at some multiple of 5 the way
Shaded Dunes (45) and Sungreet Strand (70) did? If Shallow Shoals turns out to have a cap
too, its value relative to 177-179 will tell us whether it's actually higher than Night
Harbor's still-unconfirmed ceiling, or just higher than Shaded Dunes/Sungreet Strand.

Distracted — second catch (skill 181)
------------------------------------------
Deep Sea Devourer, same zone (Shallow Shoals) — already fully recorded on the live site
(items.json card matches this screenshot exactly; gathering-nodes.json already lists
Shallow Shoals as its location and "Very Rare" as its rarity). No data changes needed, but
this catch confirms it.

Skill is now 181, up another 2 points from the 179 reading two catches ago — skill is still
climbing in Shallow Shoals with no sign of a plateau yet, same trend as the first catch here.
Two consecutive skill increases while fishing in this zone all but confirms the gain is
coming from Shallow Shoals fishing itself, not carried over from elsewhere — strengthens the
read that this zone's cap (if it has one) sits well above 181, higher than both Shaded Dunes
(45) and Sungreet Strand (70).

Distracted — Stack 1 (skill 181→200, complete)
----------------------------------------------------------
Full stack (20 bait). Skill jumped another 19 points in one stack — still no sign of a cap,
now the highest confirmed level for any zone by a wide margin.
- Raw Bay Crab: 9
- Deep Sea Devourer: 10
(19 of 20 — the remaining 1 is unaccounted for: could be a missed/no-catch cast, a junk item
not yet mentioned, or a miscount; not treated as a third species without confirmation.)

**This is a striking result, worth flagging plainly rather than glossing over:** this entire
stack was made up of exactly the two species that Night-Harbor-derived data tagged "Rare"
and "Very Rare" — zero Basa/Whitefish/Grouper/anything else. Two live possibilities, not yet
distinguished:
1. Shallow Shoals' base species pool is simply different from Night Harbor/Shaded Dunes/
   Sungreet Strand — Raw Bay Crab and Deep Sea Devourer might just be the *common* catches
   here, and the "Rare"/"Very Rare" tags (both set from Night Harbor-only data) don't
   transfer to this zone at all.
2. The "higher skill = more rare fish" theory is correct and this is a strong confirmation
   of it — at skill 181-200, rare/very-rare fish may simply dominate regardless of zone, and
   this stack just hasn't run long enough (or isn't randomized enough) to show a lower-tier
   fish mixed in.
Can't tell these apart from one stack alone. **Not changing the live `rarity` fields off this
single data point** — those still reflect Night Harbor's own observed frequency and a
zone-blind field can't represent "common in one zone, rare in another" without the deferred
Fishing-page schema rework anyway (see the note near the top of the Shaded Dunes file). If
future stacks here keep showing this same two-species pattern, that's much stronger evidence
either way — worth another full stack or two before drawing a conclusion.

**Working conclusion (user's own, 2026-08-27): Basa/Whitefish/Grouper likely don't exist as
catchable species in Shallow Shoals at all (Raw Bay Crab being the one confirmed exception,
since it also exists in Night Harbor).** Reasonably well-supported, not just a guess: Night
Harbor's own Cap-test Stack 2 (skill 132→145, see `fishing-catch-observations.md`) still
pulled Basa/Whitefish/Grouper in normal numbers (4/6/8) at a comparable skill level, which
argues against "skill alone suppresses common fish" as the explanation for their total
absence here — if skill alone were the cause, Night Harbor at a similar level should have
shown the same thinning-out, and it didn't. Caveat: Night Harbor has no catch breakdown
logged above skill ~145 (only skill-bar checks up to 177), so this isn't airtight — it's
possible Basa/Whitefish/Grouper also vanish in Night Harbor somewhere between 145 and 200,
just not yet tested. A Night Harbor stack in the 180-200 range would close that gap. Not
changing `locations` on Basa/Whitefish/Grouper in gathering-nodes.json based on this (they
were never listed for Shallow Shoals to begin with — nothing to remove), and not adding a
"Shallow Shoals only has these two species" claim to the live site either, since that's a
negative/exclusionary claim harder to fully confirm than a positive sighting.

Distracted — third species (skill 202)
------------------------------------------
Sunscale Skimmer, caught mid-reel with a skill-up landing in the same message (200→202).
Already fully recorded on the live site (items.json card matches exactly; gathering-nodes.json
already lists Shallow Shoals as its location, rarity "Uncommon"). Screenshot deleted, no data
changes needed.

Widens the zone's confirmed roster to three species (Raw Bay Crab, Deep Sea Devourer, Sunscale
Skimmer) — still zero Basa/Whitefish/Grouper sightings. Doesn't change the working conclusion
above; Sunscale Skimmer being "Uncommon" rather than "Rare"/"Very Rare" like the other two
just means Shallow Shoals' pool isn't *entirely* rare-tier fish, but the low/common-tier
species from the other zones still haven't shown up here at all.

Distracted — Stack 2 (skill 202→214, complete)
----------------------------------------------------------
Full stack (20 bait), row order confirmed by the user: Raw Bay Crab, Deep Sea Devourer,
Sunscale Skimmer. Totals sum to exactly 20 — fresh stack, no junk/misses this time.
- Raw Bay Crab: 8
- Deep Sea Devourer: 5
- Sunscale Skimmer: 7

Second full stack in a row with **zero** Basa/Whitefish/Grouper — same three species as
before, no new ones. Skill still climbing steadily (202→214, +12), no plateau. This is now
the strongest evidence yet for the "different species pool per zone" theory: two
consecutive full stacks (39 total catches) landing entirely within the same 3-species set
makes "it just hasn't come up yet by chance" a much weaker explanation than it was after one
stack.

Running totals (2 stacks + 2 singles, Shallow Shoals)
------------------------------------------------------
- Raw Bay Crab: 9 + 8 = 17
- Deep Sea Devourer: 10 + 1 + 5 = 16
- Sunscale Skimmer: 1 + 7 = 8
