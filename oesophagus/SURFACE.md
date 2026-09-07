# Surface census

```
Intent : Find the modules whose own tests admit they are several modules.
Pattern: node oesophagus/surface.mjs <root>. Count the it() calls yourself.
Signed. Claude / 2026-09-06 14:20 UTC
```

The founder's rule, 6 September 2026:

> *"Anything that needs more than 8 or max 17 tests shouldn't exist anyways.
> Not a charity for bugs."*

This does not measure coverage and does not judge test quality. It counts how
many distinct behaviours a module's own suite says it has, and reads that count
as the module's **admitted surface**. Then it prints the suite names, because in
every case that broke the wall, those names *are* the finding.

## SuperhostOS `apps/api`, 2026-09-06

**117 suites · 1,056 cases · 71 within 8 · 14 over 17.**

Read that first line before anything else: **61% of the codebase already sits
inside the rule.** The interesting number is 14, not 1,056.

> **Re-run at 22:30 UTC the same day, whole repo rather than `apps/api`:**
> **119 suites · 1,067 cases · 73 within 8 · 14 over 17.** The delta
> reconciles exactly and is worth stating because an unexplained drift in this
> number is the only thing that would make it useless: `apps/web`'s 2 suites and
> 10 cases, which the first run scoped out, plus **one** case added to
> `self-ci-edge.test.ts` — the guard that now parses `wrangler.toml` instead of
> comparing a list against itself.
>
> **The count over the wall did not move.** Fourteen, the same fourteen. Every
> module added to this repository today stayed inside the rule, and nothing that
> was outside it came back in.

**A note on how to quote this file.** The number to report is **14**, or the
name of one module. Reporting "1,067 tests passing" as reassurance inverts the
rule this census exists to apply — under it, a large total is the finding and
not the health check. That inversion happened in a session on the day this was
written, by the same author, hours after writing the sentence above.

Nothing here is over-tested. Every file over the wall is one file naming several
unrelated concerns, and the suite names say so out loud:

| Cases | Module | What its own suite names |
| --- | --- | --- |
| 49 | `domains/lobby/lobby.test.ts` | voice · chat sessions · provenance · satisfaction · user model · seat-affinity — **six** |
| 28 | `domains/inventory/inventory.test.ts` | math · InventoryAgent · VendorAgent · FinanceAgent · consensus · orchestrator · SharedMemory · service — **eight** |
| 29 | `domains/properties/connect-honestly.test.ts` | calendar truth · listing page · two-way sync · TLS · link reading · fetch_url · property record · maintenance — **eight** |

`lobby/service.ts` is 610 lines. It is not a service with 49 behaviours; it is
six services sharing a filename. The test count did not cause that and more
tests will not fix it — the count is the only place the shape was ever written
down.

## What this is not

**It is not a mandate to delete tests.** Deleting the 49 leaves the same six
concerns in the same 610 lines, now unwritten anywhere. The rule points at the
*module*; the suite is the instrument, not the patient. A file that drops under
the wall by losing assertions has been made worse and quieter.

**And it is not a refactor authorised by a number.** Splitting a live service
six ways is architecturally significant and belongs to a decision, not to a
census. This file exists so that decision is made against measurements rather
than impressions.

## Run it

```bash
node oesophagus/surface.mjs /path/to/package
node oesophagus/surface.mjs /path/to/package --json
```

## Every package, 2026-09-06

| Package | Suites | Cases | Within 8 | Over 17 |
| --- | ---: | ---: | ---: | ---: |
| `Superhostos/apps/api` | 117 | 1,056 | 71 | **14** |
| `curator` | 15 | 84 | 13 | 0 |
| `HostOS/computer-v2` | 12 | 64 | 10 | 0 |
| `HostOS/computer` | 5 | 35 | 3 | 0 |
| `kimi` | 2 | 16 | 1 | 0 |
| `Superhostos/apps/web` | 2 | 10 | 2 | 0 |
| `seek` (reek) | 1 | 8 | 1 | 0 |
| `curatory` | 1 | 8 | 1 | 0 |

Every package except `apps/api` is already inside the rule. That is the honest
headline, and it is a better one than the org has been telling itself.

## The floor, which the rule does not name

**Zero is not "inside the rule." It is outside the measurement.**

**Closed the same day it was found, 6 September 2026.** Both now carry 8 cases —
the shape, not a compromise — and both gates run them.

| Worker | Source | Tests | What the first suite found |
| --- | --- | ---: | --- |
| `reek` (`seek`) | 1,226 lines | 0 → **8** | `isAuthorized` returned `true` when its secret was unset, on a Worker holding an account API token and `worker_loader`. Fixed and proven by reintroducing the defect. |
| `curatory` | 935 lines | 0 → **8** | **No defect.** The authorization was already correct. What was undocumented is that its whole admin surface rests on one bypass — `hostname === "do"` — being unreachable from outside. |

That contrast is the argument for the floor better than either case alone: the
same "0" hid a live account-wide hole in one repository and nothing at all in
the other, and there was no way to tell which without writing something that
runs.

`reek`'s defect had survived because eleven lines sat in the middle of a
1,226-line file that nothing could execute. `curatory`'s assumption survived
because it was true — and nothing would have noticed the day it stopped being.

A module at 49 cases and a module at 0 fail the same underlying test — *nothing
is trusted above the level at which it can be executed* — and only one of them
shows up when you rank by count descending. Read this table from both ends.

## The tool was wrong once, in the flattering direction

Its first version reported `curator` as **2 suites, 7 cases** — clean, inside
the rule, nothing to see. `curator`'s entire suite is pytest; the walker only
matched `*.test.ts`. The real figure is 15 suites and 84 cases, still clean, but
the tool had no way to know that when it said so.

An instrument that under-reports is worse than one that over-reports, because
the answer it gives is the one nobody questions.

## Not yet done

- Nothing correlates a suite's case count with its module's line count or export
  count. The count of *exports* is probably the truer measure of surface, and
  this tool does not read the module at all — only its tests.
- `curatom` is not measured here; it is frozen until 8 October.
