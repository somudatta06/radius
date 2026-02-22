import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  actionItems: string[];
  estimatedImpact: string;
}

interface ExecutiveSummaryProps {
  overallScore: number;
  brandName: string;
  recommendations: Recommendation[];
}

function generateSummary(score: number, brandName: string): string {
  if (score >= 80) {
    return (
      `${brandName} demonstrates strong AI visibility with a score of ${score}/100, outperforming most brands in its category. ` +
      "Focus on maintaining content freshness and expanding into comparison-based content to cement leadership."
    );
  }
  if (score >= 60) {
    return (
      `${brandName} has moderate AI presence scoring ${score}/100 — a solid foundation but with clear room to grow. ` +
      "The highest-leverage improvements are in content depth, FAQ coverage, and structured data to improve how AI platforms summarise the brand."
    );
  }
  if (score >= 40) {
    return (
      `${brandName} scores ${score}/100, indicating limited AI discoverability at a critical time when buyers rely on AI for research. ` +
      "Immediate priorities are building out answer-ready content, adding structured data, and establishing credibility signals."
    );
  }
  return (
    `${brandName} has a low AI visibility score of ${score}/100, meaning AI platforms rarely surface or accurately describe the brand. ` +
    "This is an urgent opportunity — early movers in GEO gain lasting advantages over competitors who act later."
  );
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export function ExecutiveSummary({ overallScore, brandName, recommendations }: ExecutiveSummaryProps) {
  const summary = generateSummary(overallScore, brandName);
  const topRecs = recommendations.slice(0, 3);

  return (
    <Card className="border-l-4 border-l-primary rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>

        {topRecs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Top Priorities</p>
            {topRecs.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <Badge
                  className={`text-xs border shrink-0 ${priorityStyles[rec.priority] ?? priorityStyles.medium}`}
                >
                  {rec.priority}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
