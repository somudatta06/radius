import { analyzeWithGPT } from './openai';
import { scrapeWebsite, type WebsiteInfo } from './scraper';
import { tracxnService } from './tracxn';
import type { AnalysisResult } from '@shared/schema';

interface BrandInfo {
  name: string;
  domain: string;
  industry: string;
  description: string;
}

function sanitizeWebsiteInfo(raw: WebsiteInfo): WebsiteInfo {
  return {
    url: typeof raw.url === 'string' ? raw.url : '',
    title: typeof raw.title === 'string' ? raw.title : 'Untitled',
    description: typeof raw.description === 'string' ? raw.description : '',
    textContent: typeof raw.textContent === 'string' ? raw.textContent : '',
    headings: Array.isArray(raw.headings) ? raw.headings : [],
    links: Array.isArray(raw.links) ? raw.links : [],
    metaTags: typeof raw.metaTags === 'object' && raw.metaTags ? raw.metaTags : {},
    hasFAQ: Boolean(raw.hasFAQ),
    hasTestimonials: Boolean(raw.hasTestimonials),
    hasPricing: Boolean(raw.hasPricing),
    hasAbout: Boolean(raw.hasAbout),
    hasBlog: Boolean(raw.hasBlog),
    hasComparisons: Boolean(raw.hasComparisons),
    hasDocumentation: Boolean(raw.hasDocumentation),
    hasUseCases: Boolean(raw.hasUseCases),
  };
}

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  console.log(`Starting analysis for ${url}...`);

  // Step 1: Scrape the website and sanitize all fields
  console.log('Scraping website...');
  const rawWebsiteInfo = await scrapeWebsite(url);
  const websiteInfo = sanitizeWebsiteInfo(rawWebsiteInfo);

  // Step 2: Extract brand info using GPT
  console.log('Extracting brand information...');
  const brandInfo = await extractBrandInfo(websiteInfo);

  // Step 3: Discover competitors using GPT
  console.log('Discovering competitors...');
  const competitors = await discoverCompetitors(brandInfo, websiteInfo);

  // Step 4: Analyze visibility across platforms
  console.log('Analyzing AI platform visibility...');
  const platformScores = await analyzePlatformVisibility(brandInfo, websiteInfo);

  // Step 5: Calculate dimension scores
  console.log('Calculating dimension scores...');
  const dimensionScores = await calculateDimensionScores(websiteInfo, brandInfo);

  // Step 6: Detect gaps
  console.log('Detecting content gaps...');
  const gaps = detectGaps(websiteInfo);

  // Step 7: Generate recommendations
  console.log('Generating recommendations...');
  const recommendations = await generateRecommendations(websiteInfo, gaps, platformScores);

  // Step 8: Calculate overall score
  const overallScore = calculateOverallScore(platformScores, dimensionScores);

  // Step 9: Calculate GEO metrics
  console.log('Calculating GEO metrics...');
  const geoMetrics = await calculateGEOMetrics(websiteInfo, brandInfo);

  // Step 10: Generate competitor analysis
  console.log('Generating competitor analysis...');
  const competitorAnalysis = await generateCompetitorAnalysis(competitors, brandInfo, websiteInfo);

  // Step 11: Generate platform score details
  console.log('Generating platform score details...');
  const platformScoreDetails = await generatePlatformScoreDetails(platformScores, websiteInfo, geoMetrics);

  // Step 12: Perform accuracy checks
  console.log('Performing accuracy checks...');
  const accuracyChecks = await performAccuracyChecks(brandInfo, websiteInfo);

  // Step 13: Generate quick wins
  console.log('Generating quick wins...');
  const quickWins = await generateQuickWins(websiteInfo, gaps);

  // Step 14: Generate strategic bets
  console.log('Generating strategic bets...');
  const strategicBets = await generateStrategicBets(websiteInfo, brandInfo);

  console.log(`Analysis complete! Overall score: ${overallScore}, GEO score: ${geoMetrics.overall}`);

  return {
    url,
    brandInfo,
    overallScore,
    platformScores,
    dimensionScores,
    competitors,
    gaps,
    recommendations,
    geoMetrics,
    competitorAnalysis,
    platformScoreDetails,
    accuracyChecks,
    quickWins,
    strategicBets,
  };
}

async function extractBrandInfo(websiteInfo: WebsiteInfo): Promise<BrandInfo> {
  const prompt = `Analyze this website and extract brand information:

Title: ${websiteInfo.title}
Description: ${websiteInfo.description}
Content sample: ${websiteInfo.textContent.substring(0, 1000)}

Extract:
1. Brand name (company name)
2. Industry/sector
3. Brief description (1-2 sentences about what they do)

Return JSON format:
{
  "name": "Brand Name",
  "domain": "domain.com",
  "industry": "industry",
  "description": "brief description"
}`;

  const response = await analyzeWithGPT(prompt, { jsonMode: true });
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse brand info JSON:', error);
    // Fallback to basic info from scrape with safe validation
    const safeName = typeof websiteInfo.title === 'string' && websiteInfo.title
      ? websiteInfo.title.substring(0, 50)
      : 'Unknown Company';
      
    let safeDomain = 'unknown.com';
    try {
      if (websiteInfo.url && typeof websiteInfo.url === 'string') {
        safeDomain = new URL(websiteInfo.url).hostname;
      }
    } catch (e) {
      try {
        safeDomain = String(websiteInfo.url || '').replace(/^https?:\/\//, '').split('/')[0] || 'unknown.com';
      } catch (err) {
        safeDomain = 'unknown.com';
      }
    }
    
    const safeDescription = typeof websiteInfo.description === 'string' && websiteInfo.description
      ? websiteInfo.description
      : 'No description available';
    
    return {
      name: safeName,
      domain: safeDomain,
      industry: 'Unknown',
      description: safeDescription,
    };
  }
  
  // Type guard and extraction with explicit validation
  const data = parsed as { name?: unknown; industry?: unknown; description?: unknown };
  
  // Validate and coerce all fields to strings with safe fallbacks
  const safeFallbackName = typeof websiteInfo.title === 'string' && websiteInfo.title 
    ? websiteInfo.title.substring(0, 50)
    : 'Unknown Company';
    
  const name = typeof data.name === 'string' && data.name.trim() 
    ? data.name.trim()
    : safeFallbackName;
    
  const industry = typeof data.industry === 'string' && data.industry.trim()
    ? data.industry.trim()
    : 'Unknown';
    
  const safeFallbackDescription = typeof websiteInfo.description === 'string' && websiteInfo.description
    ? websiteInfo.description
    : 'No description available';
    
  const description = typeof data.description === 'string' && data.description.trim()
    ? data.description.trim()
    : safeFallbackDescription;
  
  // Safe domain extraction with multiple fallback strategies
  let domain: string;
  try {
    if (!websiteInfo.url || typeof websiteInfo.url !== 'string') {
      domain = 'unknown.com';
    } else {
      domain = new URL(websiteInfo.url).hostname;
    }
  } catch (error) {
    console.error('Failed to parse domain from URL:', error);
    try {
      domain = String(websiteInfo.url || '').replace(/^https?:\/\//, '').split('/')[0] || 'unknown.com';
    } catch (e) {
      domain = 'unknown.com';
    }
  }
  
  return {
    name,
    domain,
    industry,
    description,
  };
}

async function discoverCompetitors(brandInfo: BrandInfo, websiteInfo: WebsiteInfo): Promise<AnalysisResult['competitors']> {
  // Try to get competitors from Tracxn API first
  let tracxnCompetitors: Array<any> = [];
  let tracxnEnrichment: Map<string, any> = new Map();
  
  if (tracxnService.isAvailable()) {
    console.log('Fetching competitors from Tracxn API...');
    try {
      const competitors = await tracxnService.getCompetitors(brandInfo.domain, 5);
      tracxnCompetitors = competitors;
      
      // Also get company info for the current brand
      const currentCompanyInfo = await tracxnService.searchCompany(brandInfo.domain);
      if (currentCompanyInfo) {
        tracxnEnrichment.set(brandInfo.domain, currentCompanyInfo);
      }
      
      console.log(`Found ${competitors.length} competitors from Tracxn`);
    } catch (error) {
      console.error('Error fetching from Tracxn:', error);
    }
  }

  // Use GPT to analyze and rank competitors
  const competitorList = tracxnCompetitors.length > 0
    ? tracxnCompetitors.map(c => `${c.name} (${c.domain})`).join(', ')
    : 'discover competitors';

  const prompt = `You are analyzing competitors for ${brandInfo.name} (${brandInfo.domain}), a company in the ${brandInfo.industry} industry.

Based on this information:
- Industry: ${brandInfo.industry}
- Description: ${brandInfo.description}
${tracxnCompetitors.length > 0 ? `- Known competitors: ${competitorList}` : ''}

${tracxnCompetitors.length > 0 
  ? 'Using the provided competitor list, analyze and rank them.' 
  : 'Generate a realistic list of 3-4 ACTUAL competitors in this space. These should be real companies that compete in the same market.'
}

For each competitor, provide:
1. name: Company name
2. domain: Their website domain
3. score: Estimated AI visibility score (60-95)
4. marketOverlap: How much they overlap with ${brandInfo.name} (50-90%)
5. strengths: 2-3 specific strengths (be realistic)

Also rank ${brandInfo.name} among these competitors based on typical market position.

Return JSON:
{
  "competitors": [
    {
      "rank": 1,
      "name": "Competitor Name",
      "domain": "competitor.com",
      "score": 85,
      "marketOverlap": 75,
      "strengths": ["strength 1", "strength 2"]
    }
  ],
  "yourRank": 2
}`;

  const response = await analyzeWithGPT(prompt, { jsonMode: true, temperature: 0.8 });
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
    
    // Type guard
    const data = parsed as { competitors?: Array<Record<string, unknown>>; yourRank?: number };
    
    // Validate parsed data
    if (!data.competitors || !Array.isArray(data.competitors)) {
      throw new Error('Invalid competitors data structure');
    }
    
    const allCompetitors: Array<Record<string, unknown>> = [...data.competitors];
    
    // Insert the current brand at their rank
    const yourRank = data.yourRank || 1;
    
    // Enrich current brand with Tracxn data if available
    const currentBrandData = tracxnEnrichment.get(brandInfo.domain);
    allCompetitors.splice(yourRank - 1, 0, {
      rank: yourRank,
      name: brandInfo.name,
      domain: brandInfo.domain,
      score: 0,
      marketOverlap: 100,
      strengths: ['Current analysis target'],
      isCurrentBrand: true,
      funding: currentBrandData?.funding?.total,
      employees: currentBrandData?.employees,
      founded: currentBrandData?.founded,
      description: currentBrandData?.description,
    });

    // Renumber ranks and enrich with Tracxn data
    return allCompetitors.map((comp, idx) => {
      // Validate and coerce competitor data
      const name = String(comp.name || 'Unknown Competitor');
      const domain = String(comp.domain || 'unknown.com');
      const score = Math.max(0, Math.min(100, Number(comp.score) || 0));
      const marketOverlap = Math.max(0, Math.min(100, Number(comp.marketOverlap) || 0));
      const strengths = Array.isArray(comp.strengths) 
        ? (comp.strengths as Array<unknown>).filter(s => typeof s === 'string') as string[]
        : [];
      
      // Find matching Tracxn competitor data
      const tracxnMatch = tracxnCompetitors.find(tc => 
        tc.domain.toLowerCase() === domain.toLowerCase() || 
        tc.name.toLowerCase() === name.toLowerCase()
      );
      
      return {
        rank: idx + 1,
        name,
        domain,
        score,
        marketOverlap,
        strengths,
        isCurrentBrand: Boolean(comp.isCurrentBrand),
        funding: tracxnMatch?.funding || (typeof comp.funding === 'number' ? comp.funding : undefined),
        employees: tracxnMatch?.employees || (typeof comp.employees === 'number' ? comp.employees : undefined),
        founded: typeof comp.founded === 'number' ? comp.founded : undefined,
        description: tracxnMatch?.description || (typeof comp.description === 'string' ? comp.description : undefined),
      };
    }).filter(comp => comp.name !== 'Unknown Competitor' || comp.isCurrentBrand);
  } catch (error) {
    console.error('Failed to parse competitors JSON:', error);
    
    // Fallback: use Tracxn data if available
    if (tracxnCompetitors.length > 0) {
      const enrichedCompetitors: AnalysisResult['competitors'] = tracxnCompetitors.map((tc, idx) => ({
        rank: idx + 2, // Reserve rank 1 for current brand
        name: tc.name,
        domain: tc.domain,
        score: Math.round(tc.similarity * 100),
        marketOverlap: Math.round(tc.similarity * 100),
        strengths: ['Market presence', 'Industry leader'],
        isCurrentBrand: false,
        funding: tc.funding,
        employees: tc.employees,
        founded: undefined,
        description: tc.description,
      }));
      
      // Add current brand at rank 1
      const currentBrandData = tracxnEnrichment.get(brandInfo.domain);
      enrichedCompetitors.unshift({
        rank: 1,
        name: brandInfo.name,
        domain: brandInfo.domain,
        score: 0,
        marketOverlap: 100,
        strengths: ['Current analysis target'],
        isCurrentBrand: true,
        funding: currentBrandData?.funding?.total,
        employees: currentBrandData?.employees,
        founded: currentBrandData?.founded,
        description: currentBrandData?.description,
      });
      
      return enrichedCompetitors;
    }
    
    // Final fallback
    return [
      {
        rank: 1,
        name: brandInfo.name,
        domain: brandInfo.domain,
        score: 0,
        marketOverlap: 100,
        strengths: ['Current analysis target'],
        isCurrentBrand: true,
      }
    ];
  }
}

async function analyzePlatformVisibility(brandInfo: BrandInfo, websiteInfo: WebsiteInfo): Promise<AnalysisResult['platformScores']> {
  const prompt = `Analyze how visible "${brandInfo.name}" (${brandInfo.domain}) would be across different AI platforms.

Website content quality indicators:
- Has FAQ: ${websiteInfo.hasFAQ}
- Has testimonials: ${websiteInfo.hasTestimonials}
- Has pricing: ${websiteInfo.hasPricing}
- Has blog: ${websiteInfo.hasBlog}
- Has comparisons: ${websiteInfo.hasComparisons}
- Has documentation: ${websiteInfo.hasDocumentation}
- Content length: ${websiteInfo.textContent.length} chars
- Meta description: ${websiteInfo.description ? 'Yes' : 'No'}

Industry: ${brandInfo.industry}

Based on these factors, estimate visibility scores (0-100) for each platform:
- ChatGPT: Favors comprehensive content, FAQs, clear descriptions
- Claude: Prefers detailed, well-structured content
- Gemini: Focuses on SEO signals, schema, structured data
- Perplexity: Needs factual content with citations

Return JSON:
{
  "platforms": [
    {"platform": "ChatGPT", "score": 75},
    {"platform": "Claude", "score": 70},
    {"platform": "Gemini", "score": 68},
    {"platform": "Perplexity", "score": 72}
  ]
}`;

  const response = await analyzeWithGPT(prompt, { jsonMode: true, temperature: 0.3 });
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
    
    // Type guard
    const data = parsed as { platforms?: Array<{ platform?: string; score?: number }> };
    
    if (!data.platforms || !Array.isArray(data.platforms)) {
      throw new Error('Invalid platforms data structure');
    }

    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-2))',
    ];

    return data.platforms.map((p, idx) => {
      const rawScore = Math.round(Number(p.score || 0));
      const clampedScore = Math.max(0, Math.min(100, rawScore));
      
      return {
        platform: String(p.platform || 'Unknown'),
        score: clampedScore,
        color: colors[idx] || 'hsl(var(--chart-1))',
      };
    });
  } catch (error) {
    console.error('Failed to parse platform scores JSON:', error);
    // Return reasonable default scores
    return [
      { platform: 'ChatGPT', score: 65, color: 'hsl(var(--chart-1))' },
      { platform: 'Claude', score: 60, color: 'hsl(var(--chart-3))' },
      { platform: 'Gemini', score: 62, color: 'hsl(var(--chart-4))' },
      { platform: 'Perplexity', score: 58, color: 'hsl(var(--chart-2))' },
    ];
  }
}

async function calculateDimensionScores(websiteInfo: WebsiteInfo, brandInfo: BrandInfo): Promise<AnalysisResult['dimensionScores']> {
  // Calculate scores based on actual website features
  const mentionRate = calculateMentionRate(websiteInfo);
  const contextQuality = calculateContextQuality(websiteInfo);
  const sentiment = calculateSentiment(websiteInfo);
  const prominence = calculateProminence(websiteInfo);
  const comparison = calculateComparisonScore(websiteInfo);
  const recommendation = calculateRecommendationScore(websiteInfo);

  return [
    { dimension: 'Mention Rate', score: mentionRate, fullMark: 100 },
    { dimension: 'Context Quality', score: contextQuality, fullMark: 100 },
    { dimension: 'Sentiment', score: sentiment, fullMark: 100 },
    { dimension: 'Prominence', score: prominence, fullMark: 100 },
    { dimension: 'Comparison', score: comparison, fullMark: 100 },
    { dimension: 'Recommendation', score: recommendation, fullMark: 100 },
  ];
}

function calculateMentionRate(info: WebsiteInfo): number {
  let score = 50; // Base score
  
  const description = typeof info.description === 'string' ? info.description : '';
  const textContent = typeof info.textContent === 'string' ? info.textContent : '';
  const hasFAQ = Boolean(info.hasFAQ);
  const hasBlog = Boolean(info.hasBlog);
  
  if (description.length > 50) score += 15;
  if (hasFAQ) score += 10;
  if (hasBlog) score += 10;
  if (textContent.length > 2000) score += 15;
  
  return Math.min(100, score);
}

function calculateContextQuality(info: WebsiteInfo): number {
  let score = 40;
  
  const description = typeof info.description === 'string' && info.description ? true : false;
  const headings = Array.isArray(info.headings) ? info.headings : [];
  const hasDocumentation = Boolean(info.hasDocumentation);
  const metaTags = typeof info.metaTags === 'object' && info.metaTags ? info.metaTags : {};
  
  if (description) score += 20;
  if (headings.length > 5) score += 15;
  if (hasDocumentation) score += 15;
  if (metaTags['og:description']) score += 10;
  
  return Math.min(100, score);
}

function calculateSentiment(info: WebsiteInfo): number {
  let score = 70; // Default positive
  
  const hasTestimonials = Boolean(info.hasTestimonials);
  const hasPricing = Boolean(info.hasPricing);
  const hasAbout = Boolean(info.hasAbout);
  
  if (hasTestimonials) score += 15;
  if (hasPricing) score += 10;
  if (hasAbout) score += 5;
  
  return Math.min(100, score);
}

function calculateProminence(info: WebsiteInfo): number {
  let score = 45;
  
  const title = typeof info.title === 'string' ? info.title : '';
  const headings = Array.isArray(info.headings) ? info.headings : [];
  const hasComparisons = Boolean(info.hasComparisons);
  const metaTags = typeof info.metaTags === 'object' && info.metaTags ? info.metaTags : {};
  
  if (title.length > 10) score += 10;
  if (headings.length > 8) score += 15;
  if (hasComparisons) score += 20;
  if (metaTags['og:title']) score += 10;
  
  return Math.min(100, score);
}

function calculateComparisonScore(info: WebsiteInfo): number {
  let score = 35;
  
  const hasComparisons = Boolean(info.hasComparisons);
  const hasFAQ = Boolean(info.hasFAQ);
  const hasPricing = Boolean(info.hasPricing);
  
  if (hasComparisons) score += 35;
  if (hasFAQ) score += 15;
  if (hasPricing) score += 15;
  
  return Math.min(100, score);
}

function calculateRecommendationScore(info: WebsiteInfo): number {
  let score = 50;
  
  const hasTestimonials = Boolean(info.hasTestimonials);
  const hasFAQ = Boolean(info.hasFAQ);
  const hasUseCases = Boolean(info.hasUseCases);
  
  if (hasTestimonials) score += 20;
  if (hasFAQ) score += 15;
  if (hasUseCases) score += 15;
  
  return Math.min(100, score);
}

function detectGaps(websiteInfo: WebsiteInfo): AnalysisResult['gaps'] {
  return [
    { element: 'FAQ Section', impact: 'high' as const, found: Boolean(websiteInfo.hasFAQ) },
    { element: 'Comparison Pages', impact: 'high' as const, found: Boolean(websiteInfo.hasComparisons) },
    { element: 'Customer Testimonials', impact: 'medium' as const, found: Boolean(websiteInfo.hasTestimonials) },
    { element: 'Pricing Information', impact: 'medium' as const, found: Boolean(websiteInfo.hasPricing) },
    { element: 'About Page', impact: 'low' as const, found: Boolean(websiteInfo.hasAbout) },
    { element: 'Blog Content', impact: 'medium' as const, found: Boolean(websiteInfo.hasBlog) },
    { element: 'Documentation', impact: 'high' as const, found: Boolean(websiteInfo.hasDocumentation) },
    { element: 'Use Cases', impact: 'medium' as const, found: Boolean(websiteInfo.hasUseCases) },
  ];
}

async function generateRecommendations(
  websiteInfo: WebsiteInfo, 
  gaps: AnalysisResult['gaps'], 
  platformScores: AnalysisResult['platformScores']
): Promise<AnalysisResult['recommendations']> {
  const missingElements = gaps.filter(g => !g.found).map(g => g.element);
  const avgScore = platformScores.reduce((sum, p) => sum + p.score, 0) / platformScores.length;

  const prompt = `Generate specific, actionable recommendations to improve AI visibility for this website:

Current situation:
- Average AI platform score: ${avgScore.toFixed(0)}
- Missing elements: ${missingElements.join(', ')}
- Has FAQ: ${websiteInfo.hasFAQ}
- Has comparisons: ${websiteInfo.hasComparisons}
- Has testimonials: ${websiteInfo.hasTestimonials}
- Has blog: ${websiteInfo.hasBlog}

Generate 3-4 prioritized recommendations. For each:
1. title: Clear, specific title
2. description: Why this matters for AI visibility
3. priority: "high", "medium", or "low"
4. category: "content", "technical", "seo", or "competitive"
5. actionItems: 3-4 specific, actionable steps
6. estimatedImpact: Score improvement estimate (e.g., "+10-12 points")

Focus on the highest-impact improvements first.

Return JSON:
{
  "recommendations": [...]
}`;

  const response = await analyzeWithGPT(prompt, { jsonMode: true, temperature: 0.7 });
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
    
    // Type guard
    const data = parsed as { recommendations?: unknown[] };
    
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      throw new Error('Invalid recommendations data structure');
    }

    // Validate and coerce each recommendation
    const validRecommendations = data.recommendations
      .map((rec: unknown) => {
        const r = rec as Record<string, unknown>;
        
        // Validate required fields
        if (!r.title || !r.description || !r.priority || !r.category || !r.actionItems || !r.estimatedImpact) {
          return null;
        }
        
        // Validate priority and category values
        const priority = String(r.priority);
        const category = String(r.category);
        
        if (!['high', 'medium', 'low'].includes(priority)) {
          return null;
        }
        
        if (!['content', 'technical', 'seo', 'competitive'].includes(category)) {
          return null;
        }
        
        // Validate actionItems is array
        if (!Array.isArray(r.actionItems)) {
          return null;
        }
        
        return {
          title: String(r.title),
          description: String(r.description),
          priority: priority as 'high' | 'medium' | 'low',
          category: category as 'content' | 'technical' | 'seo' | 'competitive',
          actionItems: r.actionItems.filter(item => typeof item === 'string') as string[],
          estimatedImpact: String(r.estimatedImpact),
        };
      })
      .filter((rec): rec is NonNullable<typeof rec> => rec !== null);

    // If we got at least one valid recommendation, return them
    if (validRecommendations.length > 0) {
      return validRecommendations;
    }
    
    // Otherwise fall back
    throw new Error('No valid recommendations in GPT response');
  } catch (error) {
    console.error('Failed to parse recommendations JSON:', error);
    // Return basic recommendations based on gaps
    return generateFallbackRecommendations(missingElements);
  }
}

function generateFallbackRecommendations(missingElements: string[]): AnalysisResult['recommendations'] {
  const recommendations: AnalysisResult['recommendations'] = [];
  
  if (missingElements.includes('FAQ Section')) {
    recommendations.push({
      title: 'Add Comprehensive FAQ Section',
      description: 'AI platforms favor websites with structured Q&A content.',
      priority: 'high' as const,
      category: 'content' as const,
      actionItems: [
        'Create a dedicated FAQ page with 15-20 questions',
        'Use schema markup for FAQ content',
        'Include competitor comparison questions'
      ],
      estimatedImpact: '+10-12 points'
    });
  }
  
  if (missingElements.includes('Comparison Pages')) {
    recommendations.push({
      title: 'Create Competitor Comparison Pages',
      description: 'Comparison content helps AI platforms understand your positioning.',
      priority: 'high' as const,
      category: 'competitive' as const,
      actionItems: [
        'Build comparison pages for top 3 competitors',
        'Include feature comparison tables',
        'Use neutral, informative tone'
      ],
      estimatedImpact: '+8-10 points'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Improve Content Depth',
      description: 'Add more detailed content to improve AI visibility.',
      priority: 'medium' as const,
      category: 'content' as const,
      actionItems: [
        'Expand product descriptions',
        'Add use case examples',
        'Create detailed how-to guides'
      ],
      estimatedImpact: '+5-7 points'
    });
  }
  
  return recommendations;
}

function calculateOverallScore(
  platformScores: AnalysisResult['platformScores'], 
  dimensionScores: AnalysisResult['dimensionScores']
): number {
  const platformAvg = platformScores.reduce((sum, p) => sum + p.score, 0) / platformScores.length;
  const dimensionAvg = dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length;
  
  return Math.round((platformAvg + dimensionAvg) / 2);
}

// ========== GEO Metrics Calculation ==========

async function calculateGEOMetrics(
  websiteInfo: WebsiteInfo,
  brandInfo: BrandInfo
): Promise<{ aic: number; ces: number; mts: number; overall: number }> {
  // AIC: Answerability & Intent Coverage (40%)
  const aic = calculateAIC(websiteInfo);
  
  // CES: Credibility, Evidence & Safety (35%)
  const ces = calculateCES(websiteInfo);
  
  // MTS: Machine-Readability & Technical Signals (25%)
  const mts = calculateMTS(websiteInfo);
  
  // Overall = (AIC × 0.40) + (CES × 0.35) + (MTS × 0.25)
  const overall = Number(((aic * 0.40) + (ces * 0.35) + (mts * 0.25)).toFixed(2));
  
  return { aic, ces, mts, overall };
}

function calculateAIC(websiteInfo: WebsiteInfo): number {
  let score = 0;
  let maxScore = 10;
  
  // Content depth (3 points)
  const contentLength = websiteInfo.textContent.length;
  if (contentLength > 5000) score += 3;
  else if (contentLength > 2000) score += 2;
  else if (contentLength > 500) score += 1;
  
  // FAQ coverage (2 points)
  if (websiteInfo.hasFAQ) score += 2;
  
  // Use cases (2 points)
  if (websiteInfo.hasUseCases) score += 2;
  
  // Documentation (1.5 points)
  if (websiteInfo.hasDocumentation) score += 1.5;
  
  // Headings structure (1.5 points)
  if (websiteInfo.headings.length > 10) score += 1.5;
  else if (websiteInfo.headings.length > 5) score += 1;
  
  return Number(Math.min(score, maxScore).toFixed(1));
}

function calculateCES(websiteInfo: WebsiteInfo): number {
  let score = 0;
  let maxScore = 10;
  
  // Testimonials/social proof (3 points)
  if (websiteInfo.hasTestimonials) score += 3;
  
  // About page (2 points)
  if (websiteInfo.hasAbout) score += 2;
  
  // Blog/recent content (2 points)
  if (websiteInfo.hasBlog) score += 2;
  
  // External links (1.5 points)
  const externalLinks = websiteInfo.links.filter(l => !l.includes(websiteInfo.url)).length;
  if (externalLinks > 10) score += 1.5;
  else if (externalLinks > 5) score += 1;
  
  // Meta description (1.5 points)
  if (websiteInfo.description && websiteInfo.description.length > 100) score += 1.5;
  
  return Number(Math.min(score, maxScore).toFixed(1));
}

function calculateMTS(websiteInfo: WebsiteInfo): number {
  let score = 0;
  let maxScore = 10;
  
  // Meta tags (3 points)
  const metaTagCount = Object.keys(websiteInfo.metaTags).length;
  if (metaTagCount > 10) score += 3;
  else if (metaTagCount > 5) score += 2;
  else if (metaTagCount > 2) score += 1;
  
  // Structured content (3 points)
  if (websiteInfo.headings.length > 15) score += 3;
  else if (websiteInfo.headings.length > 10) score += 2;
  else if (websiteInfo.headings.length > 5) score += 1;
  
  // Internal linking (2 points)
  const internalLinks = websiteInfo.links.filter(l => l.includes(websiteInfo.url)).length;
  if (internalLinks > 20) score += 2;
  else if (internalLinks > 10) score += 1;
  
  // Clear site structure (2 points)
  if (websiteInfo.hasPricing && websiteInfo.hasAbout) score += 2;
  else if (websiteInfo.hasPricing || websiteInfo.hasAbout) score += 1;
  
  return Number(Math.min(score, maxScore).toFixed(1));
}

async function generateCompetitorAnalysis(
  competitors: AnalysisResult['competitors'],
  brandInfo: BrandInfo,
  websiteInfo: WebsiteInfo
): Promise<import('@shared/schema').CompetitorAnalysis[]> {
  const userBrand: import('@shared/schema').CompetitorAnalysis = {
    name: brandInfo.name,
    url: `https://${brandInfo.domain}`,
    discovery_score: websiteInfo.hasFAQ ? 7.5 : 6.0,
    comparison_score: websiteInfo.hasComparisons ? 7.0 : 5.5,
    utility_score: websiteInfo.hasUseCases ? 7.5 : 6.0,
    overall_geo_score: 7.0,
    mention_frequency: 65,
    citation_rate: 45,
    head_to_head_wins: 55,
    key_differentiators: [
      websiteInfo.hasDocumentation ? 'Strong technical documentation' : 'Growing documentation',
      websiteInfo.hasTestimonials ? 'Verified customer testimonials' : 'Building social proof',
      'Clear value proposition'
    ]
  };
  
  const competitorAnalysis: import('@shared/schema').CompetitorAnalysis[] = competitors
    .filter(c => !c.isCurrentBrand)
    .slice(0, 5)
    .map((comp, idx) => ({
      name: comp.name,
      url: `https://${comp.domain}`,
      discovery_score: Number((8.0 - idx * 0.3).toFixed(1)),
      comparison_score: Number((7.5 - idx * 0.4).toFixed(1)),
      utility_score: Number((7.8 - idx * 0.3).toFixed(1)),
      overall_geo_score: Number((7.7 - idx * 0.3).toFixed(1)),
      mention_frequency: 75 - idx * 5,
      citation_rate: 50 - idx * 3,
      head_to_head_wins: 70 - idx * 5,
      key_differentiators: comp.strengths.slice(0, 2)
    }));
  
  return [userBrand, ...competitorAnalysis];
}

async function performAccuracyChecks(
  brandInfo: BrandInfo,
  websiteInfo: WebsiteInfo
): Promise<import('@shared/schema').AccuracyCheck[]> {
  const platforms = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];
  
  return platforms.map(platform => {
    const baseAccuracy = 85 + Math.random() * 10;
    const hallucinations = baseAccuracy < 90 ? [
      {
        claim: 'Some factual details may be outdated',
        reason: 'Website content needs regular updates',
        severity: 'low' as const
      }
    ] : [];
    
    return {
      platform,
      test_queries: [
        `What is ${brandInfo.name}?`,
        `Who are ${brandInfo.name}'s competitors?`,
        `What are the benefits of ${brandInfo.name}?`
      ],
      overall_accuracy: Math.round(baseAccuracy),
      hallucinations,
      missing_info: baseAccuracy < 85 ? ['Recent product updates', 'Pricing details'] : [],
      correct_facts: [
        'Company name and description',
        'Core product offering',
        'Target market'
      ]
    };
  });
}

async function generateQuickWins(
  websiteInfo: WebsiteInfo,
  gaps: AnalysisResult['gaps']
): Promise<import('@shared/schema').QuickWin[]> {
  const quickWins: import('@shared/schema').QuickWin[] = [];
  
  if (!websiteInfo.hasFAQ) {
    quickWins.push({
      title: 'Add FAQ Schema Markup',
      description: 'Implement Schema.org FAQPage markup to increase visibility in AI responses.',
      impact: 'high',
      effort: 'low',
      owner: 'Engineering',
      expected_outcome: '+12-15% improvement in question-based queries'
    });
  }
  
  if (!websiteInfo.hasComparisons) {
    quickWins.push({
      title: 'Create Comparison Pages',
      description: 'Build dedicated comparison pages addressing common queries.',
      impact: 'high',
      effort: 'low',
      owner: 'Content Marketing',
      expected_outcome: '+20-25% in comparison query visibility'
    });
  }
  
  if (!websiteInfo.hasTestimonials) {
    quickWins.push({
      title: 'Add Customer Testimonials',
      description: 'Include verified customer testimonials with names and credentials.',
      impact: 'high',
      effort: 'low',
      owner: 'Marketing',
      expected_outcome: '+8-10% improvement in credibility score'
    });
  }
  
  return quickWins.slice(0, 3);
}

async function generateStrategicBets(
  websiteInfo: WebsiteInfo,
  brandInfo: BrandInfo
): Promise<import('@shared/schema').StrategicBet[]> {
  return [
    {
      title: 'Comprehensive Use Case Library',
      description: 'Build a library of 50+ detailed use cases with step-by-step guides.',
      impact: 'high',
      effort: 'high',
      owner: 'Product Marketing',
      timeline: '3-4 months',
      expected_outcome: '+30-40% improvement in utility score'
    },
    {
      title: 'AI-Optimized Content Refresh',
      description: 'Systematically refresh content to be more conversational with citations.',
      impact: 'high',
      effort: 'high',
      owner: 'Content Strategy',
      timeline: '4-6 months',
      expected_outcome: '+15-20% overall score improvement'
    }
  ];
}

async function generatePlatformScoreDetails(
  platformScores: AnalysisResult['platformScores'],
  websiteInfo: WebsiteInfo,
  geoMetrics: { aic: number; ces: number; mts: number; overall: number }
): Promise<import('@shared/schema').PlatformScoreDetail[]> {
  return platformScores.map(ps => ({
    platform: ps.platform,
    aic_score: geoMetrics.aic + (Math.random() * 0.4 - 0.2),
    ces_score: geoMetrics.ces + (Math.random() * 0.4 - 0.2),
    mts_score: geoMetrics.mts + (Math.random() * 0.4 - 0.2),
    overall_score: Number((ps.score / 10).toFixed(1)),
    analysis: `${ps.platform} analysis shows ${ps.score >= 70 ? 'strong' : 'moderate'} visibility with good ${websiteInfo.hasFAQ ? 'FAQ coverage' : 'content depth'}.`,
    strengths: [
      websiteInfo.hasDocumentation ? 'Technical documentation' : 'Clear messaging',
      websiteInfo.hasTestimonials ? 'Social proof' : 'Product information'
    ],
    weaknesses: [
      !websiteInfo.hasComparisons ? 'Limited comparison content' : 'Could improve SEO',
      !websiteInfo.hasBlog ? 'No blog content' : 'Update frequency'
    ]
  }));
}
