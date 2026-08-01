# SecureConnect Mobile (optional Expo scaffold)

Optional React Native / Expo resident client. **Not** part of the root npm workspaces — install separately so CI stays hermetic.

## Prerequisites

- Node 20+
- Expo CLI (`npx expo`)

## Setup

```bash
cd apps/mobile
npm install
npx expo start
```

Configure API:

```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000
```

## What this scaffold includes

- Minimal `App.tsx` that calls `POST /api/v1/auth/dev-session` (local only) and lists doors
- Pointers to `@veralogix/secureconnect-sdk` (link via file: dependency when ready)

## Non-goals

- App Store / Play Store release pipelines
- Full portal parity with Next.js

See `docs/phase3/README.md`.
