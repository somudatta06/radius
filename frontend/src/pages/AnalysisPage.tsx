import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import DashboardHeader from "@/components/DashboardHeader";
import AnalysisResults from "@/components/AnalysisResults";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/schema";

/**
 * Analysis Page - /analysis/:analysisId
 * 
 * ARCHITECTURAL RULES:
 * - All analysis features MUST be mounted here, not on landing page
 * - Requires valid analysisId parameter
 * - Fetches fresh analysis data - NO CACHING
 * - If analysisId invalid, redirect to landing
 */
export default function AnalysisPage() {
  const params = useParams<{ analysisId: string }>();
  const [, navigate] = useLocation();
  const analysisId = params.analysisId;

  // Validate analysisId exists
  useEffect(() => {
    if (!analysisId) {
      console.error("❌ No analysisId provided - redirecting to landing");
      navigate("/");
    }
  }, [analysisId, navigate]);

  // Fetch analysis data with NO CACHING
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: async () => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      
      // Add cache-busting headers
      const response = await fetch(`${backendUrl}/api/analysis/${analysisId}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
          "X-Request-Nonce": `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Analysis not found");
        }
        throw new Error(`Failed to fetch analysis: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Validate data provenance
      if (!result.analysisId || !result.analyzedAt) {
        throw new Error("Invalid analysis data - missing provenance");
      }
      
      return result as AnalysisResult;
    },
    enabled: !!analysisId,
    staleTime: 0, // Always fetch fresh
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const handleNewAnalysis = () => {
    navigate("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Loading Analysis</h2>
            <p className="text-gray-500 text-sm mt-1">
              Analysis ID: {analysisId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
              <div>
                <h2 className="text-xl font-semibold text-red-900">
                  Analysis Not Found
                </h2>
                <p className="text-red-700 text-sm mt-2">
                  {error?.message || "The requested analysis could not be loaded."}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Analysis ID: {analysisId}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button onClick={handleNewAnalysis}>
                  New Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success - render analysis results
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader 
        websiteUrl={data.url} 
        onNewAnalysis={handleNewAnalysis}
        analysisId={analysisId}
      />
      <AnalysisResults data={data} analysisId={analysisId} />
    </div>
  );
}
