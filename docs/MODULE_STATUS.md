# Module status (headline) — refreshed 2026-07-27

> Replaces the pre–Phase 1–3 snapshot from the comprehensive analysis.

**Stack note:** Phases 1–3 live on draft PRs #4 → #5 → #6 (not yet merged to `main`). Scores below describe the Phase 3 tip.

| Layer | Status | Notes |
|---|---|---|
| **Backend** | **~92%** MVP scaffold | CRUD×12 + unlock; auth (incl. `dev-bypass` sentinel); files + evidence finalize/verify/attach; admin; POPIA (transactional deletion); AI copilots; tenants; realtime Redis fanout; metrics. Workers: email + deletion live; **image-process + SLA live (heuristics)**; export still acknowledge-only. |
| **Frontend** | UI ~78%; **data wiring ~22% live** | Live: access, incidents (+ AI Summarize), keys, passes, maintenance×2, invoices×2, amenities (~9 pages). Remaining portals still mock. BFF httpOnly auth cookies. |
| **AI** | **MVP copilots** | POPIA redaction + heuristic summary/triage always; optional Gemini; Genkit flows for `genkit:dev`. Not full agent OS. |
| **CI** | **Complete / green** | Typecheck, Frontend Build, Backend CI, Backend Integration (Postgres+Redis e2e), CI Health. |
| **Build** | **Fixed** (on Phase 1+) | `next build` with `NODE_ENV=production` gated in Frontend Build workflow. |
| **Secrets** | **Mitigated; rotation still required** | Root `.env` untracked; CI asserts hygiene. **Gemini key must still be rotated** (was in git history). |

## One-line headline

**Backend ~92% (CRUD+auth+files+admin+POPIA+AI+tenants; export stub remains). Frontend UI ~78%; live data ~22% (9 portals). AI: MVP copilots. CI green; production build fixed; secrets mitigated — rotate Gemini key.**
