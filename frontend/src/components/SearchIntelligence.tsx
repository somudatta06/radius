import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Search, TrendingDown, Lightbulb, Zap } from "lucide-react";

interface SearchIntelligenceProps {
    brandName?: string;
    analysisId?: string;
    category?: string;
}

interface QueryCoverage {
    query: string;
    intent: string;
    current_position: string;
    sge_risk: string;
    action: string;
}

interface MissingOpp {
    query: string;
    monthly_volume: string;
    difficulty: string;
    recommendation: string;
}

interface SearchData {
    search_visibility_score: number;
    sge_readiness_score: number;
    query_coverage: QueryCoverage[];
    sge_impact: {
        queries_at_risk: number;
        estimated_traffic_loss: string;
        mitigation_strategy: string;
    };
    missing_opportunities: MissingOpp[];
    featured_snippet_opportunities: any[];
    executive_summary: string;
    is_demo?: boolean;
}

const API_BASE = import.meta.env.REACT_APP_BACKEND_URL || "";

function getScoreColor(score: number) {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
}

function getRiskBadge(risk: string) {
    switch (risk) {
        case "high":
            return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
        case "medium":
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
        case "low":
            return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
        default:
            return "bg-muted text-foreground";
    }
}

function getIntentBadge(intent: string) {
    switch (intent) {
        case "transactional":
            return "bg-foreground text-background";
        case "informational":
            return "border border-border text-foreground";
        case "navigational":
            return "bg-muted text-foreground";
        default:
            return "bg-muted text-foreground";
    }
}

export function SearchIntelligence({ brandName, analysisId, category }: SearchIntelligenceProps) {
    const { data, isLoading, isError } = useQuery<SearchData>({
        queryKey: ["search-intelligence", brandName, analysisId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/search-intelligence`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brand_name: brandName || "",
                    category: category || "",
                }),
            });
            if (!res.ok) throw new Error("Failed to fetch search intelligence");
            return res.json();
        },
        enabled: !!brandName,
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
            </div>
        );
    }

    const searchData = data;
    if (!searchData) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                Unable to load search intelligence data
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {(searchData.is_demo || isError) && (
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4" />
                    Showing sample data — connect API for live analysis
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold">Search & SGE Intelligence</h2>
                <p className="text-muted-foreground">
                    Search visibility, Google SGE readiness, and keyword opportunities
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
                    <p className="text-sm leading-relaxed">{searchData.executive_summary}</p>
                </CardContent>
            </Card>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Search Visibility
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className={`text-4xl font-bold ${getScoreColor(searchData.search_visibility_score)}`}>
                            {searchData.search_visibility_score}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">/100</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            SGE Readiness
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className={`text-4xl font-bold ${getScoreColor(searchData.sge_readiness_score)}`}>
                            {searchData.sge_readiness_score}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">/100</span>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            SGE Traffic Risk
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-4xl font-bold text-red-600">
                            {searchData.sge_impact.estimated_traffic_loss}
                        </span>
                        <p className="text-xs text-red-500 mt-1">
                            {searchData.sge_impact.queries_at_risk} queries at risk
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Query Coverage Table */}
            <div>
                <h3 className="text-lg font-semibold mb-1">Query Coverage</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Your brand's visibility across key search queries
                </p>
                <Card>
                    <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Query</th>
                                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Intent</th>
                                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Position</th>
                                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">SGE Risk</th>
                                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchData.query_coverage.map((q, idx) => (
                                        <tr key={idx} className="border-b border-border/50 last:border-0">
                                            <td className="py-2.5 px-3 font-medium">{q.query}</td>
                                            <td className="py-2.5 px-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getIntentBadge(q.intent)}`}>
                                                    {q.intent}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className={`font-medium ${q.current_position === "not ranking" ? "text-red-500" : "text-green-600"}`}>
                                                    {q.current_position === "not ranking" ? "—" : `#${q.current_position}`}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadge(q.sge_risk)}`}>
                                                    {q.sge_risk}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[200px]">{q.action}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Missing Opportunities */}
            <div>
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Missing Opportunities
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    High-value keywords you're not targeting
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {searchData.missing_opportunities.map((opp, idx) => (
                        <Card key={idx} className="hover-elevate">
                            <CardContent className="pt-5">
                                <p className="font-semibold text-sm mb-2">"{opp.query}"</p>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs text-muted-foreground">Vol: {opp.monthly_volume}/mo</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${opp.difficulty === "easy" ? "bg-green-100 text-green-700" :
                                            opp.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                        }`}>{opp.difficulty}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{opp.recommendation}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* SGE Mitigation */}
            <Card className="border-l-4 border-red-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <TrendingDown className="w-5 h-5" />
                        SGE Mitigation Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{searchData.sge_impact.mitigation_strategy}</p>
                </CardContent>
            </Card>
        </div>
    );
}
