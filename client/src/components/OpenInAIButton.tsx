import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import chatGPTLogo from '@assets/stock_images/chatgpt_logo_icon_daa2e0fa.jpg';
import claudeLogo from '@assets/stock_images/claude_ai_anthropic__556f3423.jpg';
import perplexityLogo from '@assets/stock_images/perplexity_ai_logo_i_51f7530a.jpg';
import geminiLogo from '@assets/stock_images/google_gemini_ai_log_6fcde963.jpg';

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

const PLATFORM_LOGOS = {
  ChatGPT: chatGPTLogo,
  Claude: claudeLogo,
  Perplexity: perplexityLogo,
  Gemini: geminiLogo
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
      <img 
        src={PLATFORM_LOGOS[platform]} 
        alt={`${platform} logo`}
        className="h-4 w-4 rounded-sm object-cover"
      />
      <span>Test in {platform}</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </Button>
  );
}
