# Repository Analysis State — VeraLogix SecureConnect

## Current Analysis Phase & Progress

**Phase 3: Super features — implemented (PR pending CI).**  
Branch `main-phase3-super-features-2176` stacked on Phase 2.

## Key Architectural Insights Discovered

- AI copilots use POPIA redaction + heuristic fallback (no Gemini key required in CI); optional Gemini REST/Genkit when keyed.
- Evidence locker adds sha256 + scan_status; image-process worker runs heuristic malware policy.
- SLA check worker marks open tickets/incidents past deadline as `sla_breached`.
- Multi-tenant foundation: `tenants` + `tenant_subscriptions` + `sites.tenant_id`.
- Optional Expo scaffold lives in `apps/mobile/` outside npm workspaces.

## Files Deeply Reviewed

- Phase 3: `backend/src/lib/{ai-copilot,evidence,sla}.ts`, `modules/{ai,tenants}`, `worker.ts`, migration `0002_phase3.sql`
- `src/ai/flows/copilots.ts`, `apps/mobile/*`, incidents AI Summarize UI

## Open Questions & Areas Needing Investigation

- Maintainer must **rotate Gemini API key** (was in git history)
- Admin must apply branch protection checklist manually (API 403)
- Land Phase 1 → 2 → 3 stack onto `main`

## Decisions Made & Rationale

- Deterministic AI fallback so CI/evals work without secrets
- Expo app excluded from workspaces to keep hermetic `npm ci`
- Heuristic malware scan (not full sandbox) for Phase 3 MVP

## Next Immediate Steps

1. Merge Phase 1–3 stack (#4 → #5 → #6) onto `main`
2. Maintainer: rotate Gemini API key; enable branch protection
3. Continue wiring remaining mock portals; replace export stub; billing provider

## Module status (headline)

See [`docs/MODULE_STATUS.md`](docs/MODULE_STATUS.md) — refreshed 2026-07-27 after Phases 1–3.

## Patterns & Recurring Issues Noticed

- Soft cookie RBAC vs JWT still intentional for demos
- Mock arrays remain on trustee/vendor secondary pages

## Session Log

- 2026-07-24 — Comprehensive analysis
- 2026-07-27 — Phase 1 + Phase 2
- 2026-07-27 — Phase 3 AI/evidence/SLA/tenancy/mobile
