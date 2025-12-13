import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoButton } from "./InfoButton";
import { MetricDefinition, getScoreLabel } from "@/lib/geo-types";

interface MetricCardProps {
  score: number;
  maxScore?: number;
  label: string;
  sublabel?: string;
  showInfoButton?: boolean;
  metricDefinition?: MetricDefinition;
  metricCode?: string;
}

export function MetricCard({
  score,
  maxScore = 10,
  label,
  sublabel,
  showInfoButton = false,
  metricDefinition,
  metricCode
}: MetricCardProps) {
  const percentage = (score / maxScore) * 100;
  const scoreLabel = getScoreLabel(score);

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600 dark:text-green-500';
    if (score >= 6) return 'text-blue-600 dark:text-blue-500';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-500';
    if (score >= 2) return 'text-orange-600 dark:text-orange-500';
    return 'text-red-600 dark:text-red-500';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    if (score >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card data-testid={`card-metric-${metricCode || label.toLowerCase()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
          {label}
          {showInfoButton && metricDefinition && metricCode && (
            <InfoButton metric={metricCode} definition={metricDefinition} />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`} data-testid={`score-${metricCode || label.toLowerCase()}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-lg text-muted-foreground">/ {maxScore}</div>
        </div>
        
        {sublabel && (
          <div className="text-xs text-muted-foreground">{sublabel}</div>
        )}

        <div className="space-y-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className={`h-full transition-all ${getProgressColor(score)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-xs font-medium text-muted-foreground">{scoreLabel}</div>
        </div>
      </CardContent>
    </Card>
  );
}
