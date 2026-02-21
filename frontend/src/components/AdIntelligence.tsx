import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, DollarSign, Target, Zap, BarChart3 } from "lucide-react";

interface AdIntelligenceProps {
    brandName?: string;
    analysisId?: string;
    category?: string;
}

interface KeywordItem {
    keyword: string;
    search_volume: string;
    competition: string;
    opportunity: string;
}

interface MessagingItem {
    channel: string;
    strategy: string;
    estimated_cpc: string;
    effectiveness: number;
}

interface CompetitorStrategy {
    competitor: string;
    positioning: string;
    ad_spend_estimate: string;
    key_message: string;
}

interface StrategicGap {
    gap: string;
    impact: string;
    recommendation: string;
}

interface AdData {
    spotlight_keywords: KeywordItem[];
    messaging_breakdown: MessagingItem[];
    competitor_strategies: CompetitorStrategy[];
    strategic_gaps: StrategicGap[];
    budget_recommendation: {
        monthly_minimum: string;
        optimal_split: Record<string, number>;
        priority_channel: string;
    };
    executive_summary: string;
    is_demo?: boolean;
}

const API_BASE = import.meta.env.REACT_APP_BACKEND_URL || "";

function getVolumeBadge(volume: string) {
    switch (volume) {
        case "high":
            return "bg-foreground text-background px-2.5 py-0.5 rounded-full text-xs font-medium";
        case "medium":
            return "border border-border text-foreground px-2.5 py-0.5 rounded-full text-xs font-medium";
        case "low":
            return "bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-medium";
        default:
            return "bg-muted text-foreground px-2.5 py-0.5 rounded-full text-xs font-medium";
    }
}

function getEffectivenessColor(score: number) {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
}

export function AdIntelligence({ brandName, analysisId, category }: AdIntelligenceProps) {
    const { data, isLoading, isError } = useQuery<AdData>({
        queryKey: ["ad-intelligence", brandName, analysisId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/ad-intelligence`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brand_name: brandName || "",
                    category: category || "",
                    analysis_id: analysisId || "",
                }),
            });
            if (!res.ok) throw new Error("Failed to fetch ad intelligence");
            return res.json();
        },
        enabled: !!brandName,
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        );
    }

    const adData = data;

    if (!adData) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                Unable to load ad intelligence data
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {(adData.is_demo || isError) && (
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4" />
                    Showing sample data — connect API for live analysis
                </div>
            )}

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Ad Intelligence</h2>
                <p className="text-muted-foreground">
                    Keyword opportunities, channel strategy, and competitive positioning
                </p>
            </div>

            {/* Executive Summary */}
            <Card className="border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed">{adData.executive_summary}</p>
                </CardContent>
            </Card>

            {/* Keywords Spotlight */}
            <div>
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Keywords Spotlight
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    High-opportunity keywords for ad targeting and content optimization
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adData.spotlight_keywords.map((kw, idx) => (
                        <Card key={idx} className="hover-elevate">
                            <CardContent className="pt-5">
                                <p className="font-semibold text-sm mb-3 truncate" title={kw.keyword}>"{kw.keyword}"</p>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={getVolumeBadge(kw.search_volume)}>
                                        Vol: {kw.search_volume}
                                    </span>
                                    <span className={getVolumeBadge(kw.competition)}>
                                        Comp: {kw.competition}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{kw.opportunity}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Channel Messaging Breakdown */}
            <div>
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Channel Strategy
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Recommended messaging and estimated performance by channel
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {adData.messaging_breakdown.map((msg, idx) => (
                        <Card key={idx} className="hover-elevate">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">{msg.channel}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm">{msg.strategy}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        CPC: {msg.estimated_cpc}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-20 rounded-full bg-muted">
                                            <div
                                                className={`h-2 rounded-full ${getEffectivenessColor(msg.effectiveness)} transition-all`}
                                                style={{ width: `${msg.effectiveness}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium">{msg.effectiveness}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Competitor Strategies */}
            <div>
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Competitor Ad Strategies
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    How your competitors are positioning and spending
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {adData.competitor_strategies.map((comp, idx) => (
                        <Card key={idx} className="hover-elevate">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">{comp.competitor}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">Positioning:</span> {comp.positioning}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">Ad Spend:</span> {comp.ad_spend_estimate}
                                </div>
                                <div className="mt-2 p-2 bg-muted rounded-lg text-xs italic">
                                    "{comp.key_message}"
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Strategic Gaps + Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strategic Gaps */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Strategic Gaps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {adData.strategic_gaps.map((gap, idx) => (
                            <div key={idx} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{gap.gap}</span>
                                    <span className={getVolumeBadge(gap.impact)}>
                                        {gap.impact.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Budget Recommendation */}
                <Card className="border-l-4 border-chart-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Budget Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-xs text-muted-foreground">Monthly Minimum</span>
                            <p className="text-xl font-bold">{adData.budget_recommendation.monthly_minimum}</p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">Priority Channel</span>
                            <p className="text-sm font-medium">{adData.budget_recommendation.priority_channel}</p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block mb-2">Optimal Budget Split</span>
                            <div className="space-y-2">
                                {Object.entries(adData.budget_recommendation.optimal_split).map(([channel, pct]) => (
                                    <div key={channel} className="flex items-center gap-3">
                                        <span className="text-xs w-16 capitalize">{channel}</span>
                                        <div className="flex-1 h-2 rounded-full bg-muted">
                                            <div
                                                className="h-2 rounded-full bg-foreground transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-10 text-right">{pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
