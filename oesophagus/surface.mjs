#!/usr/bin/env node
// Intent : Rank every module by how much surface its tests admit it has.
// Pattern: Run it. Count the it() calls in any flagged file yourself.
// Signed. Claude / 2026-09-06
//
// The founder's rule, 6 September 2026:
//
//   "Anything that needs more than 8 or max 17 tests shouldn't exist anyways.
//    Not a charity for bugs."
//
// This does not judge test quality and it does not measure coverage. It counts
// how many distinct behaviours a module's own suite says it has, and treats
// that count as the module's admitted surface. A file needing fifty tests is
// not a well-tested file; it is several modules wearing one name.
//
// Two thresholds, both the founder's: 8 is the shape a module should be, 17 is
// the outer wall. Over 17 is a design finding, not a testing finding.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv.find((a) => !a.startsWith("-") && a !== process.argv[0] && a !== process.argv[1]) ?? process.cwd();
const GOOD = 8;
const WALL = 17;

// Two ecosystems, because this org has both. curator's entire suite is pytest
// and an earlier version of this tool reported it as "2 suites, 7 cases" — a
// number that was wrong in the direction that flatters, which is the worst one.
const TEST_FILE = /(?:\.(test|spec)\.[cm]?[jt]sx?|^test_.+\.py|_test\.py)$/;
const PY_FILE = /\.py$/;
const CASE = /^\s*(?:it|test)(?:\.\w+)?\s*\(/gm;
const SUITE = /^\s*describe(?:\.\w+)?\s*\(\s*["'`](.+?)["'`]/gm;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const p = join(dir, name);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p, out);
    else if (TEST_FILE.test(name)) out.push(p);
  }
  return out;
}

const rows = walk(ROOT).map((file) => {
  const text = readFileSync(file, "utf8");
  const py = PY_FILE.test(file);
  const cases = py
    ? (text.match(/^\s*(?:async\s+)?def\s+test_/gm) ?? []).length
    : (text.match(CASE) ?? []).length;
  const suites = py
    ? (text.match(/^class\s+(Test\w+)/gm) ?? []).map((s) => s.replace(/^class\s+/, ""))
    : [...text.matchAll(SUITE)].map((m) => m[1]);
  return { file: relative(ROOT, file), cases, suites, lines: text.split("\n").length };
});

rows.sort((a, b) => b.cases - a.cases);

const total = rows.reduce((n, r) => n + r.cases, 0);
const within = rows.filter((r) => r.cases <= GOOD).length;
const over = rows.filter((r) => r.cases > WALL);

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify({
    generated_at: new Date().toISOString(),
    root: ROOT, shape: GOOD, wall: WALL,
    files: rows.length, cases: total,
    within_shape: within, over_wall: over.length,
    rows,
  }, null, 2) + "\n");
} else {
  console.log(`${rows.length} suites · ${total} cases · ${within} within ${GOOD} · ${over.length} over ${WALL}\n`);
  if (!over.length) { console.log("  Nothing over the wall."); }
  for (const r of over) {
    console.log(`  ${String(r.cases).padStart(3)}  ${r.file}`);
    // The suite names are the finding. A file over the wall almost always
    // names several unrelated concerns here, and that list is the split.
    for (const s of r.suites) console.log(`       · ${s.length > 88 ? s.slice(0, 85) + "…" : s}`);
  }
}
