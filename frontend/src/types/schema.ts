// Analysis Types
export interface AnalysisError {
  technicalDetails: {
    htmlLength?: number;
    title?: string;
    h1Count?: number;
    links?: number;
    scripts?: number;
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
}

export interface Gap {
  element: string;
  impact: string;
  found: boolean;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: string;
  category: string;
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
}
