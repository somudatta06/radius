import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LandingNav from "@/components/LandingNav";
import HeroSection from "@/components/HeroSection";
import DashboardHeader from "@/components/DashboardHeader";
import AnalysisResults from "@/components/AnalysisResults";
import { AnalysisTimeline } from "@/components/AnalysisTimeline";
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
        <AnalysisTimeline 
          isActive={analyzeMutation.isPending}
          onComplete={() => {
            // Timeline will auto-hide when analysis completes
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader websiteUrl={analysisResult.url} onNewAnalysis={handleNewAnalysis} />
      <AnalysisResults data={analysisResult} />
    </div>
  );
}
