# Radius - AI Brand Intelligence Platform

## The Problem

60% of Gen Z starts product research with AI, not Google. Brands have zero visibility into how AI platforms describe them. This is the GEO (Generative Engine Optimization) problem.

## The Solution

Enter your domain → get a comprehensive AI visibility report analyzing your brand across ChatGPT, Claude, Gemini, and Perplexity. See what AI says about you vs what real consumers say. Extract positioning keywords, scan social conversations, auto-generate SEO content, and export to your CMS.

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
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

Copy `.env.example` to `backend/.env` and add your `OPENAI_API_KEY`.

## Tech Stack

- **Backend:** Python FastAPI + Motor (async MongoDB driver)
- **Frontend:** React 18 + Vite + TypeScript
- **UI:** shadcn/ui + Tailwind CSS + Recharts
- **AI:** OpenAI GPT-4o-mini (primary engine)
- **Database:** MongoDB (optional — app uses in-memory cache as fallback)
- **Routing:** wouter
- **State:** @tanstack/react-query

## Features

| Tab | Description |
|-----|-------------|
| **Overview** | GEO score breakdown (AIC, CES, MTS), platform scores across ChatGPT/Claude/Gemini/Perplexity, AI-generated executive summary, key metrics, and top recommendations |
| **Ad Intelligence** | Keyword extraction, ad strategy analysis, competitor ad strategies, messaging breakdown, and strategic gap identification |
| **Content Pipeline** | 3-step workflow: scan social conversations → generate AI blog posts → export to WordPress/Webflow/JSON |
| **Search & SGE** | Search landscape analysis and Search Generative Experience readiness scoring |
| **Schema Generator** | Generate JSON-LD schema markup (Organization, Product, FAQ, BreadcrumbList, LocalBusiness) with copy-to-clipboard |
| **Knowledge Base** | AI-generated brand knowledge base with company description, ICP, differentiators, brand guidelines, and evidence management |
| **Visibility** | Competitive visibility dashboard — mention rate rankings, average position, sentiment distribution, share of voice, geographic performance |
| **Score Breakdown** | Detailed 6-dimension score analysis: Mention Rate, Context Quality, Sentiment, Prominence, Comparison, Recommendation |
| **Competitor Analysis** | Head-to-head competitor comparison with GPT-identified competitors, scores, market overlap, and strengths |
| **Reddit Intelligence** | Real Reddit thread monitoring (via Apify) with sentiment analysis, brand mention tracking, and KB-aware thread analysis |
| **Methodology** | Scoring formula explanation: `(AIC * 0.40 + CES * 0.35 + MTS * 0.25) * 10` |
| **Competitor Discovery** | Real-time competitor search with optional AI-powered analysis |
| **Accuracy Check** | Data provenance display — shows whether analysis used fresh AI data or simulated metrics |

## Architecture

```
radius/
├── backend/
│   ├── server.py                    # FastAPI entry point — all endpoints
│   ├── requirements.txt             # Python dependencies
│   ├── controllers/
│   │   └── competitor_controller.py # Competitor discovery handler
│   ├── models/
│   │   ├── knowledge_base.py        # KB data models
│   │   └── visibility_models.py     # Visibility metric models
│   └── services/
│       ├── radius_engine.py         # 8-phase analysis orchestrator
│       ├── radius_crawler.py        # Website crawling
│       ├── radius_knowledge_engine.py # KB creation
│       ├── radius_question_generator.py # Question framework
│       ├── radius_llm_tester.py     # Multi-LLM testing
│       ├── radius_scoring_engine.py # GEO scoring
│       ├── competitor_intelligence.py # GPT competitor identification
│       ├── knowledge_service.py     # KB management
│       ├── reddit_intelligence.py   # Reddit data (Apify + mock)
│       ├── visibility_service.py    # Visibility metrics
│       ├── gap_analysis.py          # AI vs consumer perception
│       ├── ad_intelligence.py       # Ad strategy analysis
│       ├── search_intelligence.py   # Search landscape
│       ├── social_scraper.py        # Social intelligence
│       ├── blog_engine.py           # Blog generation
│       ├── cms_exporter.py          # CMS export
│       └── schema_generator.py      # JSON-LD generation
├── frontend/
│   └── src/
│       ├── App.tsx                  # Router
│       ├── pages/                   # 7 pages
│       ├── components/              # 40+ components + 47 shadcn/ui
│       ├── hooks/                   # Auth, mobile, toast
│       ├── lib/                     # Types, constants, utilities
│       └── types/                   # TypeScript interfaces
├── .env.example                     # Environment template
├── CONTEXT.md                       # Full project context for AI agents
└── MIGRATION.md                     # Migration changelog
```

## API Keys

| Key | Required | What It Powers |
|-----|----------|---------------|
| `OPENAI_API_KEY` | Yes (or demo mode) | All AI analysis, scoring, recommendations |
| `MONGO_URL` | No (defaults to localhost) | Data persistence |
| `ANTHROPIC_API_KEY` | No | Real Claude visibility testing |
| `GEMINI_API_KEY` | No | Real Gemini visibility testing |
| `PERPLEXITY_API_KEY` | No | Real Perplexity visibility testing |
| `APIFY_API_KEY` | No | Real Reddit thread data |

## Hackathon

Built for VibeHack 2025 (EF x Emergent). "Every GEO tool shows you a score. Radius shows you WHY that score is wrong — and generates the content to fix it."
