# Failure Diagnosis Report — VeraLogix SecureConnect CI

**Date:** 2026-07-21  
**Repo:** `AN3S-CREATE/VeraLogix-SecureConnect-App`  
**Default branch:** `main` (`1cab805`)  
**Open PRs:** none  
**Latest failing tip-of-main runs:**  
- Backend CI — [29808869617](https://github.com/AN3S-CREATE/VeraLogix-SecureConnect-App/actions/runs/29808869617)  
- Typecheck — [29808869607](https://github.com/AN3S-CREATE/VeraLogix-SecureConnect-App/actions/runs/29808869607)

---

## 1. Workflows & jobs inventory

| Workflow file | Name | Triggers | Jobs | Status on `main` |
|---|---|---|---|---|
| `.github/workflows/typecheck.yml` | Typecheck | `push`/`pull_request` → `main`/`master` | `typecheck` | **FAIL** |
| `.github/workflows/backend-ci.yml` | Backend CI | `push`/`pull_request` path-filtered (`backend/**`, `packages/sdk/**`, …) | `test` | **FAIL** |

**Missing (gaps vs production-grade CI):** no concurrency groups, no `permissions:` blocks, no timeouts, no CI Health / summary check, no lint job, weak caching (broken or unscoped), no JUnit annotations, no docs for secrets/local parity.

---

## 2. Exact failures

### 2.1 Backend CI → job `test` → step `Run actions/setup-node@v4`

```
##[error]Some specified paths were not resolved, unable to cache dependencies.
```

- Workflow sets `cache-dependency-path: backend/package-lock.json`
- **That file does not exist.** Monorepo uses a single root `package-lock.json` with npm workspaces (`backend`, `packages/sdk`).
- Install / typecheck / test / coverage steps were **skipped** after this failure.

**Root cause class:** path filter / incorrect cache path (monorepo lockfile mismatch).

### 2.2 Typecheck → job `typecheck` → step `Run Typecheck` (`npm run typecheck`)

113 TypeScript parse errors, all in `packages/sdk/src/index.ts`, starting at line 113:

```
error TS1434: Unexpected keyword or identifier.
error TS1005: ',' expected.
…
```

**Root cause:** missing closing `}` on `SecureConnectClient.request()` after `return body as T;` (line 111). Subsequent class methods are parsed as illegal syntax.

**Local reproduction (matches CI):**

```bash
npm install          # workflow uses install, not ci
npm run typecheck    # fails only on packages/sdk today
```

---

## 3. Cascading / latent failures (will appear after surface fixes)

Verified locally by temporarily closing the SDK brace, then restoring the file.

### 3.1 Root Typecheck includes backend sources

Root `tsconfig.json` has `"include": ["**/*.ts", "**/*.tsx", …]` and only excludes `node_modules`. After the SDK fix, `tsc --noEmit` also fails on:

| File | Issue | Class |
|---|---|---|
| `backend/src/db/seed.ts` | Wrong relative imports (`./config/...`, `./db/...` from inside `db/`) | dependency / path bug |
| `backend/src/lib/crud-factory.ts` | Drizzle typing (`eq`/`isNull` on cast columns; `never` destructure) | type error |
| `backend/src/worker.ts` | `attempts` not valid on BullMQ `WorkerOptions` | API misuse / version pin |
| (+ backend workspace typecheck also reports) `backend/src/lib/cache.ts`, `health/routes.ts` | `ioredis` default import not constructable under current TS/module settings | dependency / ESM interop |

### 3.2 Backend CI — after cache path is fixed

| Step | Local result | Class |
|---|---|---|
| `npm ci` in `backend/` | Would fail: **no** `backend/package-lock.json`; must use root workspace install | lockfile / workspace layout |
| Root `npm ci` | **FAILS today** — lockfile out of sync (`Missing: process@…`, protobufjs version mismatch) | dependency conflict / stale lockfile |
| `npm run typecheck` (backend) | Fails (seed, crud-factory, worker, ioredis) | type errors |
| `npm test` (unit) | **PASS** (14 tests) | OK |
| `npm run test:coverage` | **FAIL** — lines/statements ~21% vs threshold 50% | coverage threshold / incomplete unit coverage |

### 3.3 Workflow hygiene gaps (non-blocking today, reliability risk)

| Gap | Class |
|---|---|
| No `permissions:` (defaults broader than needed) | permission |
| No `concurrency:` cancel-in-progress | race / wasted runners |
| No `timeout-minutes` | reliability |
| Typecheck uses `npm install` (non-hermetic) vs desired `npm ci` | dependency drift |
| Backend path filters omit root `package-lock.json` / `package.json` | path filter |
| Node 20 requested; Actions runtime warns Node 20 deprecated (action JS on Node 24) | version pin / deprecation |
| No CI Health required check | missing status check |

---

## 4. Environment matrix

| Layer | CI (observed) | Project needs | Local agent |
|---|---|---|---|
| Runner OS | `ubuntu-latest` → Ubuntu 24.04.4 | Linux Node app; OK | Linux |
| Node (workflow) | `20` via `actions/setup-node@v4` | `engines.node >= 20` (backend); frontend OK on 20/22 | v22.14 / v22.22 |
| npm | runner default | workspaces + single root lockfile | 10.9.7 |
| TypeScript | resolved from install (~5.9.x in lock) | `typescript ^5` / backend `^5.7.3` | 5.9.3 |
| Python / Go / Rust / Java | N/A | N/A | N/A |
| Docker | not used in current workflows | needed only for integration/e2e (`RUN_INTEGRATION=1` / `RUN_E2E=1`) | optional |
| Secrets | none referenced | none required for current CI jobs | — |

---

## 5. Ecosystems detected

- **Node/TS monorepo:** Next.js 15 frontend (root), Fastify API (`backend/`), SDK (`packages/sdk/`)
- **Docker Compose** stack under `docker/` (not gated in CI today)
- **Vitest** unit/integration/e2e for backend
- Legacy Firebase artifacts present but not CI’d

---

## 6. Fix priority (for Phase 1+)

1. **P0 — Unblock Backend CI cache/install:** point cache + `npm ci` at root lockfile / workspace.
2. **P0 — Fix SDK missing `}`** so Typecheck can progress.
3. **P0 — Scope root typecheck** (exclude `backend/**` or use project references) *and/or* fix backend TS errors so whichever check runs is green.
4. **P0 — Repair `package-lock.json`** so hermetic `npm ci` works.
5. **P0 — Backend type errors:** seed import paths, ioredis typing, crud-factory casts, worker `attempts`.
6. **P0 — Coverage:** lower threshold to realistic unit-only coverage, expand unit tests, or narrow `coverage.include` — choose explicit policy.
7. **P1 — Harden workflows:** permissions, concurrency, timeouts, step summaries, CI Health job, `docs/ci.md`.
8. **P1 — Optional:** lint job; keep integration/e2e behind flags (already skipped unless env set).

---

## 7. Acceptance snapshot (before fixes)

```text
gh run list --status failure --branch main
→ Backend CI FAIL, Typecheck FAIL

gh run list --limit 10
→ newest runs are failures (older historical Typecheck successes predate backend/SDK merge)
```

**Phase 0 complete. No production fixes applied yet at time of this report** (SDK brace was simulated then reverted during diagnosis only).
