import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Users, AlertTriangle, TrendingUp } from "lucide-react";

interface PerceptionDimension {
  quality: number;
  value: number;
  trust: number;
}

interface Gap {
  dimension: string;
  ai_says: string;
  people_say: string;
  severity: "high" | "medium" | "low";
  action: string;
}

interface GapAnalysisData {
  ai_perception: PerceptionDimension;
  social_perception: PerceptionDimension;
  gaps: Gap[];
  gap_score: number;
  crisis_alerts: string[];
  executive_summary: string;
}

interface GapAnalysisProps {
  brandName: string;
  domain: string;
  overallScore: number;
  category?: string;
}

const severityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

function getGapScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 45) return "text-yellow-600";
  return "text-red-600";
}

function PerceptionBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function GapAnalysis({ brandName, domain, overallScore, category = "Technology" }: GapAnalysisProps) {
  const { data, isLoading, error } = useQuery<GapAnalysisData>({
    queryKey: ["/api/gap-analysis", brandName, domain],
    queryFn: async () => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/gap-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: brandName,
          category,
          ai_scores: { overall: overallScore },
          website_data: { title: brandName, description: domain },
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch gap analysis");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border border-border">
        <CardContent className="py-12 text-center text-muted-foreground">
          Gap analysis unavailable. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Gap Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.executive_summary}</p>
        </CardContent>
      </Card>

      {/* Crisis Alerts */}
      {data.crisis_alerts && data.crisis_alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Crisis Alerts
          </div>
          {data.crisis_alerts.map((alert, i) => (
            <p key={i} className="text-sm text-red-600">{alert}</p>
          ))}
        </div>
      )}

      {/* Gap Score + Perception Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gap Score */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Gap Score</p>
          <span className={`text-4xl font-bold ${getGapScoreColor(data.gap_score)}`}>
            {data.gap_score}
          </span>
          <p className="text-xs text-muted-foreground mt-1">/ 100</p>
          <p className="text-xs text-muted-foreground mt-2">
            {data.gap_score >= 70
              ? "Perception aligned"
              : data.gap_score >= 45
              ? "Moderate gap"
              : "Significant gap"}
          </p>
        </Card>

        {/* AI Perception */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">AI Perception</span>
          </div>
          <div className="space-y-3">
            <PerceptionBar label="Quality" value={data.ai_perception.quality} color="bg-primary" />
            <PerceptionBar label="Value" value={data.ai_perception.value} color="bg-primary" />
            <PerceptionBar label="Trust" value={data.ai_perception.trust} color="bg-primary" />
          </div>
        </Card>

        {/* Social Perception */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Consumer Perception</span>
          </div>
          <div className="space-y-3">
            <PerceptionBar label="Quality" value={data.social_perception.quality} color="bg-muted-foreground" />
            <PerceptionBar label="Value" value={data.social_perception.value} color="bg-muted-foreground" />
            <PerceptionBar label="Trust" value={data.social_perception.trust} color="bg-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Gap Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Identified Gaps</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.gaps.map((gap, i) => (
            <Card key={i} className="border border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{gap.dimension}</CardTitle>
                  <Badge className={`text-xs border ${severityStyles[gap.severity]}`}>
                    {gap.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">AI Says</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{gap.ai_says}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">People Say</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{gap.people_say}</p>
                  </div>
                </div>
                <div className="p-3 border border-border rounded-lg bg-card">
                  <p className="text-xs font-semibold mb-1 text-foreground">Recommended Action</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{gap.action}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
