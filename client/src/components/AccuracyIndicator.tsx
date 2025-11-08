import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccuracyCheck } from "@/lib/geo-types";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface AccuracyIndicatorProps {
  accuracyChecks: AccuracyCheck[];
}

export function AccuracyIndicator({ accuracyChecks }: AccuracyIndicatorProps) {
  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 90) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (accuracy >= 70) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 70) return 'Good';
    if (accuracy >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <Card data-testid="card-accuracy-verification">
      <CardHeader>
        <CardTitle className="text-2xl">LLM Accuracy Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accuracyChecks.map((check, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 border rounded-lg hover-elevate"
            data-testid={`accuracy-check-${check.platform.toLowerCase()}`}
          >
            <div className="flex-shrink-0 mt-1">
              {getAccuracyIcon(check.overall_accuracy)}
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{check.platform}</div>
                <div className={`text-2xl font-bold ${getAccuracyColor(check.overall_accuracy)}`}>
                  {check.overall_accuracy}%
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {getAccuracyLabel(check.overall_accuracy)} - {check.correct_facts.length} correct facts verified
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${
                    check.overall_accuracy >= 90
                      ? 'bg-green-500'
                      : check.overall_accuracy >= 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${check.overall_accuracy}%` }}
                />
              </div>

              {check.hallucinations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-red-600">
                    ⚠️ {check.hallucinations.length} Hallucination{check.hallucinations.length > 1 ? 's' : ''} Detected
                  </div>
                  <ul className="space-y-1 text-sm">
                    {check.hallucinations.map((hallucination, hIdx) => (
                      <li key={hIdx} className="text-muted-foreground">
                        <span className="font-medium">"{hallucination.claim}"</span> - {hallucination.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {check.missing_info.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-yellow-600">
                    Missing Information ({check.missing_info.length})
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {check.missing_info.map((info, mIdx) => (
                      <li key={mIdx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
