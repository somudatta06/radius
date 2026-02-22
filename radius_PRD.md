# Radius — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-02-22
**Project:** Radius GEO Analytics Platform
**GitHub:** https://github.com/samridh8081-design/radius_emergent
**Live (Replit):** https://radius-v0.replit.app
**Source Fork:** somudatta/radius_emergent

---

## 1. Product Overview

### 1.1 What Is Radius?

Radius is a **GEO (Generative Engine Optimization) analytics platform** — described as "SEO for the AI era." It helps brands understand and improve how they are described, recommended, and ranked by AI platforms (ChatGPT, Claude, Gemini, Perplexity).

### 1.2 The Problem

- 60%+ of Gen Z users start product research in ChatGPT instead of Google
- Brands have zero visibility into how AI models describe them
- Traditional SEO tools do not measure AI discoverability
- There is no standard way to audit or improve a brand's AI presence

### 1.3 The Solution

Enter a domain → Get a full GEO report in ~30 seconds:
- How each major AI platform describes your brand
- Scored across 3 top-level GEO dimensions
- Competitor benchmarking
- Prioritized, actionable recommendations

---

## 2. Tech Stack

### 2.1 Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Wouter | Client-side routing |
| TanStack Query | Server state / data fetching |
| shadcn/ui (Radix UI) | Component library |
| Tailwind CSS | Styling |
| Recharts | Data visualization |
| Framer Motion | Animations |
| @react-pdf/renderer | PDF report export |
| Lucide React | Icons |
| Zod | Schema validation |

### 2.2 Backend
| Technology | Purpose |
|---|---|
| FastAPI | API framework |
| Motor (async MongoDB) | Database driver |
| Pydantic | Data validation |
| OpenAI SDK | GPT-4o integration |
| Anthropic SDK | Claude integration |
| google-generativeai | Gemini integration |
| BeautifulSoup4 | Website scraping |
| uvicorn | ASGI server |
| bcrypt | Password hashing |

### 2.3 External APIs
| API | Purpose | Status |
|---|---|---|
| OpenAI GPT-4o | LLM testing + analysis | Working |
| Anthropic Claude | LLM testing | Working |
| Google Gemini | LLM testing | Working |
| Perplexity | LLM testing | Working |
| Tracxn | Competitor intelligence | BROKEN — DNS error; using mock fallback |

---

## 3. Architecture

### 3.1 Frontend Routes
```
/                    → Home (landing + URL input)
/analysis/:id        → Analysis results page
/dashboard           → Auth-protected history/domain tracker
/competitors         → Competitor page
```

### 3.2 Backend API Endpoints
```
POST /api/analyze              → Trigger 8-phase analysis pipeline
GET  /api/analysis/:id         → Fetch stored analysis by ID
GET  /api/history              → Domain analysis history
GET  /api/knowledge-base/:id   → Knowledge Base fetch
PUT  /api/knowledge-base/:id   → Knowledge Base update
GET  /api/visibility/:id       → Visibility analytics
GET  /api/competitors          → Competitor data (mocked)
```

### 3.3 The 8-Phase Analysis Pipeline (radius_engine.py)
```
Phase 1  → Website Crawling           (radius_crawler.py)
Phase 2  → Knowledge Base Creation    (radius_knowledge_engine.py)
Phase 3  → Knowledge Base Enrichment  (radius_knowledge_engine.py)
Phase 4  → Question Framework         (radius_question_generator.py)
Phase 5  → Multi-LLM Testing          (radius_llm_tester.py) — GPT-4o, Claude, Gemini, Perplexity
Phase 6  → Scoring & Interpretation   (radius_scoring_engine.py)
Phase 7  → User Interaction Support   ("Test in LLM" button)
Phase 8  → Continuous Feedback Loop   (KB refinement)
```

---

## 4. Scoring System

### 4.1 Top-Level GEO Metrics (3 dimensions)

| Metric | Full Name | Weight |
|---|---|---|
| AIC | Answerability & Intent Coverage | 40% |
| CES | Credibility, Evidence & Safety | 35% |
| MTS | Machine-Readability & Technical Signals | 25% |

**Overall Formula:** `score = AIC×0.40 + CES×0.35 + MTS×0.25`

### 4.2 AIC Sub-metrics
- s1: Intent Coverage
- s2: Directness
- s3: Completeness & Depth
- s4: Consistency & Recency
- s5: Conversational Readiness

### 4.3 CES Sub-metrics
- s1: Evidence Density
- s2: Author Transparency
- s3: Experience & Originality
- s4: Safety & Disclaimers
- s5: Freshness

### 4.4 MTS Sub-metrics
- s1: Structure & Semantics
- s2: Schema & Metadata
- s3: Entity Clarity
- s4: Crawlability
- s5: Reusability

### 4.5 Backend Scoring Dimensions (radius_scoring_engine.py)
| Dimension | Weight | What It Measures |
|---|---|---|
| Accuracy | 30% | How correctly the brand is described |
| Consistency | 35% | Mention rate across platforms |
| Safety | 20% | Sentiment (positive/neutral/negative) |
| Readability | 15% | Response length + recommendation rate |

**Grade Scale:** A+ (≥90), A (≥80), B (≥70), C (≥60), D (≥50), F (<50)

---

## 5. Feature Inventory (Current State)

### 5.1 Landing Page Sections
- [x] LandingNav (with NavbarTypingText)
- [x] HeroSection — URL input form
- [x] LLMStatementSection
- [x] VideoSection
- [x] WhatIsGEOSection
- [x] FeaturesSection
- [x] Footer

### 5.2 Analysis Results — 10 Tabs
| Tab | Component | Status |
|---|---|---|
| Overview | GEO metrics, platform scores, stats | Working |
| Knowledge Base | AI-generated company info | Working (backend) |
| Visibility | VisibilityDashboard | Partially wired |
| Recommendations | Prioritized action items | Working |
| Score Breakdown | Dimension scores | Working |
| Competitor Analysis | CompetitorComparison | Working (mock data) |
| Reddit Intelligence | RedditAnalyticsTab | Working (mock data) |
| Methodology | Calculation methodology | Working |
| Competitor Discovery | How competitors were found | Working |
| Accuracy Check | LLM accuracy verification | Working |

### 5.3 Auth System
- Session-based auth with bcrypt password hashing
- In-memory sessions dict (not persistent across restarts)
- Auth modal (AuthModal.tsx)
- Dashboard route is auth-protected

### 5.4 PDF Report Export
- PDFReport.tsx using @react-pdf/renderer

---

## 6. Known Issues & Technical Debt

| Issue | Severity | Status | Details |
|---|---|---|---|
| Tracxn API broken | High | **Fixed (Session 2)** | Now uses tracxn_mock.py directly — no DNS calls |
| Knowledge Base UI routing | Medium | **Fixed (Session 2)** | /knowledge-base route wired in App.tsx |
| Reddit UI routing | Medium | **Fixed (Session 2)** | /reddit route wired in App.tsx |
| Anthropic/Gemini/Perplexity calls | High | **Fixed (Session 2)** | All removed; gpt-4o-mini simulates all platforms |
| TypeScript config pointing to wrong paths | High | **Fixed (Session 2)** | tsconfig.json fixed; 0 TypeScript errors |
| In-memory session store | Medium | Open | Sessions lost on server restart |
| Mixed default/named exports | Low | Open | Should be standardized to named exports |
| Competitor data is mocked | Medium | Open (by design) | Real Tracxn integration blocked |
| Reddit data is mocked | Medium | Open | Real Reddit API not yet integrated |

---

## 7. Design System

- **Reference brands:** Linear, Vercel Analytics, Stripe, Figma
- **Background:** Soft neutral `#F8F7F5`
- **Accents:** Blue with black/white semantic tokens
- **Typography:** Inter font — weights 700/600/500/400
- **Components:** Circular score rings, horizontal bar charts, radar charts, competitor tables
- **Accessibility:** 4.5:1 contrast minimum, keyboard navigation, ARIA labels

---

## 8. Upgrade Roadmap (To Be Defined)

This section will be updated as new feature prompts are received and implemented.

| # | Feature / Upgrade | Status | Notes |
|---|---|---|---|
| — | (awaiting prompts) | Pending | — |

---

## 9. Session Log

| Date | Action | Notes |
|---|---|---|
| 2026-02-22 | Initial PRD created | Based on full repo analysis of samridh8081-design/radius_emergent |
| — | — | — |

---

*This document is maintained as a living PRD. Every feature addition, bug fix, and architectural decision will be logged here.*
