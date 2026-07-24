# VeraLogix SecureConnect™ — Comprehensive Repository Analysis & Super-App Elevation Roadmap

**Analysis date:** 2026-07-24  
**Repository:** `AN3S-CREATE/VeraLogix-SecureConnect-App`  
**Analyzed revision:** `main` @ `c502375`  
**Workspace:** `/workspace`  
**Analyst role:** Senior software architect / code quality auditor / AI systems / product strategy  

---

## 1. Executive Summary

**Overall health score: 64 / 100**

VeraLogix SecureConnect is a **high-fidelity multi-portal security/community platform prototype** with a **production-shaped self-hosted backend** (Fastify + Keycloak + Postgres + MinIO + Redis/BullMQ) and a **polished Next.js 15 UI**. It is **not yet a production SaaS**: most portal pages still use mock data, Genkit AI has no flows, production `next build` fails, Docker was unavailable in this environment so live API journeys could not be fully exercised, and a **Google API key remains tracked in git**.

| Dimension | Score | Notes |
|---|---|---|
| Backend API completeness | 82 | Full CRUD surface, auth, POPIA, files, realtime; worker stubs remain |
| Frontend UX polish | 78 | Rich portals, layouts, shadcn UI; demo-first |
| Frontend↔API integration | 28 | **4 / 42** pages live (`access`, `incidents`, `keys`, `passes`) |
| AI capability | 8 | Genkit init only; `src/ai/dev.ts` empty |
| Testing | 45 | Unit 15/15 pass; integration/e2e gated & mostly placeholders; coverage scoped narrowly |
| CI/CD | 85 | Typecheck, Backend CI, CI Health green on `main` |
| Security / POPIA | 40 | POPIA routes exist; `.env` with `GEMINI_API_KEY` **committed**; soft cookie RBAC |
| Deployability | 35 | Compose stack exists; **`next build` fails**; no Docker in this runner |

### Key strengths

1. Coherent self-hosted architecture replacing Firebase with clear module boundaries.
2. OpenAPI/Swagger, Zod validation, rate limits, audit hashing, POPIA export/deletion planner.
3. Working SDK + React hooks (`useCollection` / realtime subscribe) proven on 4 pages.
4. Stabilized GitHub Actions (`docs/ci.md`); tip of `main` green.
5. High-quality portal UX scaffolding across CMD / TEN / TRU / VEN.

### Critical gaps

1. **Secret in git:** root `.env` tracked; `GEMINI_API_KEY` length 39, prefix `AIza…` — **rotate immediately**.
2. **`next build` broken** (`<Html>` / `/404` prerender) — not production-shippable as a static/SSR artifact.
3. **~90% of portal pages still mock** despite API readiness.
4. **No Docker in analysis environment** → full-stack e2e untestable here; integration tests skip without `RUN_INTEGRATION=1`.
5. **AI promised, not delivered** — Genkit scaffold only.

### Top 5 recommendations

1. **P0 security:** remove `.env` from git history tracking, rotate Gemini key, enforce ignore, disable prod `DEV_AUTH_BYPASS`.
2. **P0 build:** fix Next.js production build failure; stop ignoring TS/ESLint on build.
3. **P0 product:** wire tickets, invoices, amenities/bookings, audit to existing CRUD + realtime.
4. **P1 quality:** enable Docker-based integration CI; raise real coverage beyond lib helpers.
5. **P2 differentiation:** first Genkit flows (incident summary, maintenance triage) with eval harness + POPIA-safe prompts.

---

## 2. Project Overview & Detected Tech Stack

| Layer | Technology | Evidence |
|---|---|---|
| Frontend | Next.js **15.3.8**, React 18, Turbopack, App Router, Tailwind, Radix/shadcn, Recharts | `package.json`, `src/app/**` |
| Client SDK | `@veralogix/secureconnect-sdk` (workspace) | `packages/sdk/src/index.ts` |
| API | Fastify 5, Zod type provider, OpenAPI `/docs`, Helmet, CORS, rate-limit, WS | `backend/src/app.ts` |
| Auth | Keycloak OIDC, `jose` JWKS, optional `DEV_AUTH_BYPASS` | `backend/src/middleware/auth.ts`, `modules/auth/routes.ts` |
| Data | PostgreSQL + Drizzle; SQL migration `0001_init.sql` | `backend/src/db/*` |
| Cache / jobs | Redis, BullMQ (email + deletion live; export/image/SLA stubs) | `backend/src/worker.ts`, `jobs/queues.ts` |
| Storage | MinIO / S3 presigned URLs | `backend/src/storage/minio.ts`, `modules/files` |
| Realtime | Postgres NOTIFY → WebSocket `/ws` | `backend/src/realtime/gateway.ts` |
| AI | Genkit 1.20 + `googleai/gemini-2.5-flash` — **no flows** | `src/ai/genkit.ts`, empty `src/ai/dev.ts` |
| Edge / ops | Docker Compose, Caddy, optional Prometheus/Grafana | `docker/docker-compose.yml` |
| CI | GitHub Actions: Typecheck, Backend CI, CI Health | `.github/workflows/*` |
| Tests | Vitest unit (default); integration/e2e opt-in | `backend/vitest*.ts` |

**Product identity:** Multi-portal estate security & community ops (Agent CMD, Resident TEN, Trustee TRU, Vendor VEN) with POPIA-oriented data controls (South Africa).

---

## 3. Directory Structure & High-Level Architecture

### 3.1 Tree summary (~220 tracked source files excluding `node_modules` / `.git`)

```
/
├── .agents/                 # Agent skills (Genkit, Firebase Studio export)
├── .github/workflows/       # typecheck, backend-ci, ci-health
├── .index/                  # Agent context store
├── assets/                  # Brand logo
├── backend/                 # Fastify API workspace
│   ├── src/{app,index,worker,config,db,lib,middleware,modules,realtime,storage,jobs}
│   └── tests/{unit,integration,e2e}
├── docker/                  # Compose + Keycloak realm + Caddy + observability
├── docs/                    # Blueprint, migration, CI docs, screenshots
├── packages/sdk/            # Browser/API client
├── src/                     # Next.js app
│   ├── ai/                  # Genkit scaffold
│   ├── app/{cmd,ten,tru,ven,templates}
│   ├── backend/             # Provider + hooks
│   ├── components/{agent,auth,ui}
│   └── middleware.ts
├── package.json             # Workspaces: backend, packages/sdk
└── REPO_ANALYSIS_MEMORY.md / PROJECT_MEMORY.md
```

### 3.2 Runtime architecture

```
Browser (Next :9002)
  └─ SecureConnectClient (SDK) ──REST/WS──▶ Fastify API (:3000)
                                              ├─ Keycloak (:8080)
                                              ├─ Postgres (:5432) + NOTIFY
                                              ├─ Redis (:6379) + BullMQ worker
                                              └─ MinIO (:9000)
```

Caddy can front API/Keycloak/MinIO in Compose. Observability is optional (`--profile observability`).

---

## 4. Detailed Findings by Module/File

Status legend: **Complete** | **Partial (n%)** | **Stub** | **Broken** | **Dead** | **Experimental**

### 4.1 Root & tooling

| Path | Purpose | Status | Quality / notes |
|---|---|---|---|
| `package.json` | Workspace scripts | Complete | Good monorepo scripts; no root test script for frontend |
| `package-lock.json` | Lockfile | Complete | Hermetic `npm ci` works post-CI fix |
| `tsconfig.json` | Frontend TS | Complete | Correctly excludes `backend/` |
| `next.config.ts` | Next config | Partial | **`ignoreBuildErrors` / `ignoreDuringBuilds`** hide quality issues |
| `.env` | Local secrets | **Broken / Critical** | **Tracked in git** despite `.gitignore`; contains `GEMINI_API_KEY` |
| `.env.example` | Frontend env template | Complete | OK |
| `.gitignore` | Ignores | Partial | Lists `.env` but file already tracked |
| `firestore.rules` | Legacy Firebase | Dead | Remove/archive |
| `README.md` | Product docs | Complete | Strong marketing + quick start |
| `CONTRIBUTING.md` / `LICENSE` | Community | Complete | — |
| `PROJECT_MEMORY.md` | Prior agent intel | Active | Slightly stale (said 2 live pages; now 4) |
| `components.json` | shadcn config | Complete | — |
| `studio.json` / `metadata.json` | Studio metadata | Partial | Legacy Firebase Studio residue |
| `.idx/dev.nix` | Nix/IDX | Experimental | Cloud IDE |

### 4.2 CI / docs

| Path | Status | Notes |
|---|---|---|
| `.github/workflows/{typecheck,backend-ci,ci-health}.yml` | Complete | Green on `main` |
| `docs/ci.md`, `ci-success-report.md`, `ci-failure-diagnosis.md` | Complete | Good operator docs |
| `docs/migration-firebase.md` | Complete | Cutover map |
| `docs/blueprint.md` | Partial | Vision includes RN/Expo, evidence locker — not built |
| `docs/screenshots/*` | Complete | Marketing assets |

### 4.3 Frontend (`src/`)

| Area | Status | Evidence |
|---|---|---|
| `src/app/layout.tsx` + portals layouts | Complete | Sidebar shells, offline indicator |
| Login (`page.tsx` + `login-form.tsx`) | Partial (75%) | Login/dev/SSO UI; needs live Keycloak for full path |
| Live pages: `cmd/access`, `cmd/incidents`, `ten/keys`, `ten/passes` | Complete for MVP slice | `useCollection` + mutations |
| Other CMD/TEN/TRU/VEN pages (~30) | Partial (UI 85% / data 0%) | Hardcoded arrays |
| Templates (7) | Complete as design system demos | Not product features |
| `src/backend/provider.tsx` + `hooks.ts` | Complete | Tokens in `localStorage`; soft offline |
| `src/middleware.ts` | Partial | Spoofable `sc_role` cookie; intentional demo-first |
| `src/ai/*` | Experimental / Stub | Init only; no `defineFlow` |
| `src/components/ui/*` (40+) | Complete | shadcn quality |
| `prototype-seeder.tsx` | Complete | Seeds demo door when empty |

**Live vs mock (pages):** 4 live / 42 total `page.tsx` ≈ **9.5% API-wired**.

### 4.4 Backend (`backend/`)

| Module | Status | Notes |
|---|---|---|
| `app.ts` assembly | Complete | Helmet (CSP off), CORS, rate limit, Swagger, error handler |
| Auth routes | Partial (85%) | Login/register/refresh/me/consent/dev-session; magic-link emails stub note |
| Domain CRUD + unlock | Complete (scaffold) | 12 resources via factory; unlock + users/roles extras |
| Files | Partial (80%) | Presign up/down; quota check weak vs S3 PUT |
| Admin | Complete | Users, audit, storage, jobs, deletion requests |
| POPIA | Partial (75%) | Export + deletion request; worker non-transactional |
| Realtime gateway | Complete (single-node) | In-memory fanout; sticky sessions needed to scale |
| Worker | Partial (40%) | Email + deletion; **export / image / SLA stubs** |
| `crud-factory.ts` | Partial | Loose `any`; app-layer multi-site filter |
| `env.ts` | Complete | Zod; **no dotenv loader** — local API needs exported env |
| Unit tests | Complete for scoped libs | 15 passing |
| Integration/e2e | Stub unless env flags | Placeholders always pass |

### 4.5 SDK (`packages/sdk`)

| Item | Status |
|---|---|
| Auth, CRUD, unlock, files, subscribe | Complete |
| Types / ApiError | Complete |

### 4.6 Docker

| Item | Status |
|---|---|
| Full Compose topology | Complete as config |
| Demo secrets in compose/realm | Expected for local; **unsafe if copied to prod** |
| `DEV_AUTH_BYPASS=true` + `NODE_ENV=production` on API service | Confusing / risky drift |
| Entrypoint `migrate \|\| true` | Masks migration failure |

---

## 5. Real App Actions & Functionality Test Results

### 5.1 Environment limitations

| Capability | Available? |
|---|---|
| Node 22 / npm 10 | Yes |
| `npm ci` | Yes (1448 packages) |
| Docker / Compose | **No** (`docker: command not found`) |
| Postgres / Redis / Keycloak / MinIO | **No** (nothing on localhost) |
| Browser MCP deep UI click-through | Not used this run; HTTP smoke only |

### 5.2 Commands executed & outcomes

| Action | Result | Evidence |
|---|---|---|
| `npm ci` | **PASS** | Clean install |
| `npm run typecheck` (frontend+SDK) | **PASS** | exit 0 |
| `npm run typecheck --workspace=api` | **PASS** | exit 0 |
| `npm test` (unit) | **PASS** | 4 files, **15 tests** |
| `npm run test:coverage` | **PASS** | ~82.6% on **scoped** lib files only |
| `npm run test:integration` | **PASS (hollow)** | 1 placeholder; 3 skipped (`RUN_INTEGRATION` unset) |
| `npm run test:e2e` | **PASS (hollow)** | 1 placeholder; 2 skipped |
| `npm run lint` | **BLOCKED** | Interactive ESLint setup prompt — **no root ESLint config** |
| `npm run build` | **FAIL** | `/404` prerender: `<Html> should not be imported outside of pages/_document` (exit 1) |
| `npm run dev` (Next :9002) | **PASS** | Homepage HTTP 200 |
| Portal HTTP smoke (`/cmd`, `/ten/*`, `/tru/*`, `/ven/*`, templates) | **PASS (SSR/UI)** | All sampled routes **200** |
| Live page `/cmd/access` without API | **PARTIAL** | Renders shell; client shows error markers when API down |
| `npm run dev:api` without env | **FAIL** | Zod: missing DATABASE_URL / REDIS / Keycloak / MinIO |
| API with sourced `backend/.env` | **FAIL** | Env OK → **`ECONNREFUSED :5432`** on realtime/DB connect |
| Genkit flows | **UNTESTABLE** | No flows defined |
| Door unlock / login / POPIA E2E | **UNTESTABLE here** | Requires Compose stack |

### 5.3 Verdict: is this a real working app?

**Yes, as a dual-mode prototype:**

- **UI demo mode:** Real — portals load, navigation works, mock workflows feel complete.
- **Integrated product mode:** **Early MVP slice only** — access control + incidents + visitor passes can be real when the Docker stack is up; most value journeys (maintenance, invoices, trustee finance, vendor WO, AI) are still **scaffolding**.

**Delivering core promised value today?** Partially. The **backend can deliver** core estate ops APIs; the **frontend mostly does not consume them**. Without Docker in CI/dev, “works on my machine” risk remains for full journeys.

---

## 6. Completeness Matrix & Gap Analysis

| Feature / module | State | Notes |
|---|---|---|
| Multi-portal UI shells | **Done** | CMD/TEN/TRU/VEN + templates |
| Login / role routing UI | **In progress** | Soft cookie RBAC |
| Keycloak realm + API auth | **Done** (config) | Needs running Keycloak to prove |
| Domain CRUD API | **Done** | Factory pattern |
| Door unlock + access logs | **Done** (API + 2 UIs) | |
| Incidents UI↔API | **Done** | |
| Visitor passes UI↔API | **Done** | |
| Tickets / maintenance UI | **Not started** (API ready) | Mock pages |
| Invoices UI | **Not started** (API ready) | Mock |
| Amenities / bookings UI | **Not started** | Mock |
| Trustee financials / audit live | **Not started** | Mock; audit API exists |
| Vendor work orders live | **Not started** | Mock; tickets API exists |
| Files / evidence locker | **In progress** | Presign only; no malware/watermark |
| POPIA export / deletion | **In progress** | Worker partial; no UI |
| Realtime WS | **Done** (backend) | Used on live collection hooks |
| BullMQ email/deletion | **Done** | |
| BullMQ export/image/SLA | **Not started** | Stubs |
| Genkit AI flows | **Not started** | Scaffold |
| Mobile / RN Expo | **Not started** | Blueprint only |
| Frontend unit/E2E tests | **Not started** | |
| Production Next build | **Blocked** | Build failure |
| Secrets hygiene | **Blocked** | `.env` in git |
| Branch protection required checks | **In progress** | Documented; admin must click |

**Overall:** Functional **UI prototype + backend MVP**, with a **thin integrated spine** (access/incidents/passes). Health: advanced prototype, not production SaaS.

---

## 7. Issues, Bugs & Technical Debt (Prioritized)

| Pri | Issue | Evidence | Suggested fix |
|---|---|---|---|
| **Critical** | `GEMINI_API_KEY` committed in tracked `.env` | `git ls-files .env`; key prefix `AIza`, len 39 | Rotate key; `git rm --cached .env`; purge history if public; confirm ignore |
| **Critical** | `next build` fails on `/404` Html import | Build log 2026-07-24 | Isolate dependency pulling `next/document`; fix App Router error pages; verify clean `NODE_ENV=production` build |
| **High** | Most portals mock despite API | 4/42 live pages | Systematic wiring backlog (tickets, invoices, amenities, audit) |
| **High** | Compose: `NODE_ENV=production` + `DEV_AUTH_BYPASS=true` | `docker-compose.yml` | Bypass off in prod; separate compose overrides |
| **High** | No root ESLint; `next lint` interactive | Lint prompt | Commit `eslint.config` / Next ESLint; wire CI lint job |
| **High** | Build ignores TS & ESLint errors | `next.config.ts` | Turn off ignores once build is green |
| **High** | Integration/e2e not in CI | Vitest skipUnless flags | Compose service in GHA or Testcontainers job |
| **Medium** | JWT audience not verified | `middleware/auth.ts` | Validate `aud` / client |
| **Medium** | Soft `sc_role` cookie RBAC | `middleware.ts` | Derive portal access from JWT claims server-side |
| **Medium** | Tokens in `localStorage` | `provider.tsx` | Prefer httpOnly secure cookies / BFF |
| **Medium** | CRUD multi-site filter in app memory | `crud-factory.ts` | SQL `IN (siteIds)` |
| **Medium** | POPIA deletion non-transactional | `worker.ts` | Single DB transaction / saga with idempotency |
| **Medium** | File row before upload; filename length mismatch | `files/routes.ts` | Two-phase upload confirm; align varchar |
| **Medium** | Worker stubs still advertised | `worker.ts` | Implement or hide from admin/product |
| **Medium** | Backend no dotenv | `env.ts` | `dotenv/config` in local entrypoints |
| **Low** | `firestore.rules` dead | Repo root | Archive |
| **Low** | Coverage thresholds only on libs | `vitest.config.ts` | Expand tests before widening include |
| **Low** | Redis ECONNREFUSED noise in unit tests | cache tests | Mock Redis client fully |

---

## 8. Prioritized Next Steps for the Build

1. **Security hotfix (0.5–1 day):** remove tracked `.env`, rotate Gemini key, audit git history, ensure CI secret scanning.
2. **Unblock `next build` (1–2 days):** fix Html/404 prerender; add CI job `npm run build`.
3. **Local DX (0.5 day):** auto-load `backend/.env`; document Compose-required path; smoke script `scripts/smoke.sh`.
4. **Wire P0 pages (3–5 days):** maintenance/tickets (CMD+TEN), invoices (CMD+VEN), amenities/bookings (TEN), audit (TRU) using existing SDK hooks.
5. **Auth hardening (2–3 days):** JWT audience, cookie session option, disable bypass in Compose prod profile.
6. **Integration CI (2–3 days):** GitHub service containers or Testcontainers; turn on `RUN_INTEGRATION=1` path.
7. **First Genkit flow (2–4 days):** incident summarization with redaction; eval fixtures; no PII to third parties without consent.
8. **POPIA UI (2 days):** resident/admin export + deletion request screens calling existing endpoints.
9. **Legacy cleanup (0.5 day):** archive `firestore.rules`, studio leftovers.
10. **Branch protection (admin, 15 min):** require CI Health + Typecheck (+ Backend when applicable).

---

## 9. Strategic AI & Technical Recommendations

### Architecture & design

- Introduce a thin **BFF / server actions** layer for auth cookies instead of browser-held JWTs.
- Split **read models** (list dashboards) from CRUD factory for hot paths (access logs, invoices).
- Plan **Redis pub/sub fanout** for websocket horizontal scale (README already notes sticky sessions).
- Feature flags for mock vs live data during cutover.

### Code quality & maintainability

- Enable strict CI: typecheck (done) + lint + build + unit + integration.
- Replace `any` in CRUD factory with typed table helpers.
- Target backend coverage ≥70% on `modules/**` before claiming production readiness (today’s 82% is on a narrow include list).

### AI-specific

- Implement flows: `summarizeIncident`, `draftMaintenanceReply`, `anomalyHint` with structured Zod output.
- POPIA: minimize PII in prompts; prefer on-prem/VPC models later; log prompt hashes not raw bodies.
- Add eval set (10–20 golden incidents) and regression in CI (offline fixtures).
- Keep Genkit optional — product value is ops workflows first.

### Security & POPIA

- Treat estates’ access logs, IDs, invoices as personal information under **POPIA**.
- Encrypt backups; retention policies; DSR (export/delete) already partially modeled — finish UI + transactional deletion.
- Secrets only via env/secret manager; never commit.
- Rate-limit auth (exists) + lockout/monitoring.

### Performance & observability

- Use existing `/health/*` + `/metrics`; wire Grafana dashboards for p95 latency, WS clients, queue depth.
- Add OpenTelemetry traces on CRUD + unlock.

### Testing

- Frontend: Playwright journeys — login → unlock door → create pass → create incident.
- Contract tests between SDK types and OpenAPI.
- Chaos: Redis down (cache already degrades), MinIO down.

---

## 10. Vision & Phased Roadmap to Super-Level App

### What “super level” looks like

A **POPIA-ready multi-tenant estate OS**: every portal screen live on shared truth; sub-second realtime door/incident updates; AI copilots that summarize incidents and predict maintenance without leaking PII; evidence locker with integrity hashing + malware scan; mobile resident app; SLA-backed vendor workflows; enterprise SSO; audited financials for trustees; one-click deploy with blue/green and observability.

### Phase 1 — Stabilize & complete core MVP

- Secrets hygiene; green `next build`; Compose-verified unlock/pass/incident journeys.
- Wire tickets + invoices + amenities.
- Required branch protection.
- **Success:** Demo estate runs entirely without mock arrays for P0 entities; build+CI green.

### Phase 2 — Polish, test, scale foundations

- Integration/E2E in CI; coverage expansion; BFF auth cookies; transactional POPIA deletion; Redis fanout design; lint/type gates enforced on build.
- **Success:** Staging deploy via Compose/Caddy TLS; p95 API < 200ms on list endpoints; zero critical secrets in repo.

### Phase 3 — Super features & differentiation

- Genkit copilots with evals; evidence locker hardening; trustee analytics from live data; vendor SLA automation (replace stubs); optional RN/Expo; multi-estate tenancy billing; marketplace connectors (from Integrations mock → real).
- **Success:** Paying pilot estates; measurable MTTR reduction; POPIA DSR SLA met.

### Effort / impact (selected)

| Item | Impact | Effort |
|---|---|---|
| Remove secrets / rotate key | Critical | Low |
| Fix `next build` | Critical | Medium |
| Wire tickets/invoices | High | Medium |
| Integration CI | High | Medium |
| Genkit incident summary | Medium | Medium |
| Mobile app | High | High |
| Evidence malware scan | Medium | High |

---

## 11. Conclusion & Immediate Action Plan

SecureConnect is a **credible platform bet**: backend architecture is serious; UI is persuasive; CI is finally healthy. It is still a **prototype-leaning MVP** because the product surface is mostly disconnected from the API, AI is absent, production build fails, and secret hygiene is violated.

### Do this week

1. Rotate `GEMINI_API_KEY`; stop tracking `.env`.
2. Fix `next build`; add build to CI.
3. Run full `docker compose` locally; prove login → unlock → pass → incident.
4. Wire maintenance tickets UI to `/api/v1/tickets`.
5. Admin: enable required status checks on `main`.

### This is / is not

- **Is:** Working demo UI + substantial API/backend + thin live integrations + green CI.
- **Is not yet:** Production SaaS, complete POPIA product, AI-powered security OS, or fully tested stack.

---

## Appendix

### A. Key file references

- API assembly: `backend/src/app.ts`
- Auth: `backend/src/middleware/auth.ts`, `backend/src/modules/auth/routes.ts`
- Domain: `backend/src/modules/domain/routes.ts`
- SDK: `packages/sdk/src/index.ts`
- Live UIs: `src/app/cmd/access/page.tsx`, `src/app/cmd/incidents/page.tsx`, `src/app/ten/keys/page.tsx`, `src/app/ten/passes/page.tsx`
- AI scaffold: `src/ai/genkit.ts`, `src/ai/dev.ts`
- Compose: `docker/docker-compose.yml`
- CI: `docs/ci.md`

### B. Analysis commands used

```bash
find . -path ./node_modules -prune -o -path ./.git -prune -o -print
npm ci
npm run typecheck && npm run typecheck --workspace=@veralogix/secureconnect-api
npm test --workspace=@veralogix/secureconnect-api
npm run test:coverage --workspace=@veralogix/secureconnect-api
npm run test:integration --workspace=@veralogix/secureconnect-api
npm run test:e2e --workspace=@veralogix/secureconnect-api
npm run build   # FAIL
npm run dev     # PASS :9002
curl portal routes
# API attempted; Docker unavailable → Postgres ECONNREFUSED
gh run list --branch main --limit 5
```

### C. Limitations

- No Docker → no live Keycloak/Postgres/MinIO/Redis → no authenticated API journey proof in this environment.
- No interactive browser automation run for click-level UX validation.
- Did not rewrite git history (destructive); secret rotation must be done by maintainers.
- Deep every-line review of all 40+ shadcn UI primitives summarized as Complete rather than line-audited.

### D. Related prior artifacts

- `PROJECT_MEMORY.md` (2026-07-13 intelligence)
- `docs/ci-failure-diagnosis.md` / `docs/ci-success-report.md`
- `.index/*` architecture inventory
