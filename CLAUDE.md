# CLAUDE.md

Guidance for Claude Code working in this repository. Nobody keeps full recall
between sessions — load-bearing facts go here or they did not happen.

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
