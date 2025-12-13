import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COMPETITOR_DISCOVERY_STEPS, CRITICAL_CONSUMER_QUESTIONS, COMPARISON_DIMENSIONS } from "@/lib/geo-constants";

export function CompetitorDiscovery() {
  return (
    <div className="space-y-6" data-testid="section-competitor-discovery">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">How We Find Your Competitors</CardTitle>
          <CardDescription>
            Our 5-step methodology for discovering and validating your competitive landscape
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {COMPETITOR_DISCOVERY_STEPS.map((step) => (
            <div key={step.step} className="flex gap-4" data-testid={`discovery-step-${step.step}`}>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-mono text-muted-foreground">Step {step.step}</span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-xs font-semibold text-foreground mb-1">Method</div>
                  <div className="text-xs text-muted-foreground">{step.method}</div>
                </div>
                {step.technical_details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded text-muted-foreground">
                      {step.technical_details}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">The Critical Consumer Questions</CardTitle>
          <CardDescription>
            How AI platforms evaluate and compare brands across discovery, comparison, and utility queries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {CRITICAL_CONSUMER_QUESTIONS.map((question, idx) => (
            <div key={idx} className="space-y-3" data-testid={`consumer-question-${question.category.toLowerCase()}`}>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-foreground text-background text-xs font-bold rounded-full">
                  {(question.weight * 100).toFixed(0)}%
                </div>
                <h3 className="text-lg font-semibold">{question.category}</h3>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Example Questions:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {question.questions.map((q, qIdx) => (
                    <li key={qIdx}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="font-semibold text-foreground mb-1">What We Measure</div>
                  <div className="text-muted-foreground">{question.metric}</div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="font-semibold text-foreground mb-1">Why It Matters</div>
                  <div className="text-muted-foreground">{question.why_it_matters}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Comparison Framework</CardTitle>
          <CardDescription>
            How we score your brand against competitors across three dimensions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(COMPARISON_DIMENSIONS).map(([key, dimension]) => (
            <div key={key} className="space-y-3" data-testid={`comparison-dimension-${key}`}>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-foreground text-background text-xs font-bold rounded-full">
                  {(dimension.weight * 100).toFixed(0)}%
                </div>
                <h3 className="text-lg font-semibold">{dimension.name}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">{dimension.description}</p>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Metrics:</div>
                <div className="flex flex-wrap gap-2">
                  {dimension.metrics.map((metric, idx) => (
                    <div key={idx} className="px-3 py-1 bg-muted text-xs rounded-full">
                      {metric}
                    </div>
                  ))}
                </div>
              </div>

              {dimension.calculation_formula && (
                <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                  {dimension.calculation_formula}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
