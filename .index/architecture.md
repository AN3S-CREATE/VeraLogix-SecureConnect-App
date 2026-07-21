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

1. User logs in via SDK → `POST /api/v1/auth/login` → Keycloak token exchange
2. JWT validated in `backend/src/middleware/auth.ts`; app user resolved from `users` + `user_site_roles`
3. Frontend stores tokens in `localStorage`; sets `sc_role` cookie for soft portal routing
4. Dev path: `DEV_AUTH_BYPASS` → `POST /api/v1/auth/dev-session`

## Data flow (wired pages)

- `/cmd/access`, `/ten/keys`: `useCollection('doors'|'access-logs')` + WebSocket subscribe
- Door unlock: `client.unlockDoor(id)` → API updates door + inserts access_log + audit

## Deployment

- Local: `docker compose -f docker/docker-compose.yml up` + `npm run dev`
- Edge: Caddy proxies API, Keycloak, MinIO
- Observability: optional `--profile observability` for Prometheus/Grafana

## Not yet integrated

- Genkit AI (`src/ai/genkit.ts`) — no flows in `src/ai/dev.ts`
- ~32 portal pages use in-component mock arrays instead of SDK
