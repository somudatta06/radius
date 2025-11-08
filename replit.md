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