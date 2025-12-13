"""
Competitor Controller
Handles competitor discovery and analysis requests
"""
from typing import Optional
from fastapi import HTTPException, Query
from services.tracxn import tracxn_service
from services.openai_analysis import openai_analysis_service
import logging

logger = logging.getLogger(__name__)

async def discover_competitors(
    query: str = Query(..., description="Search query or keyword"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results")
):
    """
    Discover competitors using Tracxn API
    
    Pipeline:
    1. Read keyword or category from query params
    2. Call Tracxn service
    3. Clean and normalize data
    4. Return JSON with success flag
    
    Args:
        query: Search keyword (e.g., "AI marketing")
        category: Optional category filter
        limit: Max results (1-50)
        
    Returns:
        {
            "success": true,
            "competitors": [...],
            "metadata": {...}
        }
    """
    try:
        # Step 1: Fetch competitors from Tracxn
        if category:
            logger.info(f"Discovering competitors by category: {category}")
            competitors = tracxn_service.discover_by_category(category, limit)
        else:
            logger.info(f"Searching competitors with query: {query}")
            competitors = tracxn_service.search_competitors(query, limit)
        
        # Step 2: Validate results
        if not competitors:
            return {
                "success": True,
                "competitors": [],
                "metadata": {
                    "query": query,
                    "category": category,
                    "count": 0,
                    "message": "No competitors found for the given criteria"
                }
            }
        
        # Step 3: Clean and normalize (already done in service)
        # Step 4: Return structured response
        return {
            "success": True,
            "competitors": competitors,
            "metadata": {
                "query": query,
                "category": category,
                "count": len(competitors),
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"Competitor discovery error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to discover competitors: {str(e)}"
        )

async def discover_and_analyze_competitors(
    query: str = Query(..., description="Search query or keyword"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    analyze: bool = Query(True, description="Include AI analysis")
):
    """
    Discover and analyze competitors with AI insights
    
    Combines Tracxn data with OpenAI analysis for strategic insights
    
    Returns:
        {
            "success": true,
            "competitors": [...],
            "analysis": {...},
            "metadata": {...}
        }
    """
    try:
        # Get competitor data
        competitor_data = await discover_competitors(query, category, limit)
        
        if not competitor_data["success"] or not competitor_data["competitors"]:
            return competitor_data
        
        # Add AI analysis if requested
        if analyze and competitor_data["competitors"]:
            analysis = openai_analysis_service.analyze_competitors(
                competitor_data["competitors"]
            )
            
            return {
                "success": True,
                "competitors": competitor_data["competitors"],
                "analysis": analysis,
                "metadata": competitor_data["metadata"]
            }
        
        return competitor_data
        
    except Exception as e:
        logger.error(f"Competitor analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze competitors: {str(e)}"
        )
