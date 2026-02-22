# Radius — GEO Analytics Platform

> **SEO for the AI era.** Understand and optimize how AI platforms describe your brand.

**GitHub:** https://github.com/samridh8081-design/radius_emergent
**Live Demo:** https://radius-v0.replit.app
**Stack:** React 18 + TypeScript (frontend) · FastAPI + MongoDB (backend)

---

## What Is Radius?

Radius is a **Generative Engine Optimization (GEO)** analytics platform. It analyzes how AI platforms — ChatGPT, Claude, Gemini, and Perplexity — describe, rank, and recommend your brand, then gives you a scored report and actionable steps to improve your AI presence.

### Why It Matters

- 60%+ of Gen Z users start product research in ChatGPT, not Google
- Brands have zero visibility into how AI models talk about them
- Traditional SEO tools don't measure AI discoverability
- Radius fills that gap

### How It Works

1. Enter your domain URL
2. Radius crawls your website, builds a knowledge base, and queries 4 AI platforms
3. Get a full GEO report in ~30 seconds with scores, insights, and recommendations

---

## Project Structure

```
radius_emergent/
├── frontend/               ← React + TypeScript + Vite
│   └── src/
│       ├── App.tsx         ← Router
│       ├── pages/          ← Home, AnalysisPage, Dashboard, CompetitorPage
│       ├── components/     ← All UI components (shadcn/ui based)
│       └── lib/            ← GEO constants, types, utilities
├── backend/                ← FastAPI + Motor/MongoDB
│   ├── server.py           ← All API routes
│   └── services/           ← 8-phase analysis pipeline
├── design_guidelines.md    ← UI/UX design system
├── replit.md               ← Replit deployment config
└── .emergent/              ← Original Emergent agent session logs
```

---

## Frontend Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Landing page with URL input |
| `/analysis/:id` | AnalysisPage | Full GEO report for a domain |
| `/dashboard` | Dashboard | Auth-protected analysis history |
| `/competitors` | CompetitorPage | Competitor intelligence |

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analyze` | Start analysis pipeline |
| GET | `/api/analysis/:id` | Fetch analysis by ID |
| GET | `/api/history` | Domain analysis history |
| GET | `/api/knowledge-base/:id` | Fetch knowledge base |
| PUT | `/api/knowledge-base/:id` | Update knowledge base |
| GET | `/api/visibility/:id` | Visibility analytics |
| GET | `/api/competitors` | Competitor data |

---

## The 8-Phase Analysis Pipeline

```
Phase 1  → Website Crawling              radius_crawler.py
Phase 2  → Knowledge Base Creation       radius_knowledge_engine.py
Phase 3  → Knowledge Base Enrichment     radius_knowledge_engine.py
Phase 4  → Question Framework            radius_question_generator.py
Phase 5  → Multi-LLM Testing             radius_llm_tester.py
           (GPT-4o · Claude · Gemini · Perplexity)
Phase 6  → Scoring & Interpretation      radius_scoring_engine.py
Phase 7  → User Interaction Support      "Test in LLM" button
Phase 8  → Continuous Feedback Loop      KB refinement
```

---

## GEO Scoring System

### 3 Top-Level Metrics

| Metric | Name | Weight |
|---|---|---|
| AIC | Answerability & Intent Coverage | 40% |
| CES | Credibility, Evidence & Safety | 35% |
| MTS | Machine-Readability & Technical Signals | 25% |

**Overall Score:** `AIC×0.40 + CES×0.35 + MTS×0.25`

### Grade Scale
`A+ ≥90 · A ≥80 · B ≥70 · C ≥60 · D ≥50 · F <50`

---

## Analysis Results — 10 Tabs

1. **Overview** — GEO metrics, platform scores, key stats
2. **Knowledge Base** — AI-generated company knowledge profile
3. **Visibility** — Visibility analytics dashboard
4. **Recommendations** — Prioritized action items (quick wins + strategic bets)
5. **Score Breakdown** — Dimension-level scoring
6. **Competitor Analysis** — Competitor benchmarking
7. **Reddit Intelligence** — Reddit brand sentiment & mentions
8. **Methodology** — How scores are calculated
9. **Competitor Discovery** — How competitors were identified
10. **Accuracy Check** — LLM accuracy verification

---

## Environment Variables Required

| Variable | Service | Required? |
|---|---|---|
| `OPENAI_API_KEY` | gpt-4o-mini — all LLM testing + simulation | **Yes** |
| `MONGO_URL` | MongoDB connection (default: `mongodb://localhost:27017`) | No |

> **Note (Session 2):** Only `OPENAI_API_KEY` is needed. Anthropic, Gemini, Perplexity, and Tracxn have been removed from the codebase. Claude/Gemini/Perplexity scores are now simulated via a single GPT call. If `OPENAI_API_KEY` is missing the app returns demo scores and never crashes.

---

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

---

## Known Issues

| Issue | Status |
|---|---|
| Tracxn API broken (DNS error) | Fixed — uses tracxn_mock.py directly |
| Knowledge Base UI routing | Fixed — /knowledge-base route added |
| Reddit UI routing | Fixed — /reddit route added |
| Anthropic/Gemini/Perplexity API calls | Fixed — all replaced with GPT simulation |
| TypeScript tsconfig pointing to wrong paths | Fixed — tsconfig.json corrected, 0 TS errors |
| In-memory session store (lost on restart) | Open |
| Competitor + Reddit data mocked | Open (by design for now) |

---

## Design System

- **Reference:** Linear · Vercel Analytics · Stripe · Figma
- **Background:** `#F8F7F5` (soft neutral)
- **Font:** Inter (700/600/500/400)
- **Charts:** Circular score rings · horizontal bars · radar charts · competitor tables
- **Accessibility:** 4.5:1 contrast minimum · keyboard navigation · ARIA labels

---

## Upgrade Log

| Date | Change | Notes |
|---|---|---|
| 2026-02-22 | Documentation created | PRD, NOTES, README files created; repo fully analyzed |

---

## Related Documentation

- [radius_PRD.md](./radius_PRD.md) — Full Product Requirements Document
- [radius_NOTES.md](./radius_NOTES.md) — Session-by-session development notes and decisions

---

*This README is maintained as a living document. It is updated after every development session.*
