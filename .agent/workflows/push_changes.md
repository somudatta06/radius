---
description: Push all changes to the GitHub repo after every modification
---

# Auto-Push Workflow

After **every** code change, documentation update, or file modification, run the following steps to push to GitHub.

**Repository:** `https://github.com/samridh8081-design/radius_emergent`
**Branch:** `main`

## Steps

// turbo-all

1. Stage all changes:
```bash
cd /Users/samridhagrawal/radius_emergent-1 && git add -A
```

2. Commit with a descriptive message:
```bash
cd /Users/samridhagrawal/radius_emergent-1 && git commit -m "<describe what changed>"
```

3. Push to origin main:
```bash
cd /Users/samridhagrawal/radius_emergent-1 && git push origin main
```

## Notes
- This workflow must be run after **every** task or change, no exceptions.
- The commit message should briefly describe what was changed (e.g., "Clean up stale files and update README").
- If the push fails due to upstream changes, run `git pull --rebase origin main` first, then push again.
