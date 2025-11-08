import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeWebsite } from "./services/analyzer";
import { analysisResultSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // POST /api/analyze - Analyze a website URL
  app.post("/api/analyze", async (req, res) => {
    try {
      let { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Normalize URL: add https:// if no protocol is present
      // This allows users to submit "example.com" instead of requiring "https://example.com"
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
      }

      // Check if we have a cached analysis
      const cached = await storage.getAnalysis(url);
      if (cached) {
        console.log('Returning cached analysis for:', url);
        return res.json(cached);
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

      // Save to storage
      await storage.saveAnalysis(validated);

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
