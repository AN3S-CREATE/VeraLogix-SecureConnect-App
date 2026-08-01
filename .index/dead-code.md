# Dead / Legacy Code — VeraLogix SecureConnect

| Path | Evidence | Risk | Recommended action |
|------|----------|------|-------------------|
| `firestore.rules` | No `firebase` in `package.json`; migration doc confirms replacement | Low | Delete or move to `docs/archive/` |
| `.env` (tracked) | `git ls-files .env`; contains `GEMINI_API_KEY` | **Critical** | `git rm --cached .env`; rotate key; verify ignore |
| `src/ai/dev.ts` | Empty file, no flow imports | None | Implement flows or remove Genkit scripts |
| Backend worker stubs | `exports`, `imageProcess`, `slaCheck` log only | Medium | Implement or mark experimental in OpenAPI |
