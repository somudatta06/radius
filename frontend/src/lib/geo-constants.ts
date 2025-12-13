import { MetricDefinition, SubMetricDefinition, CompetitorDiscoveryStep, ConsumerQuestion, ComparisonDimension } from './geo-types';

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  AIC: {
    code: 'AIC',
    title: 'Answerability & Intent Coverage',
    description: 'Measures how well your content answers user queries and covers their intent in generative AI responses.',
    weight: 0.40,
    calculation_method: 'Average of 5 sub-scores (s1-s5), each rated 0-10. Final AIC score = (s1 + s2 + s3 + s4 + s5) / 5',
    scoring_anchors: [
      { range: '0-2', label: 'Critical', description: 'Missing core information, unable to answer basic queries' },
      { range: '2-4', label: 'Weak', description: 'Partial coverage with significant gaps' },
      { range: '4-6', label: 'Adequate', description: 'Covers basics but lacks depth' },
      { range: '6-8', label: 'Strong', description: 'Comprehensive coverage with good depth' },
      { range: '8-10', label: 'Outstanding', description: 'Industry-leading, exemplary coverage' }
    ],
    examples: [
      { score: 2, description: 'Homepage with no product details or FAQ' },
      { score: 5, description: 'Basic product page with some features listed' },
      { score: 8, description: 'Comprehensive guides, FAQs, and detailed use cases' }
    ]
  },
  CES: {
    code: 'CES',
    title: 'Credibility, Evidence & Safety',
    description: 'Evaluates trust signals, evidence quality, and safety markers that AI models prioritize.',
    weight: 0.35,
    calculation_method: 'Average of 5 sub-scores (s1-s5), each rated 0-10. Final CES score = (s1 + s2 + s3 + s4 + s5) / 5',
    scoring_anchors: [
      { range: '0-2', label: 'Critical', description: 'No credibility signals, anonymous content' },
      { range: '2-4', label: 'Weak', description: 'Minimal trust markers, generic content' },
      { range: '4-6', label: 'Adequate', description: 'Basic credibility with some evidence' },
      { range: '6-8', label: 'Strong', description: 'Well-evidenced with clear authorship' },
      { range: '8-10', label: 'Outstanding', description: 'Authority-level trust with extensive proof' }
    ],
    examples: [
      { score: 2, description: 'Anonymous blog with no sources' },
      { score: 5, description: 'Company site with basic team info' },
      { score: 8, description: 'Expert content with citations, credentials, and case studies' }
    ]
  },
  MTS: {
    code: 'MTS',
    title: 'Machine-Readability & Technical Signals',
    description: 'Assesses technical optimization for AI crawlers, structured data, and semantic clarity.',
    weight: 0.25,
    calculation_method: 'Average of 5 sub-scores (s1-s5), each rated 0-10. Final MTS score = (s1 + s2 + s3 + s4 + s5) / 5',
    scoring_anchors: [
      { range: '0-2', label: 'Critical', description: 'Technically broken, inaccessible to AI' },
      { range: '2-4', label: 'Weak', description: 'Poor optimization, limited machine-readability' },
      { range: '4-6', label: 'Adequate', description: 'Basic technical SEO implemented' },
      { range: '6-8', label: 'Strong', description: 'Well-optimized with structured data' },
      { range: '8-10', label: 'Outstanding', description: 'Cutting-edge implementation, AI-first' }
    ],
    examples: [
      { score: 2, description: 'Flash site with no semantic HTML' },
      { score: 5, description: 'Standard WordPress site with basic SEO plugin' },
      { score: 8, description: 'Schema.org markup, JSON-LD, perfect HTML5 semantics' }
    ]
  }
};

export const AIC_SUB_METRICS: Record<string, SubMetricDefinition> = {
  s1: {
    code: 'AIC_s1',
    name: 'Intent Coverage',
    description: 'Does your content address the full spectrum of user intents and search queries?',
    calculation: 'Analyzed across 50+ common user queries related to your industry. Scored based on % of intents covered.',
    importance: 'Critical - If you don\'t cover user intents, AI won\'t recommend you'
  },
  s2: {
    code: 'AIC_s2',
    name: 'Directness',
    description: 'How quickly does your content get to the answer users are looking for?',
    calculation: 'Measures answer position and clarity in first 200 words. Direct answers = higher score.',
    importance: 'High - AI prefers content that answers immediately'
  },
  s3: {
    code: 'AIC_s3',
    name: 'Completeness & Depth',
    description: 'Does your content provide comprehensive coverage with supporting details?',
    calculation: 'Evaluates topic breadth, supporting details, expertise signals, and answer completeness.',
    importance: 'High - Depth differentiates you from competitors'
  },
  s4: {
    code: 'AIC_s4',
    name: 'Consistency & Recency',
    description: 'Is your information up-to-date and consistent across different pages?',
    calculation: 'Checks publication dates, update timestamps, cross-page consistency, and conflicting info.',
    importance: 'Medium - Outdated content hurts trust'
  },
  s5: {
    code: 'AIC_s5',
    name: 'Conversational Readiness',
    description: 'How well-suited is your content for AI-driven conversations and voice queries?',
    calculation: 'Analyzes natural language quality, Q&A format, dialogue patterns, and conversational tone.',
    importance: 'Growing - Voice and chat are the future'
  }
};

export const CES_SUB_METRICS: Record<string, SubMetricDefinition> = {
  s1: {
    code: 'CES_s1',
    name: 'Evidence Density',
    description: 'How well do you back up claims with data, sources, and verifiable facts?',
    calculation: 'Counts citations, statistics, studies, and verifiable facts per 1000 words. More evidence = higher score.',
    importance: 'Critical - AI heavily weights cited content'
  },
  s2: {
    code: 'CES_s2',
    name: 'Author & Organization Transparency',
    description: 'Can users and AI verify who created this content and their credentials?',
    calculation: 'Checks for author bios, credentials, organization details, contact info, and about pages.',
    importance: 'High - Transparency = trust'
  },
  s3: {
    code: 'CES_s3',
    name: 'Experience & Originality',
    description: 'Does content demonstrate first-hand expertise and original insights?',
    calculation: 'Detects original research, case studies, unique data, and first-hand experience vs generic content.',
    importance: 'High - Google E-E-A-T applies to AI too'
  },
  s4: {
    code: 'CES_s4',
    name: 'Safety & Disclaimers',
    description: 'Are appropriate warnings, limitations, and disclaimers disclosed?',
    calculation: 'Identifies medical disclaimers, financial warnings, limitation statements, and safety notices.',
    importance: 'Critical for regulated industries'
  },
  s5: {
    code: 'CES_s5',
    name: 'Freshness & Revision History',
    description: 'Is content current and regularly updated with visible revision dates?',
    calculation: 'Analyzes publication date, last modified date, update frequency patterns, and changelog presence.',
    importance: 'Medium - Fresh content ranks better'
  }
};

export const MTS_SUB_METRICS: Record<string, SubMetricDefinition> = {
  s1: {
    code: 'MTS_s1',
    name: 'Structure & Semantics',
    description: 'How well is your HTML structured for machine understanding?',
    calculation: 'Evaluates heading hierarchy (H1-H6), semantic HTML5 tags, ARIA labels, and logical document structure.',
    importance: 'Critical - Foundation of machine-readability'
  },
  s2: {
    code: 'MTS_s2',
    name: 'Schema & Metadata',
    description: 'Do you use structured data markup (Schema.org, JSON-LD, Open Graph)?',
    calculation: 'Checks for Schema.org markup types, JSON-LD implementation, Open Graph tags, and Twitter Cards.',
    importance: 'High - Direct signal to AI systems'
  },
  s3: {
    code: 'MTS_s3',
    name: 'Entity Clarity',
    description: 'Are key entities (people, places, products, brands) clearly defined and marked up?',
    calculation: 'Detects entity markup, Wikipedia links, disambiguating descriptions, and entity relationships.',
    importance: 'High - Helps AI understand "what" you are'
  },
  s4: {
    code: 'MTS_s4',
    name: 'Crawlability & Coverage',
    description: 'Can AI models easily discover and access all your important content?',
    calculation: 'Analyzes robots.txt, XML sitemaps, internal linking structure, page depth, and crawl budget.',
    importance: 'Critical - Invisible content = 0 score'
  },
  s5: {
    code: 'MTS_s5',
    name: 'Reusability',
    description: 'Is your content easy for AI to extract, parse, and reuse?',
    calculation: 'Checks for clean HTML, API availability, RSS feeds, clear licensing, and download options.',
    importance: 'Medium - Makes content "AI-friendly"'
  }
};

export const COMPETITOR_DISCOVERY_STEPS: CompetitorDiscoveryStep[] = [
  {
    step: 1,
    title: 'Industry Keyword Extraction',
    description: 'We analyze your website content to extract 50-100 core industry keywords using NLP',
    method: 'NLP analysis + TF-IDF + manual verification',
    icon: '🔍',
    technical_details: 'Uses spaCy for entity extraction, OpenAI embeddings for semantic clustering, and TF-IDF for keyword importance scoring'
  },
  {
    step: 2,
    title: 'AI Response Mining',
    description: 'We query all 4 AI platforms with your keywords and track which brands appear in responses',
    method: 'Automated API queries across ChatGPT, Claude, Gemini, and Perplexity',
    icon: '🤖',
    technical_details: '300+ queries per analysis, capturing brand mentions, rankings, and citation frequency'
  },
  {
    step: 3,
    title: 'Semantic Similarity Analysis',
    description: 'Using embeddings, we find websites with similar content, products, and target audience',
    method: 'Vector similarity (cosine) using OpenAI embeddings',
    icon: '🧠',
    technical_details: 'Generates embeddings for your content and compares against 10M+ indexed websites. Threshold: >0.75 cosine similarity'
  },
  {
    step: 4,
    title: 'Citation Pattern Analysis',
    description: 'We track which brands are frequently cited alongside yours across all platforms',
    method: 'Co-occurrence matrix analysis',
    icon: '📊',
    technical_details: 'Builds co-citation graphs, identifies brands mentioned in similar contexts, calculates association strength'
  },
  {
    step: 5,
    title: 'Manual Verification',
    description: 'Our system verifies competitors are genuine alternatives and filters false positives',
    method: 'Business model matching + category validation',
    icon: '✓',
    technical_details: 'Checks for matching business models, validates category overlap, removes unrelated sites'
  }
];

export const CRITICAL_CONSUMER_QUESTIONS: ConsumerQuestion[] = [
  {
    category: 'Discovery',
    weight: 0.30,
    questions: [
      'What are the top [category] companies?',
      'Who are the leading [industry] providers in 2025?',
      'Best [product type] for [use case]?'
    ],
    metric: 'Brand Mention Frequency',
    why_it_matters: 'If your brand doesn\'t appear in discovery queries, you\'re invisible to potential customers'
  },
  {
    category: 'Comparison',
    weight: 0.35,
    questions: [
      '[Your Brand] vs [Competitor] - which is better?',
      'Compare [Product A] and [Product B]',
      '[Competitor] alternatives?'
    ],
    metric: 'Head-to-Head Win Rate',
    why_it_matters: 'Most purchase decisions involve comparing 2-3 options. You must win these comparisons.'
  },
  {
    category: 'Utility',
    weight: 0.35,
    questions: [
      'How to solve [problem] using [Product]?',
      '[Product] best practices',
      '[Product] implementation guide'
    ],
    metric: 'Solution Depth Score',
    why_it_matters: 'Users want actionable solutions. Helpful content builds trust and drives conversions.'
  }
];

export const COMPARISON_DIMENSIONS: Record<string, ComparisonDimension> = {
  discovery: {
    name: 'Discovery Score',
    weight: 0.30,
    description: 'How often your brand appears vs competitors in discovery queries',
    metrics: ['Mention frequency', 'Citation rate', 'Ranking position'],
    calculation_formula: '(Your_Mentions / Total_Mentions) × 10'
  },
  comparison: {
    name: 'Comparison Score',
    weight: 0.35,
    description: 'Win rate in head-to-head comparisons against competitors',
    metrics: ['Head-to-head wins', 'Feature completeness', 'Sentiment score'],
    calculation_formula: '(Wins / Total_Comparisons) × 10'
  },
  utility: {
    name: 'Utility Score',
    weight: 0.35,
    description: 'How helpful your content is for solving user problems',
    metrics: ['Solution depth', 'Actionability', 'Use case coverage'],
    calculation_formula: 'Average(Solution_Depth, Clarity, Coverage)'
  }
};
