# Founder standards

```
Intent : Record what the founder holds to, in his words, with what the system currently proves.
Pattern: Every claim here names a file. Open it and disagree.
Signed. Claude / 2026-09-06 15:20 UTC
```

Stated by the founder and recorded the day they were said. [`YA-RA.md`](./YA-RA.md)
is the handwritten page and sits above everything; this file is the standing
positions given in conversation, which would otherwise live only in a session
that ends.

Each is quoted, then measured. The measurement is not agreement — where the
system does not meet a standard, that is written down too.

---

## 1. Nobody sets a price but the founder

Already the oldest standing rule in this org, carried at the top of every
`CLAUDE.md`. Recorded here for completeness rather than restated: no agent
session invents, sets, or publishes a price on any product, API, service or
property, at any urgency, under any framing.

## 2. Anything needing more than 8 — at most 17 — tests should not exist

> *"I think anything that needs more than 8 or max 17 tests shouldn't exist
> anyways. Not a charity for bugs."* — 6 September 2026

Measured in [`../oesophagus/SURFACE.md`](../oesophagus/SURFACE.md), re-runnable
with `node oesophagus/surface.mjs <package>`.

Every package except `Superhostos/apps/api` is already inside it. The fourteen
files over the wall in that one are not over-tested — each names several
unrelated concerns, and its own suite names say so. `lobby` names six across a
610-line `service.ts`.

**Where the rule needs a floor.** `reek` and `curatory` were 1,226 and 935 lines
with **zero** tests. Zero is not "inside the rule", it is outside the
measurement — and reek's fail-open guard is exactly what a repository with
nothing executable cannot catch. `reek` now has 8 cases, which is the shape, not
a compromise.

## 3. As few credentials as possible; most token gates should not exist

> *"I want as less tokens in the system as possible… nobody needs that many
> keys, one solid transparent system can run an enterprise."*
> *"Most token gates should not exist in the first place."*
> *"I personally carry zero tokens, as the vision was to be purely autonomous —
> a human user is the first target of a cyber breach."* — 6 September 2026

The founder holds no credentials. Every standing token on this account is held
by machines, injected into agent environments, or set as a Worker secret. There
is no human key to phish — and no human in the path of a rotation, which is why
rotations have not happened.

This is consistent with the org law: *a standing credential is permission
asserted forever and proven never.*

**A gate that exists and fails open is worse than either.** Fewer gates is the
standard; a guard that cannot tell who is calling and answers "yes" is not
fewer gates, it is none. Every remaining gate fails closed — `mimi`,
`deepseek`, `reeklab` always did, and `reek` does as of 6 September 2026.

**What is blocked, and by exactly what:** rolling a token invalidates the
performing session's own injected credentials, and Cloudflare shows a new value
once. The roll needs a destination that outlives the session doing it. That is
one decision, not a project.

## 4. Extreme ends of the language surface — C, C++, Python, kernels

> *"I fuck with python, c, c++ because I love things coders are afraid of, I
> like the sex appeal of universal epitome of all kernels and quantum
> computing."* — 6 September 2026

This is already the declared surface, not an aspiration.
`Superhostos/apps/api/src/domains/curator/languages.ts` registers 18 languages,
including `c`, `cpp`, `wasm`, `python`, `fortran`, `openmp`, `mpi`, `cuda`. The
hot paths compile to WASM with a TypeScript twin (`native.ts`, `native-wasi.ts`,
`kernels.ts`) so the fast path stays checkable against the obvious one, and
`languages.test.ts` fails the build when a claimed language points at a module
that does not exist.

**And the register is honest about precisely the two that matter most here.**
Both are `claims: "not-yet"`, `provenOnlyBy: null`, each with a recorded wall
*and* its route — which is the org law about walls, applied to itself:

| Language | Wall as recorded |
| --- | --- |
| `mpi` | *"MPI assumes long-lived processes across a shared network fabric. An isolate is started per request…"* |
| `cuda` | *"No GPU is addressable from a Worker, and none from a Cloudflare Container either. This is not a toolchain gap; there is no device."* |

The `cuda` entry says the thing worth keeping: *"the exact line between
orchestrating intelligence and manufacturing it — worth naming precisely,
because it is the most honest limit on the whole list."*

**Quantum has no entry at all.** Not a wall with a route, not a `not-yet` — it
is simply absent from the register. Under Art. X a capability is claimed only at
the level its code can prove, so absence is the correct state today; but a
standard that is stated and unregistered is the one that quietly disappears.
Naming it as `not-yet` with its real wall would be truthful. Doing more than
that would not.

---

## How to add to this file

Quote the founder, date it, then measure it and name the file that measures it.
A standard recorded without a route to check it is a preference, and preferences
do not need a document.
