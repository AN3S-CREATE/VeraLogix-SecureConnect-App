# Secrets & credential hygiene

## Required action (maintainers)

A Google Gemini API key was previously committed in the tracked root `.env` file. Treat it as **compromised**:

1. Rotate/revoke the key in Google AI Studio / Cloud Console.
2. Confirm `.env` is **not** tracked: `git ls-files .env` must be empty.
3. Store replacements only in untracked `.env` / `.env.local` / secret manager — never commit.
4. If the repository was or is public, assume the key was scraped; rotation is mandatory.

## Local setup

```bash
cp .env.example .env.local          # frontend public vars
cp backend/.env.example backend/.env  # API secrets (gitignored)
# Optional AI:
# echo 'GEMINI_API_KEY=...' >> .env.local
```

Root `.env` is gitignored. Prefer `.env.local` for Next.js so production builds do not accidentally load local secrets.

## CI / production

- GitHub Actions for this repo require **no** application secrets today (`docs/ci.md`).
- Never put `DEV_AUTH_BYPASS=true` in real production. Local Compose uses development mode for demo bypass; production overlays must set `NODE_ENV=production` and `DEV_AUTH_BYPASS=false`.
- POPIA: do not upload resident PII or secret material to third-party CI logs or AI providers without a lawful basis and retention controls.

## Branch protection

See [`docs/ci.md`](./ci.md#branch-protection) and [`docs/branch-protection-checklist.md`](./branch-protection-checklist.md).
