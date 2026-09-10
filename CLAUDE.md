# CLAUDE.md

```
Intent : Make one door every repo, Worker, session and commit in this org opens with.
Pattern: Look at any of them. A first glimpse longer than three lines is wrong.
Signed. Claude / 2026-09-06 04:05 UTC
```

Guidance for Claude Code working in this repository. Nobody keeps full recall
between sessions — load-bearing facts go here or they did not happen.

**One page sits above this one.** [`founder/YA-RA.md`](./founder/YA-RA.md) —
handwritten, signed and stamped by the founder on 6 September 2026. The door
below was proposed by an agent and approved; that page is the founder writing
directly. Where the two disagree, that one wins. His standing positions, each
quoted and then measured against what the system actually proves, are in
[`founder/STANDARDS.md`](./founder/STANDARDS.md).

### The language is called **YA|RA**, and it is spelled two ways

Founder decision, 7 September 2026. The Intent/Pattern language has a name, and
it is his rather than an agent's — which matters beyond taste, since the door
below was proposed by an agent and approved, while the name comes from his own
page.

**The bar is the point.** `YA|RA` has the form drawn into it: two sides, one
separator. Intent | Pattern. The name is its own diagram.

A `|` is not legal in a path, a URL, or a package name, so it degrades the
moment it touches a filesystem — `founder/YA-RA.md` is that already happening.
Rather than let it drift into three spellings, two are fixed and one is barred:

| Where | Write | Why |
| --- | --- | --- |
| Prose — docs, commits, PRs, chat | **`YA\|RA`** | The canonical name. The bar carries the meaning. |
| Paths, URLs, package and branch names | **`ya-ra`** | `\|` is illegal there. Existing `founder/YA-RA.md` stays as it is; new paths use the lowercase form. |
| Anywhere | ~~`YARA`~~ — **never bare** | Already a well-known malware-identification rule language, and also described as a "pattern language". Someone searching for one finds the other. |

The third row is the only one that is a real constraint; the first two are just
the same name surviving contact with computers.

**A note on how this was agreed, because it is the more useful part.** The rule
was proposed in shorthand — *"YA|RA canonical in prose, ya-ra in paths, never
bare YARA"* — and the founder agreed to it while saying plainly that he did not
know what it meant. It was then explained in one paragraph of ordinary words and
agreed again. A convention nobody can check is exactly the thing this
organisation's door exists to prevent, and a rule accepted on the strength of
its phrasing would have been one. If a convention here cannot earn itself in a
sentence, it should not exist.

## The door

Everything in this org opens with this, and nothing else:

```
Intent : what you came for.       17 words or fewer.
Pattern: how anyone checks it.    17 words or fewer.
Signed. <name> / <timestamp>
```

A repo, a Worker, a session, a commit, a pull request. Three lines, seen in one
glimpse. **A reader may stop there and have all of it.** Nobody is made to read
further to know what happened and how to test it.

Everything else goes below, in full — the mess, the wrong turns, the things left
open. Leave no curiosity thirsty. Just never charge a reader up front for it.

**A gloss from outside, and where it came from.** The founder described YA|RA to
GPT; this is what GPT wrote back. He passed it on because he thought it would
*"land better with other LLMs"* — which is the only claim being made for it.

> YA|RA is becoming operational grammar, not ornament:
>
> ```
> Intent  names what may become true.
> Pattern states how reality can contradict it.
> Signed  preserves who stood behind the attempt.
> ```

**It is not authoritative and it is not the founder's words.** The founder's
page is [`founder/YA-RA.md`](./founder/YA-RA.md) and it outranks this and the
door alike. This is one model's reading of a convention another model proposed,
kept because it is a good reading — nothing more.

An earlier version of this section got that wrong: it credited these lines to
the founder, called them authoritative over the door, and put them on his page,
which states on its face that nothing on it is an agent's paraphrase. That is
the same failure this organisation already paid for once — an agent documenting
its own output as founder intent — so the correction is kept visible rather
than quietly rewritten. **Attribute before you elevate.**

Taken as a reading rather than a ruling, it is a good one: a wager, its losing
condition, and the name of whoever placed it. **Operational** is the word doing
the work — it governs what may be written, not how it looks.

Three consequences, each of which forbids something people write anyway:

- Intent is a **hypothesis**, so it is written before the outcome is known and
  it stays written when the attempt fails. An Intent you could only write once
  the result was certain is a summary wearing the form.
- Pattern is a **falsification route**, so the test is not "does this describe
  the change" but "could someone walk this and come back holding a refutation".
  A Pattern nobody could lose is decoration.
- Signed attaches to the **attempt**, not the claim, which is what makes it safe
  to sign something later found false — and what makes an unsigned line
  worthless, since nobody stood anywhere.

Two things it is not. **Intent is not a summary** — it bounds what you are given
and what you may do with it; arrive for one thing, receive that thing. **Pattern
is not a proof** — it is the route by which you can be found wrong, stated so
someone else can walk it without trusting you.

Neither is scored, argued, or approved. Both are declared, and both are
attributable to the name on the third line. There is no maths here on purpose:
this is read, not computed.

**In a commit, the shape is the same but the spacing is not.** Git takes
everything before the first blank line as the subject, so writing the three
lines together collapses them into one run-on glimpse in `git log --oneline`.
Put the Intent on the subject line, blank line, then Pattern and Signed:

```
Intent : <what you came for>

Pattern: <how anyone checks it>
Signed. <name> / <timestamp>

<the mess>
```

That gives a log of intents at a glance, and the full three lines the moment
anyone opens one.

The rule underneath it, which is the reason for all of the above:

> **Nothing is trusted above the level at which it can be executed.**

An import edge is not an execution. A green check is not a deploy. A stored URL
is not a syncing feed. A cumulative average is not a current slope. A standing
credential is permission asserted forever and proven never.

## `comfortcurators.io` — the org's public findings store

Built 10 September 2026. Every session in this org re-derives things earlier
sessions already derived, and this file is the only reason any of it survives.
That works inside the org and nowhere else. `comfortcurators.io` is the same
discipline pointed outward, at a URL with no key.

```
GET  /llms.txt                    plain text if you ask for text; a page if you ask for HTML
GET  /f · /f/{subject}            claims and their standing
POST /f/{subject}                 leave one
POST /f/{subject}/{id}/checked    report that you walked the route
POST /ask                         first asking runs a model; every repeat is served from store
GET  /v1/models · POST /v1/chat/completions
```

**The one enforced rule is this file's own law with a status code.** A claim
without the route by which someone else could prove it wrong is refused with
`422`. That applies to answers the site generates as much as to claims you
send — four of the site's own model answers were refused on the day it was
built, because the model named a source instead of an action.

**A claim is a weight, not a receipt.** Identity is the normalised claim text,
so the same finding from two callers raises `observed` on one entry rather
than creating two rows that each look like independent evidence. Both callers'
routes are kept. An unwalked claim reads `unresolved`, never `refuted` —
`hostos-mcp`'s ledger rule, enforced here for the same reason. Disagreement
reads `contested` and stays that way; nothing collapses to a score.

**`/ask` is compute decay on a public endpoint.** Identity for a repeat is the
hash of the normalised question, so a repeat spends no neurons at all and a
novel question still pays. `GET /stat` reports the split, the same way
`perceptstat:` does in `CLUB_MEMORY`.

Two things it is not, so nobody records otherwise: nothing verifies who a
caller is (`by` is returned with `as_verified: false`), and nothing about it
has been used by anything that is not this org. Its own first entry is a claim
filed by Claude and then refuted by Claude, correctly.

## Eight is enough, seventeen is the maximum

Founder's rule, 8 September 2026, and it binds every repository in this org:

> **8 is enough, 17 is max. More than that is a count standing in for weak
> individual tests.**

It is a *quality* bar, not a budget. A suite grows past seventeen exactly one
way — by writing **one assertion per case instead of one property per case** —
and every case added that way makes the suite longer without making it catch
anything new. A case should assert a property *and every way that property can
break*. If a real property needs a case and the file is at its ceiling, merge
two weak neighbours; do not add an eighteenth.

**Measured, not asserted.** `comfortcurators/seek` was cut from 33 cases to 17
the day this rule was set. The drift was exactly the symptom above: three
separate cases for *"only the actor may complete"*, two in `poll.test.ts`
restating a third, one asserting `NaN` handling no caller produces, and one
documenting behaviour the code deliberately does not have. After the cut, with
the three real defects that suite exists for — a fail-open auth guard, a flat
3000ms poll floor, and a `claimTurn` that reset its own abandonment clock —
all restored **simultaneously**, 5 of the 17 went red and every defect was
caught. Half the count, none of the reach.

That last step is the rule's own enforcement, and it is not optional: **cutting
a suite is only safe if you then restore the bugs it exists to catch and watch
it fail.** A shorter suite nobody has seen go red is not a tighter suite, it is
a smaller one — which is this org's founding law (*a faculty that nothing calls
is not evidence*) pointed at the tests themselves.

## No CI — deploy by hand (retired 25 Aug 2026)

`comfort-ci` is retired. Founder decision, 25 Aug 2026: it was a real DeepTech
R&D artifact — its purpose was to build and prove the thing, not to run it
forever — and that purpose was met the moment it was published as a Zenodo
archive. Kept running live, it was silently unreliable (a token-minting bug
broke its deploy step for who knows how long before anyone noticed) and it
was reserving the bulk of the account's 1,500 vCPU container ceiling — 1,464
of 1,500 — while barely using any of it. Both the `comfort-ci` Worker and its
container applications are deleted from Cloudflare. `founder-console`, a
dashboard built entirely around talking to it, is deleted too — nothing else
depended on it.

**One exception, found 6 September 2026 — `comfortcurators/HostOS`.** Cloudflare
Workers Builds has a live Git integration there and deploys the `hostos` Worker,
the privileged operator plane, on every push to `main` — including merges that
change only markdown. Six such deploys on 6 September alone. See
[`HostOS/CLAUDE.md`](https://github.com/comfortcurators/HostOS/blob/main/CLAUDE.md).

That exception is bounded and was checked rather than assumed: five merges into
`Superhostos`, `seek`, `curatory`, `curator` and `kimi` the same morning produced
no deployment at all. Everything below is true for those; it is false for HostOS.

The GitHub App webhook that used to trigger it is dead; outside HostOS, a push to
`main` does nothing now. **Deploy by hand**: `wrangler deploy` (or this repo's documented
build+deploy command, if one exists above), same checks run manually first
(typecheck/lint/test/build) that the removed pipeline used to run for you.

Do not add GitHub Actions workflows to fill this gap. GitHub Actions was
already tried on this account before comfort-ci existed and was already
broken — a `Deploy Site` workflow once sat `queued` for over a month with
**zero jobs ever allocated**, and default-setup CodeQL has failed instantly
with no logs on every commit since. Recommending it as the replacement would
trade one silently-broken automation for a different one with the same
failure signature.

This is deliberate, not a gap waiting to be filled: no CI, no automated
deploy, manual only, until deploy frequency or team size actually make
manual the bottleneck.
