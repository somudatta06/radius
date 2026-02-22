# MIGRATION.md — Replit/Anti-Gravity to Emergent

## Migration: Replit/Anti-Gravity → Emergent
**Date:** 2026-02-22

---

### Background

This repo was originally built on Replit (Express.js + PostgreSQL + Drizzle ORM), then migrated to Google Anti-Gravity (FastAPI + MongoDB). The old Replit config files were never cleaned up, creating a "ghost architecture" that would crash Emergent's import process.

The actual app uses:
- `backend/` — Python FastAPI + MongoDB (via motor)
- `frontend/` — React 18 + Vite + TypeScript

The root-level config files referenced directories that don't exist (`server/`, `client/`, `shared/`) and dependencies that aren't used (Express, Drizzle, Neon PostgreSQL). Emergent's import would parse these files, try to resolve the referenced paths, and fail.

---

### Changes Made

#### Files Deleted (11 files)

| # | File | Why Deleted |
|---|------|-------------|
| 1 | `drizzle.config.ts` | Replit-era PostgreSQL/Drizzle ORM config. App uses MongoDB — this file references a `server/db` directory that doesn't exist. |
| 2 | `postcss.config.js` | Root-level PostCSS config from Replit. Frontend has its own PostCSS setup in `frontend/`. This root file would confuse Emergent's build detection. |
| 3 | `tailwind.config.ts` | Root-level Tailwind config from Replit. Frontend uses Tailwind v4 with `@tailwindcss/vite` plugin — no root config needed. |
| 4 | `tsconfig.json` | Root-level TypeScript config from Replit. Had `include: ["client/src/**/*", "shared/**/*", "server/**/*"]` — none of these directories exist. Frontend has its own `frontend/tsconfig.json`. |
| 5 | `vite.config.ts` | Root-level Vite config from Replit. Frontend has its own `frontend/vite.config.ts`. Root config imported `@replit/vite-plugin-*` which would crash on Emergent. |
| 6 | `components.json` | shadcn/ui config pointing to root-level paths. Frontend components are in `frontend/src/components/ui/`. |
| 7 | `design_guidelines.md` | Stale design doc from Replit era. Replaced by design system documentation in CONTEXT.md. |
| 8 | `package-lock.json` | 340KB lockfile from root package.json's Replit-era dependencies. Not needed — frontend has its own lockfile. |
| 9 | `replit.md` | Not present in repo (already removed in prior migration). Listed for completeness. |
| 10 | `URL_PARSER_VALIDATION.md` | Not present in repo. Listed for completeness. |
| 11 | `test_result.md` | Not present in repo. Listed for completeness. |

**Note:** Files 9-11 were specified for deletion but did not exist in the repo. No `.png` files were found in root either.

#### Files Created (3 files)

| # | File | Purpose |
|---|------|---------|
| 1 | `.env.example` | Clean environment variable template. Lists `OPENAI_API_KEY` (required), `MONGO_URL` (optional), and optional LLM API keys. Replaced old `.env.example` that had extra unused variables. |
| 2 | `CONTEXT.md` | Comprehensive project context for AI agents. Documents architecture, directory structure, design system, all API endpoints, frontend tabs, environment variables, known issues. |
| 3 | `MIGRATION.md` | This file. Documents every change made in this cleanup. |

#### Files Replaced (6 files — entire contents replaced)

| # | File | Action | What Changed | Why |
|---|------|--------|-------------|-----|
| 1 | `package.json` | Replaced | Removed all Replit-era dependencies (Express, Drizzle, Neon, Replit plugins, etc.) and scripts (`tsx server/index.ts`, `drizzle-kit push`). Replaced with workspace scripts that delegate to `frontend/` and `backend/`. | Old scripts referenced `server/index.ts` and `dist/index.js` — neither exists. Would crash any build system. |
| 2 | `.emergent/emergent.yml` | Replaced | Removed old job metadata (`job_id`, `created_at`). Replaced with proper Emergent project config: name, description, stack (python/react/mongodb), setup commands, port mapping. | Old file was just a job tracking stub from Anti-Gravity import. Emergent needs actual project configuration. |
| 3 | `frontend/vite.config.ts` | Replaced | Removed imports of `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`. Removed async config function, Replit-specific conditional plugin loading, proxy config, fs restrictions, and manual chunk splitting. Replaced with clean synchronous config using `__dirname`. | Replit plugins don't exist on Emergent. The `async` import pattern and `REPL_ID` check were Replit-specific. Clean config is more portable. |
| 4 | `frontend/tsconfig.json` | Replaced | Changed `jsx` from `"preserve"` to `"react-jsx"`. Removed `"node"` from types (not needed in frontend). Removed `"src/components/examples"` from excludes. | `"preserve"` is for Next.js-style JSX transform. Vite + React needs `"react-jsx"`. Node types were causing resolution of Node.js globals in browser code. |
| 5 | `README.md` | Replaced | Complete rewrite. Old README described the Replit-era Express + PostgreSQL architecture. New README documents the actual FastAPI + MongoDB + React stack with correct setup instructions. | Old README would mislead any developer or AI agent about the app's architecture. |
| 6 | `ARCHITECTURE.md` | Kept | Not modified — still contains valid high-level architecture notes. | Content is still accurate for the FastAPI + React architecture. |

#### Files Modified (3 files — specific sections changed)

| # | File | What Changed | Why |
|---|------|-------------|-----|
| 1 | `frontend/package.json` | Removed 12 dead dependencies. **From dependencies:** `@neondatabase/serverless`, `drizzle-orm`, `drizzle-zod`, `express`, `express-session`. **From devDependencies:** `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`, `@replit/vite-plugin-runtime-error-modal`, `@types/express`, `@types/express-session`, `drizzle-kit`, `esbuild`. No other fields changed. | These are all from the old Replit Express/PostgreSQL architecture. None are imported anywhere in the frontend source code. They would cause unnecessary install failures and bloat. |
| 2 | `backend/server.py` | Simplified CORS `allow_origins` list. Removed hardcoded origins: `http://localhost:3001`, `http://localhost:3002`, `https://radius-analytics.preview.emergentagent.com`, `https://knowledge-hub-303.preview.emergentagent.com`. Kept `http://localhost:3000`, `http://localhost:5173`, and the `allow_origin_regex` pattern `r"https://.*\.preview\.emergentagent\.com"`. | Hardcoded preview domains were specific to old Emergent projects. The regex pattern already covers ALL Emergent preview domains. Keeping only localhost origins + regex ensures any new Emergent project works automatically. |
| 3 | `frontend/index.html` | Replaced massive Google Fonts `<link>` tag (25+ font families, ~2MB) with single Inter font link (7 weights). | The app only uses Inter. Loading 25+ fonts (Roboto, Poppins, Montserrat, JetBrains Mono, Fira Code, Geist, Outfit, Oxanium, Playfair Display, etc.) adds ~2MB of unnecessary downloads and slows initial page load. |

#### Fix 13 Note (Anthropic Import)

The specification called for wrapping a top-level `import anthropic` in server.py with a try/except. Upon inspection, **no such import exists** in `backend/server.py`. The `anthropic` package is listed in `requirements.txt` and referenced only as an env var check (`os.getenv("ANTHROPIC_API_KEY")`). The actual anthropic import happens inside `radius_llm_tester.py` which already handles import failures internally. No change was needed.

---

### Post-Migration Verification

Run these commands to verify the migration:

```bash
# 1. Frontend TypeScript check (should pass with no errors)
cd frontend && npm install && npx tsc --noEmit

# 2. Frontend build (should produce dist/ folder)
cd frontend && npm run build

# 3. Backend import check (should print OK)
cd backend && python -c "from server import app; print('OK')"

# 4. Backend server start (should start on port 8001)
cd backend && python server.py
# Then in another terminal:
curl http://localhost:8001/api/health
```

---

### Emergent Import Instructions

1. **Push this cleaned repo** to GitHub (already done as part of this migration).

2. **Create a new Emergent project** and import from GitHub:
   - Repository: `https://github.com/samridh8081-design/radius_emergent.git`
   - Branch: `main`

3. **Set environment variables** in Emergent:
   - `OPENAI_API_KEY` (required)
   - `MONGO_URL` (optional — defaults to localhost)

4. **Give the Emergent agent this setup prompt:**
   > This is a Python FastAPI + React TypeScript app. Backend is in `backend/` (port 8001). Frontend is in `frontend/` (port 3000).
   >
   > Setup: `cd backend && pip install -r requirements.txt && python server.py` and `cd frontend && npm install && npm run dev`.
   >
   > Set `OPENAI_API_KEY` in environment. Set `REACT_APP_BACKEND_URL` for the frontend to reach the backend.

5. **Verify** by navigating to the frontend URL and entering any domain (e.g., `boat-lifestyle.com`).

---

### Summary of Changes

| Category | Count |
|----------|-------|
| Files deleted | 8 (ghost configs from Replit era) |
| Files created | 3 (`.env.example`, `CONTEXT.md`, `MIGRATION.md`) |
| Files replaced entirely | 6 (`package.json`, `emergent.yml`, `vite.config.ts`, `tsconfig.json`, `README.md`, `.env.example`) |
| Files modified (sections) | 3 (`frontend/package.json`, `backend/server.py`, `frontend/index.html`) |
| Dependencies removed | 12 (5 from dependencies, 7 from devDependencies) |
| Font families removed | 24 (kept only Inter) |
| Business logic changed | 0 |
| Components modified | 0 |
| API endpoints modified | 0 |
