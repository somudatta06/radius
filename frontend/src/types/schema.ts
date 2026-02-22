// Analysis Types

export interface AnalysisError {
  message?: string;
  technicalDetails: {
    htmlLength?: number;
    title?: string;
    h1Count?: number;
    links?: number;
    scripts?: number;
    contentLength?: number;
    headingCount?: number;
    hasTitle?: boolean;
    estimatedJSCoverage?: number;
  };
  suggestions: string[];
}

export interface BrandInfo {
  name: string;
  domain: string;
  industry: string;
  description: string;
}

export interface PlatformScore {
  platform: string;
  score: number;
  color: string;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  fullMark: number;
}

export interface Competitor {
  rank: number;
  name: string;
  domain: string;
  score: number;
  marketOverlap: number;
  strengths: string[];
  isCurrentBrand?: boolean;
  funding?: number;
  employees?: number;
  founded?: number;
  description?: string;
}

export interface Gap {
  element: string;
  impact: "high" | "medium" | "low";
  found: boolean;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "content" | "technical" | "seo" | "competitive";
  actionItems: string[];
  estimatedImpact: string;
}

export interface GeoMetrics {
  aic: number;
  ces: number;
  mts: number;
  overall: number;
}

export interface AnalysisResult {
  url: string;
  brandInfo: BrandInfo;
  overallScore: number;
  platformScores: PlatformScore[];
  dimensionScores: DimensionScore[];
  competitors: Competitor[];
  gaps: Gap[];
  recommendations: Recommendation[];
  geoMetrics?: GeoMetrics;
  // Extended GEO fields (from full Radius pipeline)
  competitorAnalysis?: import("@/lib/geo-types").CompetitorAnalysis[];
  platformScoreDetails?: import("@/lib/geo-types").PlatformScore[];
  accuracyChecks?: import("@/lib/geo-types").AccuracyCheck[];
  quickWins?: import("@/lib/geo-types").QuickWin[];
  strategicBets?: import("@/lib/geo-types").StrategicBet[];
  error?: AnalysisError;
  qualityWarning?: string;
  // Data provenance fields (CRITICAL for no-cache architecture)
  analysisId?: string;
  analyzedAt?: string;
  dataProvenance?: {
    cache_used: boolean;
    fresh_crawl: boolean;
    fresh_gpt_call: boolean;
    timestamp: string;
  };
}
