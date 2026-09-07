# checkpoint

```
Intent : Make "deployed code that is not in git" impossible to reach by accident.
Pattern: Deploy with a dirty tree. It refuses before running anything.
Signed. Claude / 2026-09-07 08:30 UTC
```

Every repo in this org deploys by hand. That is a deliberate decision, not a
gap — see any `CLAUDE.md`. This is the one guard that hand-deploying needs.

```bash
node checkpoint/deploy.mjs superhostos-api --cwd apps/api -- npx wrangler deploy
node checkpoint/deploy.mjs curatory -- npx wrangler deploy
```

## What it refuses, and why each refusal exists

**A dirty tree.** On 7 September 2026 a fix to SuperhostOS's vision path was
deployed by hand, and a branch switch immediately afterwards discarded the
working tree. For several minutes `superhostos-api` served code that existed in
no repository, no branch and no commit. Nothing detected it. It was noticed
because the next command happened to grep the file.

**A commit the remote has never seen.** `git branch -r --contains` asks the
question that matters — can anyone else obtain these bytes — rather than "is my
branch ahead", which says nothing about reproducibility or rollback.

**Neither refusal is absolute.** `--allow-dirty` ships anyway and stamps the
receipt `verified: false`. Shipping unversioned bytes during an incident is
sometimes right; inheriting it as a default is not.

## What it will not claim

The receipt reads the **live version id back from the account** after the
command. An exit code of 0 is never treated as evidence on its own — this org
has already shipped a "successful" deploy that was really `tail`'s exit status,
and it is recorded in `Host/CLAUDE.md` as one of three ways verification went
wrong.

A deploy whose command failed, or whose version could not be read back, is
marked `verified: false` **with the reason named**. It is not marked as "did
not deploy": the upload may have landed before the failure, and an unknown
outcome reported as a known one is the failure this whole org keeps paying for.

## Where the shape came from

`hostos-mcp` already does this properly for agent actions, in
`comfortcurators/HostOS` → `computer-v2/src/workspace.ts` and `registry.ts`: a
Durable Object holds a claim ledger and a pointer to a restorable snapshot,
while the disposable container holds the world. None of that is copied here and
none of it is touched. What is borrowed is its three refusals:

| hostos-mcp | here |
| --- | --- |
| Claim the action id in the DO before executing, so nothing runs twice | The bytes must already exist at a pushed commit, or there is nothing to claim |
| *"Only the run that actually dispatched the command may mark it complete"* | The live version is read back from the account, never inferred from exit 0 |
| A timed-out action is `verified: false`, not a failure — it may still be running | A deploy that cannot be read back is `verified: false` with the reason named |

The asymmetry worth noticing: hostos-mcp can restore, because it owns the
filesystem it snapshots. This cannot. Git is the snapshot, and the only thing
this can do is refuse to act when there is nothing to roll back to.

## Verified by walking it

```
dirty tree            → refuses, command never runs, exit 1
clean but unpushed    → refuses, names the sha, exit 1
clean and pushed      → runs, reads back the live version, verified: true
command fails         → runs, receipt says verified: false, "command exited 1", exit 1
```
