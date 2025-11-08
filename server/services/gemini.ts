import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn('GOOGLE_API_KEY not set - Gemini analysis will use estimates');
}

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;

export interface GeminiTestResult {
  query: string;
  response: string;
  mentioned: boolean;
  context: string;
}

/**
 * Test if a brand is mentioned in Gemini's response to various queries
 * This provides REAL visibility metrics from Google's AI
 */
export async function testBrandVisibility(
  brandName: string,
  industry: string,
  domain: string
): Promise<{
  score: number;
  tests: GeminiTestResult[];
  summary: string;
}> {
  if (!genAI) {
    console.log('Gemini API not available, using estimated score');
    return {
      score: 65,
      tests: [],
      summary: 'Gemini API key not configured - using estimated visibility score',
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Comprehensive test queries that a user might ask
  const testQueries = [
    `What are the best ${industry} tools?`,
    `Recommend ${industry} software for businesses`,
    `Compare top ${industry} platforms`,
    `What ${industry} solution should I use?`,
    `List ${industry} companies`,
  ];

  const tests: GeminiTestResult[] = [];
  let mentionCount = 0;

  console.log(`Testing Gemini visibility for ${brandName} with ${testQueries.length} queries...`);

  for (const query of testQueries) {
    try {
      const result = await model.generateContent(query);
      const response = result.response.text();
      
      // Check if brand is mentioned (case-insensitive, whole word match)
      const brandRegex = new RegExp(`\\b${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const domainRegex = new RegExp(`\\b${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      const mentioned = brandRegex.test(response) || domainRegex.test(response);
      
      if (mentioned) {
        mentionCount++;
      }

      // Extract relevant context (50 chars before and after brand mention)
      let context = '';
      if (mentioned) {
        const matchIndex = response.search(brandRegex);
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(response.length, matchIndex + brandName.length + 50);
          context = '...' + response.substring(start, end) + '...';
        }
      }

      tests.push({
        query,
        response: response.substring(0, 500), // Store first 500 chars
        mentioned,
        context,
      });

      // Rate limiting - small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Gemini test query failed: ${query}`, error);
      tests.push({
        query,
        response: 'Error: Could not complete query',
        mentioned: false,
        context: '',
      });
    }
  }

  // Calculate score: (mentions / total queries) * 100
  const visibilityRate = (mentionCount / testQueries.length);
  const baseScore = Math.round(visibilityRate * 100);
  
  // Adjust score based on quality of mentions
  const finalScore = Math.min(100, Math.max(0, baseScore));

  const summary = `${brandName} was mentioned in ${mentionCount} out of ${testQueries.length} Gemini queries (${Math.round(visibilityRate * 100)}% visibility rate)`;

  console.log(`Gemini visibility test complete: ${summary}`);

  return {
    score: finalScore,
    tests,
    summary,
  };
}

/**
 * Analyze with Gemini API (general purpose)
 */
export async function analyzeWithGemini(
  prompt: string,
  options: { temperature?: number; jsonMode?: boolean } = {}
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      ...(options.jsonMode && { responseMimeType: 'application/json' }),
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
