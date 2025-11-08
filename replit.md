# Radius - AI Visibility Analyzer

## Overview
Radius is a production-ready SaaS application designed to analyze a brand's visibility across major AI platforms (ChatGPT, Claude, Gemini, and Perplexity). It achieves this by scraping websites, identifying competitors using OpenAI's GPT models and Tracxn data, and generating detailed, actionable insights. The application provides a modern dashboard featuring comprehensive metrics, interactive tools, competitor discovery methodologies, LLM accuracy verification, "Open in AI" testing capabilities, and professional PDF report generation. The primary goal is to equip businesses with a clear understanding of their AI presence and competitive landscape.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The Radius platform is built with a robust, scalable architecture. The frontend, developed with React 18, TypeScript, and Vite, uses `shadcn/ui` and Tailwind CSS for a minimalist black and white aesthetic with blue accents. State management is handled by TanStack Query for server state and local React state for UI interactions, with Wouter managing client-side routing. Key UI/UX decisions include an AI analysis progress bar, a comprehensive Generative Engine Optimization (GEO) metrics system with interactive documentation, "Open in AI" testing features, LLM accuracy verification, and professional PDF report generation. Recommendations are hyper-personalized based on brand context.

The backend is an Express.js application, also in TypeScript, providing RESTful APIs for analysis, authentication, and history. It integrates web scraping (Cheerio), AI processing (OpenAI GPT-4o-mini), and market intelligence (Tracxn). OpenAI's GPT-4o-mini is central to various functionalities, including brand extraction, competitor discovery, platform visibility analysis, dimension scoring, and recommendation generation, utilizing JSON mode with Zod for schema validation. PostgreSQL, managed with Drizzle ORM, serves as the primary data store for user information, sessions, domain history, and analysis results. Session-based authentication is implemented using `bcrypt` for password hashing and a custom `DatabaseSessionStore`.

The system incorporates a three-tier error handling system to manage JavaScript-heavy websites, categorized into SEVERE, LIMITED, and WARNING tiers, ensuring cost savings by preventing unnecessary API calls and providing educational user feedback. For JavaScript-dependent sites that return minimal static HTML, the GEO scoring system provides baseline scores instead of zero, offering a more accurate reflection of the site's existence and functionality.

## External Dependencies
### Core Services
*   **OpenAI API**: Utilized for all AI-powered analysis, including competitor discovery, scoring, and recommendations.
*   **Tracxn API**: Provides essential competitor and market intelligence data.
*   **PostgreSQL (via Neon)**: The primary database for persistent data storage.

### Third-Party Libraries
*   **UI Framework**: `@radix-ui/*`, `recharts`, `lucide-react`.
*   **State & Data Management**: `@tanstack/react-query`, `zod`, `react-hook-form`.
*   **Utilities**: `cheerio`, `node-fetch`, `clsx`, `tailwind-merge`, `date-fns`.
*   **Backend & ORM**: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `bcrypt`, `express-session`.
*   **PDF Generation**: `@react-pdf/renderer`.

## Recent Updates (November 2025)

### Premium Features Section - PRODUCTION READY ✅
World-class features section on the landing page showcasing Radius's four key capabilities with data visualizations and premium animations.

**Features Showcased:**
1. **Visibility**: Line chart visualization showing AI platform performance trends across ChatGPT, Claude, Gemini, and Perplexity
2. **Sources**: Bar chart visualization displaying source impact rankings (Twitter, YouTube, Wikipedia, LinkedIn)
3. **Competitor Tracking**: Interactive table showing competitor rankings with trend indicators
4. **Recent Mentions**: Position indicators with icons showing mention rankings across AI platforms

**Design Implementation:**
- **Minimal Aesthetic**: Maintains black/white design with semantic color tokens for dark/light mode support
- **Premium Animations**: Smooth fade-in-up entrance with staggered delays (200/400/600/800ms) for professional reveal
- **Data Visualizations**: SVG line charts with animated path drawing, bar charts, competitor tables, and position indicators
- **Interactive Elements**: Hover elevation effects using design system utilities (hover-elevate, active-elevate-2)
- **Responsive Layout**: 2-column grid on large screens (lg:grid-cols-2), stacks on mobile

**Technical Details:**
- Component: `client/src/components/FeaturesSection.tsx`
- Icons: Lucide-react icons (Target, Star, Award) - no emojis per design guidelines
- Animations: CSS keyframes for draw-line (SVG paths), fade-in-up (entrance), with delay utilities
- Button: Shadcn Button component with size="lg" variant
- Colors: Semantic tokens only (text-primary, text-destructive, text-muted-foreground)

**Quality Assurance:**
- Architect-approved with PASS verdict
- E2E tested with all 4 cards, visualizations, and interactions verified
- Full design system compliance (no custom hover classes, no manual Button padding, semantic colors throughout)
- Production-ready with smooth animations and premium feel