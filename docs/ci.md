# Continuous Integration

This repository uses GitHub Actions for hermetic Node.js checks across the npm workspaces (Next.js app, Fastify API, SDK).

## Workflows

| Workflow | File | Purpose | Required secrets |
|---|---|---|---|
| **CI Health** | `.github/workflows/ci-health.yml` | Aggregator / recommended required check; smoke typecheck + unit tests | None |
| **Typecheck** | `.github/workflows/typecheck.yml` | Frontend + SDK `tsc --noEmit` | None |
| **Backend CI** | `.github/workflows/backend-ci.yml` | API typecheck, unit tests, coverage | None |

Triggers: `push` / `pull_request` to `main` (and `master`), plus `workflow_dispatch`. Backend CI is also path-filtered to backend/SDK/lockfile changes.

Integration and e2e Vitest suites are **not** run in CI by default (they need Docker / a live stack). Enable locally with `RUN_INTEGRATION=1` / `RUN_E2E=1`.

## Run the same checks locally

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
4. Re-run: Actions → workflow run → **Re-run failed jobs**, or push an empty commit / use **Run workflow**.

## Branch protection

Recommended required checks (names as shown in the GitHub UI):

- `CI health summary` (from **CI Health**)
- `Frontend typecheck` (from **Typecheck**)
- `Backend unit + coverage` (from **Backend CI**) when backend paths change

## Design notes

- Least-privilege `permissions: contents: read` on all workflows.
- `concurrency` groups cancel redundant runs on the same ref.
- Dependency caching via `actions/setup-node` + root `package-lock.json`.
- Official actions pinned to major tags (`@v4`).
- Diagnosis history for the 2026-07-21 outage: [`docs/ci-failure-diagnosis.md`](./ci-failure-diagnosis.md).
