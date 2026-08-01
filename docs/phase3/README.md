# Phase 3 — Super features & differentiation

Delivery branch: `main-phase3-super-features-2176` (stacked on Phase 2).

## Scope (MVP slices)

| Area | Deliverable |
|---|---|
| **AI copilots** | POPIA-safe redaction + incident summary + maintenance triage (deterministic fallback; optional Gemini). Genkit flows for local `genkit:dev`. Eval fixtures. Incidents UI “Summarize” action. |
| **Evidence locker** | File `sha256` + `scan_status`; finalize/verify endpoints; attach evidence to incidents; image-process worker marks clean/quarantine. |
| **Vendor SLA** | Real `sla-check` BullMQ worker; admin enqueue + breach list API. |
| **Multi-tenant SaaS** | `tenants` + `tenant_subscriptions`; sites linked to tenants; admin tenant CRUD. |
| **Optional mobile** | Expo-ready scaffold under `apps/mobile/` (outside npm workspaces). |

## Non-goals (later)

- Full malware sandbox / watermark pipeline
- Production billing provider (Stripe/etc.)
- Published App Store / Play builds
- Marketplace connector OAuth

## Success for this PR

- Unit tests cover redaction, SLA planner, evidence hash helpers, tenant schema contracts
- Existing CI stays green (no Gemini key required)
- Docs: `docs/phase3/README.md`
