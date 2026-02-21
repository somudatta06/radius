import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Sparkles, Bot, Users, Lightbulb } from "lucide-react";

interface GapAnalysisProps {
    brandName?: string;
    analysisId?: string;
    category?: string;
    platformScores?: any[];
}

interface GapItem {
    dimension: string;
    ai_says: string;
    people_say: string;
    severity: "high" | "medium" | "low";
    action: string;
}

interface GapData {
    ai_perception: Record<string, string>;
    social_perception: Record<string, string>;
    gaps: GapItem[];
    gap_score: number;
    crisis_alerts: string[];
    executive_summary: string;
    is_demo?: boolean;
}

const API_BASE = import.meta.env.REACT_APP_BACKEND_URL || "";

function getScoreColor(score: number) {
    if (score <= 30) return "text-green-600";
    if (score <= 60) return "text-yellow-600";
    return "text-red-600";
}

function getScoreLabel(score: number) {
    if (score <= 30) return "Well Aligned";
    if (score <= 60) return "Moderate Gap";
    return "Significant Gap";
}

function getScoreBarColor(score: number) {
    if (score <= 30) return "bg-green-500";
    if (score <= 60) return "bg-yellow-500";
    return "bg-red-500";
}

function getSeverityBadge(severity: string) {
    switch (severity) {
        case "high":
            return "bg-foreground text-background px-3 py-1 rounded-full text-xs font-medium";
        case "medium":
            return "border border-border text-foreground px-3 py-1 rounded-full text-xs font-medium";
        case "low":
            return "bg-muted text-foreground px-3 py-1 rounded-full text-xs font-medium";
        default:
            return "bg-muted text-foreground px-3 py-1 rounded-full text-xs font-medium";
    }
}

export function GapAnalysis({ brandName, analysisId, category, platformScores }: GapAnalysisProps) {
    const { data, isLoading, isError } = useQuery<GapData>({
        queryKey: ["gap-analysis", brandName, analysisId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/gap-analysis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brand_name: brandName || "",
                    category: category || "",
                    analysis_id: analysisId || "",
                }),
            });
            if (!res.ok) throw new Error("Failed to fetch gap analysis");
            return res.json();
        },
        enabled: !!brandName,
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        );
    }

    const gapData = data;

    if (!gapData) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                Unable to load gap analysis data
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Demo data banner */}
            {(gapData.is_demo || isError) && (
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4" />
                    Showing sample data — connect API for live analysis
                </div>
            )}

            {/* Section Header */}
            <div>
                <h2 className="text-2xl font-bold">Perception Gap Analysis</h2>
                <p className="text-muted-foreground">
                    How AI platforms describe your brand vs. what real consumers say
                </p>
            </div>

            {/* Executive Summary */}
            <Card className="border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed">{gapData.executive_summary}</p>
                </CardContent>
            </Card>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gap Score */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Gap Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-3">
                            <span className={`text-4xl font-bold ${getScoreColor(gapData.gap_score)}`}>
                                {gapData.gap_score}
                            </span>
                            <span className={`text-sm font-medium ${getScoreColor(gapData.gap_score)}`}>
                                {getScoreLabel(gapData.gap_score)}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted mt-4">
                            <div
                                className={`h-2 rounded-full ${getScoreBarColor(gapData.gap_score)} transition-all duration-500`}
                                style={{ width: `${gapData.gap_score}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            0 = perfectly aligned · 100 = total mismatch
                        </p>
                    </CardContent>
                </Card>

                {/* Crisis Alerts */}
                <Card className={gapData.crisis_alerts.length > 0
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                    : ""
                }>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {gapData.crisis_alerts.length > 0 ? (
                                <span className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="w-4 h-4" />
                                    Crisis Alert
                                </span>
                            ) : "No Critical Alerts"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {gapData.crisis_alerts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No critical alerts detected</p>
                        ) : (
                            <ul className="space-y-2">
                                {gapData.crisis_alerts.map((alert, idx) => (
                                    <li key={idx} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                        {alert}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dimension Gaps */}
            <div>
                <h3 className="text-lg font-semibold mb-1">Dimension Gaps</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Side-by-side comparison of AI narrative vs consumer reality
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {gapData.gaps.map((gap, idx) => (
                        <Card key={idx} className="hover-elevate">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">{gap.dimension}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* AI Says */}
                                    <div className="pr-4 border-r border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs font-medium text-blue-600">AI SAYS</span>
                                        </div>
                                        <p className="text-sm">{gap.ai_says}</p>
                                    </div>

                                    {/* People Say */}
                                    <div className="pl-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs font-medium text-orange-600">PEOPLE SAY</span>
                                        </div>
                                        <p className="text-sm">{gap.people_say}</p>
                                    </div>
                                </div>

                                {/* Bottom: severity + action */}
                                <div className="flex items-center justify-between pt-3 border-t mt-3">
                                    <span className={getSeverityBadge(gap.severity)}>
                                        {gap.severity.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3" />
                                        {gap.action}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Perception Overview */}
            {gapData.ai_perception && gapData.social_perception && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Perception Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(["quality", "value", "trust", "innovation"] as const).map((dim) => (
                            <Card key={dim}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium capitalize">{dim}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-blue-600 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-xs">
                                        <span className="font-medium block mb-1">AI Perception</span>
                                        {gapData.ai_perception[dim]}
                                    </div>
                                    <div className="text-orange-600 bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg text-xs">
                                        <span className="font-medium block mb-1">Consumer Reality</span>
                                        {gapData.social_perception[dim]}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
