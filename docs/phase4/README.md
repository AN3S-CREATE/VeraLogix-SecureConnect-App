# Phase 4 — Portal wiring + POPIA export archive

Branch: `main-phase4-portal-wiring-export-2176` (stacked on Phase 3).

## Delivered

| Area | Change |
|---|---|
| **POPIA export worker** | Builds full export package, SHA-256, uploads to MinIO when available, always inserts a `files` row (`kind: popia-export`) |
| **Seed** | Demo `energy_readings` + `ev_sessions` |
| **Live portals** | `/cmd/energy`, `/cmd/ev-charging`, `/ten/ev`, `/ven/work-orders` |

## Live data wiring tally (after Phase 4)

access, incidents, keys, passes, maintenance×2, invoices×2, amenities, **energy, EV×2, vendor work-orders** → **~13 pages** (~31% of ~42 portal routes).

## Merge order

#4 → #5 → #6 → this PR.
