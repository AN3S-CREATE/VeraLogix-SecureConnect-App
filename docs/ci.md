# Continuous Integration

This repository uses GitHub Actions for hermetic Node.js checks across the npm workspaces (Next.js app, Fastify API, SDK).

## Workflows

| Workflow | File | Purpose | Required secrets |
|---|---|---|---|
| **CI Health** | `.github/workflows/ci-health.yml` | Aggregator / recommended required check; smoke typecheck + unit tests | None |
| **Typecheck** | `.github/workflows/typecheck.yml` | Frontend + SDK `tsc --noEmit` | None |
| **Frontend Build** | `.github/workflows/frontend-build.yml` | `next build` with `NODE_ENV=production` | None |
| **Backend CI** | `.github/workflows/backend-ci.yml` | API typecheck, unit tests, coverage | None |
| **Backend Integration** | `.github/workflows/backend-integration.yml` | Postgres + Redis services; migrate/seed; integration + e2e | None |

Triggers: `push` / `pull_request` to `main` (and `master`), plus `workflow_dispatch`. Backend CI / Integration are path-filtered to backend/SDK/lockfile changes.

## Integration / e2e (CI + local)

**CI** starts Postgres 16 + Redis 7 as Actions service containers, applies migrations, seeds demo data, boots the API with `DEV_AUTH_BYPASS=true`, then runs:

```bash
RUN_INTEGRATION=1 npm run test:integration --workspace=@veralogix/secureconnect-api
RUN_E2E=1 npm run test:e2e --workspace=@veralogix/secureconnect-api
```

Keycloak and MinIO are **not** required for the smoke path (dummy env values satisfy Zod). `/health/ready` may report them as `down`; `/health/live` and the unlock flow still pass.

**Locally** (with Compose or any live Postgres/Redis):

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
# export env from backend/.env.example, set DEV_AUTH_BYPASS=true
npm run db:migrate && npm run db:seed
npm run dev:api
RUN_INTEGRATION=1 npm run test:integration --workspace=@veralogix/secureconnect-api
RUN_E2E=1 npm run test:e2e --workspace=@veralogix/secureconnect-api
```

## Run the same hermetic checks locally

```bash
# Hermetic install (same as CI)
npm ci

# Frontend + SDK
npm run typecheck

# Backend
npm run typecheck --workspace=@veralogix/secureconnect-api
npm test --workspace=@veralogix/secureconnect-api
npm run test:coverage --workspace=@veralogix/secureconnect-api
```

Node **20+** is required (`engines` on the API package; workflows pin Node 20).

## Required secrets / variables

Current CI jobs need **no** repository secrets or variables. Runtime config for local/dev lives in `.env.example` and `backend/.env.example` (never commit real secrets; POPIA — do not upload PII to third-party CI).

If you add deploy or cloud jobs later, document new `secrets.*` here and keep least-privilege `permissions:` on those workflows.

## Debugging a failing run

1. Open the failed job on GitHub Actions and read the failing step + `$GITHUB_STEP_SUMMARY`.
2. Reproduce locally with the commands above on a clean `npm ci`.
3. Common failures:
   - **Lockfile / `npm ci`**: regenerate with `npm install` at the repo root and commit `package-lock.json`.
   - **SDK/frontend type errors**: fix under `packages/sdk` or `src/`; root `tsconfig.json` excludes `backend/`.
   - **Backend type errors**: run workspace typecheck; API uses `NodeNext` modules.
   - **Coverage**: thresholds apply only to unit-covered lib modules listed in `backend/vitest.config.ts`.
   - **Integration**: check service container health, `/tmp/secureconnect-api.log` on the job, and that `DEV_AUTH_BYPASS=true` with `NODE_ENV=development`.
4. Re-run: Actions → workflow run → **Re-run failed jobs**, or push an empty commit / use **Run workflow**.

## Branch protection

Recommended required checks (names as shown in the GitHub UI):

- `CI health summary` (from **CI Health**)
- `Frontend typecheck` (from **Typecheck**)
- `Frontend production build` (from **Frontend Build**)
- `Backend unit + coverage` (from **Backend CI**)
- `Backend integration + e2e` (from **Backend Integration**) — recommended once stable

Admin checklist: [`docs/branch-protection-checklist.md`](./branch-protection-checklist.md).
Secrets hygiene: [`docs/secrets.md`](./secrets.md).
Phase 2 notes: [`docs/phase2/README.md`](./phase2/README.md).

### How to configure (repository admin)

1. Open **Settings → Rules → Rulesets** (or **Settings → Branches → Branch protection rules**).
2. Create or edit a rule targeting `main`.
3. Enable **Require status checks to pass**.
4. Search for and select the job names above.
5. Optionally enable **Require branches to be up to date before merging** and restrict who can push to `main`.

> Note: path-filtered Backend CI / Integration may show as pending/skipped on PRs that only touch frontend docs. Prefer requiring **CI health summary** + **Frontend typecheck** + **Frontend production build** always; require backend jobs when your GitHub plan supports conditional required checks.

### Verify

After a merge to `main`, confirm:

```bash
gh run list --branch main --limit 5
gh api repos/OWNER/REPO/commits/main/check-runs --jq '.check_runs[] | {name, conclusion}'
```

## Design notes

- Least-privilege `permissions: contents: read` on all workflows.
- `concurrency` groups cancel redundant runs on the same ref.
- Dependency caching via `actions/setup-node` + root `package-lock.json`.
- Official actions pinned to major tags (`@v4`).
- Diagnosis history for the 2026-07-21 outage: [`docs/ci-failure-diagnosis.md`](./ci-failure-diagnosis.md).
