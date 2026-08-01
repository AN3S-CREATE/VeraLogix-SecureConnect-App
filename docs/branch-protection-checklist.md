# Branch protection checklist (manual)

Automation cannot apply these settings with the current GitHub token (API 403). A repository admin should complete this once.

## Required checks on `main`

Enable **Settings → Rules → Rulesets** (or **Branches → Branch protection**) for `main`:

| Check name (exact) | Workflow | Always require? |
|---|---|---|
| `CI health summary` | CI Health | **Yes** |
| `Frontend typecheck` | Typecheck | **Yes** |
| `Frontend production build` | Frontend Build | **Yes** |
| `Backend unit + coverage` | Backend CI | Yes when possible* |
| `Backend integration + e2e` | Backend Integration | Recommended once green* |

\*Backend CI / Integration are path-filtered. Prefer always requiring CI Health + Typecheck + Frontend Build. Add backend jobs if your plan supports conditional required checks, or accept that docs-only PRs may need a no-op backend path touch.

## Recommended rule options

- [ ] Require status checks to pass before merging
- [ ] Require branches to be up to date before merging
- [ ] Restrict who can push to matching branches
- [ ] Do not allow bypassing (except emergency admins)

## Verify

```bash
gh api repos/OWNER/REPO/branches/main/protection
# or open Settings → Rules and confirm the checks listed above
```

After the next merge to `main`, confirm:

```bash
gh run list --branch main --limit 5
```
