# Radius Project Rules

## Tech Stack
- Backend: Python FastAPI (backend/server.py + backend/services/)
- Frontend: React + Vite + TypeScript (frontend/src/)
- Database: MongoDB (motor async driver)
- UI Library: shadcn/ui (Card, Badge, Tabs, Skeleton, Button, Input, Select, Dialog)
- Icons: lucide-react (ONLY)
- Charts: recharts (ONLY)
- Styling: Tailwind CSS with CSS custom properties
- Routing: wouter
- Data fetching: @tanstack/react-query
- Package manager: npm (frontend), pip (backend)

## Design System (MANDATORY)
- Background: white (light), warm dark (dark mode)
- Primary: black in light mode, warm orange (hsl 9 75% 61%) in dark mode  
- Accent: blue (hsl 221 83% 53%)
- Font: Inter (all weights)
- Cards: rounded-lg border border-border p-6, hover-elevate class for hover effects
- Badge styles:
  - HIGH priority: "bg-foreground text-background px-3 py-1 rounded-full text-xs font-medium"
  - MEDIUM priority: "border border-border text-foreground px-3 py-1 rounded-full text-xs font-medium"
  - LOW priority: "bg-muted text-foreground px-3 py-1 rounded-full text-xs font-medium"
- Score colors: green-600 (>=80), blue-600 (>=60), yellow-600 (>=40), orange-600 (>=20), red-600 (<20)
- Spacing: p-6/p-8 inside cards, gap-6 between cards, space-y-8 between sections
- Typography:
  - Page titles: text-3xl font-bold
  - Section headers: text-2xl font-bold  
  - Card titles: text-lg font-semibold OR text-sm font-medium text-muted-foreground
  - Body: text-sm
  - Metadata: text-xs text-muted-foreground
- Loading states: Skeleton components from shadcn/ui
- Animations: animate-fade-in-up, hover-elevate, animate-pulse-subtle (all defined in index.css)
- Tab navigation: Liquid glass rounded-full pill bar (see AnalysisResults.tsx)

## Backend Patterns
- All services in backend/services/ as classes with async methods
- OpenAI calls: use gpt-4o-mini, ONE call per service (batch everything)
- EVERY service must have a _demo_data() fallback method
- EVERY endpoint wrapped in try/except returning demo data on failure
- Import OpenAI client: from openai import OpenAI; client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
- All GPT prompts end with "Return ONLY valid JSON:" followed by the schema

## Frontend Patterns  
- Component files in frontend/src/components/
- Pages in frontend/src/pages/
- Data fetching: useQuery from @tanstack/react-query
- API base URL: import.meta.env.REACT_APP_BACKEND_URL || ""
- Named exports for new components (not default)
- Every component handles 3 states: loading (Skeleton), error (muted banner with AlertTriangle), success (data render)

## Critical Rules
- ADDITIVE ONLY: Never rewrite existing files. Add new files + targeted edits.
- No new npm packages.
- No new CSS files or fonts.
- Every GPT call requests JSON-only response.
- The app must never show a 500 error — always graceful demo data fallback.
