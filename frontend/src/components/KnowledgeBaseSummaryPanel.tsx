import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen, CheckCircle2, ExternalLink, Sparkles, AlertCircle,
  PlusCircle, ChevronDown, ChevronUp, Save, Trash2, X
} from "lucide-react";
import { useLocation } from "wouter";

interface KnowledgeBaseSummaryPanelProps {
  brandName?: string;
  domain?: string;
  analysisId?: string;
}

export function KnowledgeBaseSummaryPanel({ brandName, domain, analysisId }: KnowledgeBaseSummaryPanelProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const companyId = analysisId || domain?.replace(/\./g, '_') || 'default';

  // ── Manual input state ──────────────────────────────────────────────────
  const [showAddInfo, setShowAddInfo] = useState(false);
  const [customOverview, setCustomOverview] = useState("");
  const [customProducts, setCustomProducts] = useState("");
  const [customTargetCustomers, setCustomTargetCustomers] = useState("");
  const [customPositioning, setCustomPositioning] = useState("");
  const [newEvidenceTitle, setNewEvidenceTitle] = useState("");
  const [newEvidenceContent, setNewEvidenceContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Fetch KB ─────────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/knowledge-base", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/knowledge-base?company_id=${companyId}`, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
          "X-Request-Nonce": `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      return await res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateDescMutation = useMutation({
    mutationFn: async (desc: Record<string, string>) => {
      const res = await fetch(`/api/knowledge-base/company-description?company_id=${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(desc),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base", companyId] });
    },
  });

  const addEvidenceMutation = useMutation({
    mutationFn: async (evidence: { title: string; content: string; type: string }) => {
      const res = await fetch(`/api/knowledge-base/evidence?company_id=${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evidence),
      });
      if (!res.ok) throw new Error("Evidence save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base", companyId] });
      setNewEvidenceTitle("");
      setNewEvidenceContent("");
    },
  });

  const handleSaveCustomInfo = async () => {
    setSaveStatus("saving");
    try {
      const updates: Record<string, string> = {};
      if (customOverview.trim()) updates.overview = customOverview.trim();
      if (customProducts.trim()) updates.products_services = customProducts.trim();
      if (customTargetCustomers.trim()) updates.target_customers = customTargetCustomers.trim();
      if (customPositioning.trim()) updates.positioning = customPositioning.trim();

      if (Object.keys(updates).length > 0) {
        await updateDescMutation.mutateAsync(updates);
      }
      setSaveStatus("saved");
      // Reset fields after save
      setCustomOverview(""); setCustomProducts("");
      setCustomTargetCustomers(""); setCustomPositioning("");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleAddEvidence = async () => {
    if (!newEvidenceTitle.trim() && !newEvidenceContent.trim()) return;
    await addEvidenceMutation.mutateAsync({
      title: newEvidenceTitle.trim() || "Custom note",
      content: newEvidenceContent.trim(),
      type: "custom",
    });
  };

  // ── Render helpers ────────────────────────────────────────────────────────
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
              <p className="text-sm text-yellow-900 font-medium mb-2">Knowledge Base not loaded</p>
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
  const evidenceItems: Array<{ id: string; title: string; content?: string; type?: string }> = data?.evidence || [];

  const hasCustomContent =
    customOverview.trim() || customProducts.trim() ||
    customTargetCustomers.trim() || customPositioning.trim();

  return (
    <div className="space-y-6" data-testid="knowledge-base-summary-panel">

      {/* Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">Knowledge Base Applied</p>
              <p className="text-xs text-green-700">
                This analysis uses your company description, brand rules, and evidence to improve accuracy.
              </p>
            </div>
            <Button
              size="sm" variant="outline"
              onClick={() => navigate("/dashboard/knowledge-base")}
              className="border-green-300 hover:bg-green-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Edit Full KB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── ADD YOUR OWN INFORMATION (new section) ───────────────────────── */}
      <Card className="border-violet-200">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setShowAddInfo(v => !v)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-violet-800">
                <PlusCircle className="h-5 w-5" />
                Add Your Own Information
              </CardTitle>
              <CardDescription>
                Supplement the auto-scraped data with your own brand context
              </CardDescription>
            </div>
            {showAddInfo ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        {showAddInfo && (
          <CardContent className="space-y-6 pt-0">

            {/* Description fields */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Brand Description</h4>
              <p className="text-xs text-muted-foreground">
                Fill in any fields you want to update or add to the auto-detected information.
                Leave blank to keep the existing value.
              </p>

              <div className="space-y-2">
                <Label htmlFor="kb-overview" className="text-xs font-medium">
                  Overview / About the Brand
                </Label>
                <Textarea
                  id="kb-overview"
                  placeholder={companyDesc?.overview
                    ? `Current: "${companyDesc.overview.slice(0, 80)}..." — type to override`
                    : "Describe what your brand does, your mission, and what makes you unique…"}
                  value={customOverview}
                  onChange={e => setCustomOverview(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kb-products" className="text-xs font-medium">
                  Products &amp; Services
                </Label>
                <Textarea
                  id="kb-products"
                  placeholder={companyDesc?.products_services || "List your key products or services…"}
                  value={customProducts}
                  onChange={e => setCustomProducts(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kb-customers" className="text-xs font-medium">
                    Target Customers
                  </Label>
                  <Input
                    id="kb-customers"
                    placeholder={companyDesc?.target_customers || "Who are your ideal customers?"}
                    value={customTargetCustomers}
                    onChange={e => setCustomTargetCustomers(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kb-positioning" className="text-xs font-medium">
                    Brand Positioning
                  </Label>
                  <Input
                    id="kb-positioning"
                    placeholder={companyDesc?.positioning || "How do you position vs competitors?"}
                    value={customPositioning}
                    onChange={e => setCustomPositioning(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveCustomInfo}
                disabled={!hasCustomContent || saveStatus === "saving"}
                className="gap-2"
                size="sm"
              >
                {saveStatus === "saving" ? (
                  <>Saving…</>
                ) : saveStatus === "saved" ? (
                  <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                ) : saveStatus === "error" ? (
                  <><X className="h-4 w-4" /> Error — try again</>
                ) : (
                  <><Save className="h-4 w-4" /> Save Brand Info</>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-1">Add a Note or Evidence</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Add a fact, testimonial, case study, or any context you want the AI to know about.
              </p>
              <div className="space-y-2">
                <Input
                  placeholder="Title (e.g. 'Award won in 2024', 'Key differentiator')"
                  value={newEvidenceTitle}
                  onChange={e => setNewEvidenceTitle(e.target.value)}
                  className="text-sm"
                />
                <Textarea
                  placeholder="Details — paste a quote, statistic, product description, or any information…"
                  value={newEvidenceContent}
                  onChange={e => setNewEvidenceContent(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
                <Button
                  onClick={handleAddEvidence}
                  disabled={(!newEvidenceTitle.trim() && !newEvidenceContent.trim()) || addEvidenceMutation.isPending}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  {addEvidenceMutation.isPending ? "Adding…" : "Add Note"}
                </Button>
              </div>
            </div>

            {/* Show existing evidence items with delete option */}
            {evidenceItems.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Saved Notes &amp; Evidence ({evidenceItems.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {evidenceItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                        {item.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {item.content}
                          </p>
                        )}
                      </div>
                      {item.type === "custom" && (
                        <button
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          title="Remove"
                          onClick={async () => {
                            await fetch(
                              `/api/knowledge-base/evidence/${item.id}?company_id=${companyId}`,
                              { method: "DELETE" }
                            );
                            queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base", companyId] });
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Company Description Preview (auto-scraped) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Company Description
              </CardTitle>
              <CardDescription>Auto-scraped from your website</CardDescription>
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
            <h4 className="text-sm font-semibold mb-2">Products &amp; Services</h4>
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
                  <Badge key={idx} variant="secondary" className="text-xs">{word}</Badge>
                ))}
                {brandGuidelines.words_to_prefer.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{brandGuidelines.words_to_prefer.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          {!brandGuidelines?.tone && (!brandGuidelines?.words_to_prefer || brandGuidelines.words_to_prefer.length === 0) && (
            <p className="text-sm text-muted-foreground">No brand guidelines detected yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Evidence Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Evidence</CardTitle>
          <CardDescription>Case studies, testimonials, and your custom notes</CardDescription>
        </CardHeader>
        <CardContent>
          {evidenceItems.length > 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm">
                <span className="font-semibold">{evidenceItems.length}</span> evidence item
                {evidenceItems.length !== 1 ? "s" : ""} available
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No evidence yet. Use the "Add Your Own Information" section above to add notes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
