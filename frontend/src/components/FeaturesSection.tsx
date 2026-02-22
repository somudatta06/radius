import { Target, Star, Award, Lightbulb, BarChart3, CheckCircle, TrendingUp, Megaphone, Bot, Users } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  visualization: 'chart' | 'recommendations' | 'table' | 'download-report' | 'gap-analysis' | 'ad-intelligence';
  animationDelay?: string;
}

const FeatureCard = ({ title, description, visualization, animationDelay }: FeatureCardProps) => {
  return (
    <div
      className={`group relative bg-card border-2 border-border rounded-2xl p-8 hover-elevate transition-all duration-300 animate-fade-in-up ${animationDelay || ''}`}
      data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="relative aspect-[16/9] bg-muted/30 rounded-xl overflow-hidden border border-border">
        {visualization === 'chart' && <ChartVisualization />}
        {visualization === 'recommendations' && <RecommendationsVisualization />}
        {visualization === 'table' && <TableVisualization />}
        {visualization === 'download-report' && <DownloadReportVisualization />}
        {visualization === 'gap-analysis' && <GapAnalysisVisualization />}
        {visualization === 'ad-intelligence' && <AdIntelligenceVisualization />}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all duration-300" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
    </div>
  );
};

const ChartVisualization = () => (
  <div className="w-full h-full flex items-center justify-center p-6">
    <svg viewBox="0 0 400 200" className="w-full h-full">
      <path
        d="M 20 140 Q 80 120, 120 100 T 200 80 T 280 100 T 360 120"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        className="animate-draw-line"
      />
      <path
        d="M 20 160 Q 80 145, 120 130 T 200 110 T 280 130 T 360 150"
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="3"
        className="animate-draw-line animation-delay-200"
      />
      {/* Platform labels */}
      {[
        { x: 50, label: "GPT" },
        { x: 150, label: "Claude" },
        { x: 250, label: "Gemini" },
        { x: 350, label: "Perplx" },
      ].map((p) => (
        <text key={p.label} x={p.x} y="185" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">
          {p.label}
        </text>
      ))}
      <circle cx="200" cy="80" r="6" fill="hsl(var(--primary))" className="animate-pulse" />
      <circle cx="200" cy="110" r="6" fill="hsl(var(--muted-foreground))" className="animate-pulse" />
      <text x="20" y="78" fontSize="10" fill="hsl(var(--primary))" fontWeight="bold">Your brand</text>
      <text x="20" y="110" fontSize="10" fill="hsl(var(--muted-foreground))">Competitors</text>
    </svg>
  </div>
);

const RecommendationsVisualization = () => (
  <div className="w-full h-full p-6 flex flex-col justify-center gap-3">
    {[
      { Icon: Lightbulb, title: 'Add FAQ Schema Markup', impact: 'HIGH', points: '+10 pts' },
      { Icon: BarChart3, title: 'Create Comparison Pages', impact: 'HIGH', points: '+8 pts' },
      { Icon: Star, title: 'Add Customer Testimonials', impact: 'MED', points: '+6 pts' },
      { Icon: CheckCircle, title: 'Enhance Pricing Clarity', impact: 'MED', points: '+4 pts' },
    ].map((item, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover-elevate transition-all"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <item.Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.impact === 'HIGH' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
            {item.impact}
          </span>
          <span className="text-xs font-bold text-foreground">{item.points}</span>
        </div>
      </div>
    ))}
  </div>
);

const TableVisualization = () => (
  <div className="w-full h-full p-6 flex flex-col justify-center">
    <div className="space-y-3">
      {[
        { rank: '1', name: 'Your Brand', score: '39%', trend: '+4%', positive: true, isYou: true },
        { rank: '2', name: 'Competitor A', score: '33%', trend: '-1%', positive: false },
        { rank: '3', name: 'Competitor B', score: '24%', trend: '-6%', positive: false },
        { rank: '4', name: 'Competitor C', score: '23%', trend: '0%', positive: null },
      ].map((item, index) => (
        <div
          key={index}
          className={`flex items-center justify-between py-3 px-4 rounded-lg border transition-all ${
            item.isYou ? 'bg-foreground text-background border-foreground' : 'bg-card border-border hover-elevate'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold w-6 ${item.isYou ? 'text-background' : 'text-muted-foreground'}`}>{item.rank}</span>
            <span className={`text-sm font-semibold ${item.isYou ? 'text-background' : 'text-foreground'}`}>{item.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-bold ${item.isYou ? 'text-background' : 'text-foreground'}`}>{item.score}</span>
            <span className={`text-xs font-semibold ${
              item.positive === true ? (item.isYou ? 'text-green-300' : 'text-green-600') :
              item.positive === false ? 'text-red-500' : 'text-muted-foreground'
            }`}>{item.trend}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DownloadReportVisualization = () => (
  <div className="w-full h-full flex items-center justify-center p-6">
    <div className="text-center space-y-6">
      <div className="relative inline-block">
        <div className="w-32 h-40 bg-card border-2 border-border rounded-lg shadow-lg transform rotate-3 absolute -top-4 -right-4 opacity-30" />
        <div className="w-32 h-40 bg-card border-2 border-border rounded-lg shadow-lg transform -rotate-2 absolute -top-2 -right-2 opacity-50" />
        <div className="w-32 h-40 bg-card border-2 border-foreground rounded-lg shadow-xl relative overflow-hidden">
          <div className="p-3 space-y-2">
            <div className="h-3 bg-foreground rounded w-3/4" />
            <div className="h-2 bg-muted-foreground/30 rounded w-full" />
            <div className="h-2 bg-muted-foreground/30 rounded w-5/6" />
            <div className="h-2 bg-muted-foreground/30 rounded w-full" />
            <div className="mt-4 h-16 bg-muted/30 rounded" />
            <div className="h-2 bg-muted-foreground/30 rounded w-2/3" />
          </div>
          <div className="absolute bottom-2 right-2 bg-foreground text-background text-xs px-2 py-1 rounded font-bold">PDF</div>
        </div>
      </div>
      <div className="flex justify-center gap-6 text-xs">
        <div className="text-center">
          <div className="font-bold text-foreground text-lg">20+</div>
          <div className="text-muted-foreground">Pages</div>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <div className="font-bold text-foreground text-lg">100+</div>
          <div className="text-muted-foreground">Insights</div>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <div className="font-bold text-foreground text-lg">4</div>
          <div className="text-muted-foreground">Platforms</div>
        </div>
      </div>
    </div>
  </div>
);

const GapAnalysisVisualization = () => (
  <div className="w-full h-full p-6 flex flex-col justify-center gap-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-3.5 h-3.5 text-foreground" />
          <span className="text-xs font-bold text-foreground">AI Perception</span>
        </div>
        {[
          { label: 'Quality', value: 78 },
          { label: 'Value', value: 65 },
          { label: 'Trust', value: 72 },
        ].map((bar) => (
          <div key={bar.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="font-medium text-foreground">{bar.value}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-foreground rounded-full" style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground">Consumer Reality</span>
        </div>
        {[
          { label: 'Quality', value: 54 },
          { label: 'Value', value: 71 },
          { label: 'Trust', value: 48 },
        ].map((bar) => (
          <div key={bar.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="font-medium">{bar.value}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-muted-foreground rounded-full" style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
      <p className="text-xs text-red-700 font-medium">⚠ Trust gap detected: AI overestimates by 24 points</p>
    </div>
  </div>
);

const AdIntelligenceVisualization = () => (
  <div className="w-full h-full p-6 flex flex-col justify-center gap-3">
    <div className="flex items-center gap-2 mb-1">
      <Megaphone className="w-3.5 h-3.5 text-foreground" />
      <span className="text-xs font-bold text-foreground">Messaging Mix Analysis</span>
    </div>
    {[
      { label: 'Feature-led', value: 38, color: 'bg-foreground' },
      { label: 'Aspirational', value: 28, color: 'bg-foreground/70' },
      { label: 'UGC / Social', value: 18, color: 'bg-foreground/50' },
      { label: 'Discount', value: 10, color: 'bg-muted-foreground/50' },
      { label: 'Comparison', value: 6, color: 'bg-muted-foreground/30' },
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-20 shrink-0">{item.label}</span>
        <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
          <div className={`h-full ${item.color} rounded transition-all`} style={{ width: `${item.value}%` }} />
        </div>
        <span className="text-xs font-bold text-foreground w-8 text-right">{item.value}%</span>
      </div>
    ))}
    <div className="mt-1 p-2.5 bg-muted rounded-lg">
      <p className="text-xs text-muted-foreground">💡 Recommended: Shift 12% budget to comparison ads</p>
    </div>
  </div>
);

export const FeaturesSection = () => {
  const features = [
    {
      title: 'AI Visibility',
      description: 'Understand how your brand performs across ChatGPT, Claude, Gemini, and Perplexity — with real score breakdowns per platform.',
      visualization: 'chart' as const,
    },
    {
      title: 'Gap Analysis',
      description: 'Spot the gap between how AI perceives your brand and what your actual customers experience. Close it before competitors do.',
      visualization: 'gap-analysis' as const,
    },
    {
      title: 'Ad Intelligence',
      description: 'Decode your competitors\' ad messaging strategy and get AI-powered recommendations for your own campaigns.',
      visualization: 'ad-intelligence' as const,
    },
    {
      title: 'Smart Recommendations',
      description: 'Personalized, ranked action items generated by GPT-4o — each with estimated score impact and step-by-step execution plan.',
      visualization: 'recommendations' as const,
    },
    {
      title: 'Competitor Tracking',
      description: 'Measure your AI mention share against competitors with real-time ranking analysis across all major AI platforms.',
      visualization: 'table' as const,
    },
    {
      title: 'PDF Report Export',
      description: 'Export a board-ready PDF with all metrics, insights, and recommendations. Share with your team in one click.',
      visualization: 'download-report' as const,
    },
  ];

  return (
    <section className="w-full bg-background py-20 md:py-32 pt-[0px] pb-[0px]" data-testid="section-features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            Comprehensive AI Visibility
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-foreground text-background px-6 py-2 rounded-xl">
                Analytics
              </span>
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-6">
            Six intelligence modules to dominate AI search and discovery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              visualization={feature.visualization}
              animationDelay={
                index === 0 ? 'animation-delay-200' :
                index === 1 ? 'animation-delay-400' :
                index === 2 ? 'animation-delay-600' :
                index === 3 ? 'animation-delay-800' : ''
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};
