import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, TrendingUp, MessageSquare, Search } from "lucide-react";

interface BrandIntelligenceHeaderProps {
    brandName?: string;
    overallScore?: number;
    pillars?: {
        visibility: number;
        perception: number;
        content: number;
        advertising: number;
        search: number;
    };
}

function getScoreColor(score: number) {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
}

function getScoreBg(score: number) {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
}

const pillarConfig = [
    { key: "visibility", label: "AI Visibility", icon: Brain, description: "How AI platforms describe you" },
    { key: "perception", label: "Perception Gap", icon: Target, description: "AI vs consumer alignment" },
    { key: "advertising", label: "Ad Intelligence", icon: TrendingUp, description: "Advertising positioning" },
    { key: "content", label: "Content Pipeline", icon: MessageSquare, description: "Content opportunity score" },
    { key: "search", label: "Search & SGE", icon: Search, description: "Search visibility + SGE readiness" },
] as const;

export function BrandIntelligenceHeader({ brandName, overallScore = 65, pillars }: BrandIntelligenceHeaderProps) {
    const defaultPillars = {
        visibility: 68,
        perception: 55,
        content: 62,
        advertising: 58,
        search: 50,
    };
    const p = pillars || defaultPillars;

    return (
        <Card className="mb-6 overflow-hidden">
            <CardContent className="pt-6 pb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Brand + Overall Score */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{brandName || "Brand"} Intelligence</h1>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
                                <span className="text-sm text-muted-foreground">/100 overall</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-16 bg-border" />

                    {/* Pillars */}
                    <div className="flex-1 grid grid-cols-5 gap-3 w-full">
                        {pillarConfig.map((pillar) => {
                            const Icon = pillar.icon;
                            const score = p[pillar.key];
                            return (
                                <div key={pillar.key} className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground truncate">{pillar.label}</span>
                                    </div>
                                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
                                    <div className="h-1.5 rounded-full bg-muted mt-1">
                                        <div
                                            className={`h-1.5 rounded-full ${getScoreBg(score)} transition-all duration-500`}
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
