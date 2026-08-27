#!/usr/bin/env node
// Pools Fishing catch data across every merged MnM Field Notes session export
// into one shared statistic, published as fishing-rarity.json for the app to
// fetch and merge with its own local data — same shape Get-FishRarity already
// produces in that app (MnMFieldNotes.ps1), so no format translation is
// needed on that side: { "<zone>": { "totalAttempts": N, "fish": { "<fishName>": N } } }.
//
// Run by .github/workflows/fishing-rarity.yml on every push to main that
// touches session-exports/**, plus on-demand via workflow_dispatch. Safe to
// run locally too: `node scripts/build-fishing-rarity.js`.
//
// Source files live in session-exports/ — one .txt per merged session export
// (see CLAUDE.md "Session exports & pooled Fishing rarity"). This parser
// reads the raw per-attempt lines rather than the exports' own precomputed
// "Fishing rarity data" block, so it works uniformly across every export,
// including ones from before that block existed (2026-08-27).
//
// Each session's own attempt/catch counts are summed directly (no averaging,
// no per-session weighting) — a 3-attempt session and a 300-attempt session
// both just add their raw numbers into the same pool, so a small session
// naturally ends up with proportionally less influence on the combined
// percentage than a large one, the same way real combined statistics work.
// There's no "conflicting data" case to arbitrate here the way there is for
// manually-submitted screenshots: every file is structured, machine-written
// data from a real play session, and a merged PR already was the human
// review step. A file that fails to parse is skipped with a warning rather
// than failing the whole build — this format is a guide the exporter can
// change, not a spec other files are held to.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const SESSION_EXPORTS_DIR = path.join(REPO_ROOT, 'session-exports');
const OUTPUT_PATH = path.join(REPO_ROOT, 'fishing-rarity.json');

// Parses one "- Zone: X | Area: Y | Skill: Z | Result: W | Attempts: N" (or
// "...| No catch/result | Attempts: N") harvesting line into its fields.
// Split-on-" | " rather than one rigid regex so field order/presence can
// drift (Area and Skill are already optional today) without breaking this.
function parseHarvestingLine(line) {
  const body = line.replace(/^-\s*/, '');
  const segments = body.split(' | ');
  const rec = { zone: null, attempts: 0, success: false, resultItem: null };
  for (const seg of segments) {
    if (seg === 'No catch/result') {
      rec.success = false;
      continue;
    }
    const idx = seg.indexOf(': ');
    if (idx === -1) continue;
    const key = seg.slice(0, idx).trim();
    const value = seg.slice(idx + 2).trim();
    if (key === 'Zone') {
      rec.zone = value;
    } else if (key === 'Attempts') {
      const n = parseInt(value, 10);
      rec.attempts = Number.isFinite(n) ? n : 0;
    } else if (key === 'Result') {
      rec.success = true;
      // A generic "Result: success" (no specific item) never appears for
      // Fishing in practice, but Get-FishRarity guards on resultItem being
      // set too — mirror that here rather than assuming.
      rec.resultItem = value === 'success' ? null : value;
    }
    // Area/Skill: not needed for this stat, ignored.
  }
  return rec;
}

// Walks one session export's full text and yields every Fishing harvesting
// line found, regardless of whether it sits under a "--- harvesting ---"
// section marker (only printed when a session mixes multiple entry types) —
// tracking the tradeskill named on the most recent "== Name (Tradeskill) =="
// header is enough on its own, and works the same for Combat/Crafting
// headers (their own parenthesized text just never matches "Fishing").
function extractFishingLines(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let currentTradeskill = null;
  for (const line of lines) {
    const headerMatch = line.match(/^==\s*.+?\s*\((.+?)\)\s*==$/);
    if (headerMatch) {
      currentTradeskill = headerMatch[1].trim();
      continue;
    }
    if (currentTradeskill === 'Fishing' && line.startsWith('- Zone:')) {
      out.push(parseHarvestingLine(line));
    }
  }
  return out;
}

function buildFishingRarity(sessionExportDir) {
  const result = {};
  if (!fs.existsSync(sessionExportDir)) return result;

  const files = fs.readdirSync(sessionExportDir).filter((f) => f.endsWith('.txt')).sort();
  let filesUsed = 0;

  for (const file of files) {
    const filePath = path.join(sessionExportDir, file);
    try {
      const text = fs.readFileSync(filePath, 'utf8');
      const records = extractFishingLines(text);
      for (const rec of records) {
        if (!rec.zone) continue;
        if (!result[rec.zone]) result[rec.zone] = { totalAttempts: 0, fish: {} };
        result[rec.zone].totalAttempts += rec.attempts;
        if (rec.success && rec.resultItem) {
          result[rec.zone].fish[rec.resultItem] = (result[rec.zone].fish[rec.resultItem] || 0) + 1;
        }
      }
      filesUsed++;
    } catch (err) {
      console.warn(`Skipping ${file}: ${err.message}`);
    }
  }

  console.log(`Parsed ${filesUsed}/${files.length} session export file(s).`);

  // Sort zone/fish keys alphabetically so regeneration produces a stable,
  // minimal diff instead of reshuffling key order every run.
  const sorted = {};
  for (const zone of Object.keys(result).sort()) {
    const fishSorted = {};
    for (const fishName of Object.keys(result[zone].fish).sort()) {
      fishSorted[fishName] = result[zone].fish[fishName];
    }
    sorted[zone] = { totalAttempts: result[zone].totalAttempts, fish: fishSorted };
  }
  return sorted;
}

function main() {
  const rarity = buildFishingRarity(SESSION_EXPORTS_DIR);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(rarity, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${OUTPUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { parseHarvestingLine, extractFishingLines, buildFishingRarity };
