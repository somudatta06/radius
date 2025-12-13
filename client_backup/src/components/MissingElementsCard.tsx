import { X, Check, AlertCircle } from "lucide-react";

interface Gap {
  element: string;
  impact: "high" | "medium" | "low";
  found: boolean;
}

interface MissingElementsCardProps {
  gaps: Gap[];
}

export function MissingElementsCard({ gaps }: MissingElementsCardProps) {
  const missingElements = gaps.filter(g => !g.found);
  const presentElements = gaps.filter(g => g.found);
  const gapsCount = missingElements.length;

  const getImpactBadgeStyle = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-foreground text-background";
      case "medium":
        return "bg-foreground/70 text-background";
      case "low":
        return "bg-foreground/40 text-background";
    }
  };

  if (gapsCount === 0) {
    return null;
  }

  return (
    <div 
      className="w-full bg-card border border-border rounded-lg p-6 mb-6 shadow-sm"
      data-testid="card-missing-elements"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-foreground flex-shrink-0" />
          <h3 className="text-xl font-semibold text-foreground">
            Missing Elements Detected
          </h3>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {gapsCount} {gapsCount === 1 ? 'gap' : 'gaps'} found
        </span>
      </div>

      {/* Missing Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-3">Missing:</h4>
        <div className="space-y-2">
          {missingElements.map((gap, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-md hover-elevate active-elevate-2 transition-colors"
              data-testid={`item-missing-${gap.element.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground font-medium">{gap.element}</span>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${getImpactBadgeStyle(gap.impact)}`}
              >
                {gap.impact} impact
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Present Section */}
      {presentElements.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Present:</h4>
          <div className="flex flex-wrap gap-3">
            {presentElements.map((gap, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md bg-muted/30"
                data-testid={`item-present-${gap.element.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Check className="w-3 h-3 text-foreground/60" />
                <span className="text-sm font-medium text-foreground">{gap.element}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
