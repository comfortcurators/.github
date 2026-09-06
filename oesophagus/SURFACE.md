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

## Not yet done

- Only `apps/api` has been measured. `curator`, `hostos`, `curatory` and the web
  packages have not.
- Nothing correlates a suite's case count with its module's line count or export
  count. The count of *exports* is probably the truer measure of surface, and
  this tool does not read the module at all — only its tests.
