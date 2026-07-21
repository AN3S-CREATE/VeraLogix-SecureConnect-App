# Repository Analysis State — VeraLogix SecureConnect

## Current Analysis Phase & Progress

**Phase: CI Stabilization — implementation complete, awaiting green GitHub runs.**  
Failure diagnosis written; root causes fixed locally; workflows hardened.

## Key Architectural Insights Discovered

- Backend is a mature Firebase replacement with full CRUD for 12+ entities, POPIA, files, realtime WS, and BullMQ workers (`backend/src/app.ts`, `domain/routes.ts`).
- Frontend cutover is **minimal**: only `/cmd/access` and `/ten/keys` use `useCollection`; ~32 portal pages still use hardcoded mock arrays.
- Monorepo uses a **single root** `package-lock.json` with workspaces `backend` + `packages/sdk` — Backend CI must not reference `backend/package-lock.json`.
- Root `tsconfig.json` must exclude `backend/` (NodeNext) or frontend typecheck pulls API sources incorrectly.

## Files Deeply Reviewed

- `.github/workflows/*.yml` — Typecheck, Backend CI, CI Health
- `packages/sdk/src/index.ts` — missing `}` on `request()` caused Typecheck failure
- `backend/src/db/seed.ts`, `lib/cache.ts`, `lib/crud-factory.ts`, `worker.ts` — type/path fixes
- `docs/ci-failure-diagnosis.md`, `docs/ci.md`

## Open Questions & Areas Needing Investigation

- Confirm deployment target (Docker VPS vs cloud K8s)
- Whether branch protection can be updated to require `CI health summary` (API returned 403 for protection settings)

## Decisions Made & Rationale

- **Primary memory file:** `PROJECT_MEMORY.md` at repo root (per intelligence agent protocol)
- **CI:** Hermetic `npm ci` at repo root; coverage thresholds scoped to unit-covered lib modules
- **Branch name:** `main-ci-stabilize-checks-2176` — Git cannot create `main/*` while branch `main` exists

## Next Immediate Steps

1. Push branch and open PR; wait for Actions green
2. Optionally ask maintainers to set required checks to CI Health + Typecheck + Backend CI

## Patterns & Recurring Issues Noticed

- **Pattern:** Rich UI pages with mock arrays — API exists but not connected
- **Recurring issue:** Lockfile drift breaks `npm ci` while `npm install` masks it

## Session Log

- 2026-07-13 — First intelligence pass complete. See `PROJECT_MEMORY.md` for full report.
- 2026-07-21 — CI Phase 0 diagnosis + fixes. Memory updated.
