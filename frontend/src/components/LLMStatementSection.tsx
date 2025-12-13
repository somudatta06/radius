export default function LLMStatementSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20" data-testid="section-llm-statement">
      {/* Main Statement */}
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          LLMs are the{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-background px-6 py-2 rounded-xl bg-[#8c8c8c]">
              new Google Search
            </span>
          </span>
        </h2>
      </div>
      {/* Supporting Text */}
      <div className="max-w-3xl mx-auto">
        <p className="text-lg md:text-xl text-muted-foreground text-center leading-relaxed">
          Traditional SEO is dead. AI platforms like ChatGPT, Claude, and Perplexity 
          are reshaping how customers discover brands.{' '}
          <span className="font-semibold text-foreground">
            Are you visible?
          </span>
        </p>
      </div>
      {/* Stats Highlight */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12">
        <div className="text-center" data-testid="stat-ai-search">
          <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            78%
          </div>
          <div className="text-sm md:text-base text-muted-foreground">
            of consumers use AI search
          </div>
        </div>
        <div className="text-center" data-testid="stat-chatgpt-queries">
          <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            5.6B
          </div>
          <div className="text-sm md:text-base text-muted-foreground">
            monthly ChatGPT queries
          </div>
        </div>
        <div className="text-center" data-testid="stat-ai-traffic">
          <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            40%
          </div>
          <div className="text-sm md:text-base text-muted-foreground">
            growth in AI-driven traffic
          </div>
        </div>
      </div>
    </section>
  );
}
