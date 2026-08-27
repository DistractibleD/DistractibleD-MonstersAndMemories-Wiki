#!/usr/bin/env node
// Flags a newly-submitted MnM Field Notes session export for a human to
// look at before merging, rather than pooling every merged file blindly.
// Not a hard gate — every check here is a heuristic ("this looks unusual"),
// never proof of misuse, since real zone-to-zone skill variance can look
// exactly like a "wrong" number too (see CLAUDE.md's fishing-catch-
// observations research, and the zone-skill-cap findings there). Run by
// .github/workflows/fishing-anomaly-check.yml on every session-export PR;
// posts a PR comment only when something is actually flagged — a clean
// file produces no output and no comment.
//
// Two kinds of standard to check a new file against:
// 1. This wiki's own confirmed Fishing data (gathering-nodes.json's
//    minSkill/rarity per species) — catches something no known mechanic
//    explains, e.g. a high-tier fish landed at skill 0.
// 2. The pooled baseline every PREVIOUSLY MERGED session already built
//    (fishing-rarity.json) — catches a submission whose catch rate for one
//    fish is wildly out of line with what everyone else has reported so
//    far, once there's enough history to compare against.
//
// Usage: node scripts/check-fishing-anomalies.js <path-to-export.txt> [...]

const fs = require('fs');
const path = require('path');
const { extractFishingLines, parseSessionHeader } = require('./lib/session-export');

const REPO_ROOT = path.join(__dirname, '..');

function loadFishReference() {
  const nodesPath = path.join(REPO_ROOT, 'gathering-nodes.json');
  if (!fs.existsSync(nodesPath)) return {};
  const nodes = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
  const byName = {};
  for (const n of nodes) {
    if (n.tradeskill !== 'Fishing') continue;
    byName[n.name] = {
      minSkill: typeof n.minSkill === 'number' ? n.minSkill : null,
      rarity: n.rarity || null
    };
  }
  return byName;
}

function loadBaseline() {
  const p = path.join(REPO_ROOT, 'fishing-rarity.json');
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

// Rule 1: a fish landed well below the skill this wiki has on record for
// it, or any skill at all for a Rare/Very Rare species, is worth a second
// look — but with a generous margin, since confirmed real per-zone
// variance of 30-40 skill points already exists (Grouper: minSkill 70 in
// Night Harbor vs. ~30 in Shaded Dunes, both directly confirmed).
function checkLowSkillHighTierCatches(records, fishRef) {
  const groups = {}; // "zone|fish" -> { zone, fish, ref, skills: [] }
  for (const r of records) {
    if (!r.success || !r.resultItem || r.skill === null) continue;
    const fish = fishRef[r.resultItem];
    if (!fish) continue;
    const isHighTier = (fish.minSkill !== null && fish.minSkill >= 20) ||
      fish.rarity === 'Rare' || fish.rarity === 'Very Rare';
    if (!isHighTier) continue;
    const isSuspicious = r.skill === 0 || (fish.minSkill !== null && r.skill < fish.minSkill / 2);
    if (!isSuspicious) continue;
    const key = `${r.zone}|${r.resultItem}`;
    if (!groups[key]) groups[key] = { zone: r.zone, fish: r.resultItem, ref: fish, skills: [] };
    groups[key].skills.push(r.skill);
  }
  return Object.values(groups).map((g) => {
    const refNote = g.ref.minSkill !== null
      ? `known min skill ~${g.ref.minSkill}`
      : `rarity: ${g.ref.rarity}`;
    const skillsNote = g.skills.length > 1
      ? `skill ${Math.min(...g.skills)}-${Math.max(...g.skills)} across ${g.skills.length} catches`
      : `skill ${g.skills[0]}`;
    return `**${g.fish}** caught in **${g.zone}** at ${skillsNote} (${refNote})`;
  });
}

// Rule 2: a large number of catches with zero net skill change only looks
// wrong at a low starting skill — a legitimate per-zone skill cap as low as
// 45 is already confirmed, so this stays well below that (30) to avoid
// flagging real capped-out play, and requires a genuinely large catch
// count (40+) so a short, ordinary flat stretch never trips it.
function checkFlatSkillHighVolume(records, header) {
  if (header.fishingStartSkill === null || header.fishingEndSkill === null) return [];
  const gain = header.fishingEndSkill - header.fishingStartSkill;
  const totalCatches = records.filter((r) => r.success && r.resultItem).length;
  if (gain <= 0 && totalCatches >= 40 && header.fishingStartSkill < 30) {
    return [
      `${totalCatches} successful catches logged with Fishing skill flat at ` +
      `${header.fishingStartSkill} the entire session — skill gain is expected this early, ` +
      'even accounting for known per-zone skill caps'
    ];
  }
  return [];
}

// Rule 3: this session's own catch rate for a fish, compared against the
// rate every previously-merged session has established for that zone —
// only once that baseline has enough samples to mean something, and only
// once this session itself has enough samples to not just be noise.
function checkRateVsBaseline(records, baseline) {
  const byZone = {};
  for (const r of records) {
    if (!r.zone) continue;
    if (!byZone[r.zone]) byZone[r.zone] = { attempts: 0, fish: {} };
    byZone[r.zone].attempts += r.attempts;
    if (r.success && r.resultItem) {
      byZone[r.zone].fish[r.resultItem] = (byZone[r.zone].fish[r.resultItem] || 0) + 1;
    }
  }

  const MIN_BASELINE_ATTEMPTS = 50;
  const MIN_NEW_ATTEMPTS = 10;
  const SPIKE_MULTIPLIER = 4;
  const NEW_SPECIES_RATE_THRESHOLD = 0.15;

  const findings = [];
  for (const [zone, data] of Object.entries(byZone)) {
    const base = baseline[zone];
    if (!base || base.totalAttempts < MIN_BASELINE_ATTEMPTS) continue;
    if (data.attempts < MIN_NEW_ATTEMPTS) continue;
    for (const [fishName, count] of Object.entries(data.fish)) {
      const newRate = count / data.attempts;
      const baseRate = (base.fish[fishName] || 0) / base.totalAttempts;
      if (baseRate > 0 && newRate > baseRate * SPIKE_MULTIPLIER) {
        findings.push(
          `**${fishName}** caught at ${(newRate * 100).toFixed(0)}% rate in **${zone}** this ` +
          `session, vs an established ${(baseRate * 100).toFixed(1)}% across ` +
          `${base.totalAttempts} previously-pooled attempts — much higher than usual`
        );
      } else if (baseRate === 0 && newRate > NEW_SPECIES_RATE_THRESHOLD) {
        findings.push(
          `**${fishName}** hasn't shown up in **${zone}** in any previously-pooled session ` +
          `(${base.totalAttempts} attempts so far), but shows up at ${(newRate * 100).toFixed(0)}% here`
        );
      }
    }
  }
  return findings;
}

function checkFile(filePath, fishRef, baseline) {
  const text = fs.readFileSync(filePath, 'utf8');
  const records = extractFishingLines(text);
  const header = parseSessionHeader(text);
  return {
    lowSkillHighTier: checkLowSkillHighTierCatches(records, fishRef),
    flatSkillHighVolume: checkFlatSkillHighVolume(records, header),
    rateVsBaseline: checkRateVsBaseline(records, baseline)
  };
}

function formatFindings(filePath, findings) {
  const sections = [];
  if (findings.lowSkillHighTier.length) {
    sections.push(['Fish landed well below their known skill requirement', findings.lowSkillHighTier]);
  }
  if (findings.flatSkillHighVolume.length) {
    sections.push(['High catch volume with no skill gain', findings.flatSkillHighVolume]);
  }
  if (findings.rateVsBaseline.length) {
    sections.push(['Catch rate unusually different from established data', findings.rateVsBaseline]);
  }
  if (sections.length === 0) return null;

  const lines = [];
  lines.push(`### ⚠️ Possible data anomalies in \`${path.basename(filePath)}\``);
  lines.push('');
  lines.push(
    "These are heuristic checks against this wiki's own Fishing data and everyone's " +
    'previously-pooled sessions — not proof of a problem. Real zone-to-zone skill variance ' +
    'can look unusual too. Take a look before merging, but use your own judgment.'
  );
  for (const [title, items] of sections) {
    lines.push('');
    lines.push(`**${title}:**`);
    for (const item of items) lines.push(`- ${item}`);
  }
  return lines.join('\n');
}

function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) return;

  const fishRef = loadFishReference();
  const baseline = loadBaseline();

  const allOutput = [];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    try {
      const findings = checkFile(file, fishRef, baseline);
      const formatted = formatFindings(file, findings);
      if (formatted) allOutput.push(formatted);
    } catch (err) {
      console.error(`Could not check ${file}: ${err.message}`);
    }
  }

  if (allOutput.length > 0) {
    process.stdout.write(allOutput.join('\n\n---\n\n') + '\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkLowSkillHighTierCatches, checkFlatSkillHighVolume, checkRateVsBaseline };
