#!/usr/bin/env node
// Intent : Make "deployed code that is not in git" impossible to reach by accident.
// Pattern: Deploy with a dirty tree. It refuses before running anything.
// Signed. Claude / 2026-09-07 08:30 UTC
//
// WHY THIS EXISTS, precisely. On 7 Sep 2026 a fix to SuperhostOS's vision path
// was deployed by hand, and a branch switch immediately afterwards discarded
// the working tree. For several minutes `superhostos-api` served code that
// existed in no repository, no branch and no commit. Nothing detected it; it
// was noticed because the next command happened to grep the file.
//
// This is the shape `hostos-mcp` already uses and this org already trusts —
// `computer-v2/src/workspace.ts` and `registry.ts`. That design is not copied
// here and is not touched. What is borrowed is its three refusals:
//
//   CLAIM BEFORE YOU ACT.  hostos-mcp claims an action id in a Durable Object
//   before executing, so the same action cannot run twice. The equivalent for
//   a hand deploy is: the exact bytes about to ship must already exist at a
//   commit that is on the remote. If they do not, there is nothing to claim
//   and the deploy is refused.
//
//   ONLY THE ACTOR MAY COMPLETE.  Its registry says "only the run that
//   actually dispatched the command may mark it complete". Here: the live
//   version id is read back from the account after the deploy, never inferred
//   from the fact that the command exited 0.
//
//   AN UNKNOWN OUTCOME IS NOT A FAILURE.  It marks a timed-out action
//   `verified: false` rather than reporting failure, because the command may
//   still be running with side effects. Here: a deploy whose command fails
//   after upload, or whose version cannot be read back, is recorded as
//   `verified: false` — it is NOT recorded as "did not deploy".
//
// Usage:
//   node checkpoint/deploy.mjs <worker-name> -- <command...>
//   node checkpoint/deploy.mjs superhostos-api --cwd apps/api -- npx wrangler deploy
//
// Environment: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for the read-back.
// Without them the deploy still runs and the receipt is marked unverified,
// because a missing credential must not silently become a green tick.

import { execFileSync, spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const sep = argv.indexOf("--");
if (sep === -1 || sep === 0) {
  console.error(
    "usage: deploy.mjs <worker> [--cwd <dir>] [--allow-dirty] -- <command...>",
  );
  process.exit(2);
}
const head = argv.slice(0, sep);
const command = argv.slice(sep + 1);
const worker = head[0];
const cwd = head.includes("--cwd") ? head[head.indexOf("--cwd") + 1] : ".";
// Deliberately explicit and deliberately loud: shipping unversioned bytes is
// sometimes the right call in an incident, but it must be a decision someone
// typed, not a default they inherited.
const allowDirty = head.includes("--allow-dirty");

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();

/** The claim: these exact bytes exist at a commit the remote already has. */
function claim() {
  const problems = [];

  const dirty = git("status", "--porcelain");
  if (dirty) {
    problems.push(
      `working tree is dirty:\n${dirty
        .split("\n")
        .map((l) => `      ${l}`)
        .join("\n")}`,
    );
  }

  const sha = git("rev-parse", "HEAD");
  // `branch -r --contains` is the question that matters — "is this commit on
  // the remote" — rather than "is my branch ahead", which says nothing about
  // whether anyone else could ever obtain these bytes.
  let onRemote = "";
  try {
    onRemote = git("branch", "-r", "--contains", sha);
  } catch {
    /* a commit the remote has never seen makes this fail; treated below */
  }
  if (!onRemote.trim()) {
    problems.push(`HEAD ${sha.slice(0, 8)} is on no remote branch — push first`);
  }

  return { sha, problems };
}

/** Read the live version back from the account. Never inferred from exit 0. */
async function liveVersion(name) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) return { id: null, why: "no account credentials" };
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${name}/deployments`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    const body = await res.json();
    const latest = body?.result?.deployments?.[0];
    const id = latest?.versions?.[0]?.version_id ?? null;
    return id
      ? { id, at: latest?.created_on ?? null, why: null }
      : { id: null, why: `no deployment reported (HTTP ${res.status})` };
  } catch (error) {
    return { id: null, why: error instanceof Error ? error.message : String(error) };
  }
}

const { sha, problems } = claim();

if (problems.length > 0 && !allowDirty) {
  console.error(`\n✘ refusing to deploy ${worker}\n`);
  for (const p of problems) console.error(`   ${p}`);
  console.error(
    `\n   Deployed bytes must exist at a pushed commit, or nobody can\n` +
      `   reproduce, review or roll back what is now serving traffic.\n` +
      `   Commit and push, or pass --allow-dirty and say why in the receipt.\n`,
  );
  process.exit(1);
}

if (problems.length > 0) {
  console.error(`\n⚠ deploying ${worker} with --allow-dirty — receipt is unverified\n`);
}

const ran = spawnSync(command[0], command.slice(1), {
  cwd,
  stdio: "inherit",
  env: process.env,
});

const live = await liveVersion(worker);
// exit 0 alone is not evidence: this org has already shipped a "successful"
// deploy that was really `tail`'s exit code.
const verified =
  ran.status === 0 && problems.length === 0 && live.id !== null;

const receipt = {
  worker,
  commit: sha,
  dirty: problems.length > 0,
  commandExit: ran.status,
  liveVersion: live.id,
  liveVersionAt: live.at ?? null,
  verified,
  unverifiedBecause: verified
    ? null
    : [
        ran.status !== 0 ? `command exited ${ran.status}` : null,
        problems.length > 0 ? "tree was not clean and pushed" : null,
        live.id === null ? `version not read back: ${live.why}` : null,
      ].filter(Boolean),
  at: new Date().toISOString(),
};

console.log(`\n── deploy receipt ──\n${JSON.stringify(receipt, null, 2)}`);
process.exit(ran.status === 0 ? 0 : 1);
