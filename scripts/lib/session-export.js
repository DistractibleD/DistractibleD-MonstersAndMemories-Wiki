// Shared parsing helpers for MnM Field Notes session export .txt files
// (session-exports/*.txt) — used by both build-fishing-rarity.js (pools
// every merged export into fishing-rarity.json) and
// check-fishing-anomalies.js (flags one new export for human review before
// merge). Kept in one place so the two scripts can never silently drift on
// what counts as a valid line. See CLAUDE.md "Session exports & pooled
// Fishing rarity" for the full file-format writeup.

// Parses one "- Zone: X | Area: Y | Skill: Z | Result: W | Attempts: N" (or
// "...| No catch/result | Attempts: N") harvesting line into its fields.
// Split-on-" | " rather than one rigid regex so field order/presence can
// drift (Area and Skill are already optional today) without breaking this.
function parseHarvestingLine(line) {
  const body = line.replace(/^-\s*/, '');
  const segments = body.split(' | ');
  const rec = { zone: null, area: null, skill: null, attempts: 0, success: false, resultItem: null };
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
    } else if (key === 'Area') {
      rec.area = value;
    } else if (key === 'Skill') {
      const n = parseInt(value, 10);
      rec.skill = Number.isFinite(n) ? n : null;
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

// Pulls the plain "Key: value" header fields every export starts with —
// only the ones relevant so far (Fishing skill start/end, for the flat-
// skill-high-volume anomaly check).
function parseSessionHeader(text) {
  const get = (label) => {
    const m = text.match(new RegExp(`^${label}: (.+)$`, 'm'));
    return m ? m[1].trim() : null;
  };
  const getInt = (label) => {
    const v = get(label);
    if (v === null) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  return {
    loggedBy: get('Logged by'),
    entries: getInt('Entries'),
    fishingStartSkill: getInt('Fishing skill at session start'),
    fishingEndSkill: getInt('Fishing skill at session end')
  };
}

module.exports = { parseHarvestingLine, extractFishingLines, parseSessionHeader };
