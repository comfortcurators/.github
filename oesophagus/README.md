# The oesophagus

```
Intent : Make every repository's first glimpse readable as data, not only as prose.
Pattern: Run extract.mjs. Every row traces to a fenced block in a CLAUDE.md.
Signed. Claude / 2026-09-06 13:40 UTC
```

[`founder/YA-RA.md`](../founder/YA-RA.md) asks for this in one line:

> **Feed Curator and install oesophagus** — ⊦ all repository ⊦ all intent ⊦ all patterns

This is the first half of it: the swallow, not the stomach. It reads, it writes
nothing, and it makes no network call. Curator ingestion is not wired yet, and
saying otherwise would be the exact failure the org door warns about — *a
faculty that nothing calls is not evidence, it is a folder.*

## Run it

```bash
node oesophagus/extract.mjs                 # human census
node oesophagus/extract.mjs --json          # machine manifest
node oesophagus/extract.mjs /some/root      # a different checkout root
```

## What it counts as a door

Strict on purpose. A block that does not match is reported **missing**, never
repaired, never guessed at:

- a fenced block within the **first 40 lines** of `CLAUDE.md` — a door further
  down the file is not a first glimpse;
- three lines, in order: `Intent :`, `Pattern:`, `Signed. <name> / <timestamp>`;
- word counts on Intent and Pattern, flagged over 17.

Alongside each door it records what git actually says — branch, head, remote,
last commit, commit count — so a door can be read against the state of the
repository that carries it, not on its own word.

## The census as of 2026-09-06

**15 repositories · 13 with a door · 2 without · 0 over the word limit.**

The two without are deliberate, and both would be wrong to "fix":

| Repository | Why it has no door |
| --- | --- |
| `curatom` | Frozen at the hackathon submission commit until 8 October 2026. Post-deadline work lives on `post-deadline-work`. Writing to `main` would break the freeze. |
| `sissyphus` | The founder's own repository, and the origin of this language. It holds two files named `Intent` and `Pattern`, both empty. Those are his to fill. |

## The blind spot this had on its first run

The first version filtered every entry beginning with a dot, so it hid
**`.github`** — the repository that defines the door — from the door census. It
reported 14 repositories and 7 doors, and the number was wrong in the one place
it most needed to be right.

That is the org law pointed at this tool: *nothing is trusted above the level at
which it can be executed.* A census that cannot see itself is not a census. The
line that fixes it carries a comment saying so, rather than being quietly
corrected.

## What is not done

- **Curator does not eat this yet.** The manifest exists; no ingest path
  consumes it. Curator's evidence surface is a closed enum (`self_ci_session`,
  `ci_run_terminal`, `deployment_receipt_terminal`) and intents are not
  evidence — they are notes. Wiring it is the stomach, and it is the next piece.
- **Nothing verifies a Pattern is walkable.** Every Pattern in the census claims
  a route by which its author can be found wrong. Nothing yet walks one. A
  Pattern that cannot be executed is exactly the thing the law is about, and
  right now the doors are trusted above that level.
