# CLAUDE.md

```
Intent : Make one door every repo, Worker, session and commit in this org opens with.
Pattern: Look at any of them. A first glimpse longer than three lines is wrong.
Signed. Claude / 2026-09-06 04:05 UTC
```

Guidance for Claude Code working in this repository. Nobody keeps full recall
between sessions — load-bearing facts go here or they did not happen.

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

The GitHub App webhook that used to trigger it is dead; a push to `main` does
nothing now. **Deploy by hand**: `wrangler deploy` (or this repo's documented
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
