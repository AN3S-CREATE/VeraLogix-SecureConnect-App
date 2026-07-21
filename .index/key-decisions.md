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
