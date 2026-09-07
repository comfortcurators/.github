# The oesophagus

```
Intent : Make every repository's first glimpse readable as data, not only as prose.
Pattern: Run extract.mjs. Every row traces to a real file — a fence, or Intent/Pattern.
Signed. Claude / 2026-09-06 13:40 UTC
```

[`founder/YA-RA.md`](../founder/YA-RA.md) asks for this in one line:

> **Feed Curator and install oesophagus** — ⊦ all repository ⊦ all intent ⊦ all patterns

This is the first half of it: the swallow, not the stomach. It reads and writes
nothing. Curator ingestion is not wired to a schedule yet, and saying otherwise
would be the exact failure the org door warns about — *a faculty that nothing
calls is not evidence, it is a folder.*

## Run it

```bash
node oesophagus/extract.mjs                 # census of the WORKING TREES
node oesophagus/extract.mjs --remote        # census of the REPOSITORIES
node oesophagus/extract.mjs --remote --json # machine manifest
node oesophagus/extract.mjs /some/root      # a different checkout root
node oesophagus/extract.mjs --remote --repos=curator,HostOS,owner/other
```

### The two modes are not interchangeable, and the difference has bitten twice

Default mode reads whatever is checked out under `ROOT`, dirty edits included.
`--remote` reads `CLAUDE.md` from GitHub. **A census of what happens to be
checked out is not a census of the org**, and the JSON says which one you got
in its `source` field so a consumer can never confuse them.

It is not hypothetical. Both modes run against the same fifteen repositories on
6 Sep 2026 disagree, live:

| | `seek` | `kimi` |
| --- | --- | --- |
| working tree | *no CLAUDE.md* — the checkout is on a topic branch | door found |
| repository | door found on `main` | door found on `main` |

The `kimi` case is the one that nearly caused real damage: a session read the
tree, concluded kimi was doorless, and almost wrote it a second door while a
better one already existed on another branch.

`--remote` carries its own trap and reports it rather than hiding it. A repo's
GitHub **default branch is not necessarily its live one** — `kimi`'s default is
`add-badges-to-readme`, 65 commits behind `main`. So `--remote` reads the
default branch, reads `main` separately when they differ, prefers `main`, and
prints `! default branch '…' disagrees` so the reader sees the choice was made.

Two more things `--remote` does deliberately:

- **It does not call `GET /orgs/<org>/repos`.** That endpoint answers 403 to
  this GitHub App installation token while every per-repository read answers
  200. One 403 is one endpoint, not a policy — so the repo set comes from
  `--repos=` or the local directory names, and that is the one place local
  layout still leaks in. Pass `--repos` when you need to be sure of the set.
- **A refused repository is a row, not a crash.** Dying on the first repo you
  cannot see reports nothing at all, which is worse than reporting fourteen
  doors and one refusal.

If `--remote` returns 401 on a token that works in `curl`, that is not the
token. Node's `fetch` ignores `HTTPS_PROXY` unless told to; the script re-execs
itself once with `NODE_USE_ENV_PROXY=1` for exactly this reason. *Test a
credential by doing the operation, not by asking whether it is valid.*

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

**15 repositories · 14 with a door · 1 without · 0 over the word limit.**

The one without is deliberate and would be wrong to "fix". The second row is
kept struck through rather than deleted, because what it claimed is the more
useful thing to remember:

| Repository | Why it has no door |
| --- | --- |
| `curatom` | Frozen at the hackathon submission commit until 8 October 2026. Post-deadline work lives on `post-deadline-work`. Writing to `main` would break the freeze. |
| ~~`sissyphus`~~ | **Corrected 7 Sep 2026 — it has a door, and this row was wrong.** See below. |

### `sissyphus` was never doorless, and the census said its files were empty

The row above used to read: *"It holds two files named `Intent` and `Pattern`,
both empty. Those are his to fill."*

They were filled on **22 August 2026** — two weeks before that sentence was
written. `Glimpse` was added at 10:11 on 6 September, four hours before it. The
claim was false at the moment it was made, and it was made about the founder's
own words. Nobody opened the files: the extractor reported *no CLAUDE.md*, and
the absence of a CLAUDE.md was read as the absence of a door.

```
Intent   change is certain to me . want something from it .
Pattern  weaved within aforementioned .
Glimpse  curator's curosity: greeted with glimpse / serves depth to the asker
```

**The tool now reads that form.** `sissyphus` is where this language came from,
and it states the door the way the founder states it — one file per line, no
fence, no CLAUDE.md. An extractor built to swallow the org's doors that could
not swallow the origin was describing its own blind spot as an empty room.

`doorFromFiles()` falls back to root `Intent` / `Pattern` / `Glimpse` when there
is no CLAUDE.md. There is no `Signed` file and none is invented: `signer` and
`timestamp` come back **null**, and every door now carries a `source` field —
`claude-md-fence` or `intent-pattern-files` — so a consumer can tell the two
apart without guessing. The human output prints
`(Intent/Pattern files — unsigned)` rather than the word `null` where a name
would be, because an unsigned door here is a form, not a defect.

**Census after the fix: 15 repositories · 14 with a door · 1 without.**

## The blind spot this had on its first run

The first version filtered every entry beginning with a dot, so it hid
**`.github`** — the repository that defines the door — from the door census. It
reported 14 repositories and 7 doors, and the number was wrong in the one place
it most needed to be right.

That is the org law pointed at this tool: *nothing is trusted above the level at
which it can be executed.* A census that cannot see itself is not a census. The
line that fixes it carries a comment saying so, rather than being quietly
corrected.

## The limitation that matters most

**It reads the working tree, so its answer depends on which branch each checkout
is sitting on.** On its first full run it reported `kimi` as doorless. `kimi`
had a door — on `claude/new-session-xt2ksw`, pushed hours earlier — and the
local checkout happened to be on `main`. The tool was not wrong about the file
it read; it was wrong about the repository, which is worse, because the output
says "repository".

Until it resolves a named ref rather than whatever is checked out, treat a
`missing` row as *"no door on the branch this checkout is on"*, and confirm
against the remote before acting on it. That is the difference between a census
and a snapshot of one machine.

## The third tool: `reachable.mjs`

```bash
node oesophagus/reachable.mjs /path/to/src
node oesophagus/reachable.mjs /path/to/src --json
```

Lists modules **nothing imports**. Written the hour after being burned by exactly
that: a component in `Host` called three API routes returning `503`, and a whole
finding was written about *"blog likes are dead in the UI"* — before checking
whether anything imports the component. It is in no built chunk. The endpoint and
its only caller were both dead, and agreed with each other.

The org law is *an import edge is not an execution*. This is the cheaper half:
**no import edge is definitely not an execution.**

It resolves real `import`/`require`/dynamic-`import` specifiers rather than
grepping basenames, because a basename grep counts a comment or a similarly-named
variable as a reference and under-reports. Entry points (`index`, `main`, `app`,
`worker`, `server`, `client`, tests, configs) are excluded — a bundler enters
there, so "nothing imports it" says nothing about them.

### `Host/frontend/src`, 2026-09-06

**133 modules · 100 imported by something · 32 imported by nothing.**

Roughly a quarter of the tree. Spot-checked rather than trusted: `ContactForm`,
`WaitlistForm`, `Testimonials` and `RadiatingOrb` all have no importer, and
`ContactPage.js` turns out to carry its own inline form — the pages were
rewritten and the components they replaced were left behind.

**The one that proves the tool is not just grepping:** it flags
`components/Navbar.js`, which sounds impossible. `App.js` imports `Footer` and
`CookieBanner` and **not** `Navbar` — the live page's `<nav>` elements come from
elsewhere. The repository's own `CLAUDE.md` still says "Navbar/Footer/
CookieBanner/ExitIntent are hidden for `/host/*`"; three of those four are real
and `Navbar` is not one of them.

### Every package, 2026-09-06

| Package | Modules | Imported | **Imported by nothing** |
| --- | ---: | ---: | ---: |
| `Host/frontend/src` | 133 | 100 | **32** |
| `Superhostos/apps/web/src` | 69 | 59 | 7 |
| `curator/service/worker/src` | 43 | 36 | 5 |
| `Superhostos/apps/api/src` | 326 | 205 | 4 |
| `HostOS/computer-v2/src` | 24 | 18 | 4 |
| `HostOS/computer/src` | 26 | 22 | 4 |
| `seek/src` | 5 | 1 | 1 |
| `kimi/src` | 19 | 17 | **0** |
| `curatory/src` | 7 | 5 | **0** |

### The tool was wrong first, by a factor of seven

Its first run reported **64** orphans in `Superhostos/apps/api/src`, including
`app.hono.ts` — the file that repo's own `CLAUDE.md` calls the mounted app. That
was the instrument, not the code. TypeScript ESM writes `import "./app.hono.js"`
for a file named `app.hono.ts`: the specifier names the *emitted* file. Every
such import resolved to nothing, so every importee looked orphaned. Fixed; the
real figure is **9**.

`Host` is unaffected by that bug — CRA imports carry no extension — so its 32
stand.

### What the remaining nine in the API actually are

Two of them are worth more than the rest, because they meet SuperhostOS's own
law — *a faculty that nothing calls is not evidence, it is a folder*:

`domains/curator/evals/run.ts`, `domains/curator/from-curator-package.ts`, and
`queues/{email,ical-sync}.queue.ts`. The queue modules have no matching queue in
`wrangler.toml` — its only queue binding is a `curator-ingest` producer — so
those two are the ones worth a decision.

**These are candidates, not a delete list.** The tool cannot see a module
referenced only from HTML, one loaded by a runtime-built string, or one another
repository imports. Removing a module is a decision, not a cleanup.

## What is not done

- **Curator does not eat this yet.** The manifest exists; no ingest path
  consumes it. Curator's evidence surface is a closed enum (`self_ci_session`,
  `ci_run_terminal`, `deployment_receipt_terminal`) and intents are not
  evidence — they are notes. Wiring it is the stomach, and it is the next piece.
- **Nothing verifies a Pattern is walkable.** Every Pattern in the census claims
  a route by which its author can be found wrong. Nothing yet walks one. A
  Pattern that cannot be executed is exactly the thing the law is about, and
  right now the doors are trusted above that level.
