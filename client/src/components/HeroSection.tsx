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
    <div className="min-h-screen flex items-center justify-center pt-32 pb-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-black leading-tight">
          Be Found in the Age of AI.
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced <span className="underline decoration-2 underline-offset-4">GEO targeting</span> and optimization tools that boost your visibility in specific geographic markets
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Input
              type="text"
              placeholder="www.techstartup.io"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1 border border-gray-300 focus-visible:ring-1 focus-visible:ring-black text-base h-14 bg-white rounded-xl shadow-sm px-6"
              data-testid="input-url"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800 h-14 px-8 rounded-xl whitespace-nowrap"
              data-testid="button-analyze"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </>
              ) : (
                <>
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
        </form>
      </div>
    </div>
  );
}
