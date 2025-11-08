import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Check } from "lucide-react";

interface Gap {
  element: string;
  impact: "high" | "medium" | "low";
  found: boolean;
}

interface GapDetectionCardProps {
  gaps: Gap[];
}

export default function GapDetectionCard({ gaps }: GapDetectionCardProps) {
  const missingGaps = gaps.filter(g => !g.found);
  const foundElements = gaps.filter(g => g.found);

  const getImpactBadgeStyle = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-foreground text-background px-2 py-0.5 rounded text-xs font-medium";
      case "medium":
        return "bg-foreground/70 text-background px-2 py-0.5 rounded text-xs font-medium";
      case "low":
        return "bg-foreground/40 text-background px-2 py-0.5 rounded text-xs font-medium";
      default:
        return "bg-muted text-foreground px-2 py-0.5 rounded text-xs font-medium";
    }
  };

  return (
    <Card data-testid="card-gap-detection">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Missing Elements Detected</CardTitle>
          <span className="text-xs text-muted-foreground border border-border px-3 py-1 rounded-full">
            {missingGaps.length} gaps found
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {missingGaps.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Missing:</h4>
            <div className="space-y-2">
              {missingGaps.map((gap, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  data-testid={`item-missing-${gap.element.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-3">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{gap.element}</span>
                  </div>
                  <span className={getImpactBadgeStyle(gap.impact)}>
                    {gap.impact} impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            All essential elements detected! Great job.
          </p>
        )}

        {foundElements.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold">Present:</h4>
            <div className="flex flex-wrap gap-2">
              {foundElements.map((gap, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 border border-border px-3 py-1 rounded-full text-xs">
                  <Check className="w-3 h-3" />
                  {gap.element}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
