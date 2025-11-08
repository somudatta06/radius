import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-medium border border-gray-300">
          <span>AI-Powered Visibility Analysis</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-black leading-tight">
          Increase your visibility
          <br />
          <span className="relative inline-block">
            <span className="text-blue-600 underline decoration-blue-600 decoration-2 underline-offset-8">
              across AI platforms
            </span>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Discover how ChatGPT, Claude, Gemini, and Perplexity perceive your brand. Get actionable insights to boost your AI presence.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12">
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-xl shadow-lg border border-gray-200">
            <Input
              type="text"
              placeholder="Enter your website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1 border-0 focus-visible:ring-0 text-base h-14 bg-white text-black placeholder:text-gray-400"
              data-testid="input-url"
            />
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="gap-2 h-14 px-8 bg-black hover:bg-gray-900 text-white rounded-lg whitespace-nowrap font-semibold"
              data-testid="button-analyze"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Get Instant Results
                  <Search className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2 text-left" data-testid="text-error">
              {error}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free comprehensive analysis • Results in 30 seconds
          </p>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">500+ analyses run</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-black">89%</span>
            <span className="text-sm text-gray-600">avg improvement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-black">4</span>
            <span className="text-sm text-gray-600">AI platforms analyzed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
