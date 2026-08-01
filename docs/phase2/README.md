# Phase 2 — E2E/CI, BFF auth, transactional POPIA, observability

Shipped on branch `main-phase2-e2e-bff-popia-obs-2176` (stacked on Phase 1).

## 1. Integration / E2E CI

- Workflow: `.github/workflows/backend-integration.yml`
- Services: Postgres 16 + Redis 7
- Steps: migrate → seed → API (`DEV_AUTH_BYPASS`) → `RUN_INTEGRATION=1` → `RUN_E2E=1` → `/metrics` smoke
- Auth fix: Bearer `dev-bypass` is a sentinel (no JWKS call) so SDK/integration headers work

## 2. BFF auth (httpOnly cookies)

| Route | Role |
|---|---|
| `POST /api/auth/login` | Proxy Keycloak login; set `sc_access` / `sc_refresh` / `sc_role` / `sc_user` |
| `POST /api/auth/dev-session` | Proxy dev bypass session |
| `POST /api/auth/logout` | Clear cookies; best-effort upstream logout |
| `GET /api/auth/session` | Hydrate client from cookies |

`src/backend/provider.tsx` clears legacy `localStorage` token keys and keeps the access token **in memory** only (hydrated from `/api/auth/session`). Soft portal RBAC still uses the non-httpOnly `sc_role` cookie for middleware.

## 3. Transactional POPIA deletion

`backend/src/worker.ts` deletion worker wraps anonymize / soft-delete / membership cleanup in `db.transaction(...)`. Partial failures roll back; BullMQ can retry.

## 4. Observability

- `/metrics` emits Prometheus text: up, uptime, HTTP totals/by-status, duration sum, WS clients/messages, realtime fanouts
- Request hook in `buildApp` records HTTP metrics
- Realtime gateway publishes Postgres `NOTIFY` payloads to Redis channel `secureconnect:realtime` and fans out to local WebSocket clients (multi-instance ready)

## Dependency

Merge **after** Phase 1 PR (#4) or keep this PR stacked on the Phase 1 branch tip.
