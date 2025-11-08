import { analyzeWithGPT } from './openai';
import { scrapeWebsite, type WebsiteInfo } from './scraper';
import { tracxnService } from './tracxn';
import { testBrandVisibility as testGeminiVisibility } from './gemini';
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

  console.log(`Analysis complete! Overall score: ${overallScore}`);

  return {
    url,
    brandInfo,
    overallScore,
    platformScores,
    dimensionScores,
    competitors,
    gaps,
    recommendations,
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
  console.log('Analyzing platform visibility with real Gemini testing...');
  
  // REAL Gemini testing - actually queries Google's AI to check brand mentions
  let geminiScore = 62; // Default fallback
  let geminiTestResults: any = null;
  
  try {
    console.log(`Testing real Gemini visibility for ${brandInfo.name}...`);
    geminiTestResults = await testGeminiVisibility(
      brandInfo.name,
      brandInfo.industry,
      brandInfo.domain
    );
    geminiScore = geminiTestResults.score;
    console.log(`Real Gemini score: ${geminiScore} - ${geminiTestResults.summary}`);
  } catch (error) {
    console.error('Gemini real testing failed, using estimates:', error);
  }

  // For other platforms, use GPT to estimate based on content quality
  // (We could add real testing for these too if we have their APIs)
  const prompt = `Analyze how visible "${brandInfo.name}" (${brandInfo.domain}) would be across AI platforms ChatGPT, Claude, and Perplexity.

Website content quality indicators:
- Has FAQ: ${websiteInfo.hasFAQ}
- Has testimonials: ${websiteInfo.hasTestimonials}
- Has pricing: ${websiteInfo.hasPricing}
- Has blog: ${websiteInfo.hasBlog}
- Has comparisons: ${websiteInfo.hasComparisons}
- Has documentation: ${websiteInfo.hasDocumentation}
- Has use cases: ${websiteInfo.hasUseCases}
- Content length: ${websiteInfo.textContent.length} chars
- Meta description: ${websiteInfo.description ? 'Yes' : 'No'}
- Headings count: ${websiteInfo.headings.length}

Industry: ${brandInfo.industry}
Description: ${brandInfo.description}

Based on these factors, estimate visibility scores (0-100) for:
- ChatGPT: Favors comprehensive content, FAQs, clear descriptions, detailed explanations
- Claude: Prefers detailed, well-structured content, thoughtful analysis, thorough documentation
- Perplexity: Needs factual content with citations, structured data, authoritative sources

NOTE: Be thorough in your analysis. Consider:
1. Content depth and quality
2. Structured information (FAQs, pricing, docs)
3. Authority signals (testimonials, use cases)
4. SEO and discoverability factors

Return JSON with realistic scores based on actual content quality:
{
  "platforms": [
    {"platform": "ChatGPT", "score": XX},
    {"platform": "Claude", "score": XX},
    {"platform": "Perplexity", "score": XX}
  ]
}`;

  const response = await analyzeWithGPT(prompt, { jsonMode: true, temperature: 0.2 });
  
  let estimatedPlatforms: Array<{ platform: string; score: number }> = [];
  
  try {
    const parsed = JSON.parse(response) as { platforms?: Array<{ platform?: string; score?: number }> };
    
    if (parsed.platforms && Array.isArray(parsed.platforms)) {
      estimatedPlatforms = parsed.platforms
        .map(p => ({
          platform: String(p.platform || 'Unknown'),
          score: Math.max(0, Math.min(100, Math.round(Number(p.score || 0)))),
        }))
        .filter(p => p.platform !== 'Gemini'); // Filter out Gemini since we have real data
    }
  } catch (error) {
    console.error('Failed to parse estimated platform scores:', error);
    // Fallback estimates
    estimatedPlatforms = [
      { platform: 'ChatGPT', score: 65 },
      { platform: 'Claude', score: 60 },
      { platform: 'Perplexity', score: 58 },
    ];
  }

  // Combine real Gemini score with estimated scores for other platforms
  const allPlatforms = [
    ...estimatedPlatforms,
    { platform: 'Gemini', score: geminiScore }, // REAL score from actual Gemini testing
  ];

  // Sort by platform name for consistent ordering
  const sortedPlatforms = allPlatforms.sort((a, b) => {
    const order = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];
    return order.indexOf(a.platform) - order.indexOf(b.platform);
  });

  const colors = [
    'hsl(var(--chart-1))', // ChatGPT
    'hsl(var(--chart-3))', // Claude
    'hsl(var(--chart-4))', // Gemini
    'hsl(var(--chart-2))', // Perplexity
  ];

  return sortedPlatforms.map((p, idx) => ({
    platform: p.platform,
    score: p.score,
    color: colors[idx] || 'hsl(var(--chart-1))',
  }));
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
