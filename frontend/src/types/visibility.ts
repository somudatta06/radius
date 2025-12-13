/**
 * Visibility Analytics Type Definitions
 */

export interface Competitor {
  id: string;
  name: string;
  aliases?: string[];
  website?: string;
  is_manual: boolean;
  category?: string;
}

export interface VisibilityMetrics {
  mention_rate: number;
  avg_position?: number;
  sentiment_score: number;
  share_of_voice: number;
  total_mentions: number;
  total_prompts: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface MentionRateData {
  metrics: {
    current: number;
    previous: number;
    total_mentions: number;
    total_prompts: number;
    time_series: TimeSeriesData[];
  };
  rankings: CompetitorRanking[];
}

export interface CompetitorRanking {
  rank: number;
  competitor_id: string;
  competitor_name: string;
  mention_rate?: number;
  avg_position?: number;
  share?: number;
  is_current: boolean;
}

export interface GeoData {
  region: string;
  country_code: string;
  mention_rate: number;
  share_of_voice: number;
  total_mentions: number;
  total_prompts: number;
}

export interface SentimentData {
  score: number;
  time_series: TimeSeriesData[];
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface ShareOfVoiceData {
  competitors: CompetitorRanking[];
  total_mentions: number;
}

export interface VisibilityFilters {
  startDate: string;
  endDate: string;
  granularity: 'daily' | 'weekly' | 'monthly';
  provider?: string;
  keyword?: string;
}
