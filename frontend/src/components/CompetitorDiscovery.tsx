import { useState } from 'react';
import { Search, TrendingUp, AlertCircle, Target, DollarSign, Users, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config';

interface Competitor {
  id: string;
  name: string;
  website: string;
  category: string;
  description: string;
  funding: {
    total: number;
    currency: string;
    stage: string;
  };
  stage: string;
  employees: number | null;
  founded: number | null;
}

interface CompetitorScore {
  name: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  positioning: string;
  threatLevel: 'high' | 'medium' | 'low';
  keyMetrics?: {
    fundingScore: number;
    marketPresence: number;
    innovation: number;
  };
}

interface Analysis {
  competitorScores: CompetitorScore[];
  summary: string;
  recommendedStrategy: string;
  marketInsights: string;
  keyOpportunities: string[];
}

export function CompetitorDiscovery() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword');
      return;
    }

    setLoading(true);
    setError('');
    setCompetitors([]);
    setAnalysis(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/competitors?query=${encodeURIComponent(keyword)}&limit=10&analyze=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch competitors');
      }

      const data = await response.json();
      
      if (data.success) {
        setCompetitors(data.competitors || []);
        setAnalysis(data.analysis || null);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Competitor Discovery</h1>
        <p className="text-muted-foreground text-lg">
          Discover and analyze competitors using AI-powered insights
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your startup keyword (e.g., 'AI analytics', 'SaaS CRM')"
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                Discover Competitors
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* AI Analysis Summary */}
      {analysis && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            AI Strategic Analysis
          </h2>
          
          <div className="prose max-w-none">
            <div className="bg-background rounded-lg p-4 border">
              <h3 className="text-lg font-semibold mb-2">Market Summary</h3>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>

            <div className="bg-background rounded-lg p-4 border mt-4">
              <h3 className="text-lg font-semibold mb-2">Recommended Strategy</h3>
              <p className="text-muted-foreground">{analysis.recommendedStrategy}</p>
            </div>

            {analysis.keyOpportunities && analysis.keyOpportunities.length > 0 && (
              <div className="bg-background rounded-lg p-4 border mt-4">
                <h3 className="text-lg font-semibold mb-2">Key Opportunities</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {analysis.keyOpportunities.map((opp, idx) => (
                    <li key={idx}>{opp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Competitor Scores */}
      {analysis?.competitorScores && analysis.competitorScores.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Competitor Scores</h2>
          
          <div className="grid gap-4">
            {analysis.competitorScores.map((comp, idx) => (
              <div key={idx} className="bg-card border border-card-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{comp.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{comp.positioning}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(comp.score)}`}>
                      {comp.score}
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getThreatColor(comp.threatLevel)}`}>
                    {comp.threatLevel.toUpperCase()} Threat
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-600">Strengths</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {comp.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-600">Weaknesses</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {comp.weaknesses.map((weakness, i) => (
                        <li key={i}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Competitor Data */}
      {competitors.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Competitor Details</h2>
          
          <div className="grid gap-4">
            {competitors.map((comp, idx) => (
              <div key={idx} className="bg-card border border-card-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{comp.name}</h3>
                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm"
                      >
                        {comp.website}
                      </a>
                    )}
                    <p className="text-muted-foreground text-sm mt-2">{comp.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        ${(comp.funding?.total / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-muted-foreground">Funding</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{comp.funding?.stage || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">Stage</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{comp.employees || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Employees</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{comp.founded || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Founded</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && competitors.length === 0 && !error && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No results yet</h3>
          <p className="text-muted-foreground">
            Enter a keyword above to discover and analyze competitors
          </p>
        </div>
      )}
    </div>
  );
}
