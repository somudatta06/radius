# CONTEXT.md — Radius AI Brand Intelligence Platform

> This file gives any AI agent (Emergent, Claude Code, Anti-Gravity, Cursor, etc.) full context about what this project is, how it works, and how to work on it.

---

## 1. Project Overview

- **Name:** Radius
- **What it does:** AI Brand Intelligence Platform for Indian D2C companies. Enter a domain, get a comprehensive AI visibility report in ~30 seconds analyzing how ChatGPT, Claude, Gemini, and Perplexity describe your brand.
- **The problem:** 60% of Gen Z starts product research with ChatGPT, not Google. Brands have zero visibility into how AI platforms represent them. This is the GEO (Generative Engine Optimization) problem.
- **The solution:** Enter a domain → get a comprehensive AI visibility report with GEO scoring, gap analysis, ad intelligence, content pipeline, competitor discovery, Reddit intelligence, and schema markup generation.
- **Hackathon:** Built for VibeHack 2025 (EF x Emergent).

---

## 2. Architecture

| Layer | Technology | Details |
|-------|-----------|---------|
| **Backend** | Python FastAPI | `backend/server.py`, runs on port 8001 |
| **Frontend** | React 18 + Vite + TypeScript | `frontend/`, runs on port 3000 |
| **Database** | MongoDB | Async via `motor` driver, 2s timeouts |
| **AI Engine** | OpenAI GPT-4o-mini (primary) | Optional: Anthropic Claude, Google Gemini, Perplexity |
| **State Management** | @tanstack/react-query | No caching — `staleTime: 0`, `gcTime: 0` |
| **Routing** | wouter | Lightweight React router |
| **UI** | shadcn/ui + Tailwind CSS + Recharts | 47 Radix-based UI components |
| **Font** | Inter (only) | Weights 300-900 via Google Fonts |
| **PDF Export** | @react-pdf/renderer + jspdf | Client-side PDF generation |

### Key Architectural Decisions
- **No caching:** Every analysis generates a fresh `analysisId`. Frontend uses `staleTime: 0`.
- **MongoDB optional:** In-memory cache (200 entries, FIFO) survives MongoDB being down.
- **Graceful degradation:** All services have demo/mock data fallback when API keys are missing.
- **Non-blocking KB:** Knowledge Base generation runs as a background task, never blocks analysis.
- **Lazy API key loading:** Keys are loaded fresh on each call, not at startup.
- **Data provenance:** Every response includes `dataProvenance` tracking whether data is fresh or simulated.

---

## 3. Directory Structure

### Backend (`backend/`)

```
backend/
├── server.py                          # FastAPI app entry point — ALL endpoints defined here
├── requirements.txt                   # Python dependencies (102 packages)
├── controllers/
│   └── competitor_controller.py       # Competitor discovery endpoint handler (uses tracxn_mock)
├── models/
│   ├── knowledge_base.py             # Pydantic models: KnowledgeBase, CompanyDescription, BrandGuideline, Evidence
│   └── visibility_models.py          # Pydantic models: Competitor, PromptRun, Mention, VisibilityMetrics
└── services/
    ├── radius_engine.py               # Main 8-phase analysis orchestrator
    ├── radius_crawler.py              # Phase 1: Website crawling (up to 10 pages)
    ├── radius_knowledge_engine.py     # Phase 2-3: GPT-powered KB creation from crawl data
    ├── radius_question_generator.py   # Phase 4: Consumer question framework generation
    ├── radius_llm_tester.py           # Phase 5: Multi-LLM visibility testing (real APIs or simulated)
    ├── radius_scoring_engine.py       # Phase 6: GEO scoring — (AIC*0.40+CES*0.35+MTS*0.25)*10
    ├── competitor_intelligence.py     # GPT-based competitor identification (5 direct competitors)
    ├── knowledge_service.py           # KB CRUD + AI text improvement + website regeneration
    ├── knowledge_synthesizer.py       # GPT KB content synthesis from crawl data
    ├── website_scraper.py             # Comprehensive multi-page website scraping
    ├── reddit_intelligence.py         # Real Reddit via Apify API + brand-aware mock fallback
    ├── tracxn.py                      # Tracxn API client (broken — DNS error)
    ├── tracxn_mock.py                 # Mock competitor data (DataRobot, Alteryx, Tableau, etc.)
    ├── openai_analysis.py             # GPT-powered competitive analysis
    ├── visibility_service.py          # Deterministically seeded visibility metrics
    ├── gap_analysis.py                # AI vs consumer perception gap (demo data + GPT enhancement)
    ├── ad_intelligence.py             # Ad strategy & keyword analysis (demo data + GPT enhancement)
    ├── search_intelligence.py         # Search landscape & SGE readiness (demo data)
    ├── social_scraper.py              # Social conversation intelligence (demo data)
    ├── blog_engine.py                 # AI blog post generation (GPT or demo fallback)
    ├── cms_exporter.py                # Export to WordPress XML / Webflow JSON / generic JSON
    └── schema_generator.py            # JSON-LD schema markup generation (demo data)
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── main.tsx                           # React entry point, renders <App />
├── index.css                          # Global CSS — variables, animations, utility classes
├── App.tsx                            # Router: /, /analysis/:id, /dashboard, /knowledge-base, /reddit, /competitors
├── config.ts                          # Backend URL configuration
├── pages/
│   ├── Home.tsx                       # Landing page — hero + URL input → POST /api/analyze → redirect
│   ├── AnalysisPage.tsx               # Fetches GET /api/analysis/:id, renders AnalysisResults
│   ├── Dashboard.tsx                  # Auth-gated history + re-analysis page
│   ├── KnowledgeBasePage.tsx          # KB management — 3 tabs: Description, Guidelines, Evidence
│   ├── RedditDashboard.tsx            # Reddit intelligence dashboard
│   ├── CompetitorPage.tsx             # Competitor discovery via search
│   └── not-found.tsx                  # 404 page
├── components/
│   ├── AnalysisResults.tsx            # Main results container — 13 tabs (see Section 6)
│   ├── URLInputForm.tsx               # URL input with validation
│   ├── HeroSection.tsx                # Landing hero section
│   ├── LandingNav.tsx                 # Top navigation bar
│   ├── DashboardHeader.tsx            # Dashboard header with brand info
│   ├── AnalysisTimeline.tsx           # Analysis progress animation
│   ├── ExecutiveSummary.tsx           # GPT-generated 2-3 sentence brief
│   ├── BriefSection.tsx               # Analysis brief card
│   ├── MetricCard.tsx                 # GEO metric display (AIC/CES/MTS, 0-10 scale)
│   ├── MetricInfoCards.tsx            # 3-card GEO metrics grid
│   ├── StatsCard.tsx                  # Generic stat card (icon + title + value)
│   ├── PlatformComparison.tsx         # Bar chart comparing 4 AI platform scores
│   ├── ScoreBreakdown.tsx             # 6-dimension score breakdown
│   ├── CalculationMethodology.tsx     # Scoring formula explanation
│   ├── CompetitorCard.tsx             # Individual competitor card
│   ├── CompetitorComparison.tsx       # Head-to-head competitor comparison
│   ├── CompetitorDiscovery.tsx        # Real-time competitor search via API
│   ├── RecommendationCard.tsx         # Recommendation with priority badge + action items
│   ├── AccuracyIndicator.tsx          # Data provenance badge (fresh vs simulated)
│   ├── QualityWarningBanner.tsx       # Quality warning for JS-heavy sites
│   ├── JavaScriptHeavyErrorModal.tsx  # Error modal when scraping fails on JS sites
│   ├── GapAnalysis.tsx                # AI vs consumer perception gap analysis
│   ├── AdIntelligence.tsx             # Ad strategy & keyword intelligence
│   ├── ContentPipeline.tsx            # 3-step content generation (social → blog → export)
│   ├── SearchIntelligence.tsx         # Search landscape & SGE readiness
│   ├── SchemaGenerator.tsx            # JSON-LD code generator with copy-to-clipboard
│   ├── VisibilityDashboard.tsx        # Competitive visibility metrics dashboard
│   ├── KnowledgeBaseSummaryPanel.tsx  # KB summary panel in analysis view
│   ├── BrandIntelligenceHeader.tsx    # Brand info header
│   ├── PDFReport.tsx                  # PDF export component
│   ├── OpenInAIButton.tsx             # "Test in ChatGPT/Claude/Gemini" buttons
│   ├── knowledge/                     # KB sub-components
│   │   ├── CompanyDescriptionTab.tsx  # Company overview, products, ICP, differentiators
│   │   ├── BrandGuidelinesTab.tsx     # Tone, preferred/avoided words, style guide
│   │   └── EvidenceTab.tsx            # Case studies, reviews, statistics
│   ├── reddit/
│   │   ├── RedditAnalyticsTab.tsx     # Reddit thread list + sentiment + metrics
│   │   └── MockDataBanner.tsx         # Banner shown when using mock Reddit data
│   ├── visibility/
│   │   └── VisibilityDashboard.tsx    # Mention rate, position, sentiment, share of voice
│   ├── examples/                      # Example/demo components (not used in main app)
│   └── ui/                            # 47 shadcn/ui components (button, card, tabs, dialog, etc.)
├── hooks/
│   ├── use-auth.ts                    # Authentication hook (signup/login/logout/me)
│   ├── use-mobile.tsx                 # Mobile viewport detection
│   └── use-toast.ts                   # Toast notification hook
├── lib/
│   ├── geo-types.ts                   # TypeScript interfaces for GEO analysis
│   ├── geo-constants.ts               # GEO metric definitions (AIC, CES, MTS)
│   ├── mock-geo-data.ts              # Mock analysis data for development
│   ├── queryClient.ts                 # React Query client setup (no caching)
│   ├── urlNormalizer.ts               # URL normalization utility
│   └── utils.ts                       # cn() utility for Tailwind class merging
└── types/
    ├── schema.ts                      # AnalysisResult TypeScript interfaces
    └── visibility.ts                  # Visibility metric TypeScript types
```

---

## 4. Design System

### Color Scheme (CSS Variables from `index.css`)

**Light Mode:**
| Variable | Value | Usage |
|----------|-------|-------|
| `--primary` | `0 0% 0%` (black) | Primary text, buttons |
| `--secondary` | `0 0% 96%` (light gray) | Secondary backgrounds |
| `--accent` | `221 83% 53%` (blue) | Accent elements, links |
| `--destructive` | `0 84% 60%` (red) | Error states, destructive actions |
| `--background` | `0 0% 100%` (white) | Page background |
| `--foreground` | `0 0% 0%` (black) | Primary text |
| `--border` | `0 0% 90%` (light gray) | Borders |
| `--muted` | `0 0% 96%` (light gray) | Muted backgrounds |
| `--muted-foreground` | `0 0% 42%` (medium gray) | Muted text |
| `--card` | `0 0% 100%` (white) | Card backgrounds |

**Chart Colors:**
| Variable | Value | Usage |
|----------|-------|-------|
| `--chart-1` | `221 83% 53%` (blue) | ChatGPT scores |
| `--chart-2` | `159 78% 52%` (green) | Perplexity scores |
| `--chart-3` | `37 92% 56%` (orange) | Claude scores |
| `--chart-4` | `147 79% 42%` (dark green) | Gemini scores |
| `--chart-5` | `341 75% 51%` (pink) | Additional charts |

### Typography
- **Font family:** Inter (only), loaded via Google Fonts
- **Weights:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black)
- **CSS variables:** `--font-sans: 'Inter', sans-serif`

### Card Patterns
- **Border radius:** `var(--radius)` = `0.4rem`
- **Background:** `hsl(var(--card))` (white in light mode)
- **Border:** `1px solid hsl(var(--border))`
- **Shadow:** Varies by component (shadcn defaults)
- **Padding:** Typically `p-4` or `p-6`

### Badge Styles (Priority)
- **High:** Red/destructive background
- **Medium:** Yellow/orange background
- **Low:** Green/blue background

### Score Color Coding
| Range | Color | Meaning |
|-------|-------|---------|
| 80-100 | Green | Excellent |
| 60-79 | Blue | Good |
| 40-59 | Yellow | Moderate |
| 20-39 | Orange | Poor |
| 0-19 | Red | Critical |

### Animation Classes
- `.animate-pulse-subtle` — Subtle scale pulse (1 → 1.05, 1.5s loop)
- `.animate-scale-in` — Scale entrance (0 → 1.2 → 1, 300ms)
- `.animate-fadeIn` — Fade in (200ms)
- `.animate-slideUp` — Slide up with fade (300ms)
- `.animate-fade-in-up` — Combined fade + slide (600ms, with delay variants)
- `.animate-draw-line` — SVG line drawing (2s)
- `.animate-blink` — Cursor blink effect (1s)

### Loading State Pattern
- Uses shadcn `<Skeleton />` components for loading placeholders
- Skeleton rendered in card layouts matching final content shape

### Interaction Patterns
- `.hover-elevate` — Brightness adjustment on hover
- `.toggle-elevate` / `.toggle-elevated` — Toggleable elevation state

---

## 5. API Endpoints

### Health & Root

| Method | Path | Description | Demo Fallback |
|--------|------|-------------|---------------|
| GET | `/` | Root — returns API info | N/A |
| GET | `/api/health` | Health check — MongoDB + OpenAI status | N/A |

### Authentication

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| POST | `/api/auth/signup` | Create account | `{name, email, password}` | `{id, name, email}` + session cookie |
| POST | `/api/auth/login` | Login | `{email, password}` | `{id, name, email}` + session cookie |
| POST | `/api/auth/logout` | Logout | None | `{message}` |
| GET | `/api/auth/me` | Get current user | None (cookie auth) | `{id, name, email}` |

### Core Analysis

| Method | Path | Description | Request Body | Response | Demo Fallback |
|--------|------|-------------|-------------|----------|---------------|
| POST | `/api/analyze` | Quick analysis (scrape + GPT) | `{url}` | Full analysis with `analysisId` | Fallback scores if no OpenAI key |
| GET | `/api/analysis/{id}` | Retrieve analysis | N/A | Stored analysis data | N/A (404 if not found) |
| POST | `/api/generate-brief` | GPT-generated brief | `{overallScore, platformScores, brandName, domain}` | `{brief}` | Static fallback text |

### Radius Engine (Full Pipeline)

| Method | Path | Description | Request Body | Response | Demo Fallback |
|--------|------|-------------|-------------|----------|---------------|
| POST | `/api/radius/analyze` | Full 8-phase analysis | `{url}` | Complete pipeline result | Simulated scores |
| POST | `/api/radius/analyze-quick` | Quick analysis (skip LLM tests) | `{url}` | Pipeline without Phase 5 | Simulated scores |
| GET | `/api/radius/analysis/{id}` | Retrieve Radius analysis | N/A | Stored analysis | N/A |
| GET | `/api/radius/test-question/{id}/{platform}` | Pre-generated test question | N/A | `{question, platform}` | N/A |
| POST | `/api/radius/feedback/{id}` | Submit KB feedback | `{feedback dict}` | Refinement result | N/A |
| GET | `/api/radius/api-status` | Check LLM API key status | N/A | `{openai, anthropic, gemini, perplexity}` | N/A |

### Competitor Intelligence

| Method | Path | Description | Query Params | Response | Demo Fallback |
|--------|------|-------------|-------------|----------|---------------|
| GET | `/api/competitors` | Discover competitors | `query, category, limit, analyze` | `{competitors[], analysis?, metadata}` | Mock data (tracxn_mock.py) |

### Visibility Metrics

| Method | Path | Description | Query Params | Response | Demo Fallback |
|--------|------|-------------|-------------|----------|---------------|
| GET | `/api/visibility/mention-rate` | Mention rate rankings | `brand_id, domain, start_date, end_date, provider` | `{metrics, rankings}` | Deterministic seeded data |
| GET | `/api/visibility/position` | Average position | `brand_id, domain, start_date, end_date` | `{metrics, rankings}` | Deterministic seeded data |
| GET | `/api/visibility/sentiment` | Sentiment analysis | `brand_id, start_date, end_date` | Sentiment distribution | Deterministic seeded data |
| GET | `/api/visibility/share-of-voice` | Share of voice | `domain` | Share distribution | Deterministic seeded data |
| GET | `/api/visibility/geographic` | Geographic performance | None | Geographic data | Static data |

### Knowledge Base

| Method | Path | Description | Request/Params | Response | Demo Fallback |
|--------|------|-------------|---------------|----------|---------------|
| GET | `/api/knowledge-base` | Get KB | `company_id` query | Full KB object | Empty KB |
| POST | `/api/knowledge-base/company-description` | Update description | `company_id` + body | Updated KB | N/A |
| POST | `/api/knowledge-base/brand-guidelines` | Update guidelines | `company_id` + body | Updated KB | N/A |
| POST | `/api/knowledge-base/improve` | AI text improvement | `text, mode` | `{improved_text}` | N/A |
| POST | `/api/knowledge-base/extract-guidelines` | Extract from URL | `url` | Guidelines object | N/A |
| POST | `/api/knowledge-base/evidence` | Add evidence | `company_id` + body | Updated evidence | N/A |
| GET | `/api/knowledge-base/evidence` | Get evidence | `company_id` | Evidence list | Empty list |
| DELETE | `/api/knowledge-base/evidence/{id}` | Delete evidence | `company_id` | `{success}` | N/A |
| POST | `/api/knowledge-base/regenerate` | Regenerate from website | `website_url, company_id` | `{success, knowledge_base}` | N/A |

### Reddit Intelligence

| Method | Path | Description | Query Params | Response | Demo Fallback |
|--------|------|-------------|-------------|----------|---------------|
| GET | `/api/reddit/metrics` | Reddit metrics | `brand_name` | Metrics object | Brand-aware mock |
| GET | `/api/reddit/threads` | Reddit threads | `brand_name, search, filter, sentiment` | Thread list | Brand-aware mock |
| POST | `/api/reddit/analyze-thread` | Analyze thread with KB | `title, content, company_id` | `{sentiment, summary}` | N/A |

### Intelligence Modules

| Method | Path | Description | Request Body | Response | Demo Fallback |
|--------|------|-------------|-------------|----------|---------------|
| POST | `/api/gap-analysis` | AI vs consumer perception gap | `{brand_name, category, ai_scores, website_data}` | Gap analysis | `_DEMO_DATA` |
| POST | `/api/ad-intelligence` | Ad strategy analysis | `{brand_name, category, competitors, website_data}` | Ad intelligence | `_DEMO_DATA` |
| POST | `/api/content-pipeline/social` | Social conversations | `{keywords, brand_name}` | Social data | `_demo_data()` |
| POST | `/api/content-pipeline/blog` | Generate blog post | `{topic, brand_name, keywords, social_data}` | Blog content | `_demo_data()` |
| POST | `/api/content-pipeline/export` | Export blog to CMS | `{content, format}` | Export package | Error response |
| POST | `/api/search-intelligence` | Search landscape | `{brand_name, category, website_data}` | Search analysis | `_demo_data()` |
| POST | `/api/schema-generator` | JSON-LD schema markup | `{brand_name, domain, website_data, analysis_data}` | Schema markup | `_demo_data()` |

---

## 6. Frontend Tabs (Analysis Page)

The `AnalysisResults.tsx` component renders 13 tabs:

| Tab ID | Label | Component | Data Source | Status |
|--------|-------|-----------|-------------|--------|
| `overview` | Overview | Inline (MetricCards, StatsCards, PlatformComparison, ExecutiveSummary, Recommendations) | Analysis data | Fully functional |
| `ad-intelligence` | Ad Intelligence | `<AdIntelligence />` | `POST /api/ad-intelligence` | Works — uses demo data + GPT enhancement |
| `content-pipeline` | Content Pipeline | `<ContentPipeline />` | `POST /api/content-pipeline/social`, `/blog`, `/export` | Works — social/blog use demo data, blog uses GPT |
| `search-sge` | Search & SGE | `<SearchIntelligence />` | `POST /api/search-intelligence` | Works — always uses demo data |
| `schema-generator` | Schema Generator | `<SchemaGenerator />` | `POST /api/schema-generator` | Works — always uses demo data |
| `knowledge-base` | Knowledge Base | `<KnowledgeBaseSummaryPanel />` | `GET /api/knowledge-base` | Fully functional — real AI-generated content |
| `visibility` | Visibility | `<VisibilityDashboard />` | `GET /api/visibility/*` | Works — deterministically seeded metrics |
| `score-breakdown` | Score Breakdown | `<ScoreBreakdown />` | Analysis data (dimension scores) | Fully functional |
| `competitors` | Competitor Analysis | `<CompetitorComparison />` + `<CompetitorCard />` | Analysis data (competitors array) | Fully functional |
| `reddit` | Reddit Intelligence | `<RedditAnalyticsTab />` | `GET /api/reddit/threads` + `/metrics` | Works — real Apify or brand-aware mock |
| `methodology` | Methodology | `<CalculationMethodology />` | Static content | Fully functional |
| `discovery` | Competitor Discovery | `<CompetitorDiscovery />` | `GET /api/competitors` | Works — uses mock competitor data |
| `accuracy` | Accuracy Check | Inline (data provenance display) | Analysis data (`dataProvenance`) | Fully functional |

---

## 7. Environment Variables

| Variable | Required | Default | What Happens If Missing |
|----------|----------|---------|------------------------|
| `OPENAI_API_KEY` | Yes (for real analysis) | None | Analysis falls back to deterministic scores, no GPT enhancement |
| `MONGO_URL` | No | `mongodb://localhost:27017` | Uses default localhost; in-memory cache used if MongoDB unreachable |
| `ANTHROPIC_API_KEY` | No | None | Claude visibility testing uses simulated scores |
| `GEMINI_API_KEY` | No | None | Gemini visibility testing uses simulated scores |
| `PERPLEXITY_API_KEY` | No | None | Perplexity visibility testing uses simulated scores |
| `APIFY_API_KEY` | No | None | Reddit intelligence uses brand-aware mock data |
| `PORT` | No | `8001` | Backend server port |
| `REACT_APP_BACKEND_URL` | No | `http://localhost:8001` | Frontend API base URL |

---

## 8. How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (optional — app works without it)

### Backend
```bash
cd backend
pip install -r requirements.txt
# Create .env with at least OPENAI_API_KEY
python server.py
# Runs on http://localhost:8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Environment
```bash
# Copy from root
cp .env.example backend/.env
# Edit backend/.env and add your OPENAI_API_KEY
```

---

## 9. How to Deploy on Emergent

After importing from GitHub, give Emergent's agent this prompt:

> This is a Python FastAPI + React TypeScript app. The backend is in `backend/` and runs on port 8001. The frontend is in `frontend/` and runs on port 3000.
>
> To set up:
> 1. `cd backend && pip install -r requirements.txt && python server.py`
> 2. `cd frontend && npm install && npm run dev`
>
> Set `OPENAI_API_KEY` in the environment. MongoDB is optional (app uses in-memory cache as fallback). The frontend needs `REACT_APP_BACKEND_URL` pointing to the backend.

---

## 10. Known Issues & Limitations

### Services That Always Return Demo Data
- **`search_intelligence.py`** — `_demo_data()` is always returned; no real search API integration
- **`social_scraper.py`** — `_demo_data()` is always returned; no real social scraping
- **`schema_generator.py`** — `_demo_data()` is always returned; schemas are template-based

### Services That Use Demo Data as Fallback
- **`gap_analysis.py`** — Returns `_DEMO_DATA` if OpenAI key missing or API call fails
- **`ad_intelligence.py`** — Returns `_DEMO_DATA` if OpenAI key missing or API call fails
- **`blog_engine.py`** — Returns `_demo_data()` if GPT call fails
- **`reddit_intelligence.py`** — Returns brand-aware mock data if APIFY_API_KEY missing
- **`tracxn_mock.py`** — Always used (real Tracxn API is broken — DNS error on endpoint)
- **`visibility_service.py`** — Uses deterministically seeded metrics (not real visibility data)

### Components That May Not Render Properly
- **PDF Export** — Large analyses may exceed memory limits in browser
- **JavaScript-heavy sites** — Scraper can't execute JS; shows error modal

### API Calls That Fail Silently
- MongoDB writes in `/api/analyze` — logged but don't fail the response
- Knowledge Base background generation — failures logged, don't block analysis
- Competitor identification — falls back to empty array on error

### Features Described in UI But Not Fully Implemented
- **Real-time LLM testing** — Only works with corresponding API keys; shows simulated scores otherwise
- **Geographic performance** — Always returns static data
- **Search & SGE analysis** — Always returns demo data
- **Social scraping** — Always returns demo data

### Hardcoded Data
- `tracxn_mock.py` has 8+ hardcoded companies (DataRobot, Alteryx, Tableau, etc.)
- `visibility_service.py` uses deterministic hashing for "stable" metrics
- Competitor scores in analysis are derived from the brand's score with offsets, not independently measured

### Scoring Note
- The GEO scoring formula is `(AIC*0.40 + CES*0.35 + MTS*0.25) * 10`
- Server always recalculates this — never trusts GPT's `overall_score` directly
- Minimum score is 10 for any reachable website
