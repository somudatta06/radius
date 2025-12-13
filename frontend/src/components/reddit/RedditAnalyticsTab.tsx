import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, MessageSquare, ExternalLink, Search, AlertTriangle } from "lucide-react";
import { MockDataBanner } from "@/components/reddit/MockDataBanner";

interface RedditThread {
  id: string;
  rank: number;
  title: string;
  url: string;
  subreddit: string;
  citations: number;
  percentage: number;
  brand_mentioned: number;
  competitors_mentioned: Record<string, number>;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  summary: string;
  created_at: string;
  is_verified?: boolean;  // Real data verification flag
}

interface RedditMetrics {
  positive_sentiment_pct: number;
  total_mention_rate: number;
  positive_mentions: number;
  total_mentions: number;
  change_vs_previous: number;
  reddit_share_of_citations: number;
  data_source?: string;  // "live_api" | "mock" | "insufficient_data"
}

interface RedditAnalyticsTabProps {
  brandName?: string;
  analysisId?: string;  // Per-analysis data
}

export function RedditAnalyticsTab({ brandName, analysisId }: RedditAnalyticsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("analytics");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");

  // Fetch Reddit metrics with NO CACHING
  const { data: metrics, isLoading: metricsLoading } = useQuery<RedditMetrics>({
    queryKey: ["/api/reddit/metrics", analysisId],
    queryFn: async () => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/reddit/metrics?analysis_id=${analysisId || 'default'}`, {
        headers: {
          "Cache-Control": "no-store, no-cache",
          "X-Request-Nonce": `${Date.now()}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return await res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch Reddit threads with NO CACHING
  const { data: threads, isLoading: threadsLoading } = useQuery<RedditThread[]>({
    queryKey: ["/api/reddit/threads", searchQuery, filterType, filterSentiment, analysisId],
    queryFn: async () => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterType !== "all") params.append("filter", filterType);
      if (filterSentiment !== "all") params.append("sentiment", filterSentiment);
      
      const res = await fetch(`${backendUrl}/api/reddit/threads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch threads");
      return await res.json();
    },
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      default:
        return "😐";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="auto-responses">
            Auto-Responses <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Mock Data Warning */}
          <MockDataBanner />
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metricsLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Positive Sentiment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.positive_sentiment_pct.toFixed(1)}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Total Mention Rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.total_mention_rate.toFixed(1)}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Positive / Total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.positive_mentions} / {metrics?.total_mentions}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">vs Previous Period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold flex items-center gap-1 ${
                      (metrics?.change_vs_previous || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(metrics?.change_vs_previous || 0) >= 0 ? '+' : ''}
                      {metrics?.change_vs_previous.toFixed(1)}%
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Reddit Share of Citations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.reddit_share_of_citations.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threads</SelectItem>
                <SelectItem value="brand">Brand Mentioned</SelectItem>
                <SelectItem value="competitor">Competitor Mentioned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSentiment} onValueChange={setFilterSentiment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reddit Threads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Cited Reddit Threads</CardTitle>
              <CardDescription>
                Reddit discussions with the highest AI citation rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threadsLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : threads && threads.length > 0 ? (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              #{thread.rank}
                            </Badge>
                            <a
                              href={thread.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold hover:underline flex items-center gap-2"
                            >
                              {thread.title}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>r/{thread.subreddit}</span>
                            <span>•</span>
                            <span>{thread.citations} citations</span>
                            <span>•</span>
                            <span>{thread.percentage.toFixed(1)}% of Reddit citations</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                Brand: {thread.brand_mentioned}
                              </span>
                            </div>
                            {Object.entries(thread.competitors_mentioned).map(([name, count]) => (
                              <div key={name} className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">
                                  {name}: {count}
                                </span>
                              </div>
                            ))}
                          </div>

                          <p className="text-sm text-muted-foreground italic">
                            "{thread.summary}"
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getSentimentColor(thread.sentiment)}>
                            {getSentimentIcon(thread.sentiment)} {thread.sentiment}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {thread.sentiment_score.toFixed(2)} confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reddit threads found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Responses Tab */}
        <TabsContent value="auto-responses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Response Suggestions</CardTitle>
              <CardDescription>
                AI-generated response suggestions for high-intent Reddit posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Detect unanswered high-intent Reddit posts and suggest AI-generated replies 
                  following your brand guidelines. Manual approval required.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
