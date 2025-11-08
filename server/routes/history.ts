import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { analyzeWebsite } from '../services/analyzer';
import { analysisResultSchema } from '@shared/schema';

const router = Router();

// All history routes require authentication
router.use(requireAuth);

// GET /api/history - Get user's domain history
router.get('/', async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;

    let domains;
    if (search && search.length > 0) {
      domains = await storage.searchDomainHistory(userId, search);
    } else {
      domains = await storage.getUserDomainHistory(userId, limit, offset);
    }

    res.json({ domains });
  } catch (error) {
    console.error('Failed to fetch domain history:', error);
    res.status(500).json({ error: 'Failed to fetch domain history' });
  }
});

// GET /api/history/:historyId - Get analysis result for a specific history entry
router.get('/:historyId', async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId!;
    const { historyId } = req.params;

    // First verify the history entry belongs to this user
    const historyEntry = await storage.getHistoryEntry(historyId);
    if (!historyEntry) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (historyEntry.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analysis = await storage.getAnalysisResultByHistoryId(historyId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis data not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Failed to fetch analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// POST /api/history/reanalyze - Re-analyze a domain (with 24h cache check)
router.post('/reanalyze', async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId!;
    let { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Normalize URL
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }

    const normalizedUrl = url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/$/, '')
      .toLowerCase();

    // Check 24h cache
    const recentAnalysis = await storage.getRecentAnalysis(userId, normalizedUrl);
    if (recentAnalysis) {
      console.log('Returning cached analysis (< 24h) for reanalysis request:', normalizedUrl);
      return res.json({ 
        ...recentAnalysis,
        cached: true,
        message: 'Using recent analysis (less than 24 hours old)'
      });
    }

    // Perform new analysis
    console.log('Starting fresh analysis for:', url);
    const result = await analyzeWebsite(url);
    const validated = analysisResultSchema.parse(result);

    // Update competitor scores
    const brandCompetitor = validated.competitors.find(c => c.isCurrentBrand);
    if (brandCompetitor) {
      brandCompetitor.score = validated.overallScore;
    }

    // Save to domain history
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

    res.json({ 
      ...validated,
      cached: false 
    });
  } catch (error) {
    console.error('Reanalysis error:', error);
    res.status(500).json({ 
      error: 'Failed to re-analyze website',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
