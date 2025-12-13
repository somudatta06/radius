import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Palette, Database } from "lucide-react";
import LandingNav from "@/components/LandingNav";
import Footer from "@/components/Footer";
import { CompanyDescriptionTab } from "@/components/knowledge/CompanyDescriptionTab";
import { BrandGuidelinesTab } from "@/components/knowledge/BrandGuidelinesTab";
import { EvidenceTab } from "@/components/knowledge/EvidenceTab";

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState("company");

  // Fetch knowledge base data
  const { data, isLoading, error } = useQuery({
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNav />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Knowledge Base</h1>
            <p className="text-muted-foreground text-lg">
              Your single source of truth for AI-generated content about your brand
            </p>
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
    </div>
  );
}
