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
### Comprehensive Metrics Documentation & PDF Reporting System
Added extensive GEO (Generative Engine Optimization) metrics documentation system with the following features:

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

### Enhanced Features
*   AnalysisResults component now includes 8 tabs: Overview, Recommendations, Score Breakdown, Competitor Analysis, Methodology, How We Find Competitors, Accuracy Check, and Missing Elements
*   All metrics now have interactive info buttons with detailed explanations
*   Scoring anchors clearly defined: 0-2 (Critical), 2-4 (Weak), 4-6 (Adequate), 6-8 (Strong), 8-10 (Outstanding)
*   GEO score calculation: Final Score = (AIC × 0.40) + (CES × 0.35) + (MTS × 0.25)