import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function HeroSection({ onAnalyze, isLoading }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let processedUrl = url.trim();
    
    if (!processedUrl) {
      setError("Please enter a website URL");
      return;
    }

    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl;
    }

    try {
      new URL(processedUrl);
      onAnalyze(processedUrl);
    } catch {
      setError("Please enter a valid URL");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-chart-3/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="absolute top-32 right-20 hidden lg:block">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-lg" />
          <div className="relative bg-card border-2 border-primary/30 rounded-lg p-3 rotate-12 hover:rotate-6 transition-transform">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Visibility Analysis</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          Increase your visibility
          <br />
          <span className="text-primary">across AI platforms</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Discover how ChatGPT, Claude, Gemini, and Perplexity perceive your brand. Get actionable insights to boost your AI presence.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-2xl shadow-2xl border-2">
            <Input
              type="text"
              placeholder="Enter your website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1 border-0 focus-visible:ring-0 text-base h-12 bg-transparent"
              data-testid="input-url"
            />
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="gap-2 h-12 px-8 whitespace-nowrap"
              data-testid="button-analyze"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Get Instant Results
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2 text-left" data-testid="text-error">
              {error}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free comprehensive analysis • Results in 30 seconds
          </p>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">500+ analyses run</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">89%</span>
            <span className="text-sm text-muted-foreground">avg improvement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">4</span>
            <span className="text-sm text-muted-foreground">AI platforms analyzed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
