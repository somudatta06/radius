/**
 * Component Barrel Export
 * Centralized export for all reusable components
 * 
 * Benefits:
 * - Single import source
 * - Better tree-shaking
 * - Predictable imports
 */

// Analytics & Discovery
export { CompetitorDiscovery } from './CompetitorDiscovery';
export { CompetitorComparison } from './CompetitorComparison';
export { CalculationMethodology } from './CalculationMethodology';

// Cards & Display
export { MissingElementsCard } from './MissingElementsCard';
export { MetricCard } from './MetricCard';
export { MetricInfoCards } from './MetricInfoCards';

// Navigation & Layout
export { NavbarTypingText } from './NavbarTypingText';

// Modals & Overlays
export { JavaScriptHeavyErrorModal } from './JavaScriptHeavyErrorModal';

// Indicators & Status
export { AccuracyIndicator } from './AccuracyIndicator';
export { AnalysisTimeline } from './AnalysisTimeline';

// Interactive Elements
export { OpenInAIButton } from './OpenInAIButton';
export { InfoButton } from './InfoButton';

// Reports & Documents
export { PDFReport } from './PDFReport';
export { BriefSection } from './BriefSection';

// Features & Sections
export { FeaturesSection } from './FeaturesSection';

// Default exports (for components following page pattern)
export { default as AnalysisResults } from './AnalysisResults';
export { default as CompetitorCard } from './CompetitorCard';
export { default as DashboardHeader } from './DashboardHeader';
export { default as Footer } from './Footer';
export { default as HeroSection } from './HeroSection';
export { default as LandingNav } from './LandingNav';
export { default as LLMStatementSection } from './LLMStatementSection';
export { default as PlatformComparison } from './PlatformComparison';
export { default as RecommendationCard } from './RecommendationCard';
export { default as ScoreBreakdown } from './ScoreBreakdown';
export { default as StatsCard } from './StatsCard';
export { default as URLInputForm } from './URLInputForm';
export { default as VideoSection } from './VideoSection';
export { default as WhatIsGEOSection } from './WhatIsGEOSection';
