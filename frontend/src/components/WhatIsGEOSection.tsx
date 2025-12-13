import { Check } from "lucide-react";

export default function WhatIsGEOSection() {
  return (
    <section className="w-full py-28 px-6 bg-muted" data-testid="section-what-is-geo">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          {/* Premium Badge with Dot Indicator */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-card border border-border rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 bg-foreground rounded-full" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                The Basics
              </span>
            </div>
          </div>

          {/* Enhanced Title */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-none">
            What is GEO?
          </h2>

          {/* Refined Definition */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            <span className="font-bold text-foreground tracking-tight">
              Generative Engine Optimization
            </span>{' '}
            is the practice of optimizing your brand for AI-powered search
            engines and conversational platforms.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Traditional SEO Card - Enhanced */}
          <div className="group relative bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl hover:border-foreground/20 transition-all duration-300 overflow-hidden" data-testid="card-traditional-seo">
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Decorative corner element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-muted/50 rounded-bl-full" />
            
            {/* Title Section */}
            <div className="relative z-10 mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-1 tracking-tight">
                SEO
              </h3>
              <p className="text-muted-foreground text-sm font-medium">
                Search Engine Optimization
              </p>
            </div>

            {/* Platform List with Enhanced Styling */}
            <div className="relative z-10 space-y-3 mb-8">
              <div className="flex items-center gap-3 text-foreground group/item" data-testid="platform-google">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border group-hover/item:bg-muted/80 group-hover/item:border-border/80 transition-all">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium">Google Search</span>
              </div>
              <div className="flex items-center gap-3 text-foreground group/item" data-testid="platform-bing">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border group-hover/item:bg-muted/80 group-hover/item:border-border/80 transition-all">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium">Bing</span>
              </div>
              <div className="flex items-center gap-3 text-foreground group/item" data-testid="platform-yahoo">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border group-hover/item:bg-muted/80 group-hover/item:border-border/80 transition-all">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium">Yahoo</span>
              </div>
            </div>

            {/* Focus Section */}
            <div className="relative z-10 mt-8 pt-6 border-t border-border">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Focus
              </div>
              <div className="text-sm text-foreground font-medium">
                Keywords, backlinks, and page rankings
              </div>
            </div>
          </div>

          {/* Modern GEO Card - Ultra Premium */}
          <div className="group relative bg-foreground rounded-2xl p-8 border-2 border-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden" data-testid="card-modern-geo">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-background/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Enhanced Glow Effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-background/5 rounded-full blur-3xl group-hover:bg-background/10 transition-all duration-500" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-background/5 rounded-full blur-3xl group-hover:bg-background/10 transition-all duration-500" />
            
            {/* Title Section */}
            <div className="relative z-10 mb-8">
              <h3 className="text-3xl font-bold text-background mb-1 tracking-tight">
                GEO
              </h3>
              <p className="text-background/80 text-sm font-medium">
                Generative Engine Optimization
              </p>
            </div>

            {/* Platform List with Glass Morphism */}
            <div className="relative z-10 space-y-3 mb-8">
              <div className="flex items-center gap-3 text-background group/item" data-testid="platform-chatgpt">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-background/20 group-hover/item:bg-background/20 group-hover/item:border-background/30 transition-all">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">ChatGPT</span>
              </div>
              <div className="flex items-center gap-3 text-background group/item" data-testid="platform-claude">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-background/20 group-hover/item:bg-background/20 group-hover/item:border-background/30 transition-all">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">Claude</span>
              </div>
              <div className="flex items-center gap-3 text-background group/item" data-testid="platform-gemini">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-background/20 group-hover/item:bg-background/20 group-hover/item:border-background/30 transition-all">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">Gemini</span>
              </div>
              <div className="flex items-center gap-3 text-background group/item" data-testid="platform-perplexity">
                <div className="w-8 h-8 bg-background/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 border border-background/20 group-hover/item:bg-background/20 group-hover/item:border-background/30 transition-all">
                  <Check className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm font-medium">Perplexity</span>
              </div>
            </div>

            {/* Focus Section */}
            <div className="relative z-10 mt-8 pt-6 border-t border-background/10">
              <div className="text-xs font-bold text-background/60 uppercase tracking-wider mb-2">
                Focus
              </div>
              <div className="text-sm text-background/90 font-medium">
                Brand visibility, context quality, and AI recommendations
              </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Banner */}
        <div className="bg-card rounded-2xl p-8 border-2 border-border text-center shadow-sm" data-testid="stats-banner">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex-1 max-w-xs" data-testid="stat-ai-users">
              <div className="text-5xl md:text-6xl font-bold text-foreground mb-2 tracking-tight">
                65%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                of users now start with AI platforms instead of Google
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-border" />

            <div className="flex-1 max-w-xs" data-testid="stat-monthly-queries">
              <div className="text-5xl md:text-6xl font-bold text-foreground mb-2 tracking-tight">
                5.6B
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                monthly queries on ChatGPT alone
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-border" />

            <div className="flex-1 max-w-xs" data-testid="stat-visibility-gap">
              <div className="text-5xl md:text-6xl font-bold text-foreground mb-2 tracking-tight">
                0%
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                visibility on AI platforms for most brands
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
