import { ReportData, CompetitorAnalysis, PlatformScore, AccuracyCheck, QuickWin, StrategicBet } from './geo-types';

export function generateMockGEOData(websiteUrl: string): ReportData {
  const domain = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  const userBrand: CompetitorAnalysis = {
    name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
    url: websiteUrl,
    discovery_score: 7.2,
    comparison_score: 6.8,
    utility_score: 7.5,
    overall_geo_score: 7.1,
    mention_frequency: 65,
    citation_rate: 42,
    head_to_head_wins: 58,
    key_differentiators: [
      'Strong content depth and technical documentation',
      'High credibility signals with verified authors',
      'Good structured data implementation'
    ]
  };

  const competitors: CompetitorAnalysis[] = [
    {
      name: 'Competitor A',
      url: 'https://competitor-a.com',
      discovery_score: 8.1,
      comparison_score: 7.5,
      utility_score: 7.8,
      overall_geo_score: 7.8,
      mention_frequency: 78,
      citation_rate: 56,
      head_to_head_wins: 72,
      key_differentiators: [
        'Market leader with extensive brand recognition',
        'Comprehensive FAQ and support documentation'
      ]
    },
    {
      name: 'Competitor B',
      url: 'https://competitor-b.com',
      discovery_score: 6.5,
      comparison_score: 6.2,
      utility_score: 6.8,
      overall_geo_score: 6.5,
      mention_frequency: 52,
      citation_rate: 38,
      head_to_head_wins: 45,
      key_differentiators: [
        'Strong utility content with implementation guides',
        'Active blog with recent updates'
      ]
    },
    {
      name: 'Competitor C',
      url: 'https://competitor-c.com',
      discovery_score: 5.8,
      comparison_score: 6.0,
      utility_score: 6.2,
      overall_geo_score: 6.0,
      mention_frequency: 45,
      citation_rate: 32,
      head_to_head_wins: 38,
      key_differentiators: [
        'Niche focus with specialized content'
      ]
    }
  ];

  const platforms: PlatformScore[] = [
    {
      platform: 'ChatGPT',
      aic_score: 7.5,
      ces_score: 7.0,
      mts_score: 6.8,
      overall_score: 7.1,
      analysis: 'Strong performance with good content answerability. Recommended in 68% of relevant queries.',
      strengths: ['Comprehensive FAQ coverage', 'Clear product descriptions', 'Strong use case documentation'],
      weaknesses: ['Limited comparison content', 'Missing pricing details in some sections']
    },
    {
      platform: 'Claude',
      aic_score: 7.2,
      ces_score: 7.5,
      mts_score: 7.0,
      overall_score: 7.2,
      analysis: 'Excellent credibility signals detected. Citations and evidence well-structured.',
      strengths: ['High evidence density', 'Clear authorship', 'Regular content updates'],
      weaknesses: ['Some intents not fully covered', 'Conversational readiness could improve']
    },
    {
      platform: 'Gemini',
      aic_score: 6.8,
      ces_score: 6.5,
      mts_score: 7.2,
      overall_score: 6.8,
      analysis: 'Good technical implementation with strong structured data. Some gaps in content depth.',
      strengths: ['Excellent Schema.org markup', 'Clear entity definitions', 'Good crawlability'],
      weaknesses: ['Limited testimonials', 'Weak safety disclaimers']
    },
    {
      platform: 'Perplexity',
      aic_score: 7.0,
      ces_score: 6.8,
      mts_score: 6.5,
      overall_score: 6.8,
      analysis: 'Balanced performance across all factors. Well-cited in academic and professional contexts.',
      strengths: ['Cited frequently in professional queries', 'Good evidence backing'],
      weaknesses: ['Could improve machine-readability', 'Missing some comparison content']
    }
  ];

  const accuracyChecks: AccuracyCheck[] = [
    {
      platform: 'ChatGPT',
      test_queries: [],
      overall_accuracy: 95,
      hallucinations: [
        {
          claim: 'Founded in 2015',
          reason: 'Actual founding year is 2017',
          severity: 'low'
        }
      ],
      missing_info: [],
      correct_facts: [
        'Core product offering',
        'Target market',
        'Key features',
        'Pricing model'
      ]
    },
    {
      platform: 'Claude',
      test_queries: [],
      overall_accuracy: 98,
      hallucinations: [],
      missing_info: ['Recent product launches'],
      correct_facts: [
        'Company description',
        'Competitors',
        'Use cases',
        'Customer segments',
        'Pricing'
      ]
    },
    {
      platform: 'Gemini',
      test_queries: [],
      overall_accuracy: 82,
      hallucinations: [
        {
          claim: 'Has 500+ employees',
          reason: 'Actual employee count is ~200',
          severity: 'medium'
        },
        {
          claim: 'Available in 50 countries',
          reason: 'Currently available in 25 countries',
          severity: 'medium'
        }
      ],
      missing_info: ['Customer testimonials', 'Recent awards'],
      correct_facts: [
        'Product features',
        'Company location'
      ]
    },
    {
      platform: 'Perplexity',
      test_queries: [],
      overall_accuracy: 88,
      hallucinations: [
        {
          claim: 'Raised $100M in Series C',
          reason: 'Raised $50M in Series B, no Series C yet',
          severity: 'high'
        }
      ],
      missing_info: ['Team background'],
      correct_facts: [
        'Product description',
        'Market positioning',
        'Key benefits'
      ]
    }
  ];

  const quickWins: QuickWin[] = [
    {
      title: 'Add FAQ Schema Markup',
      description: 'Implement Schema.org FAQPage markup on your FAQ pages to increase visibility in AI responses. This is a quick win that significantly improves discoverability.',
      impact: 'high',
      effort: 'low',
      owner: 'Engineering',
      expected_outcome: '+12-15% improvement in question-based queries'
    },
    {
      title: 'Create Comparison Pages',
      description: 'Build dedicated "[Your Brand] vs [Competitor]" pages addressing common comparison queries. This directly improves head-to-head win rate.',
      impact: 'high',
      effort: 'low',
      owner: 'Content Marketing',
      expected_outcome: '+20-25% in comparison query visibility'
    },
    {
      title: 'Add Author Bylines',
      description: 'Add author names, credentials, and bios to all blog posts and guides. This significantly improves credibility signals.',
      impact: 'high',
      effort: 'low',
      owner: 'Content Team',
      expected_outcome: '+8-10% improvement in CES score'
    }
  ];

  const strategicBets: StrategicBet[] = [
    {
      title: 'Comprehensive Use Case Library',
      description: 'Build a library of 50+ detailed use cases with step-by-step implementation guides. This positions you as the go-to resource for utility queries.',
      impact: 'high',
      effort: 'high',
      owner: 'Product Marketing',
      timeline: '3-4 months',
      expected_outcome: '+30-40% improvement in utility score'
    },
    {
      title: 'AI-Optimized Content Refresh',
      description: 'Systematically refresh all existing content to be more conversational, add evidence citations, and optimize for voice/chat interfaces.',
      impact: 'high',
      effort: 'high',
      owner: 'Content Strategy',
      timeline: '4-6 months',
      expected_outcome: '+15-20% overall score improvement'
    }
  ];

  return {
    websiteUrl,
    domain,
    generatedAt: new Date(),
    overallScore: 7.1,
    aic: 7.2,
    ces: 6.9,
    mts: 6.9,
    executiveSummary: `Your brand demonstrates strong AI visibility with a GEO score of 7.1/10, ranking above 60% of competitors. You excel in content depth (AIC: 7.2) and have solid credibility signals (CES: 6.9). Key opportunities include improving comparison content, adding more evidence citations, and optimizing for conversational AI interfaces. With the recommended quick wins, you could reach a score of 7.8+ within 60 days.`,
    platforms,
    competitors: [userBrand, ...competitors],
    quickWins,
    strategicBets,
    accuracyChecks
  };
}
