"""
OpenAI Analysis Service
AI-powered competitor scoring and strategic analysis
"""
import os
import json
from typing import List, Dict
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class OpenAIAnalysisService:
    """Service for AI-powered competitor analysis using OpenAI"""
    
    def __init__(self):
        self.api_key = OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4o-mini"  # Using GPT-4o mini for cost efficiency
    
    def analyze_competitors(self, competitors: List[Dict], user_company: Dict = None) -> Dict:
        """
        Analyze competitors using OpenAI for scoring and strategic insights
        
        Args:
            competitors: List of competitor data from Tracxn
            user_company: User's company data (optional)
            
        Returns:
            Analysis with scores, strengths, weaknesses, and strategy
        """
        # Use fallback if no API key or client
        if not self.client or not self.api_key:
            logger.warning("OpenAI API key not configured, using fallback analysis")
            return self._fallback_analysis(competitors)
        
        try:
            # Prepare competitor data for analysis
            competitors_summary = self._prepare_competitor_summary(competitors)
            
            # Build analysis prompt
            prompt = self._build_analysis_prompt(competitors_summary, user_company)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert business strategist and competitive analyst. Analyze competitors and provide actionable strategic insights in JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            analysis = json.loads(response.choices[0].message.content)
            
            return {
                "competitorScores": analysis.get("competitor_scores", []),
                "summary": analysis.get("summary", ""),
                "recommendedStrategy": analysis.get("recommended_strategy", ""),
                "marketInsights": analysis.get("market_insights", ""),
                "keyOpportunities": analysis.get("key_opportunities", [])
            }
            
        except Exception as e:
            logger.error(f"OpenAI analysis error: {str(e)}")
            return self._fallback_analysis(competitors)
    
    def _prepare_competitor_summary(self, competitors: List[Dict]) -> str:
        """Prepare competitor data for OpenAI prompt"""
        summaries = []
        for idx, comp in enumerate(competitors, 1):
            # Handle both dict and direct funding values
            funding_data = comp.get('funding', 0)
            if isinstance(funding_data, dict):
                funding_amount = funding_data.get('total', 0)
                funding_stage = funding_data.get('stage', 'Unknown')
            else:
                funding_amount = funding_data
                funding_stage = comp.get('stage', 'Unknown')
            
            summary = f"""
Competitor {idx}:
- Name: {comp.get('name', 'Unknown')}
- Website: {comp.get('website', 'N/A')}
- Category: {comp.get('category', 'Unknown')}
- Description: {comp.get('description', 'N/A')}
- Funding: ${funding_amount:,} ({funding_stage})
- Stage: {comp.get('stage', 'Unknown')}
- Employees: {comp.get('employeeSize', comp.get('employees', 'Unknown'))}
- Founded: {comp.get('foundedYear', comp.get('founded', 'Unknown'))}
"""
            summaries.append(summary)
        
        return "\n".join(summaries)
    
    def _build_analysis_prompt(self, competitors_summary: str, user_company: Dict = None) -> str:
        """Build the analysis prompt for OpenAI"""
        
        user_context = ""
        if user_company:
            user_context = f"""
User's Company Context:
- Name: {user_company.get('name', 'Unknown')}
- Industry: {user_company.get('industry', 'Unknown')}
- Description: {user_company.get('description', '')}
"""
        
        prompt = f"""
{user_context}

Analyze the following competitors and provide strategic insights:

{competitors_summary}

Provide your analysis in the following JSON format:
{{
  "competitor_scores": [
    {{
      "name": "Competitor Name",
      "score": 85,
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "positioning": "Market positioning description",
      "threatLevel": "high|medium|low",
      "keyMetrics": {{
        "fundingScore": 80,
        "marketPresence": 75,
        "innovation": 90
      }}
    }}
  ],
  "summary": "Overall competitive landscape summary (2-3 sentences)",
  "recommended_strategy": "Strategic recommendations (3-4 key points)",
  "market_insights": "Key market trends and opportunities",
  "key_opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"]
}}

Score each competitor 0-100 based on:
- Funding strength (30%)
- Market presence (25%)
- Innovation capability (25%)
- Growth stage (20%)

Assess threat level based on direct competition and market overlap.
"""
        return prompt
    
    def _fallback_analysis(self, competitors: List[Dict]) -> Dict:
        """Provide basic analysis if OpenAI fails"""
        competitor_scores = []
        
        for comp in competitors:
            # Handle both dict and direct funding values
            funding_data = comp.get('funding', 0)
            funding = funding_data.get('total', 0) if isinstance(funding_data, dict) else funding_data
            
            # Simple scoring based on available data
            funding_score = min(100, funding / 10000000 * 50)  # $10M = 50 points
            
            # Get stage from either funding dict or comp directly
            stage = comp.get('stage', 'unknown')
            if isinstance(stage, str):
                stage_score = {"seed": 40, "series_a": 60, "series a": 60, "series_b": 80, "series b": 80, 
                              "series_c": 90, "series c": 90, "series_g": 95, "series g": 95,
                              "ipo": 100, "acquired": 90}.get(stage.lower().replace(' ', '_'), 50)
            else:
                stage_score = 50
            
            overall_score = int((funding_score + stage_score) / 2)
            
            competitor_scores.append({
                "name": comp.get('name', 'Unknown'),
                "score": overall_score,
                "strengths": ["Well-funded", "Established presence"],
                "weaknesses": ["Limited data available"],
                "positioning": comp.get('description', 'No description available')[:100],
                "threatLevel": "medium"
            })
        
        return {
            "competitorScores": competitor_scores,
            "summary": "Analysis based on available funding and stage data.",
            "recommendedStrategy": "Focus on differentiation and unique value proposition.",
            "marketInsights": "Competitive landscape analysis limited due to data availability.",
            "keyOpportunities": ["Market differentiation", "Niche targeting", "Innovation focus"]
        }

# Singleton instance
openai_analysis_service = OpenAIAnalysisService()
