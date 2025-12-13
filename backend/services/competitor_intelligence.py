"""
Competitor Intelligence Service
Uses GPT to identify real, relevant competitors based on company profile
"""
import os
from typing import Dict, List
from openai import OpenAI
import json

class CompetitorIntelligenceService:
    """
    Identifies real competitors using AI reasoning
    Based on company description, industry, and products
    """
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.openai_key) if self.openai_key else None
    
    def identify_competitors(
        self,
        company_name: str,
        domain: str,
        description: str,
        industry: str = "Technology"
    ) -> List[Dict]:
        """
        Identify 4-5 real competitors based on company profile
        
        Args:
            company_name: Name of the company
            domain: Website domain
            description: Company description/title
            industry: Industry category
            
        Returns:
            List of competitor dictionaries with name, domain, description
        """
        if not self.client:
            print("⚠️  OpenAI not available - using fallback competitors")
            return self._fallback_competitors(company_name, industry)
        
        try:
            # Build prompt for GPT
            system_prompt = """You are a market research analyst specializing in competitive intelligence.

Your task: Identify 4-5 REAL competitors for the given company.

CRITICAL RULES:
✅ Competitors MUST be real companies that actually exist
✅ Competitors MUST operate in the same industry/category
✅ Competitors MUST offer similar products/services
✅ Include a mix of direct competitors and adjacent players
❌ Do NOT invent fake companies
❌ Do NOT include companies from unrelated industries

Return ONLY valid JSON with this structure:
{
  "competitors": [
    {
      "name": "Company Name",
      "domain": "example.com",
      "description": "Brief description of what they do",
      "reasoning": "Why they are a competitor"
    }
  ]
}"""

            user_prompt = f"""Identify 4-5 real competitors for this company:

Company: {company_name}
Domain: {domain}
Description: {description}
Industry: {industry}

Identify competitors that:
1. Operate in the same space (direct competitors)
2. Target similar customers
3. Offer comparable products/services
4. Are well-known in the industry

Return competitors ranked by relevance (most relevant first)."""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0,  # Deterministic for consistency
                max_tokens=800,
                response_format={"type": "json_object"}
            )
            
            raw_response = response.choices[0].message.content
            print(f"🔍 GPT response length: {len(raw_response)} chars")
            
            result = json.loads(raw_response)
            competitors = result.get('competitors', [])
            
            # Validate we got reasonable data
            if len(competitors) < 3:
                print(f"⚠️  GPT returned {len(competitors)} competitors - using fallback")
                print(f"Response: {raw_response[:200]}")
                return self._fallback_competitors(company_name, industry)
            
            print(f"✅ Identified {len(competitors)} competitors for {company_name}")
            for comp in competitors:
                print(f"   - {comp['name']}")
            return competitors[:5]  # Limit to 5
        
        except Exception as e:
            print(f"❌ Competitor identification error: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._fallback_competitors(company_name, industry)
    
    def _fallback_competitors(self, company_name: str, industry: str) -> List[Dict]:
        """Fallback competitors when GPT unavailable"""
        # Generic tech competitors as fallback
        return [
            {
                "name": "Competitor A",
                "domain": "competitor-a.com",
                "description": f"Leading {industry} company",
                "reasoning": "Market leader in similar space"
            },
            {
                "name": "Competitor B",
                "domain": "competitor-b.com",
                "description": f"{industry} platform provider",
                "reasoning": "Offers similar products"
            },
            {
                "name": "Competitor C",
                "domain": "competitor-c.com",
                "description": f"{industry} solution",
                "reasoning": "Adjacent market player"
            },
            {
                "name": "Competitor D",
                "domain": "competitor-d.com",
                "description": f"{industry} service",
                "reasoning": "Emerging competitor"
            }
        ]

# Singleton
competitor_service = CompetitorIntelligenceService()
