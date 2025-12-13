import { useState } from "react";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MetricDefinition, SubMetricDefinition } from "@/lib/geo-types";

interface InfoButtonProps {
  metric: string;
  definition: MetricDefinition | SubMetricDefinition;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoButton({ metric, definition, position = 'top' }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMainMetric = 'weight' in definition;

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center h-4 w-4 rounded-full hover-elevate active-elevate-2 ml-1.5"
              data-testid={`button-info-${metric}`}
              aria-label={`Learn more about ${isMainMetric ? (definition as MetricDefinition).title : (definition as SubMetricDefinition).name}`}
            >
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side={position} className="max-w-xs">
            <p className="text-sm">{definition.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid={`modal-metric-${metric}`}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isMainMetric ? definition.title : (definition as SubMetricDefinition).name}
            </DialogTitle>
            <DialogDescription className="text-base">
              {definition.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isMainMetric && (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Weight in Overall Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {((definition as MetricDefinition).weight! * 100).toFixed(0)}% of final GEO score
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Calculation Method</h3>
                  <p className="text-sm text-muted-foreground">
                    {(definition as MetricDefinition).calculation_method}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Scoring Anchors</h3>
                  <div className="space-y-2">
                    {(definition as MetricDefinition).scoring_anchors.map((anchor, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="font-medium text-foreground min-w-[60px]">{anchor.range}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{anchor.label}</div>
                          <div className="text-muted-foreground">{anchor.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(definition as MetricDefinition).examples && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Examples</h3>
                    <div className="space-y-2">
                      {(definition as MetricDefinition).examples!.map((example, idx) => (
                        <div key={idx} className="flex gap-3 text-sm p-3 rounded-md bg-muted">
                          <div className="font-bold text-foreground min-w-[40px]">{example.score}/10</div>
                          <div className="text-muted-foreground">{example.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!isMainMetric && (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">How It's Calculated</h3>
                  <p className="text-sm text-muted-foreground">
                    {(definition as SubMetricDefinition).calculation}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Why It Matters</h3>
                  <p className="text-sm text-muted-foreground">
                    {(definition as SubMetricDefinition).importance}
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
