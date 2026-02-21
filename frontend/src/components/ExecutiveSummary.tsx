import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface ExecutiveSummaryProps {
    brandName?: string;
    overallScore?: number;
    recommendations?: string[];
    criticalAlerts?: string[];
    topWins?: string[];
}

export function ExecutiveSummary({
    brandName = "Brand",
    overallScore = 65,
    recommendations,
    criticalAlerts,
    topWins,
}: ExecutiveSummaryProps) {
    const defaultRecs = [
        "Implement structured data and FAQ schema across all product pages to improve SGE readiness",
        "Create transparent ingredient breakdown content to address the perception gap identified on Reddit",
        "Launch competitor comparison pages targeting 'vs' search queries with 8K+ monthly volume",
        "Build authentic Reddit community presence in r/IndianSkincareAddicts — respond, don't sell",
        "Syndicate 50+ video testimonials across YouTube, Instagram, and product pages",
    ];

    const defaultAlerts = [
        "SGE readiness score (42/100) puts 15-25% of organic traffic at risk",
        "Perception gap widening — AI says 'premium trusted brand' but Reddit sentiment is declining",
    ];

    const defaultWins = [
        "Strong branded search presence — #2-3 for most branded queries",
        "High Instagram engagement rate compared to category average",
        "Knowledge base coverage above industry median across all 4 AI platforms",
    ];

    const recs = recommendations || defaultRecs;
    const alerts = criticalAlerts || defaultAlerts;
    const wins = topWins || defaultWins;

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Executive Summary — {brandName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Critical Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            Requires Immediate Attention
                        </h4>
                        <ul className="space-y-1.5">
                            {alerts.map((alert, idx) => (
                                <li key={idx} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                    {alert}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Top Wins */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        What's Working
                    </h4>
                    <ul className="space-y-1.5">
                        {wins.map((win, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                {win}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                        <ArrowRight className="w-4 h-4" />
                        Top Recommendations
                    </h4>
                    <ol className="space-y-1.5">
                        {recs.map((rec, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                </span>
                                {rec}
                            </li>
                        ))}
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}
