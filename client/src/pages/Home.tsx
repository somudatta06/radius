import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LandingNav from "@/components/LandingNav";
import HeroSection from "@/components/HeroSection";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCard from "@/components/StatsCard";
import PlatformComparison from "@/components/PlatformComparison";
import CompetitorCard from "@/components/CompetitorCard";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import RecommendationCard from "@/components/RecommendationCard";
import GapDetectionCard from "@/components/GapDetectionCard";
import { TrendingUp, Target, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@shared/schema";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/analyze', { url });
      return await response.json() as AnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete!",
        description: `Your website scored ${data.overallScore}/100 across AI platforms.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze website. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = (url: string) => {
    analyzeMutation.mutate(url);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
  };

  if (!analysisResult) {
    return (
      <>
        <LandingNav />
        <HeroSection onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />
      </>
    );
  }

  const { brandInfo, overallScore, platformScores, dimensionScores, competitors, gaps, recommendations } = analysisResult;

  // Calculate stats
  const mentionRate = dimensionScores.find(d => d.dimension === 'Mention Rate')?.score || 0;
  const avgPlatformScore = Math.round(platformScores.reduce((sum, p) => sum + p.score, 0) / platformScores.length);
  const yourRank = competitors.find(c => c.isCurrentBrand)?.rank || 0;
  const totalCompetitors = competitors.length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader websiteUrl={analysisResult.url} onNewAnalysis={handleNewAnalysis} />
      
      <main className="container mx-auto px-6 py-8 pt-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PlatformComparison data={platformScores} />
          </div>
          <div className="lg:col-span-1">
            <GapDetectionCard gaps={gaps} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ScoreBreakdown data={dimensionScores} />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-2xl font-bold">Competitor Rankings</h2>
            <div className="space-y-3">
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
        </div>

        <div className="space-y-4">
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
      </main>
    </div>
  );
}
