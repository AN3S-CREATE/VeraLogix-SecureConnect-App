# Repository Analysis State — VeraLogix SecureConnect

## Current Analysis Phase & Progress

**Phase 1: Baseline Intelligence & Completion Planning — 100% (first run).**  
Backend architecture mapped; frontend mock-vs-live matrix complete; phased roadmap delivered.

## Key Architectural Insights Discovered

- Backend is a mature Firebase replacement with full CRUD for 12+ entities, POPIA, files, realtime WS, and BullMQ workers (`backend/src/app.ts`, `domain/routes.ts`).
- Frontend cutover is **minimal**: only `/cmd/access` and `/ten/keys` use `useCollection`; ~32 portal pages still use hardcoded mock arrays.
- Staged git changes include root `.env` with secrets — critical before any push.
- Genkit is scaffolded (`src/ai/genkit.ts`) but `src/ai/dev.ts` has no flows.

## Files Deeply Reviewed

- `README.md` — product positioning, roadmap, stack diagram
- `backend/src/app.ts` — Fastify plugin assembly
- `backend/src/modules/domain/routes.ts` — full CRUD surface
- `backend/src/modules/auth/routes.ts` — Keycloak login/register
- `packages/sdk/src/index.ts` — client SDK contract
- `src/backend/provider.tsx`, `hooks.ts` — frontend data layer
- `docker/docker-compose.yml` — full stack topology
- `docs/migration-firebase.md` — cutover checklist

## Open Questions & Areas Needing Investigation

- Confirm deployment target (Docker VPS vs cloud K8s)
- Whether mobile/React Native is in v1 scope
- Priority of Genkit AI flows vs portal API wiring

## Decisions Made & Rationale

- **Primary memory file:** `PROJECT_MEMORY.md` at repo root (per intelligence agent protocol)
- **P0 work:** Security fix for `.env`, then wire high-traffic portal pages to existing APIs

## Next Immediate Steps

1. Unstage/ignore `.env`; rotate exposed API keys
2. Implement Phase 1 portal wiring (passes, tickets, incidents)
3. Run backend tests in CI or clean local install

## Patterns & Recurring Issues Noticed

- **Pattern:** Rich UI pages with `const data = [...]` mock arrays — API exists but not connected
- **Recurring issue:** Google Drive path causes `npm install` tar/EPERM failures

## Session Log

- 2026-07-13 — First intelligence pass complete. See `PROJECT_MEMORY.md` for full report.
