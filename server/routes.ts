import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeWebsite } from "./services/analyzer";
import { analysisResultSchema } from "@shared/schema";
import authRoutes from "./routes/auth";
import historyRoutes from "./routes/history";
import { optionalAuth, type AuthenticatedRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register auth routes
  app.use("/api/auth", authRoutes);
  app.use("/api/history", historyRoutes);
  
  // POST /api/generate-brief - Generate AI brief for analysis results
  app.post("/api/generate-brief", async (req, res) => {
    try {
      const { overallScore, platformScores, brandName, domain } = req.body;

      if (!overallScore || !platformScores || !brandName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create context for the brief
      const platformDetails = platformScores.map((p: any) => 
        `${p.platform}: ${p.score}/100`
      ).join(', ');

      const prompt = `You are an AI visibility expert. Generate a concise, professional brief (2-3 sentences) analyzing the following brand's AI platform performance:

Brand: ${brandName} (${domain || 'N/A'})
Overall Score: ${overallScore}/100
Platform Scores: ${platformDetails}

The brief should:
- Highlight the brand's overall performance level
- Identify the strongest and weakest platforms
- Provide a quick insight about what this means for the brand

Keep it professional, data-driven, and actionable. Focus on facts, not generic advice.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI visibility analysis expert providing clear, actionable insights." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const brief = completion.choices[0]?.message?.content || "Unable to generate brief at this time.";

      res.json({ brief });
    } catch (error) {
      console.error('Brief generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate brief',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/analyze - Analyze a website URL
  app.post("/api/analyze", optionalAuth, async (req, res) => {
    try {
      let { url } = req.body;
      const userId = (req as AuthenticatedRequest).userId;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Normalize URL: add https:// if no protocol is present
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
      }

      // Extract normalized URL for caching (remove protocol, trailing slash, www)
      const normalizedUrl = url
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/$/, '')
        .toLowerCase();

      // For authenticated users, check 24h cache
      if (userId) {
        const recentAnalysis = await storage.getRecentAnalysis(userId, normalizedUrl);
        if (recentAnalysis) {
          console.log('Returning cached analysis (< 24h) for user:', userId, normalizedUrl);
          return res.json(recentAnalysis);
        }
      }

      // Perform analysis
      console.log('Starting new analysis for:', url);
      const result = await analyzeWebsite(url);

      // Validate the result
      const validated = analysisResultSchema.parse(result);

      // Update competitor scores with the brand's score
      const brandCompetitor = validated.competitors.find(c => c.isCurrentBrand);
      if (brandCompetitor) {
        brandCompetitor.score = validated.overallScore;
      }

      // For authenticated users, save to domain history
      if (userId) {
        const historyEntry = await storage.saveDomainHistory({
          userId,
          domain: validated.brandInfo.domain || normalizedUrl,
          normalizedUrl,
          aiVisibilityScore: validated.overallScore,
          status: 'completed',
        });

        await storage.saveAnalysisResult({
          domainHistoryId: historyEntry.id,
          analysisData: validated,
        });

        console.log('Saved analysis to domain history for user:', userId);
      }

      res.json(validated);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze website',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
