# Architecture — VeraLogix SecureConnect

## Overview

Multi-portal property security platform: Next.js frontend talks to a self-hosted Fastify API via `@veralogix/secureconnect-sdk`. Auth is Keycloak OIDC. Data lives in PostgreSQL with realtime via NOTIFY → WebSocket.

## Components

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 15 (port 9002)                                     │
│  Portals: /cmd /ten /tru /ven + /templates                  │
│  src/backend: provider, hooks (useCollection, useDoc)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + WS
┌──────────────────────────▼──────────────────────────────────┐
│  Fastify API (port 3000) — backend/src/app.ts               │
│  Modules: auth, domain CRUD, files, admin, popia, realtime  │
└─┬────────┬────────┬──────────┬──────────┬───────────────────┘
  │        │        │          │          │
  ▼        ▼        ▼          ▼          ▼
Postgres Keycloak  MinIO     Redis     BullMQ worker
```

## Auth flow

1. Browser calls Next BFF (`POST /api/auth/login` or `/api/auth/dev-session`) → Fastify `/api/v1/auth/*`
2. BFF sets httpOnly `sc_access` / `sc_refresh` (+ soft `sc_role` for portal middleware)
3. Provider hydrates in-memory SDK token via `GET /api/auth/session` (no localStorage tokens)
4. JWT validated in `backend/src/middleware/auth.ts`; app user resolved from `users` + `user_site_roles`
5. Dev path: `DEV_AUTH_BYPASS` → sentinel Bearer `dev-bypass` + `x-dev-bypass: 1`

## Data flow (wired pages)

- `/cmd/access`, `/ten/keys`: `useCollection('doors'|'access-logs')` + WebSocket subscribe
- Door unlock: `client.unlockDoor(id)` → API updates door + inserts access_log + audit

## Realtime

Postgres `NOTIFY` → Redis `secureconnect:realtime` → per-instance WebSocket fanout (`backend/src/realtime/gateway.ts`).

## Deployment

- Local: `docker compose -f docker/docker-compose.yml up` + `npm run dev`
- Edge: Caddy proxies API, Keycloak, MinIO
- Observability: `/metrics` Prometheus text; optional Compose `--profile observability` for Prometheus/Grafana
- CI: Typecheck, Frontend Build, Backend CI, Backend Integration (Postgres+Redis services), CI Health — see `docs/ci.md`

## Not yet integrated

- Full malware sandbox / watermark pipeline (heuristic scan only)
- Production billing provider (Stripe/etc.)
- Published App Store / Play builds (`apps/mobile` is optional scaffold)
- Remaining portal pages still use in-component mock arrays instead of SDK
- Genkit requires `GEMINI_API_KEY` for live model calls (heuristics work without)
