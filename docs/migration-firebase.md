# Migrating from Firebase to the self-hosted stack

This guide maps the previous Firebase Studio prototype to the SecureConnect API.

## Service mapping

| Firebase | Replacement |
|----------|-------------|
| Firebase Auth | Keycloak (OIDC) + `/api/v1/auth/*` |
| Firestore `doors`, `accessLogs` | Postgres `doors`, `access_logs` |
| `onSnapshot` | WebSocket `/ws` + Postgres `LISTEN/NOTIFY` |
| Firebase App Hosting | Any Node host / Docker Compose / VPS + Caddy |
| Firebase Storage (unused) | MinIO presigned URLs |
| Cloud Functions (unused) | BullMQ workers |
| `NEXT_PUBLIC_FIREBASE_*` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_KEYCLOAK_*` |

## Code mapping

| Old | New |
|-----|-----|
| `src/firebase/*` | `src/backend/*` + `packages/sdk` |
| `FirebaseClientProvider` | `BackendClientProvider` |
| `useCollection(firestoreQuery)` | `useCollection('doors', { realtimeTable: 'doors' })` |
| `initiateEmailSignIn` | `useBackend().login(email, password)` |
| `addDoc(accessLogs)` | `client.unlockDoor(id)` or `client.create('access-logs', …)` |
| `prototype-seeder.tsx` Firestore batch | `npm run db:seed` + light client fallback |
| `firestore.rules` | API RBAC (`user_site_roles` + Keycloak realm roles) |

## Data migration steps

1. Export Firestore collections (`doors`, `accessLogs`, and any others) to JSON.
2. Map fields:
   - `accessLogs.status` → `access_logs.result`
   - `accessLogs.time` → `access_logs.ts` (parse to timestamptz)
   - Ensure every row has a `site_id` (create a default site first).
3. Insert via SQL or `POST /api/v1/...` with an admin token.
4. Create Keycloak users (or federate IdP) and link app `users.keycloak_sub`.
5. Assign `user_site_roles` for each membership.
6. Remove Firebase config from hosting and delete old project keys after cutover.

## Auth cutover

1. Import/configure Keycloak realm (`docker/keycloak/realm-export.json`).
2. Enable Google/Apple IdPs by filling client IDs/secrets (placeholders in realm export).
3. Point the Next.js app at Keycloak (`NEXT_PUBLIC_KEYCLOAK_*`).
4. Disable `DEV_AUTH_BYPASS` in production.
5. Rotate any previously embedded Firebase web API keys.

## Frontend checklist

- [x] Root layout uses `BackendClientProvider`
- [x] Login form uses SDK login / SSO redirect
- [x] `/cmd/access` and `/ten/keys` use API + realtime
- [x] Firebase packages removed from `package.json`
- [ ] Wire remaining mock portals (passes, tickets, invoices) to CRUD endpoints as needed
- [ ] Configure production CORS and TLS (Caddy)

## Rollback

Keep a read-only Firebase project until the new stack is verified. Feature-flag `NEXT_PUBLIC_API_URL` if you need a temporary dual-run (not required for this repo’s default path).
