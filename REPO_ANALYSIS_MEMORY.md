# Repository Analysis State — VeraLogix SecureConnect

## Current Analysis Phase & Progress

**Phase 4: Portal wiring + POPIA export — implemented.**  
Branch `main-phase4-portal-wiring-export-2176` stacked on Phase 3.

## Key Architectural Insights Discovered

- Live portals now include energy, EV (cmd+ten), vendor work-orders (~13 / ~31%).
- POPIA export worker archives JSON to MinIO (best-effort) + `files` row with sha256.
- Export package builder shared between HTTP route and worker (`lib/popia-export.ts`).

## Files Deeply Reviewed

- Phase 4: worker exports, seed energy/EV, cmd/ten/ven portal pages above

## Open Questions & Areas Needing Investigation

- Maintainer must **rotate Gemini API key**
- Admin branch protection still manual
- Land Phase 1–4 stack onto `main`

## Decisions Made & Rationale

- Export persists even if MinIO unavailable (metadata row) so CI/local still prove the path
- Vendor work-orders map to tickets CRUD (no separate WO table yet)

## Next Immediate Steps

1. Verify Phase 4 CI green
2. Merge #4 → #5 → #6 → Phase 4
3. Wire trustee overview/financials; integrations connectors; billing

## Module status (headline)

See [`docs/MODULE_STATUS.md`](docs/MODULE_STATUS.md).

## Patterns & Recurring Issues Noticed

- Soft cookie RBAC vs JWT still intentional for demos
- Trustee portal largely mock

## Session Log

- 2026-07-27 — Phases 1–3
- 2026-07-27 — Phase 4 portal wiring + export worker
