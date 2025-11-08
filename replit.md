# Radius - AI Visibility Analyzer

## Overview
Radius is a production-ready SaaS application designed to analyze a brand's visibility across major AI platforms (ChatGPT, Claude, Gemini, and Perplexity). It achieves this by scraping websites, identifying competitors using OpenAI's GPT models and Tracxn data, and generating detailed, actionable insights presented through a modern dashboard with comprehensive metrics documentation, interactive info buttons, competitor discovery methodology, LLM accuracy verification, "Open in AI" testing features, and professional PDF report generation. The project's core purpose is to provide businesses with a clear understanding of how their brand is perceived and recommended by AI, enabling them to enhance their AI presence and competitive standing.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite for fast development. It leverages `shadcn/ui` for accessible components and Tailwind CSS for styling, adhering to a minimalist black and white design with a blue accent. State management is handled by TanStack Query for server state and local React state for UI interactions. Wouter is used for lightweight client-side routing. The application includes a landing page with a search component, an authentication modal (Login/Signup), and a protected dashboard displaying domain analysis history.

### Backend Architecture
The backend is an Express.js application with TypeScript. It provides RESTful APIs for analysis, authentication, and history management. A service layer orchestrates web scraping (Cheerio), AI integration (OpenAI GPT), and market intelligence (Tracxn). Data is persistently stored in a PostgreSQL database using Drizzle ORM, including user data, sessions, domain history, and analysis results. Session-based authentication with `bcrypt` for password hashing and a custom `DatabaseSessionStore` ensures secure user management.

### AI Integration Architecture
OpenAI's GPT-4o-mini is the primary AI service, used for brand extraction, competitor discovery (enriched by Tracxn API data), platform visibility analysis, dimension scoring, and recommendation generation. The system uses JSON mode with Zod schema validation for GPT responses to ensure structured and type-safe data output.

### Authentication Architecture
Session-based authentication is implemented with PostgreSQL-backed sessions. `bcrypt` handles password hashing, and `express-session` with a custom `DatabaseSessionStore` manages sessions, including HttpOnly cookies and hourly cleanup of expired sessions. Middleware (`requireAuth`, `optionalAuth`) controls access to protected routes and attaches user information to requests.

### Data Schemas
Key data schemas include `User`, `Session`, `DomainHistory`, and `AnalysisResult`, all defined with Zod for runtime validation and type inference, ensuring consistency between frontend and backend.

## External Dependencies
### Core Services
*   **OpenAI API**: Used for all AI-powered analysis, including competitor discovery, scoring, and recommendations. Requires `OPENAI_API_KEY`.
*   **Tracxn API**: Provides real-world competitor and market intelligence data (funding, employees, etc.) to enrich AI analysis. Requires `TRACXN_API_KEY`, with graceful degradation if unavailable.
*   **PostgreSQL (via Neon)**: The primary database for persistent storage of user data, sessions, domain history, and analysis results. Requires `DATABASE_URL`.

### Third-Party Libraries
*   **UI Framework**: `@radix-ui/*`, `recharts`, `lucide-react`.
*   **State & Data**: `@tanstack/react-query`, `zod`, `react-hook-form`.
*   **Utilities**: `cheerio`, `node-fetch`, `clsx`, `tailwind-merge`, `date-fns`.
*   **Development & Backend**: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `bcrypt`, `express-session`.
*   **PDF Generation**: `@react-pdf/renderer`, `jspdf`, `html2canvas`.

## Recent Updates (November 2025)
### Comprehensive GEO Metrics System - Components Built (Backend Integration Pending)
Created complete frontend components for an advanced GEO (Generative Engine Optimization) metrics system. **Note: These features are currently gated and not visible in the production application until backend integration is complete.** All components are production-ready and saved in the codebase at:

**Current Status:** ✅ Frontend components complete | ⏳ Backend integration needed

1. **Interactive Metrics Documentation**
   - InfoButton component with tooltips and detailed modal explanations for every metric
   - Three main scoring factors: AIC (40%), CES (35%), MTS (25%)
   - MetricCard components with color-coded scoring anchors and info buttons
   - Comprehensive calculation methodology section with sub-metrics breakdown

2. **Competitor Discovery & Comparison**
   - 5-step competitor discovery methodology visualization
   - "The 7 Critical Consumer Questions" framework (Discovery, Comparison, Utility)
   - Comparison dimensions with weighted scoring (Discovery 30%, Comparison 35%, Utility 35%)
   - Interactive competitor comparison tables with head-to-head scoring

3. **"Open in AI" Testing Features**
   - OpenInAIButton component supporting ChatGPT, Claude, Perplexity, and Gemini
   - Pre-configured test queries with brand context
   - One-click testing of brand visibility in live AI platforms

4. **LLM Accuracy Verification**
   - Platform-by-platform accuracy checking with percentage scores
   - Hallucination detection and highlighting
   - Missing information tracking
   - Color-coded accuracy indicators (Green: ≥90%, Yellow: ≥70%, Red: <70%)

5. **Professional PDF Report Generation**
   - Multi-page PDF reports with black/white minimalist design
   - Includes cover page, executive summary, key metrics, platform analysis, competitive landscape, quick wins, strategic bets, and accuracy verification
   - One-click download with proper date formatting
   - Professional layout using `@react-pdf/renderer`

### New Files Added
*   `client/src/lib/geo-types.ts` - Comprehensive TypeScript type definitions for GEO metrics
*   `client/src/lib/geo-constants.ts` - Metric definitions, sub-metrics, discovery steps, consumer questions
*   `client/src/lib/mock-geo-data.ts` - Mock data generator for testing and demonstration
*   `client/src/components/InfoButton.tsx` - Interactive info button with tooltips and modals
*   `client/src/components/MetricCard.tsx` - Score display cards with color-coded progress bars
*   `client/src/components/OpenInAIButton.tsx` - "Test in AI" buttons for live platform testing
*   `client/src/components/CalculationMethodology.tsx` - Detailed methodology explanation with tabs
*   `client/src/components/CompetitorDiscovery.tsx` - Visual competitor discovery methodology
*   `client/src/components/CompetitorComparison.tsx` - Interactive competitor comparison table
*   `client/src/components/AccuracyIndicator.tsx` - LLM accuracy verification display
*   `client/src/components/PDFReport.tsx` - PDF report generation and download

### Next Steps for Backend Integration
To enable these GEO features in production, the following backend work is required:

1. **Extend AnalysisResult Schema** (`shared/schema.ts`):
   ```typescript
   // Add to AnalysisResult type:
   geoMetrics: {
     aic: number;
     ces: number;
     mts: number;
     overall: number;
   };
   competitorAnalysis: CompetitorAnalysis[];
   accuracyChecks: AccuracyCheck[];
   quickWins: QuickWin[];
   strategicBets: StrategicBet[];
   ```

2. **Update Analysis Service** (`server/services/analyzer.ts`):
   - Calculate AIC, CES, MTS scores from scraped data
   - Generate competitor comparison metrics
   - Implement LLM accuracy verification
   - Generate quick wins and strategic bets

3. **Update Storage Layer** (`server/storage.ts`):
   - Store GEO metrics in database
   - Persist competitor analysis results
   - Save accuracy check results

4. **Enable Frontend Components** (`client/src/components/AnalysisResults.tsx`):
   - Uncomment GEO component imports
   - Add Methodology, Discovery, and Accuracy tabs back to navigation
   - Connect components to real `AnalysisResult` data instead of mock data
   - Re-enable PDF export with real data

### Current Production Features
*   AnalysisResults component includes 5 tabs: Overview, Recommendations, Score Breakdown, Competitor Analysis, and Missing Elements
*   All features display real analysis data from the backend
*   No mock or placeholder data in production