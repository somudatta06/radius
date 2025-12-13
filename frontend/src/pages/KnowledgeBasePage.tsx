import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Palette, Database, AlertTriangle } from "lucide-react";
import LandingNav from "@/components/LandingNav";
import Footer from "@/components/Footer";
import { CompanyDescriptionTab } from "@/components/knowledge/CompanyDescriptionTab";
import { BrandGuidelinesTab } from "@/components/knowledge/BrandGuidelinesTab";
import { EvidenceTab } from "@/components/knowledge/EvidenceTab";

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState("company");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  // Fetch knowledge base data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/knowledge-base"],
    queryFn: async () => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/knowledge-base?company_id=default`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      return await res.json();
    },
  });

  const handleRegenerate = async () => {
    // Get website URL from somewhere (you might need to pass this or store it)
    const websiteUrl = data?.metadata?.generated_from || "example.com";
    
    setIsRegenerating(true);
    try {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(
        `${backendUrl}/api/knowledge-base/regenerate?website_url=${encodeURIComponent(websiteUrl)}&company_id=default`,
        { method: "POST" }
      );
      
      if (res.ok) {
        await refetch();
        setShowRegenerateDialog(false);
      }
    } catch (err) {
      console.error("Regeneration failed:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNav />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Knowledge Base</h1>
                <p className="text-muted-foreground text-lg">
                  Your single source of truth for AI-generated content about your brand
                </p>
              </div>
              {data?.company_description?.is_ai_generated && (
                <Button
                  variant="outline"
                  onClick={() => setShowRegenerateDialog(true)}
                  disabled={isRegenerating}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRegenerating ? "Regenerating..." : "Regenerate from Website"}
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-destructive mb-4">Failed to load knowledge base</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                <TabsTrigger value="company" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Company Description</span>
                  <span className="sm:hidden">Company</span>
                </TabsTrigger>
                <TabsTrigger value="brand" className="gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Brand Guidelines</span>
                  <span className="sm:hidden">Brand</span>
                </TabsTrigger>
                <TabsTrigger value="evidence" className="gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Evidence</span>
                  <span className="sm:hidden">Evidence</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-6">
                <CompanyDescriptionTab data={data?.company_description} />
              </TabsContent>

              <TabsContent value="brand" className="space-y-6">
                <BrandGuidelinesTab data={data?.brand_guidelines} />
              </TabsContent>

              <TabsContent value="evidence" className="space-y-6">
                <EvidenceTab data={data?.evidence || []} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
      
      {/* Regenerate Confirmation Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Regenerate Knowledge Base?
            </DialogTitle>
            <DialogDescription>
              This will re-analyze your website and regenerate all AI-generated content. 
              Any manual edits you've made will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? "Regenerating..." : "Yes, Regenerate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
