# Repository Analysis State — VeraLogix SecureConnect

## Current Analysis Phase & Progress

**Phase 2: E2E/CI, BFF auth, transactional POPIA, observability — complete (CI green).**  
Branch `main-phase2-e2e-bff-popia-obs-2176` / PR #5. Stacked on Phase 1.

## Key Architectural Insights Discovered

- Live portal pages: access, incidents, keys, passes, maintenance×2, invoices×2, amenities.
- Bearer `dev-bypass` must short-circuit JWKS or integration/e2e headers fail.
- BFF cookies (`sc_access` httpOnly) + in-memory SDK token replace localStorage persistence.
- POPIA deletion is now a single Drizzle transaction.
- Realtime uses Redis pub/sub for multi-instance fanout; `/metrics` exposes HTTP/WS counters.

## Files Deeply Reviewed

- `backend/src/middleware/auth.ts`, `worker.ts`, `realtime/gateway.ts`, `modules/health/routes.ts`
- `src/backend/provider.tsx`, `src/lib/auth-cookies.ts`, `src/app/api/auth/*`
- `.github/workflows/backend-integration.yml`

## Open Questions & Areas Needing Investigation

- Maintainer must **rotate Gemini API key** (was in git history)
- Admin must apply branch protection checklist manually (API 403)
- Phase 1 PR #4 should merge (or remain base) before landing Phase 2 on `main`

## Decisions Made & Rationale

- Integration CI uses GHA service containers (no Docker-in-Docker / Testcontainers in agent VM)
- Cookie BFF over full API proxy for Phase 2 scope
- POPIA failures roll back via transaction; BullMQ retries (no new `failed` enum value)

## Next Immediate Steps

1. Verify Backend Integration + unit CI green on PR
2. Land Phase 1 then Phase 2 (or merge stack)
3. Phase 3 candidates: Genkit flows, remaining mock portals, harden ready-check for CI

## Patterns & Recurring Issues Noticed

- Soft cookie RBAC vs JWT still intentional for demos
- Mock arrays remain on trustee/vendor secondary pages
- Zod env still requires Keycloak/MinIO vars even when unused in a smoke path

## Session Log

- 2026-07-24 — Comprehensive analysis
- 2026-07-27 — Phase 1 implementation
- 2026-07-27 — Phase 2 implementation (E2E CI, BFF, POPIA txn, metrics/Redis fanout)
