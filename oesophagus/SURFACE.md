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
| `seek` (reek) | **0** | **0** | — | — |
| `curatory` | **0** | **0** | — | — |

Every package except `apps/api` is already inside the rule. That is the honest
headline, and it is a better one than the org has been telling itself.

## The floor, which the rule does not name

**Zero is not "inside the rule." It is outside the measurement.**

| Worker | Source | Tests | What it holds |
| --- | ---: | ---: | --- |
| `reek` (`seek`) | 1,226 lines | 0 | account API token, `worker_loader`, deploys other Workers without approval |
| `curatory` | 935 lines | 0 | live showroom and marketplace Worker, backend bulletin, admin surface |

`reek` is also the Worker whose `isAuthorized` returns `true` when its secret is
unset. Nothing in the repository would ever have caught that, because there is
nothing in the repository that runs.

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
