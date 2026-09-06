#!/usr/bin/env node
// Intent : Turn every repository's first glimpse into data Curator can swallow.
// Pattern: Run it. Every row traces to a fenced block at the top of a CLAUDE.md.
// Signed. Claude / 2026-09-06
//
// The door (comfortcurators/.github -> CLAUDE.md) says every repo opens with
// three lines. Until now those lines were prose in fourteen files: readable by
// a human, invisible to the runtime that is supposed to govern them.
//
// This is the first half of the oesophagus YA|RA asks for. It reads, it does
// not write, and it makes no network call. A repository with no door reports
// as missing rather than being given one.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const AS_JSON = args.includes("--json");
// A flag is not a path. The first version took argv[2] as the root and
// crashed on `--json` with ENOENT scandir '--json'.
const ROOT = args.find((a) => !a.startsWith("-")) ?? "/home/user";
const WORD_LIMIT = 17;

// The door, as a grammar. Deliberately strict: a block that does not match is
// reported as absent, never repaired or guessed at. Intent may be one line or
// wrapped; Pattern and Signed close it.
const DOOR = /^Intent\s*:\s*(.+?)\r?\nPattern\s*:\s*(.+?)\r?\nSigned\.\s*(.+?)\s*\/\s*(.+?)\s*$/ms;

function firstFence(text) {
  // Only the first fenced block in the first 40 lines counts. A door further
  // down the file is not a first glimpse.
  const head = text.split("\n").slice(0, 40).join("\n");
  const m = head.match(/```[a-z]*\r?\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

function words(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function gitFacts(dir) {
  const run = (args) => {
    try {
      return execFileSync("git", ["-C", dir, ...args], {
        encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch { return null; }
  };
  if (!existsSync(join(dir, ".git"))) return { versioned: false };
  return {
    versioned: true,
    head: run(["rev-parse", "--short", "HEAD"]),
    branch: run(["rev-parse", "--abbrev-ref", "HEAD"]),
    remote: run(["config", "--get", "remote.origin.url"]),
    last_commit_at: run(["log", "-1", "--format=%cI"]),
    commits: Number(run(["rev-list", "--count", "HEAD"]) ?? 0) || null,
  };
}

const repos = readdirSync(ROOT)
  // .github is a real repository, not a dotfile. An extractor that hides the
  // door repo from the door census is exactly the blind spot this exists to
  // remove — it did, on the first run, until this line was written.
  .filter((name) => !name.startsWith(".") || name === ".github")
  .map((name) => join(ROOT, name))
  .filter((p) => { try { return statSync(p).isDirectory(); } catch { return false; } })
  .filter((p) => existsSync(join(p, "CLAUDE.md")) || existsSync(join(p, ".git")));

const rows = [];
for (const dir of repos) {
  const name = dir.split("/").pop();
  const claudeMd = join(dir, "CLAUDE.md");
  const git = gitFacts(dir);

  if (!existsSync(claudeMd)) {
    rows.push({ repo: name, door: null, missing: "no CLAUDE.md", git });
    continue;
  }
  const fence = firstFence(readFileSync(claudeMd, "utf8"));
  const m = fence ? fence.match(DOOR) : null;
  if (!m) {
    rows.push({ repo: name, door: null, missing: fence ? "fence is not a door" : "no fence in first 40 lines", git });
    continue;
  }
  const [, intent, pattern, signer, timestamp] = m.map((s) => s.trim());
  rows.push({
    repo: name,
    door: {
      intent, pattern, signer, timestamp,
      intent_words: words(intent),
      pattern_words: words(pattern),
      over_limit: words(intent) > WORD_LIMIT || words(pattern) > WORD_LIMIT,
    },
    git,
  });
}

rows.sort((a, b) => a.repo.localeCompare(b.repo));

if (AS_JSON) {
  process.stdout.write(JSON.stringify({
    generated_at: new Date().toISOString(),
    word_limit: WORD_LIMIT,
    root: ROOT,
    repositories: rows,
  }, null, 2) + "\n");
} else {
  const withDoor = rows.filter((r) => r.door);
  const without = rows.filter((r) => !r.door);
  const over = withDoor.filter((r) => r.door.over_limit);
  console.log(`${rows.length} repositories · ${withDoor.length} with a door · ${without.length} without · ${over.length} over the word limit\n`);
  for (const r of rows) {
    const g = r.git.versioned ? `${r.git.branch}@${r.git.head}` : "UNVERSIONED";
    if (!r.door) { console.log(`  ✗ ${r.repo.padEnd(14)} ${g.padEnd(28)} ${r.missing}`); continue; }
    const flag = r.door.over_limit ? ` [${r.door.intent_words}/${r.door.pattern_words} words]` : "";
    console.log(`  ✓ ${r.repo.padEnd(14)} ${g.padEnd(28)} ${r.door.signer}${flag}`);
    console.log(`      Intent : ${r.door.intent}`);
    console.log(`      Pattern: ${r.door.pattern}`);
  }
}
