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
