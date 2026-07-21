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
| `src/app/**/page.tsx` (other) | Portal UI — mostly mock data | Active (partial) |
| `src/backend/provider.tsx` | Auth session + SDK client | Active |
| `src/backend/hooks.ts` | `useCollection`, `useDoc` | Active |
| `src/middleware.ts` | Soft portal RBAC via cookie | Active |
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
| `backend/src/worker.ts` | BullMQ workers | Active |
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
| `.github/workflows/typecheck.yml` | Frontend + SDK typecheck | Active |
| `.github/workflows/ci-health.yml` | Aggregator / recommended required check | Active |
| `docs/ci.md` | Local CI parity + troubleshooting | Active |
| `docs/ci-failure-diagnosis.md` | 2026-07-21 failure diagnosis | Active |
| `docs/migration-firebase.md` | Migration guide | Active |
| `docs/blueprint.md` | Product/style blueprint | Active |
