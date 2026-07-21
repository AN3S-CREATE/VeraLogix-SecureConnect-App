# Dead / Legacy Code — VeraLogix SecureConnect

| Path | Evidence | Risk | Recommended action |
|------|----------|------|-------------------|
| `firestore.rules` | No `firebase` in `package.json`; migration doc confirms replacement | Low | Delete or move to `docs/archive/` |
| `apphosting.yaml` | Firebase App Hosting config; stack is Docker/Caddy | Low | Delete or document as historical |
| `package-lock.json` firebase entries | Transitive/stale lock entries; not in package.json deps | Low | Regenerate lock after clean `npm install` |
| `src/ai/dev.ts` | Empty file, no flow imports | None | Implement flows or remove Genkit scripts |
| Backend worker stubs | `exports`, `imageProcess`, `slaCheck` log only | Medium | Implement or mark experimental in OpenAPI |
