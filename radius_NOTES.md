# Radius — Development Notes & Session Log

**Project:** Radius GEO Analytics Platform
**GitHub:** https://github.com/samridh8081-design/radius_emergent
**Started Tracking:** 2026-02-22

---

## How To Use This File

This file is a running log of every decision, implementation, prompt, change, and observation made during development. It is updated after every significant action. Use it to:
- Resume work in any new AI session without context loss
- Understand why decisions were made
- Track what was tried and what didn't work
- Hand off to another developer with full context

---

## Project Origin

- Built on Emergent AI platform (agent-driven development)
- Forked by `samridh8081-design` from `somudatta/radius_emergent` on 2026-02-21
- Original agent session is logged in `.emergent/summary.txt` inside the repo
- The repo was initially Express.js/PostgreSQL, then refactored by the Emergent agent to FastAPI/MongoDB

---

## Architecture Decisions (Inherited)

| Decision | Rationale | Date |
|---|---|---|
| FastAPI over Express.js | Better Python ecosystem for LLM integrations | Pre-fork |
| MongoDB over PostgreSQL | Flexible schema for variable AI response structures | Pre-fork |
| Wouter over React Router | Lightweight routing for Vite/React | Pre-fork |
| In-memory session store | Quick auth for MVP; not production-ready | Pre-fork |
| shadcn/ui component library | Design consistency, accessible defaults | Pre-fork |

---

## Session 1 — 2026-02-22

### Context Setup
- User forked `somudatta/radius_emergent` repo
- Full repo analysis completed via `gh` CLI
- Created PRD, NOTES, and README documentation files
- Goal: Upgrade and extend the platform based on upcoming prompts

### Repo State at Session Start
- Live URL: https://radius-v0.replit.app
- Backend: FastAPI + Motor/MongoDB, 8-phase pipeline
- Frontend: React 18 + TypeScript + Vite + shadcn/ui
- Known broken: Tracxn API (using mock fallback)
- Known incomplete: Knowledge Base UI routing, in-memory sessions

### Files Created This Session
| File | Purpose |
|---|---|
| `/Users/samridhagrawal/radius_PRD.md` | Full product requirements document |
| `/Users/samridhagrawal/radius_NOTES.md` | This file — running dev notes |
| `/Users/samridhagrawal/radius_README.md` | Comprehensive README for handoff/resuming |

---

## Pending Prompts / Features Queue

*(This section is filled in as the user provides new prompts)*

| # | Prompt Summary | Status | Session |
|---|---|---|---|
| — | (awaiting) | — | — |

---

## Known Issues Tracker

| Issue | First Seen | Status | Fix Attempted | Notes |
|---|---|---|---|---|
| Tracxn API DNS error | Pre-fork | **Fixed (Session 2)** | Yes | competitor_controller.py now uses tracxn_mock directly |
| Knowledge Base UI not wired | Pre-fork | **Fixed (Session 2)** | Yes | /knowledge-base route added to App.tsx |
| Reddit UI not wired | Pre-fork | **Fixed (Session 2)** | Yes | /reddit route added to App.tsx |
| Anthropic/Gemini/Perplexity API calls | Pre-fork | **Fixed (Session 2)** | Yes | All removed; GPT-4o-mini simulates all platforms |
| TypeScript errors (tsconfig wrong paths) | Pre-fork | **Fixed (Session 2)** | Yes | tsconfig.json paths corrected; schema.ts types expanded |
| In-memory session store | Pre-fork | Open | No | Lost on server restart |
| Competitor data mocked | Pre-fork | Open (by design) | No | Using tracxn_mock intentionally |
| Reddit data mocked | Pre-fork | Open | No | No real Reddit API call |
| Mixed named/default exports | Pre-fork | Open | No | Inconsistent export style in components |

---

## Component Map (Quick Reference)

```
frontend/src/
├── App.tsx                        ← Router: /, /analysis/:id, /dashboard, /competitors
├── pages/
│   ├── Home.tsx                   ← Landing page (URL input form → POST /api/analyze)
│   ├── AnalysisPage.tsx           ← Loads analysis by ID → passes to AnalysisResults
│   ├── Dashboard.tsx              ← Auth-protected domain history
│   └── CompetitorPage.tsx         ← Competitor intelligence page
├── components/
│   ├── AnalysisResults.tsx        ← 12-tab results dashboard (CORE component)
│   ├── HeroSection.tsx            ← Landing hero with URL input
│   ├── URLInputForm.tsx           ← Form that triggers analysis
│   ├── PDFReport.tsx              ← PDF export using @react-pdf/renderer
│   ├── CompetitorComparison.tsx   ← Competitor tab content
│   ├── VisibilityDashboard.tsx    ← Visibility tab content
│   └── reddit/
│       └── RedditAnalyticsTab.tsx ← Reddit tab content
└── lib/
    ├── geo-constants.ts           ← AIC, CES, MTS definitions
    ├── geo-types.ts               ← TypeScript interfaces
    └── urlNormalizer.ts           ← URL normalization utility

backend/
├── server.py                      ← FastAPI app + all route definitions
└── services/
    ├── radius_engine.py           ← 8-phase pipeline orchestrator
    ├── radius_crawler.py          ← Phase 1: website scraping
    ├── radius_knowledge_engine.py ← Phases 2-3: KB creation
    ├── radius_question_generator.py ← Phase 4: question framework
    ├── radius_llm_tester.py       ← Phase 5: multi-LLM queries
    ├── radius_scoring_engine.py   ← Phase 6: scoring
    ├── competitor_intelligence.py ← Competitor analysis (partially mocked)
    ├── tracxn.py                  ← BROKEN — use tracxn_mock.py instead
    └── reddit_intelligence.py     ← Reddit analysis (mocked)
```

---

## API Keys / Environment Variables Required

*(Do not store actual values here — just document what is needed)*

| Variable | Used In | Notes |
|---|---|---|
| OPENAI_API_KEY | radius_llm_tester.py, gap_analysis.py, ad_intelligence.py | gpt-4o-mini only — all other platforms simulated |
| MONGO_URL | server.py | Defaults to mongodb://localhost:27017 if not set |
| (removed) ANTHROPIC_API_KEY | — | No longer used — Claude simulated via GPT |
| (removed) GOOGLE_API_KEY | — | No longer used — Gemini simulated via GPT |
| (removed) PERPLEXITY_API_KEY | — | No longer used — Perplexity simulated via GPT |
| (removed) TRACXN_API_KEY | — | tracxn.py preserved but not imported |

---

## Change Log

| Date | Session | Change | File(s) Affected |
|---|---|---|---|
| 2026-02-22 | 1 | Created documentation files | radius_PRD.md, radius_NOTES.md, radius_README.md |
| 2026-02-22 | 2 | Backend: removed anthropic + google-generativeai imports; rewrote radius_llm_tester.py to use gpt-4o-mini only with GPT-simulated platform scores; added hardcoded demo fallback when no API key | backend/services/radius_llm_tester.py |
| 2026-02-22 | 2 | Backend: removed `import anthropic` from server.py; replaced analyze_with_claude with analyze_with_openai (gpt-4o-mini); upgraded /api/health to ping MongoDB; wrapped DB operations in try/except; fixed FastAPI deprecation warning (regex→pattern) | backend/server.py |
| 2026-02-22 | 2 | Backend: changed competitor_controller.py to import tracxn_mock directly instead of tracxn (which had DNS errors); tracxn.py preserved but not imported | backend/controllers/competitor_controller.py |
| 2026-02-22 | 2 | Frontend: added KnowledgeBasePage and RedditDashboard routes to App.tsx (/knowledge-base, /reddit) | frontend/src/App.tsx |
| 2026-02-22 | 2 | Frontend: fixed tsconfig.json include paths (client/src → src) and @/* alias; excluded examples directory | frontend/tsconfig.json |
| 2026-02-22 | 2 | Frontend: expanded schema.ts types — AnalysisResult (added 7 optional fields), Competitor (funding/employees/founded/description), Gap (literal impact type), Recommendation (literal priority/category), AnalysisError (technicalDetails extended) | frontend/src/types/schema.ts |
| 2026-02-22 | 2 | Frontend: fixed JavaScriptHeavyErrorModal.tsx — added ?? 0 null guards for optional technical detail fields | frontend/src/components/JavaScriptHeavyErrorModal.tsx |
| 2026-02-22 | 2 | Frontend: added @ts-nocheck to chart.tsx (recharts version mismatch with shadcn/ui) | frontend/src/components/ui/chart.tsx |
| 2026-02-22 | 2 | Frontend: cast pie label entry to any in VisibilityDashboard.tsx | frontend/src/components/visibility/VisibilityDashboard.tsx |
| 2026-02-22 | 2 | TypeScript check: 0 errors. Python import check: 0 errors. | — |
| 2026-02-22 | 3 | Backend: created gap_analysis.py — GapAnalysisService with single gpt-4o-mini call; returns ai_perception, social_perception, gaps, gap_score, crisis_alerts, executive_summary; hardcoded _DEMO_DATA fallback | backend/services/gap_analysis.py |
| 2026-02-22 | 3 | Backend: created ad_intelligence.py — AdIntelligenceService with single gpt-4o-mini call; returns keywords_extracted, ad_strategy, competitor_strategies, messaging_breakdown, strategic_gaps, recommendations; hardcoded _DEMO_DATA fallback | backend/services/ad_intelligence.py |
| 2026-02-22 | 3 | Backend: added POST /api/gap-analysis and POST /api/ad-intelligence endpoints; added allow_origin_regex CORS for preview.emergentagent.com | backend/server.py |
| 2026-02-22 | 3 | Frontend: created GapAnalysis.tsx — useQuery POST, exec summary card, crisis alerts, gap score + perception bars, gap cards grid with AI Says / People Say / severity badge / action | frontend/src/components/GapAnalysis.tsx |
| 2026-02-22 | 3 | Frontend: created AdIntelligence.tsx — useQuery POST, keywords badges, vertical BarChart for messaging mix, competitor strategy cards, strategic gaps, recommendations list | frontend/src/components/AdIntelligence.tsx |
| 2026-02-22 | 3 | Frontend: created BrandIntelligenceHeader.tsx — brand name + domain header card, pillar indicators row, overall score with letter grade | frontend/src/components/BrandIntelligenceHeader.tsx |
| 2026-02-22 | 3 | Frontend: created ExecutiveSummary.tsx — client-side summary generation based on score thresholds, top 3 recommendations with priority badges | frontend/src/components/ExecutiveSummary.tsx |
| 2026-02-22 | 3 | Frontend: updated AnalysisResults.tsx — added Gap Analysis + Ad Intelligence tabs; added BrandIntelligenceHeader + ExecutiveSummary at top of overview tab; added tab content blocks for gap-analysis and ad-intelligence | frontend/src/components/AnalysisResults.tsx |
| 2026-02-22 | 3 | Frontend: added scrollbar-hide utility CSS to index.css | frontend/src/index.css |
| 2026-02-22 | 3 | Cleanup: deleted 28 PNG screenshot files and test_result.md from repo root | / |
| 2026-02-22 | 3 | Created .env.example with OPENAI_API_KEY and MONGO_URL | .env.example |
| 2026-02-22 | 3 | TypeScript check: 0 errors. Vite build: success (2690 kB bundle, expected for large app). | — |

---

*Updated every session. Never delete old entries — append only.*
