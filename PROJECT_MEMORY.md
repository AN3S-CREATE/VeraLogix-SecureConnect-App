# PROJECT_MEMORY — VeraLogix SecureConnect

**Last Analysis:** 2026-07-13  
**Branch:** `main-self-hosted-firebase-replacement`  
**Analyst:** Codebase Intelligence Agent (first run)

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | VeraLogix SecureConnect™ |
| **Purpose** | Proactive autonomous security ecosystem & smart community platform for estates, property managers, security teams, residents, trustees, and vendors |
| **Target users** | Security agents (CMD), residents (TEN), trustees (TRU), vendors (VEN), estate managers |
| **Core value** | AI-assisted access control, incident response, maintenance workflows, POPIA-compliant data handling, unified multi-portal experience |
| **Stage** | Advanced prototype — production-grade backend scaffold; frontend mostly high-fidelity UI with mock data |

---

## Tech Stack & Architecture

```mermaid
graph TD
    A[Next.js 15 App Router :9002] --> B[@veralogix/secureconnect-sdk]
    B --> C[Fastify 5 API :3000]
    C --> D[PostgreSQL 16 + Drizzle]
    C --> E[Keycloak OIDC :8080]
    C --> F[MinIO S3 :9000]
    C --> G[Redis + BullMQ Workers]
    C --> H[WebSocket /ws + NOTIFY]
    I[Genkit / Gemini] -.->|not wired| A
```

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, Tailwind, shadcn/ui, Turbopack dev |
| API | Fastify 5, Zod, OpenAPI at `/docs` |
| Auth | Keycloak 26, JWT + refresh, dev bypass flag |
| DB | PostgreSQL 16, Drizzle ORM, SQL migrations |
| Realtime | Postgres LISTEN/NOTIFY → WebSocket gateway |
| Storage | MinIO presigned uploads |
| Jobs | BullMQ (email, POPIA deletion live; export/SLA/image stubs) |
| Edge | Caddy reverse proxy |
| Observability | Prometheus + Grafana (optional Docker profile) |
| AI | Genkit 1.20 + `googleai/gemini-2.5-flash` — scaffold only, no flows |

**Monorepo workspaces:** root (Next.js), `backend/`, `packages/sdk/`

---

## Current Feature & Module Status

### Backend API — **Largely complete (scaffold)**

| Module | Status | Notes |
|--------|--------|-------|
| Auth (login/register/refresh/logout/me/dev-session) | ✅ Working | Keycloak integration + `keycloak-admin.ts` |
| RBAC + site scoping | ✅ Working | `user_site_roles`, middleware `requireRoles` |
| CRUD: sites, units, doors, access-logs, passes, amenities, bookings, invoices, tickets, incidents, energy, ev-sessions | ✅ API ready | `crud-factory.ts` + `domain/routes.ts` |
| Door unlock + audit | ✅ Working | Creates access log, cache invalidation |
| Files (presign upload/download) | ✅ Working | MinIO |
| POPIA export + deletion | ✅ Partial | Export sync; deletion worker implemented; export job stub |
| Admin routes | ✅ Present | Users, audit, jobs, storage |
| Realtime WebSocket | ✅ Present | Subscribe by site + table |
| Workers | ⚠️ Partial | Email + deletion live; SLA/image/export stubs |
| Tests | ⚠️ Present, unverified locally | vitest unit/integration/e2e; CI workflow added |
| Redis cache | ✅ Added (staged) | `cache.ts` for doors |

### Frontend portals — **UI rich, data mostly mock**

| Portal | Pages | Live API (`useCollection`/`useDoc`) | Mock/hardcoded |
|--------|-------|-----------------------------------|----------------|
| **CMD** (Agent) | 11 | `/cmd/access` (doors, access-logs + realtime) | 10 pages |
| **TEN** (Resident) | 9 | `/ten/keys` (doors, access-logs) | 8 pages |
| **TRU** (Trustee) | 9 | — | 9 pages |
| **VEN** (Vendor) | 5 | — | 5 pages |
| **Templates** | 7 | — | demo templates |

**Auth/UI infrastructure:** `BackendClientProvider`, `useCollection`, `useDoc`, `PrototypeSeeder`, soft portal RBAC via `sc_role` cookie in `middleware.ts`

### Seed / demo data

- `npm run db:seed` creates demo estate, admin user, 3 doors, access logs, amenity, pass
- Keycloak realm export with demo users per `backend/README.md`
- Client `PrototypeSeeder` creates doors if empty (admin/agent only)

---

## History & Evolution

| When | Event |
|------|-------|
| Early | Firebase Studio prototype (Firestore, App Hosting) |
| `dffd431` | Initialize SecureConnect architecture + prototype |
| `102c3e6` | **Major:** Replace Firebase with self-hosted Fastify/Keycloak/Postgres/MinIO stack |
| `e68c5fe` (staged) | Cache layer, Keycloak admin, backend CI, eslint — **includes `.env` staged (security risk)** |
| README roadmap | UI scaffolding ✅, backend ✅, auth cutover partial ✅, portal wiring ❌, Genkit ❌, 85% test coverage ❌ |

**Abandoned / legacy artifacts:** `firestore.rules`, `apphosting.yaml`, Firebase references in `.agents/` skills, stale `firebase` entries in `package-lock.json`

---

## Known Constraints, Decisions & Trade-offs

1. **Demo-first UX:** Unauthenticated portal browsing allowed; API enforces auth on data (`middleware.ts` comment)
2. **Dev auth bypass:** `DEV_AUTH_BYPASS` / `NEXT_PUBLIC_DEV_AUTH_BYPASS` for local demos without Keycloak
3. **Soft frontend RBAC:** Cookie `sc_role` from login profile picker — not cryptographically bound to JWT
4. **Self-hosted over Firebase:** Full control, POPIA alignment, no vendor lock-in
5. **CRUD factory pattern:** Rapid API surface; less domain-specific business logic per entity
6. **Google Drive workspace:** `npm install` shows EPERM/tar errors — local dev friction on synced drives

---

## Open Questions & Ambiguities

1. **Target deployment:** VPS + Docker Compose vs cloud K8s? `apphosting.yaml` suggests legacy Firebase path unused
2. **Mobile/PWA:** Blueprint mentions React Native + Expo — not in repo; web-only for now?
3. **Genkit priority:** Required for v1 or optional enhancement?
4. **Evidence locker:** Blueprint mentions malware scanning/watermarking — not implemented
5. **`.env` in git:** Staged commit includes root `.env` with API keys — intentional or mistake?
5. **Memory file location:** Using `PROJECT_MEMORY.md` (this file) unless user prefers `docs/PROJECT_KNOWLEDGE.md`

---

## Security Posture (summary)

| Issue | Severity | Evidence |
|-------|----------|----------|
| `.env` staged for commit with `GEMINI_API_KEY` | **Critical** | `git status`, `.env` present |
| `.gitignore` does not ignore `.env` (only `.env*.local`) | **High** | `.gitignore` L29 |
| `DEV_AUTH_BYPASS=true` in root `.env` and Docker API service | **High** (prod risk) | `.env.example`, `docker-compose.yml` |
| JWT in `localStorage` | Medium | `provider.tsx` |
| Demo credentials in README | Low (expected for demo) | `README.md` |
| Portal RBAC via spoofable cookie | Medium | `middleware.ts` |

---

## Gap Summary (Current → Target)

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| Portal data wiring | 2/34 pages on API | All entity pages on CRUD + realtime | P0 |
| AI agents | Genkit init only | Incident summary, maintenance prediction flows | P2 |
| Test coverage | Unit tests exist; coverage goal unmet | ≥85% backend modules | P1 |
| Production hardening | Dev bypass, no TLS docs complete | Caddy TLS, bypass off, secrets managed | P0 |
| Legacy cleanup | firestore.rules, apphosting.yaml | Remove or archive | P2 |
| Mobile app | Not started | RN/Expo per blueprint | P3 |

---

## Next Immediate Steps

1. **Security:** Unstage `.env`, add `.env` to `.gitignore`, rotate exposed `GEMINI_API_KEY`
2. **Wire P0 portals:** passes, tickets, incidents, invoices (API already exists)
3. **Verify backend:** `npm install` + `npm run test:api` (fix Google Drive install issues if needed)
4. **Commit staged backend work** without secrets
5. **Implement first Genkit flow** (incident summarization) if AI is in scope

---

## Session Log

- **2026-07-13** — First full intelligence pass. Created `PROJECT_MEMORY.md` and `.index/`. Health score: **6.2/10**.
