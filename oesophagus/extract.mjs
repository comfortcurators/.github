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
// not write. A repository with no door reports as missing rather than being
// given one.
//
// TWO MODES, and the difference between them is a bug this tool has already
// caused once:
//
//   (default)  reads the working trees under ROOT — whatever is checked out,
//              dirty edits included. Fast, offline, and NOT the repository.
//   --remote   reads CLAUDE.md from GitHub. This is the repository.
//
// The local mode reported `kimi` as doorless. It has a door — on a branch that
// was not the one checked out — and a session very nearly wrote it a second
// one. A census of what happens to be checked out is not a census of the org.
//
// --remote carries its own trap and reports rather than hides it: a repo's
// GitHub DEFAULT branch is not necessarily its live one. `kimi`'s default is
// `add-badges-to-readme`, 65 commits behind `main`. So --remote reads the
// default branch, and separately reads `main` when it exists, and says so
// whenever the two doors differ.

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

const REMOTE = args.includes("--remote");
const ORG = (args.find((a) => a.startsWith("--org=")) ?? "--org=comfortcurators").slice(6);

// ---- remote mode -----------------------------------------------------------
// Reads the repository rather than a checkout. No writes, no token minting;
// GH_TOKEN is used exactly as given, and its absence is reported as such
// instead of being papered over with unauthenticated requests that would
// silently omit every private repo — which is all of them.

const GH = "https://api.github.com";

// Node's fetch does not honour HTTPS_PROXY unless told to, and curl does. In an
// environment whose egress is a proxy, that difference shows up as a 401 from
// GitHub on a token that is fine — which reads exactly like a bad credential
// and sends you off rotating one that never needed rotating. Re-exec once with
// the flag set rather than letting anyone debug that twice.
if (REMOTE && (process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, [process.argv[1], ...args], {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_NO_WARNINGS: "1" },
  });
  process.exit(r.status ?? 1);
}

async function gh(path, { raw = false } = {}) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw new Error("no GH_TOKEN/GITHUB_TOKEN in env — every repo here is private, so an unauthenticated read would report a false empty org");
  const res = await fetch(`${GH}${path}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
      "user-agent": "comfortcurators-oesophagus",
    },
  });
  // A missing file and a refused repository are both data. Neither is a reason
  // to abandon the other fourteen: an extractor that dies on the first repo it
  // cannot see reports nothing at all, which is strictly worse than reporting
  // fourteen doors and one refusal.
  if (res.status === 404) return null;
  if (res.status === 403 || res.status === 401) {
    const e = new Error(`${res.status}`);
    e.refused = res.status;
    throw e;
  }
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
  return raw ? res.text() : res.json();
}

/**
 * The door stated as separate files, which is how `sissyphus` states it.
 *
 * That repository is where this language came from, and it writes the door the
 * way the founder writes it: an `Intent` file, a `Pattern` file, and a
 * `Glimpse` file — no CLAUDE.md, no fence. This extractor called it doorless
 * for as long as it existed, and the census went further and recorded the two
 * files as *"both empty. Those are his to fill."* They had been filled since
 * 22 August. Nobody opened them; the absence of a CLAUDE.md was read as the
 * absence of a door.
 *
 * There is no `Signed` file, and one is not invented: `signer` and `timestamp`
 * come back null, and `source` says which form was read, so a consumer can
 * tell a three-line fence from this without guessing.
 */
async function doorFromFiles(slug, ref) {
  const r = (p) => gh(`/repos/${slug}/contents/${p}?ref=${encodeURIComponent(ref)}`, { raw: true });
  const [intentRaw, patternRaw, glimpseRaw] = await Promise.all([
    r("Intent").catch(() => null),
    r("Pattern").catch(() => null),
    r("Glimpse").catch(() => null),
  ]);
  const intent = (intentRaw ?? "").trim();
  const pattern = (patternRaw ?? "").trim();
  if (!intent || !pattern) return null;
  return {
    source: "intent-pattern-files",
    intent,
    pattern,
    signer: null,
    timestamp: null,
    glimpse: (glimpseRaw ?? "").trim() || null,
    intent_words: words(intent),
    pattern_words: words(pattern),
    over_limit: words(intent) > WORD_LIMIT || words(pattern) > WORD_LIMIT,
  };
}

/** The door on one ref, or a reason it is absent. Never invents one. */
async function doorAt(slug, ref) {
  const text = await gh(`/repos/${slug}/contents/CLAUDE.md?ref=${encodeURIComponent(ref)}`, { raw: true });
  if (text === null) {
    const filed = await doorFromFiles(slug, ref);
    if (filed) return { ref, door: filed };
    return { ref, door: null, missing: "no CLAUDE.md, and no Intent/Pattern files" };
  }
  const fence = firstFence(text);
  const m = fence ? fence.match(DOOR) : null;
  if (!m) return { ref, door: null, missing: fence ? "fence is not a door" : "no fence in first 40 lines" };
  const [, intent, pattern, signer, timestamp] = m.map((s) => s.trim());
  return {
    ref,
    door: {
      source: "claude-md-fence",
      intent, pattern, signer, timestamp,
      intent_words: words(intent),
      pattern_words: words(pattern),
      over_limit: words(intent) > WORD_LIMIT || words(pattern) > WORD_LIMIT,
    },
  };
}

/**
 * Which repositories to read.
 *
 * NOT `GET /orgs/<org>/repos`: this credential is a GitHub App installation
 * token and that endpoint answers 403 to it, while every per-repository read
 * below answers 200. One 403 is one endpoint, not a policy — so name the repos
 * explicitly instead of concluding the org is unreachable.
 *
 * Source of names, in order: --repos=a,b,c, else the directory names under
 * ROOT. The second is a convenience, and it is the ONE place local layout
 * still leaks in: a repo nobody has cloned here will not be censused. Pass
 * --repos to be sure of the set.
 */
async function repoNames() {
  const flag = args.find((a) => a.startsWith("--repos="));
  if (flag) return flag.slice(8).split(",").map((s) => s.trim()).filter(Boolean);
  // sissyphus is the founder's own repo under a different owner; the rest
  // are this org's. Qualify it so a local-directory census still resolves.
  const OWNER_OF = { sissyphus: "yashrajvansh" };
  return repos.map((d) => d.split("/").pop()).map((n) => (OWNER_OF[n] ? `${OWNER_OF[n]}/${n}` : n));
}

async function remoteRows() {
  const names = await repoNames();
  const out = [];
  for (const entry of names) {
    // A name may carry its own owner. `sissyphus` is under yashrajvansh, not
    // this org, and hardcoding ORG for every repo made the census die on it.
    const [owner, name] = entry.includes("/") ? entry.split("/") : [ORG, entry];
    const slug = `${owner}/${name}`;

    let meta;
    try {
      meta = await gh(`/repos/${slug}`);
    } catch (err) {
      if (!err.refused) throw err;
      out.push({ repo: name, door: null, missing: `repository refused (HTTP ${err.refused}) — not visible to this credential`, read_from: null, git: { versioned: false, remote: `https://github.com/${slug}` } });
      continue;
    }
    if (meta === null) {
      out.push({ repo: name, door: null, missing: "no such repository", read_from: null, git: { versioned: false } });
      continue;
    }
    const r = { ...meta, name, slug };
    const def = r.default_branch;
    const onDefault = await doorAt(slug, def);
    // Read main separately when it is not already the default. kimi's default
    // is 65 commits behind main; a census that trusted `default_branch` alone
    // would report the stale answer as the repository's answer.
    let onMain = null;
    if (def !== "main") {
      try { onMain = await doorAt(slug, "main"); } catch { onMain = null; }
    }
    const differs = Boolean(
      onMain && JSON.stringify(onMain.door) !== JSON.stringify(onDefault.door),
    );
    out.push({
      repo: r.name,
      door: (differs ? onMain.door : onDefault.door) ?? null,
      missing: (differs ? onMain.missing : onDefault.missing) ?? undefined,
      read_from: differs ? "main" : def,
      git: {
        versioned: true,
        remote: r.html_url,
        default_branch: def,
        private: r.private,
        last_commit_at: r.pushed_at,
      },
      // Present only when it happened, so a clean org prints nothing extra.
      ...(differs
        ? {
            default_branch_differs: {
              default_branch: def,
              door_on_default: onDefault.door ?? null,
              missing_on_default: onDefault.missing ?? undefined,
              note: "default branch and main disagree; the door above is main's",
            },
          }
        : {}),
    });
  }
  return out;
}
// ---------------------------------------------------------------------------

const repos = readdirSync(ROOT)
  // .github is a real repository, not a dotfile. An extractor that hides the
  // door repo from the door census is exactly the blind spot this exists to
  // remove — it did, on the first run, until this line was written.
  .filter((name) => !name.startsWith(".") || name === ".github")
  .map((name) => join(ROOT, name))
  .filter((p) => { try { return statSync(p).isDirectory(); } catch { return false; } })
  .filter((p) => existsSync(join(p, "CLAUDE.md")) || existsSync(join(p, ".git")));

const rows = REMOTE ? await remoteRows() : [];
if (!REMOTE) for (const dir of repos) {
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
    // Which of the two things was read. A consumer that cannot tell a checkout
    // from a repository will eventually be told a dirty edit is the org's door.
    source: REMOTE ? { kind: "github", org: ORG } : { kind: "working_tree", root: ROOT },
    repositories: rows,
  }, null, 2) + "\n");
} else {
  const withDoor = rows.filter((r) => r.door);
  const without = rows.filter((r) => !r.door);
  const over = withDoor.filter((r) => r.door.over_limit);
  console.log(`${rows.length} repositories · ${withDoor.length} with a door · ${without.length} without · ${over.length} over the word limit\n`);
  console.log(REMOTE ? `  source: github.com/${ORG} (the repositories)\n` : `  source: ${ROOT} (working trees — not the repositories)\n`);
  for (const r of rows) {
    const g = REMOTE ? `@${r.read_from}` : r.git.versioned ? `${r.git.branch}@${r.git.head}` : "UNVERSIONED";
    if (!r.door) { console.log(`  ✗ ${r.repo.padEnd(14)} ${g.padEnd(28)} ${r.missing}`); continue; }
    const flag = r.door.over_limit ? ` [${r.door.intent_words}/${r.door.pattern_words} words]` : "";
    // An unsigned door is not a defect. sissyphus states the door as Intent and
    // Pattern files with no Signed line, so say which form was read rather than
    // printing the word "null" where a name would be.
    const who = r.door.signer ?? "(Intent/Pattern files — unsigned)";
    console.log(`  ✓ ${r.repo.padEnd(14)} ${g.padEnd(28)} ${who}${flag}`);
    console.log(`      Intent : ${r.door.intent}`);
    console.log(`      Pattern: ${r.door.pattern}`);
    if (r.default_branch_differs) {
      console.log(`      ! default branch '${r.default_branch_differs.default_branch}' disagrees — read main instead`);
    }
  }
}
