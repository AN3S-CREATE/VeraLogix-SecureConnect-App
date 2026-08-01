# File Inventory — VeraLogix SecureConnect

*Status: Active | Deprecated | Dead | Experimental | Generated*

## Root

| Path | Purpose | Status |
|------|---------|--------|
| `package.json` | Next.js app + workspace scripts | Active |
| `PROJECT_MEMORY.md` | Agent project intelligence state | Active |
| `.env.example` | Frontend public env template | Active |
| `.env` | Local secrets (**must not commit**) | Active |
| `README.md` | Product docs, quick start, roadmap | Active |
| `docker/docker-compose.yml` | Full self-hosted stack | Active |
| `firestore.rules` | Legacy Firebase rules | Dead |
| `apphosting.yaml` | Legacy Firebase App Hosting | Dead |

## Frontend (`src/`)

| Path | Purpose | Status |
|------|---------|--------|
| `src/app/layout.tsx` | Root layout + `BackendClientProvider` | Active |
| `src/app/cmd/access/page.tsx` | Live doors + access logs | Active |
| `src/app/ten/keys/page.tsx` | Live keys + access history | Active |
| `src/app/**/page.tsx` (other) | Portal UI — ~19 live; remaining mock | Active (partial) |
| `src/lib/portal-kpis.ts` | Shared invoice/ticket/incident/energy/EV KPIs + report pack builder | Active |
| `src/app/tru/overview/page.tsx` | Live trustee overview KPIs | Active |
| `src/app/tru/financials/page.tsx` | Live financials + aging | Active |
| `src/app/tru/security/page.tsx` | Live incidents + access logs | Active |
| `src/app/tru/energy/page.tsx` | Live energy + EV oversight | Active |
| `src/app/ven/dashboard/page.tsx` | Live tickets/passes + access request | Active |
| `src/app/cmd/reports/page.tsx` | Live report builder + JSON pack export | Active |
| `src/backend/provider.tsx` | Auth session + SDK client (BFF cookies, in-memory token) | Active |
| `src/backend/hooks.ts` | `useCollection`, `useDoc` | Active |
| `src/middleware.ts` | Soft portal RBAC via cookie | Active |
| `src/lib/auth-cookies.ts` | httpOnly session cookie helpers for BFF | Active |
| `src/app/api/auth/*/route.ts` | BFF login / dev-session / logout / session | Active |
| `src/ai/genkit.ts` | Genkit + Gemini model init | Experimental |
| `src/ai/dev.ts` | Genkit dev entry (empty) | Experimental |
| `src/components/prototype-seeder.tsx` | Client fallback door seed | Active |

## Backend (`backend/`)

| Path | Purpose | Status |
|------|---------|--------|
| `backend/src/app.ts` | Fastify app assembly | Active |
| `backend/src/modules/domain/routes.ts` | All domain CRUD + unlock | Active |
| `backend/src/modules/auth/routes.ts` | Keycloak auth routes | Active |
| `backend/src/modules/popia/routes.ts` | POPIA export/deletion | Active |
| `backend/src/modules/ai/routes.ts` | Incident summary + maintenance triage copilots | Active |
| `backend/src/modules/tenants/routes.ts` | Multi-tenant admin CRUD | Active |
| `backend/src/lib/ai-copilot.ts` | POPIA redaction + heuristic copilots | Active |
| `backend/src/lib/evidence.ts` | Hash + heuristic malware scan helpers | Active |
| `backend/src/lib/sla.ts` | SLA breach planner | Active |
| `backend/src/db/migrations/0002_phase3.sql` | Evidence + tenants schema | Active |
| `apps/mobile/**` | Optional Expo resident scaffold | Experimental |
| `backend/src/worker.ts` | BullMQ workers (transactional POPIA deletion) | Active |
| `backend/src/realtime/gateway.ts` | WS + Redis realtime fanout | Active |
| `backend/src/observability/metrics.ts` | In-process Prometheus metrics | Active |
| `backend/src/db/migrations/0001_init.sql` | Core schema | Active |
| `backend/src/db/seed.ts` | Demo data seed | Active |
| `backend/tests/**` | vitest unit/integration/e2e | Active |

## Packages

| Path | Purpose | Status |
|------|---------|--------|
| `packages/sdk/src/index.ts` | `SecureConnectClient` SDK | Active |

## CI / Docs

| Path | Purpose | Status |
|------|---------|--------|
| `.github/workflows/backend-ci.yml` | Backend typecheck, unit tests, coverage | Active |
| `.github/workflows/backend-integration.yml` | Postgres+Redis integration/e2e | Active |
| `.github/workflows/typecheck.yml` | Frontend + SDK typecheck | Active |
| `.github/workflows/ci-health.yml` | Aggregator / recommended required check | Active |
| `.github/workflows/frontend-build.yml` | Production `next build` gate | Active |
| `docs/ci.md` | Local CI parity + troubleshooting | Active |
| `docs/phase2/README.md` | Phase 2 delivery notes | Active |
| `docs/phase4/README.md` | Phase 4 delivery notes | Active |
| `docs/phase5/README.md` | Phase 5 trustee + reports notes | Active |
| `docs/MODULE_STATUS.md` | Headline module status | Active |
| `backend/tests/unit/phase5-contract.test.ts` | Phase 5 wiring contracts | Active |
| `docs/secrets.md` | Secret rotation + local env hygiene | Active |
| `docs/branch-protection-checklist.md` | Admin steps for required checks | Active |
| `docs/ci-failure-diagnosis.md` | 2026-07-21 failure diagnosis | Active |
| `docs/migration-firebase.md` | Migration guide | Active |
| `docs/blueprint.md` | Product/style blueprint | Active |
