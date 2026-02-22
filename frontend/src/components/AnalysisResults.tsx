import { useState, useEffect } from "react";
import { TrendingUp, Target, Users, Zap } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import PlatformComparison from "@/components/PlatformComparison";
import CompetitorCard from "@/components/CompetitorCard";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import RecommendationCard from "@/components/RecommendationCard";
import { MissingElementsCard } from "@/components/MissingElementsCard";
import { MetricCard } from "@/components/MetricCard";
import { MetricInfoCards } from "@/components/MetricInfoCards";
import { CalculationMethodology } from "@/components/CalculationMethodology";
import { CompetitorDiscovery } from "@/components/CompetitorDiscovery";
import { CompetitorComparison } from "@/components/CompetitorComparison";
import { AccuracyIndicator } from "@/components/AccuracyIndicator";
import { VisibilityDashboard } from "@/components/visibility/VisibilityDashboard";
import { OpenInAIButton } from "@/components/OpenInAIButton";
import { PDFReport } from "@/components/PDFReport";
import { BriefSection } from "@/components/BriefSection";
import { JavaScriptHeavyErrorModal } from "@/components/JavaScriptHeavyErrorModal";
import { KnowledgeBaseSummaryPanel } from "@/components/KnowledgeBaseSummaryPanel";
import { RedditAnalyticsTab } from "@/components/reddit/RedditAnalyticsTab";
import { GapAnalysis } from "@/components/GapAnalysis";
import { AdIntelligence } from "@/components/AdIntelligence";
import { ContentPipeline } from "@/components/ContentPipeline";
import { SearchIntelligence } from "@/components/SearchIntelligence";
import { SchemaGenerator } from "@/components/SchemaGenerator";
import { BrandIntelligenceHeader } from "@/components/BrandIntelligenceHeader";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { METRIC_DEFINITIONS } from "@/lib/geo-constants";
import type { AnalysisResult } from "@/types/schema";
import type { ReportData } from "@/lib/geo-types";
import { format } from 'date-fns';

type Tab = "overview" | "gap-analysis" | "ad-intelligence" | "content-pipeline" | "search-sge" | "schema-generator" | "knowledge-base" | "visibility" | "recommendations" | "score-breakdown" | "competitors" | "methodology" | "discovery" | "reddit" | "accuracy";

interface TabConfig {
  id: Tab;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "ad-intelligence", label: "Ad Intelligence" },
  { id: "content-pipeline", label: "Content Pipeline" },
  { id: "search-sge", label: "Search & SGE" },
  { id: "schema-generator", label: "Schema Generator" },
  { id: "knowledge-base", label: "Knowledge Base" },
  { id: "visibility", label: "Visibility" },
  { id: "score-breakdown", label: "Score Breakdown" },
  { id: "competitors", label: "Competitor Analysis" },
  { id: "reddit", label: "Reddit Intelligence" },
  { id: "methodology", label: "Methodology" },
  { id: "discovery", label: "Competitor Discovery" },
  { id: "accuracy", label: "Accuracy Check" },
];

interface AnalysisResultsProps {
  data: AnalysisResult;
  analysisId?: string;  // Analysis ID for per-analysis data fetching
}

export default function AnalysisResults({ data, analysisId }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const {
    brandInfo, overallScore, platformScores, dimensionScores, competitors, gaps, recommendations,
    geoMetrics, competitorAnalysis, platformScoreDetails, accuracyChecks, quickWins, strategicBets,
    error, qualityWarning
  } = data;

  // Show error modal on mount if there's a severe error
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Extract domain for use in components
  const domain = brandInfo.domain;

  // Use analysisId for per-analysis data (KB, Reddit, etc.)
  // Falls back to domain-based ID for backward compatibility
  const dataId = analysisId || domain?.replace(/\./g, '_') || 'default';

  // Calculate stats
  const mentionRate = dimensionScores.find(d => d.dimension === 'Mention Rate')?.score || 0;
  const avgPlatformScore = Math.round(platformScores.reduce((sum, p) => sum + p.score, 0) / platformScores.length);
  const yourRank = competitors.find(c => c.isCurrentBrand)?.rank || 0;
  const totalCompetitors = competitors.length;

  // Prepare PDF report data (only if GEO data is available)
  const pdfReportData: ReportData | null = geoMetrics && competitorAnalysis && platformScoreDetails && accuracyChecks ? {
    websiteUrl: data.url,
    domain: domain,
    generatedAt: new Date(),
    overallScore: geoMetrics.overall,
    aic: geoMetrics.aic,
    ces: geoMetrics.ces,
    mts: geoMetrics.mts,
    executiveSummary: `Your brand demonstrates ${geoMetrics.overall >= 7 ? 'strong' : geoMetrics.overall >= 5 ? 'moderate' : 'developing'} AI visibility with a GEO score of ${geoMetrics.overall}/10. Focus areas include ${geoMetrics.aic < 6 ? 'content depth,' : ''} ${geoMetrics.ces < 6 ? 'credibility signals,' : ''} ${geoMetrics.mts < 6 ? 'technical optimization' : ''}.`,
    platforms: platformScoreDetails,
    competitors: competitorAnalysis,
    quickWins: quickWins || [],
    strategicBets: strategicBets || [],
    accuracyChecks: accuracyChecks,
  } : null;

  return (
    <>
      {/* JavaScript Heavy Error Modal */}
      {error && (
        <JavaScriptHeavyErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          url={data.url}
          errorDetails={error}
        />
      )}

      <main className="container mx-auto px-6 py-8 pt-28">
        {/* Header with PDF Export */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analysis Results</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-muted-foreground">Comprehensive AI visibility analysis for {domain}</p>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-green-700" title="This analysis uses your company description, brand rules, and evidence">
                  Knowledge Base Applied
                </span>
              </div>
            </div>
          </div>
          {pdfReportData && <PDFReport data={pdfReportData} />}
        </div>
        {/* Liquid Glass Tab Navigation */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-2 p-1.5 bg-card/90 backdrop-blur-xl border border-border rounded-full shadow-lg overflow-x-auto">
            {/* Left-aligned tabs */}
            <div className="flex items-center gap-2">
              {tabs.filter(tab => tab.id !== "methodology").map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id}`}
                  className={`
                  px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap
                  transition-all duration-300 ease-out
                  relative overflow-hidden
                  ${activeTab === tab.id
                      ? "bg-foreground text-background shadow-md"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }
                `}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Right-aligned Methodology tab */}
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab("methodology")}
                data-testid="tab-methodology"
                className={`
                px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap
                transition-all duration-300 ease-out
                relative overflow-hidden
                ${activeTab === "methodology"
                    ? "bg-foreground text-background shadow-md"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }
              `}
              >
                {activeTab === "methodology" && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
                )}
                <span className="relative z-10">Methodology</span>
              </button>
            </div>
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8" data-testid="content-overview">
            {/* Brand Intelligence Header */}
            <BrandIntelligenceHeader
              brandName={brandInfo.name}
              domain={domain}
              overallScore={overallScore}
            />

            {/* Executive Summary */}
            <ExecutiveSummary
              overallScore={overallScore}
              brandName={brandInfo.name}
              recommendations={recommendations}
            />

            {/* GEO Metrics */}
            {geoMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  score={geoMetrics.aic}
                  label="AIC"
                  sublabel="Answerability & Intent Coverage"
                  showInfoButton={true}
                  metricDefinition={METRIC_DEFINITIONS.AIC}
                  metricCode="AIC"
                />
                <MetricCard
                  score={geoMetrics.ces}
                  label="CES"
                  sublabel="Credibility, Evidence & Safety"
                  showInfoButton={true}
                  metricDefinition={METRIC_DEFINITIONS.CES}
                  metricCode="CES"
                />
                <MetricCard
                  score={geoMetrics.mts}
                  label="MTS"
                  sublabel="Machine-Readability & Technical"
                  showInfoButton={true}
                  metricDefinition={METRIC_DEFINITIONS.MTS}
                  metricCode="MTS"
                />
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Overall Score"
                value={overallScore}
                subtitle={`${100 - overallScore} points potential`}
                icon={TrendingUp}
                trend="up"
              />
              <StatsCard
                title="Mention Rate"
                value={`${mentionRate}%`}
                subtitle="In AI responses"
                icon={Target}
              />
              <StatsCard
                title="Competitor Position"
                value={`#${yourRank}`}
                subtitle={`Out of ${totalCompetitors} competitors`}
                icon={Users}
              />
              <StatsCard
                title="Platform Average"
                value={avgPlatformScore}
                subtitle="Across 4 AI platforms"
                icon={Zap}
              />
            </div>

            {/* Test in AI Platforms */}
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Test Your Visibility Live</h3>
              <p className="text-sm text-muted-foreground">
                See how AI platforms respond to queries about your brand right now
              </p>
              <div className="flex flex-wrap gap-3">
                <OpenInAIButton
                  platform="ChatGPT"
                  query={`What are the top companies in the ${brandInfo.industry || 'industry'} space?`}
                  context={{ brandName: brandInfo.name }}
                />
                <OpenInAIButton
                  platform="Claude"
                  query={`Compare the leading solutions for ${brandInfo.industry || 'this category'}`}
                  context={{ brandName: brandInfo.name }}
                />
                <OpenInAIButton
                  platform="Perplexity"
                  query={`Who are the main competitors of ${brandInfo.name}?`}
                  context={{ brandName: brandInfo.name }}
                />
                <OpenInAIButton
                  platform="Gemini"
                  query={`What is ${brandInfo.name}?`}
                  context={{ brandName: brandInfo.name }}
                />
              </div>
            </div>

            {/* Platform Comparison */}
            <div>
              <PlatformComparison data={platformScores} />
            </div>

            {/* AI-Generated Brief */}
            <BriefSection
              overallScore={overallScore}
              platformScores={platformScores}
              brandName={brandInfo.name}
              domain={domain}
            />
          </div>
        )}

        {activeTab === "ad-intelligence" && (
          <div className="space-y-6" data-testid="content-ad-intelligence">
            <AdIntelligence
              brandName={brandInfo?.name}
              domain={domain}
              competitors={competitors
                .filter(c => !c.isCurrentBrand)
                .map(c => ({ name: c.name, domain: c.domain }))}
              category={brandInfo?.industry}
            />
          </div>
        )}

        {activeTab === "knowledge-base" && (
          <div className="space-y-6" data-testid="content-knowledge-base">
            <KnowledgeBaseSummaryPanel brandName={brandInfo?.name} domain={domain} analysisId={dataId} />
          </div>
        )}

        {activeTab === "visibility" && (
          <div className="space-y-6" data-testid="content-visibility">
            <VisibilityDashboard brandId={brandInfo?.name} domain={domain} />
          </div>
        )}

        {activeTab === "reddit" && (
          <div className="space-y-6" data-testid="content-reddit">
            <RedditAnalyticsTab brandName={brandInfo?.name} analysisId={dataId} />
          </div>
        )}

        {activeTab === "score-breakdown" && (
          <div className="space-y-6" data-testid="content-score-breakdown">
            <h2 className="text-2xl font-bold">Dimension Analysis</h2>
            <ScoreBreakdown data={dimensionScores} />
            <MetricInfoCards data={dimensionScores} />
          </div>
        )}
        {activeTab === "competitors" && (
          <div className="space-y-8" data-testid="content-competitors">
            <div>
              <h2 className="text-3xl font-bold mb-2">Competitor Rankings</h2>
              <p className="text-muted-foreground">Discover how you stack up against your competition</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {competitors.map((competitor) => (
                <CompetitorCard
                  key={competitor.rank}
                  rank={competitor.rank}
                  name={competitor.name}
                  domain={competitor.domain}
                  score={competitor.score}
                  marketOverlap={competitor.marketOverlap}
                  strengths={competitor.strengths}
                  isCurrentBrand={competitor.isCurrentBrand || false}
                  funding={competitor.funding}
                  employees={competitor.employees}
                  founded={competitor.founded}
                  description={competitor.description}
                />
              ))}
            </div>
          </div>
        )}
        {activeTab === "content-pipeline" && (
          <div className="space-y-6" data-testid="content-content-pipeline">
            <ContentPipeline
              brandName={brandInfo?.name || domain}
            />
          </div>
        )}
        {activeTab === "search-sge" && (
          <div className="space-y-6" data-testid="content-search-sge">
            <SearchIntelligence
              brandName={brandInfo?.name || domain}
              category={(data as any).industry || "E-commerce"}
            />
          </div>
        )}
        {activeTab === "schema-generator" && (
          <div className="space-y-6" data-testid="content-schema-generator">
            <SchemaGenerator
              brandName={brandInfo?.name || domain}
              domain={domain}
              analysisData={{ overallScore: data.overallScore, industry: (data as any).industry }}
            />
          </div>
        )}
        {activeTab === "methodology" && (
          <div className="space-y-6" data-testid="content-methodology">
            <CalculationMethodology />
          </div>
        )}
        {activeTab === "discovery" && (
          <div className="space-y-6" data-testid="content-discovery">
            <CompetitorDiscovery />
            {competitorAnalysis && competitorAnalysis.length > 1 && (
              <CompetitorComparison
                userBrand={competitorAnalysis[0]}
                competitors={competitorAnalysis.slice(1)}
              />
            )}
          </div>
        )}
        {activeTab === "accuracy" && (
          <div className="space-y-6" data-testid="content-accuracy">
            {accuracyChecks && accuracyChecks.length > 0 ? (
              <AccuracyIndicator accuracyChecks={accuracyChecks} />
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No accuracy check data available
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
