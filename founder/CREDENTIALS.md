# Credential census

```
Intent : Count every standing credential this system holds, by using it, not by trusting its name.
Pattern: Each row names an endpoint and a status code. Repeat the call.
Signed. Claude / 2026-09-06 16:20 UTC
```

The founder's standard, from [`STANDARDS.md`](./STANDARDS.md):

> *"I want as less tokens in the system as possible… nobody needs that many
> keys, one solid transparent system can run an enterprise."*
> *"Most token gates should not exist in the first place."*

This is the count that standard needs. **No values appear here and none ever
should.** Every row was established by performing an operation, because this org
has already paid for the alternative: *test a credential by doing the operation,
not by asking whether it is valid.*

Taken 6 September 2026 from the agent environment. It is a census of one
environment at one moment, not of the company.

## What is actually held

| Name | Established by | Verdict |
| --- | --- | --- |
| `GH_TOKEN` | `GET /user` → **200** | live |
| `GITHUB_TOKEN` | `GET /user` → **200** | live, and **byte-identical to `GH_TOKEN`** |
| `GITHUB_PAT` | `GET /user` → **200** | live, and a genuinely different value |
| `NEON_API` | `GET /projects?org_id=…` → **200** | live |
| `CLOUDFLARE_API_TOKEN` | `GET /accounts/{id}` → **200** | live, broad |
| `CLOUDFLARE_CREATE` | `GET /accounts` → 200, `tokens/permission_groups` → 200, `workers/scripts` → **403** | live, and narrowly scoped to **minting tokens** |
| `AWS_ACCESS_KEY_ID` / `SECRET` | value begins `prox…` | **not a company credential** — the agent proxy's |
| `GOOGLE_API`, `CLOUDSDK_AUTH_ACCESS_TOKEN` | `tokeninfo` → 400 for both, and the two differ | **unclassified.** Not OAuth access tokens. Whether either is a company key is not established, and guessing is how a census becomes fiction. |
| `API_KEY`, `CHAT_USERNAME`, `CHAT_PASSWORD` | present, untested | **unclassified.** No endpoint was known to test them against. |

## Three findings

**1. One gate is wearing two names.** `GH_TOKEN` and `GITHUB_TOKEN` are the same
value under two variables. That is not two credentials — it is one credential
with two names to rotate, two names to leak, and two names to forget. Deleting
one changes nothing about access and removes a whole row from every future
census. It is the cheapest reduction available and needs no decision.

**2. Two traps fired exactly as this org's files predict.** Both would have
produced a confident wrong answer:

- `NEON_API` returned **400** on `GET /projects`. Read literally, dead. It needs
  `org_id`; scoped correctly it is **200**. Same shape as the `{"projects": []}`
  trap already recorded in `Host/CLAUDE.md` — *an empty list is a scope answer,
  not an inventory.*
- `CLOUDFLARE_CREATE` returned **403** on `/accounts/{id}` and **401** on
  `/user/tokens/verify`. Read literally, dead twice. It returns **200** on
  `/accounts` and on `tokens/permission_groups`. *One 403 is one endpoint, not a
  policy* — and a 401 from `/user/tokens/verify` is the exact false negative
  that cost a token refresh on 5 August.

**3. `CLOUDFLARE_CREATE` is the thing the standard has been waiting for.**

It cannot read Workers. It can mint tokens. That is a **creator capability** —
precisely the pattern `comfort-ci/CLAUDE.md` already describes:

> *"If a privileged creator capability is used to mint an ephemeral deploy
> token, the minted token should be scoped, time-limited, injected only for
> eligible work, and revoked after use."*

Which means "as few tokens as possible" is not blocked on anything
architectural. **One creator, held once, minting short-lived scoped tokens per
task, is the shape** — and the account already carries the creator. Every
standing broad token below it is then a convenience, not a requirement, and the
number of permanent gates goes to one.

The remaining obstacle is unchanged and is a decision, not a problem: rolling a
credential invalidates the performing session's own, and Cloudflare shows a new
value once. The creator token is the piece that makes the destination question
answerable — a minted token needs no destination, because it expires.

## What this census does not do

- It does not enumerate **Worker secrets**, which are a separate and larger
  surface: `reek` alone holds `AI_TOKEN`, `CLOUDFLARE_API_TOKEN` and
  `SEEK_AUTH_TOKEN`; `hostos-mcp` holds a GitHub App private key, a Cloudflare
  API token, R2 keys and `CURATOR_ACTION_TOKEN`.
- It does not claim a credential is unused. Nothing here traces a token to the
  code that reads it, and "no caller found" is not the same fact as "no caller".
- **It expires.** It is a snapshot of one agent environment on one day. Re-run
  the calls rather than citing the table.
