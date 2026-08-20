# CLAUDE.md

Guidance for Claude Code working in this repository. Nobody keeps full recall
between sessions — load-bearing facts go here or they did not happen.

## CI — comfort-ci owns delivery (20 Aug 2026)

Do not add GitHub Actions workflows. The GitHub App webhook
`https://comfort-ci.rajvansh.workers.dev/webhook` is the only push path.
Empty repo Settings → Webhooks is correct; Apps do not appear there.

Prove the factory with `GET https://comfort-ci.rajvansh.workers.dev/health`.
Live `release` on 20 Aug 2026: `2026-08-20-standard-4-all`. Every container
application on this Cloudflare account is `standard-4` (4 vCPU / 12 GiB / 20 GB).
The binding constraint is **1,500 concurrent vCPU**, not the 6 TiB memory line.
`wrangler deploy` SUCCESS is not proof a container changed size — read
`GET /accounts/:acct/containers/applications/:id` `vcpu` / `memory`.

