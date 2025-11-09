import { Search, Sparkles, Check } from "lucide-react";

export default function WhatIsGEOSection() {
  return (
    <section className="w-full py-24 px-6 bg-muted" data-testid="section-what-is-geo">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full mb-6">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              The Basics
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            What is GEO?
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            <span className="font-semibold text-foreground">
              Generative Engine Optimization
            </span>{' '}
            is the practice of optimizing your brand for AI-powered search
            engines and conversational platforms.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Traditional SEO Card */}
          <div className="bg-card rounded-2xl p-8 border-2 border-border relative overflow-hidden group hover-elevate" data-testid="card-traditional-seo">
            {/* Decorative Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
              Traditional
            </div>

            <div className="mb-6">
              <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                SEO
              </h3>
              <p className="text-muted-foreground text-sm">
                Search Engine Optimization
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-foreground" data-testid="platform-google">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium">Google Search</span>
              </div>
              <div className="flex items-center gap-3 text-foreground" data-testid="platform-bing">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium">Bing</span>
              </div>
              <div className="flex items-center gap-3 text-foreground" data-testid="platform-yahoo">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium">Yahoo</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Focus
              </div>
              <div className="text-sm text-foreground">
                Keywords, backlinks, and page rankings
              </div>
            </div>
          </div>

          {/* Modern GEO Card */}
          <div className="bg-foreground rounded-2xl p-8 border-2 border-foreground relative overflow-hidden group shadow-2xl" data-testid="card-modern-geo">
            {/* Decorative Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-background/20 backdrop-blur-sm text-background text-xs font-semibold rounded-full">
              The Future
            </div>

            {/* Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-background/10 rounded-full blur-3xl" />

            <div className="relative z-10 mb-6">
              <div className="w-14 h-14 bg-background/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-background" />
              </div>
              <h3 className="text-2xl font-bold text-background mb-2">
                GEO
              </h3>
              <p className="text-background/80 text-sm">
                Generative Engine Optimization
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3 text-background" data-testid="platform-chatgpt">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">ChatGPT</span>
              </div>
              <div className="flex items-center gap-3 text-background" data-testid="platform-claude">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">Claude</span>
              </div>
              <div className="flex items-center gap-3 text-background" data-testid="platform-gemini">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">Gemini</span>
              </div>
              <div className="flex items-center gap-3 text-background" data-testid="platform-perplexity">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">Perplexity</span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-6 border-t border-background/10">
              <div className="text-xs text-background/60 uppercase tracking-wide mb-2">
                Focus
              </div>
              <div className="text-sm text-background/90">
                Brand visibility, context quality, and AI recommendations
              </div>
            </div>
          </div>
        </div>

        {/* Key Insight Banner */}
        <div className="bg-card rounded-2xl p-8 border-2 border-border text-center" data-testid="stats-banner">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex-1 max-w-xs" data-testid="stat-ai-users">
              <div className="text-5xl font-bold text-foreground mb-2">
                65%
              </div>
              <div className="text-sm text-muted-foreground">
                of users now start with AI platforms instead of Google
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-border" />

            <div className="flex-1 max-w-xs" data-testid="stat-monthly-queries">
              <div className="text-5xl font-bold text-foreground mb-2">
                5.6B
              </div>
              <div className="text-sm text-muted-foreground">
                monthly queries on ChatGPT alone
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-border" />

            <div className="flex-1 max-w-xs" data-testid="stat-visibility-gap">
              <div className="text-5xl font-bold text-foreground mb-2">
                0%
              </div>
              <div className="text-sm text-muted-foreground">
                visibility on AI platforms for most brands
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
