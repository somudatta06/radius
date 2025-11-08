export interface GEOScore {
  factor: 'AIC' | 'CES' | 'MTS';
  score_0_to_10: number;
  confidence_0_to_1: number;
  sub_scores: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  };
  top_strengths: string[];
  top_gaps: string[];
  evidence_snippets: EvidenceSnippet[];
  recommended_actions: RecommendedAction[];
  inferred_intents?: string[];
  inferred_entities?: string[];
  red_flags?: string[];
}

export interface EvidenceSnippet {
  quote: string;
  location: {
    path: string;
    start_ix?: number;
    end_ix?: number;
  };
}

export interface RecommendedAction {
  action: string;
  why_it_matters: string;
  est_impact_high_med_low: 'high' | 'med' | 'low';
  effort_low_med_high: 'low' | 'med' | 'high';
  owner_hint: string;
}

export interface QuickWin {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  owner: string;
  expected_outcome: string;
}

export interface StrategicBet {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  owner: string;
  timeline?: string;
  expected_outcome: string;
}

export interface PlatformScore {
  platform: string;
  aic_score: number;
  ces_score: number;
  mts_score: number;
  overall_score: number;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
}

export interface CompetitorAnalysis {
  name: string;
  url: string;
  discovery_score: number;
  comparison_score: number;
  utility_score: number;
  overall_geo_score: number;
  mention_frequency: number;
  citation_rate: number;
  head_to_head_wins: number;
  key_differentiators: string[];
}

export interface AccuracyCheck {
  platform: string;
  test_queries: string[];
  overall_accuracy: number;
  hallucinations: Hallucination[];
  missing_info: string[];
  correct_facts: string[];
}

export interface TestQuery {
  query: string;
  expected_facts: string[];
  actual_response: string;
  accuracy_score: number;
  is_critical: boolean;
}

export interface Hallucination {
  claim: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface MetricDefinition {
  code: string;
  title: string;
  description: string;
  weight?: number;
  calculation_method: string;
  scoring_anchors: {
    range: string;
    label: string;
    description: string;
  }[];
  examples?: {
    score: number;
    description: string;
  }[];
}

export interface SubMetricDefinition {
  code: string;
  name: string;
  description: string;
  calculation: string;
  importance: string;
}

export interface CompetitorDiscoveryStep {
  step: number;
  title: string;
  description: string;
  method: string;
  icon: string;
  technical_details?: string;
}

export interface ConsumerQuestion {
  category: 'Discovery' | 'Comparison' | 'Utility';
  weight: number;
  questions: string[];
  metric: string;
  why_it_matters: string;
}

export interface ComparisonDimension {
  name: string;
  weight: number;
  description: string;
  metrics: string[];
  calculation_formula?: string;
}

export interface ReportData {
  websiteUrl: string;
  domain: string;
  generatedAt: Date;
  overallScore: number;
  aic: number;
  ces: number;
  mts: number;
  executiveSummary: string;
  platforms: PlatformScore[];
  competitors: CompetitorAnalysis[];
  quickWins: QuickWin[];
  strategicBets: StrategicBet[];
  accuracyChecks: AccuracyCheck[];
  experiments?: Experiment[];
  riskNotes?: string[];
}

export interface Experiment {
  hypothesis: string;
  test_method: string;
  success_metrics: string[];
  duration?: string;
}

export type ScoreRange = '0-2' | '2-4' | '4-6' | '6-8' | '8-10';

export const SCORE_LABELS: Record<ScoreRange, string> = {
  '0-2': 'Critical',
  '2-4': 'Weak',
  '4-6': 'Adequate',
  '6-8': 'Strong',
  '8-10': 'Outstanding'
};

export function getScoreLabel(score: number): string {
  if (score >= 0 && score < 2) return SCORE_LABELS['0-2'];
  if (score >= 2 && score < 4) return SCORE_LABELS['2-4'];
  if (score >= 4 && score < 6) return SCORE_LABELS['4-6'];
  if (score >= 6 && score < 8) return SCORE_LABELS['6-8'];
  if (score >= 8 && score <= 10) return SCORE_LABELS['8-10'];
  return 'Unknown';
}

export function calculateWeightedScore(
  aic: number,
  ces: number,
  mts: number,
  weights = { AIC: 0.40, CES: 0.35, MTS: 0.25 }
): number {
  return Number(
    (aic * weights.AIC + ces * weights.CES + mts * weights.MTS).toFixed(1)
  );
}

export function calculateFactorScore(subScores: {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
}): number {
  const { s1, s2, s3, s4, s5 } = subScores;
  return Number(((s1 + s2 + s3 + s4 + s5) / 5).toFixed(1));
}
