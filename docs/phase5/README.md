# Phase 5 — Trustee wiring + live report packs

Branch: `main-phase5-trustee-wiring-2176` (stacked on Phase 4).

## Delivered

| Area | Change |
|---|---|
| **KPI helpers** | `src/lib/portal-kpis.ts` — invoice/ticket/incident/energy/EV KPIs + `buildCmdReportPack` |
| **Trustee live** | `/tru/overview`, `/tru/financials`, `/tru/security`, `/tru/energy` |
| **Vendor dashboard** | `/ven/dashboard` — tickets + passes; access request with ticket fallback |
| **Cmd reports** | `/cmd/reports` — live aggregates, JSON pack export |

## Live data wiring tally (after Phase 5)

Phase 4 (~13) **+** trustee×4, vendor dashboard, cmd reports → **~19 pages** (~45% of ~42 portal routes).

## Still mock

cmd concierge/integrations/pricing; ten home/wallet/onboarding/concierge; tru audit/collections/pricing/pack-builder/resolutions; ven onboarding/safety.

## Merge order

#4 → #5 → #6 → #7 → this PR.
