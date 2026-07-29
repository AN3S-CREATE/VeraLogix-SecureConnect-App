# Key Decisions — VeraLogix SecureConnect

## ADR-001: Replace Firebase with self-hosted stack

**Date:** ~commit `102c3e6`  
**Decision:** Fastify + Keycloak + Postgres + MinIO + Redis/BullMQ instead of Firebase Auth/Firestore/Hosting.  
**Rationale:** POPIA control, no vendor lock-in, OpenAPI-first API, Docker-local parity with production.

## ADR-002: Generic CRUD factory for domain APIs

**Decision:** `registerCrudRoutes()` in `crud-factory.ts` for most entities.  
**Rationale:** Fast API coverage for prototype; trade-off is thinner per-entity business rules.

## ADR-003: Demo-first frontend RBAC

**Decision:** `middleware.ts` allows unauthenticated portal browsing; enforces `sc_role` cookie only when present.  
**Rationale:** UI demos without login; API still requires JWT for data.

## ADR-004: SDK + React hooks for data layer

**Decision:** `packages/sdk` + `useCollection`/`useDoc` replace Firestore hooks.  
**Rationale:** Clean separation; realtime via WebSocket subscription in hooks.

## ADR-005: Genkit deferred

**Decision:** Genkit dependencies present; no production flows yet.  
**Rationale:** README marks AI as optional post-cutover work.

## ADR-007: BFF httpOnly session cookies (Phase 2)

**Date:** 2026-07-27  
**Decision:** Next.js route handlers under `/api/auth/*` set `sc_access` / `sc_refresh` httpOnly cookies; the React provider hydrates an in-memory SDK token from `GET /api/auth/session` and clears legacy localStorage keys.  
**Rationale:** Reduces XSS token theft vs localStorage; keeps soft `sc_role` cookie for portal middleware demos; API still validates Bearer/JWT.

## ADR-008: Redis fanout for realtime (Phase 2)

**Date:** 2026-07-27  
**Decision:** Postgres `NOTIFY` → Redis pub/sub channel `secureconnect:realtime` → local WebSocket fanout.  
**Rationale:** Multi-instance API deployments share change events without sticky sessions.

## ADR-009: Transactional POPIA deletion (Phase 2)

**Date:** 2026-07-27  
**Decision:** BullMQ deletion worker wraps all anonymize/soft-delete steps in a single Drizzle `db.transaction`.  
**Rationale:** Avoids partial POPIA deletion state; failures roll back and can retry.

## ADR-010: Phase 3 copilots with POPIA-safe heuristic fallback

**Date:** 2026-07-27  
**Decision:** Backend `/api/v1/ai/*` always runs deterministic redaction + heuristics; Gemini is optional when `GEMINI_API_KEY` is set. Genkit flows mirror this for local `genkit:dev`.  
**Rationale:** CI and evals stay hermetic; no secret required for baseline copilots.

## ADR-011: Multi-tenant SaaS foundation

**Date:** 2026-07-27  
**Decision:** Introduce `tenants` + `tenant_subscriptions` and optional `sites.tenant_id` without breaking existing single-estate demos.  
**Rationale:** Enables billing/tenancy without forcing a big-bang migration of all portals.

## ADR-012: Client-side KPI aggregation for trustee/reports (Phase 5)

**Date:** 2026-07-29  
**Decision:** Derive trustee and cmd report metrics in `src/lib/portal-kpis.ts` from existing collection endpoints instead of new aggregate APIs.  
**Rationale:** Reuses CRUD surface; keeps Phase 5 focused on portal wiring; pack export is JSON until PDF/deck lands.

