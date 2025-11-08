import { useState } from "react";
import { TrendingUp, Target, Users, Zap } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import PlatformComparison from "@/components/PlatformComparison";
import CompetitorCard from "@/components/CompetitorCard";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import RecommendationCard from "@/components/RecommendationCard";
import GapDetectionCard from "@/components/GapDetectionCard";
import type { AnalysisResult } from "@shared/schema";

type Tab = "overview" | "recommendations" | "score-breakdown" | "competitors" | "missing-elements";

interface TabConfig {
  id: Tab;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "recommendations", label: "Recommendations" },
  { id: "score-breakdown", label: "Score Breakdown" },
  { id: "competitors", label: "Competitor Analysis" },
  { id: "missing-elements", label: "Missing Elements" },
];

interface AnalysisResultsProps {
  data: AnalysisResult;
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { brandInfo, overallScore, platformScores, dimensionScores, competitors, gaps, recommendations } = data;

  // Extract domain for use in components
  const domain = brandInfo.domain;

  // Calculate stats
  const mentionRate = dimensionScores.find(d => d.dimension === 'Mention Rate')?.score || 0;
  const avgPlatformScore = Math.round(platformScores.reduce((sum, p) => sum + p.score, 0) / platformScores.length);
  const yourRank = competitors.find(c => c.isCurrentBrand)?.rank || 0;
  const totalCompetitors = competitors.length;

  return (
    <main className="container mx-auto px-6 py-8 pt-28">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <p className="text-muted-foreground mt-2">Comprehensive AI visibility analysis for {domain}</p>
      </div>

      {/* Liquid Glass Tab Navigation */}
      <div className="mb-12">
        <div className="flex items-center gap-2 p-1.5 bg-card/90 backdrop-blur-xl border border-border rounded-full shadow-lg overflow-x-auto flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`
                px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap
                transition-all duration-300 ease-out
                relative overflow-hidden
                ${
                  activeTab === tab.id
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
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8" data-testid="content-overview">

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


          {/* Platform Comparison */}
          <div>
            <PlatformComparison data={platformScores} />
          </div>
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="space-y-6" data-testid="content-recommendations">
          <h2 className="text-2xl font-bold">AI-Generated Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec, idx: number) => (
              <RecommendationCard 
                key={idx}
                title={rec.title}
                description={rec.description}
                priority={rec.priority}
                category={rec.category}
                actionItems={rec.actionItems}
                estimatedImpact={rec.estimatedImpact}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "score-breakdown" && (
        <div className="space-y-6" data-testid="content-score-breakdown">
          <h2 className="text-2xl font-bold">Dimension Analysis</h2>
          <ScoreBreakdown data={dimensionScores} />
        </div>
      )}

      {activeTab === "competitors" && (
        <div className="space-y-6" data-testid="content-competitors">
          <h2 className="text-2xl font-bold">Competitor Rankings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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


      {activeTab === "missing-elements" && (
        <div className="space-y-6" data-testid="content-missing-elements">
          <h2 className="text-2xl font-bold">Missing Elements Detected</h2>
          <GapDetectionCard gaps={gaps} />
        </div>
      )}
    </main>
  );
}
