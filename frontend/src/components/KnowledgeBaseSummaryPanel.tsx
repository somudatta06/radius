import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle2, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface KnowledgeBaseSummaryPanelProps {
  brandName?: string;
  domain?: string;  // Added domain prop to fetch domain-specific KB
}

export function KnowledgeBaseSummaryPanel({ brandName, domain }: KnowledgeBaseSummaryPanelProps) {
  const [, navigate] = useLocation();

  // Use domain as company_id for domain-specific KB
  const companyId = domain?.replace(/\./g, '_') || 'default';

  // Fetch knowledge base data for this specific domain
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/knowledge-base", companyId],
    queryFn: async () => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/knowledge-base?company_id=${companyId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      return await res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-900 font-medium mb-2">
                Knowledge Base not loaded
              </p>
              <p className="text-sm text-yellow-700 mb-4">
                This analysis was run without your Knowledge Base context. Set it up to improve accuracy.
              </p>
              <Button size="sm" onClick={() => navigate("/dashboard/knowledge-base")}>
                Set Up Knowledge Base
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const companyDesc = data?.company_description;
  const brandGuidelines = data?.brand_guidelines;
  const evidenceCount = data?.evidence?.length || 0;

  return (
    <div className="space-y-6" data-testid="knowledge-base-summary-panel">
      {/* Header with Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                Knowledge Base Applied
              </p>
              <p className="text-xs text-green-700">
                This analysis uses your company description, brand rules, and evidence to improve accuracy.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/dashboard/knowledge-base")}
              className="border-green-300 hover:bg-green-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Edit Full KB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Description Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Company Description
              </CardTitle>
              <CardDescription>Your brand's source of truth</CardDescription>
            </div>
            {companyDesc?.is_ai_generated && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Generated
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Overview</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {companyDesc?.overview || "No overview available"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Products & Services</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {companyDesc?.products_services || "Not specified"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Target Customers</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {companyDesc?.target_customers || "Not specified"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Brand Guidelines Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Guidelines</CardTitle>
          <CardDescription>Voice and style rules applied to this analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {brandGuidelines?.tone && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Brand Tone</h4>
              <Badge variant="outline">{brandGuidelines.tone}</Badge>
            </div>
          )}
          {brandGuidelines?.words_to_prefer && brandGuidelines.words_to_prefer.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Preferred Words</h4>
              <div className="flex flex-wrap gap-2">
                {brandGuidelines.words_to_prefer.slice(0, 5).map((word: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {word}
                  </Badge>
                ))}
                {brandGuidelines.words_to_prefer.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{brandGuidelines.words_to_prefer.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Evidence</CardTitle>
          <CardDescription>Case studies, testimonials, and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {evidenceCount > 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm">
                <span className="font-semibold">{evidenceCount}</span> evidence item
                {evidenceCount !== 1 ? "s" : ""} available
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No evidence added yet. Add case studies to strengthen your analysis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Want to improve this analysis?
              </p>
              <p className="text-xs text-blue-700">
                Update your Knowledge Base and re-run the analysis for better results.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/knowledge-base")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Manage KB
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
