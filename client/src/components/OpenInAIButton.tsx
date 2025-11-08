import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface OpenInAIProps {
  platform: 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini';
  query: string;
  context?: {
    brandName: string;
    industry?: string;
    purpose?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const PLATFORM_URLS = {
  ChatGPT: 'https://chat.openai.com/',
  Claude: 'https://claude.ai/new',
  Perplexity: 'https://www.perplexity.ai/',
  Gemini: 'https://gemini.google.com/'
};

export function OpenInAIButton({
  platform,
  query,
  context,
  variant = 'outline',
  size = 'sm'
}: OpenInAIProps) {
  const generateURL = () => {
    let fullQuery = query;
    
    if (context) {
      const contextStr = `Context: Analyzing ${context.brandName}${
        context.industry ? ` in the ${context.industry} industry` : ''
      }${context.purpose ? `. ${context.purpose}` : ''}`;
      fullQuery = `${query}\n\n${contextStr}`;
    }

    const baseUrl = PLATFORM_URLS[platform];
    const encodedQuery = encodeURIComponent(fullQuery);
    
    return `${baseUrl}?q=${encodedQuery}`;
  };

  const handleClick = () => {
    window.open(generateURL(), '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      data-testid={`button-open-${platform.toLowerCase()}`}
      className="gap-2"
    >
      <span>Test in {platform}</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </Button>
  );
}
