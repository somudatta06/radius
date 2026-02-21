import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, MessageSquare, PenTool, Download, ChevronRight, Check, Loader2, FileText, ArrowRight } from "lucide-react";

interface ContentPipelineProps {
    brandName?: string;
    analysisId?: string;
    category?: string;
}

type PipelineStep = 1 | 2 | 3 | 4;

const API_BASE = import.meta.env.REACT_APP_BACKEND_URL || "";

const steps = [
    { id: 1 as PipelineStep, label: "Social Intelligence", icon: MessageSquare, description: "Discover what consumers are saying" },
    { id: 2 as PipelineStep, label: "Content Angles", icon: PenTool, description: "AI-generated content ideas" },
    { id: 3 as PipelineStep, label: "Blog Generation", icon: FileText, description: "SEO-optimized blog posts" },
    { id: 4 as PipelineStep, label: "CMS Export", icon: Download, description: "Export to your CMS" },
];

export function ContentPipeline({ brandName, analysisId, category }: ContentPipelineProps) {
    const [currentStep, setCurrentStep] = useState<PipelineStep>(1);
    const [socialData, setSocialData] = useState<any>(null);
    const [blogData, setBlogData] = useState<any>(null);

    // Step 1: Social scraping
    const socialQuery = useQuery({
        queryKey: ["content-pipeline-social", brandName],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/content-pipeline/social`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand_name: brandName, keywords: [] }),
            });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setSocialData(data);
            return data;
        },
        enabled: !!brandName,
    });

    // Step 3: Blog generation (manual trigger)
    const blogMutation = useMutation({
        mutationFn: async (topic: string) => {
            const res = await fetch(`${API_BASE}/api/content-pipeline/blog`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    brand_name: brandName,
                    keywords: socialData?.trending_topics || [],
                    social_data: socialData || {},
                }),
            });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setBlogData(data);
            return data;
        },
    });

    // Step 4: CMS export (manual trigger)
    const exportMutation = useMutation({
        mutationFn: async (format: string) => {
            const res = await fetch(`${API_BASE}/api/content-pipeline/export`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: blogData || {}, format }),
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const handleExport = async (format: string) => {
        const result = await exportMutation.mutateAsync(format);
        // Trigger download
        const blob = new Blob([JSON.stringify(result.content, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${blogData?.slug || "blog-export"}.${format === "wordpress" ? "xml.json" : "json"}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Content Pipeline</h2>
                <p className="text-muted-foreground">
                    From social intelligence → content angles → blog posts → CMS export
                </p>
            </div>

            {/* Pipeline Steps */}
            <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-xl">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <button
                                onClick={() => setCurrentStep(step.id)}
                                className={`flex items-center gap-3 flex-1 p-3 rounded-lg transition-all ${isActive
                                        ? "bg-foreground text-background shadow-md"
                                        : isCompleted
                                            ? "bg-card text-foreground"
                                            : "bg-transparent text-muted-foreground"
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-background text-foreground" : "bg-muted"
                                    }`}>
                                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-xs font-medium">{step.label}</p>
                                    <p className="text-[10px] opacity-70">{step.description}</p>
                                </div>
                            </button>
                            {idx < steps.length - 1 && (
                                <ArrowRight className="w-4 h-4 mx-1 text-muted-foreground flex-shrink-0" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Social Conversation Intelligence</h3>
                        <Button onClick={() => setCurrentStep(2)} disabled={!socialQuery.data} size="sm">
                            Next: Content Angles <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    {socialQuery.isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : socialQuery.data ? (
                        <div className="space-y-4">
                            {socialQuery.data.is_demo && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-xs text-muted-foreground">
                                    <AlertTriangle className="w-3 h-3" /> Sample data
                                </div>
                            )}

                            {/* Sentiment breakdown */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Sentiment Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="flex gap-3">
                                    <div className="flex-1 bg-green-100 dark:bg-green-950/30 rounded-lg p-3 text-center">
                                        <span className="text-lg font-bold text-green-700">{socialQuery.data.sentiment_breakdown?.positive}%</span>
                                        <p className="text-xs text-green-600">Positive</p>
                                    </div>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800/30 rounded-lg p-3 text-center">
                                        <span className="text-lg font-bold">{socialQuery.data.sentiment_breakdown?.neutral}%</span>
                                        <p className="text-xs text-muted-foreground">Neutral</p>
                                    </div>
                                    <div className="flex-1 bg-red-100 dark:bg-red-950/30 rounded-lg p-3 text-center">
                                        <span className="text-lg font-bold text-red-700">{socialQuery.data.sentiment_breakdown?.negative}%</span>
                                        <p className="text-xs text-red-600">Negative</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Conversations */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {socialQuery.data.conversations?.map((conv: any, idx: number) => (
                                    <Card key={idx} className="hover-elevate">
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">{conv.platform}</span>
                                                {conv.subreddit !== "N/A" && <span className="text-xs text-muted-foreground">{conv.subreddit}</span>}
                                                <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${conv.sentiment === "positive" ? "bg-green-100 text-green-700" :
                                                        conv.sentiment === "negative" ? "bg-red-100 text-red-700" : "bg-gray-100"
                                                    }`}>{conv.sentiment}</span>
                                            </div>
                                            <p className="text-sm font-medium mb-1">{conv.title}</p>
                                            <p className="text-xs text-muted-foreground mb-2">{conv.key_insight}</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 italic">💡 {conv.content_opportunity}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Content Angles</h3>
                        <Button onClick={() => {
                            if (socialData?.content_angles?.[0]) {
                                blogMutation.mutate(socialData.content_angles[0].angle);
                            }
                            setCurrentStep(3);
                        }} size="sm">
                            Next: Generate Blog <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(socialData?.content_angles || []).map((angle: any, idx: number) => (
                            <Card key={idx} className="hover-elevate cursor-pointer" onClick={() => {
                                blogMutation.mutate(angle.angle);
                                setCurrentStep(3);
                            }}>
                                <CardContent className="pt-5">
                                    <p className="font-semibold text-sm mb-2">{angle.angle}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">From: {angle.source}</span>
                                        <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full">
                                            {angle.potential_reach} reach
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Trending topics */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Trending Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {(socialData?.trending_topics || []).map((topic: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium">{topic}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Generated Blog Post</h3>
                        <Button onClick={() => setCurrentStep(4)} disabled={!blogData} size="sm">
                            Next: Export <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    {blogMutation.isPending ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground">Generating SEO-optimized blog post...</p>
                            </CardContent>
                        </Card>
                    ) : blogData ? (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">{blogData.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{blogData.meta_description}</p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">SEO Score:</span>
                                            <span className="text-sm font-bold">{blogData.seo_score}/100</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">Readability:</span>
                                            <span className="text-sm font-bold">{blogData.readability_score}/100</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">Words:</span>
                                            <span className="text-sm font-bold">~{blogData.estimated_word_count}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {blogData.target_keywords?.map((kw: string, idx: number) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs rounded">{kw}</span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-5">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div dangerouslySetInnerHTML={{
                                            __html: (blogData.content_body || "")
                                                .replace(/## (.*)/g, "<h2>$1</h2>")
                                                .replace(/### (.*)/g, "<h3>$1</h3>")
                                                .replace(/\n\n/g, "</p><p>")
                                                .replace(/\| .* \|/g, (match: string) => `<code>${match}</code>`)
                                        }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileText className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Select a content angle to generate a blog post</p>
                                <Button onClick={() => setCurrentStep(2)} variant="outline" size="sm" className="mt-4">
                                    Go to Content Angles
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {currentStep === 4 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Export to CMS</h3>

                    {!blogData ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Download className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Generate a blog post first</p>
                                <Button onClick={() => setCurrentStep(3)} variant="outline" size="sm" className="mt-4">
                                    Go to Blog Generation
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { format: "json", label: "Generic JSON", desc: "Universal format for any CMS" },
                                { format: "wordpress", label: "WordPress", desc: "Ready for WP import with Yoast SEO meta" },
                                { format: "webflow", label: "Webflow", desc: "Webflow CMS collection format" },
                            ].map((exp) => (
                                <Card key={exp.format} className="hover-elevate cursor-pointer" onClick={() => handleExport(exp.format)}>
                                    <CardContent className="pt-5 text-center">
                                        <Download className="w-6 h-6 mx-auto mb-2" />
                                        <p className="font-semibold text-sm">{exp.label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{exp.desc}</p>
                                        {exportMutation.isPending && (
                                            <Loader2 className="w-4 h-4 animate-spin mx-auto mt-3" />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
