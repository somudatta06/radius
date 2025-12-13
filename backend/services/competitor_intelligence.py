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
        industry: str = "Technology",
        website_content: str = ""
    ) -> List[Dict]:
        """
        Identify 4-5 real DIRECT competitors based on company profile
        
        Args:
            company_name: Name of the company
            domain: Website domain
            description: Company description/title
            industry: Industry category
            website_content: Additional content from the website for context
            
        Returns:
            List of competitor dictionaries with name, domain, description
        """
        # Reinitialize client if needed (env might load after import)
        if not self.client:
            self.openai_key = os.getenv("OPENAI_API_KEY")
            if self.openai_key:
                self.client = OpenAI(api_key=self.openai_key)
                print(f"✅ OpenAI client initialized for competitor ID")
        
        if not self.client:
            print("⚠️  OpenAI not available - using fallback competitors")
            return self._fallback_competitors(company_name, industry)
        
        try:
            # Build enhanced prompt for GPT with better competitor identification
            system_prompt = """You are an expert market research analyst specializing in competitive intelligence.

Your task: Identify 5 REAL, DIRECT competitors for the given company.

CRITICAL RULES FOR ACCURATE COMPETITOR IDENTIFICATION:

1. DIRECT COMPETITORS FIRST:
   - Companies offering the SAME or very similar products/services
   - Companies targeting the EXACT same customer segment
   - Companies in the same price range and market positioning
   - Companies that customers would consider as alternatives

2. SPECIFICITY IS KEY:
   - For business schools: Find OTHER business schools with similar positioning (startup-focused, executive education, etc.)
   - For payment processors: Find OTHER payment processors
   - For SaaS: Find OTHER SaaS tools in the same category
   - NEVER suggest companies from different industries

3. GEOGRAPHIC & MARKET RELEVANCE:
   - If the company operates in a specific region (e.g., India), prioritize competitors in that region
   - Include both local leaders and relevant global players

4. MODERN & EMERGING PLAYERS:
   - Include newer, disruptive competitors - not just established giants
   - Identify companies with similar business models (e.g., if company has cohort-based learning, find others with cohort-based learning)

❌ AVOID:
- Generic industry leaders that aren't direct competitors
- Companies from different industries/categories
- Fictional or non-existent companies
- Overly broad comparisons (e.g., comparing a startup school to Harvard)

Return ONLY valid JSON:
{
  "competitors": [
    {
      "name": "Company Name",
      "domain": "example.com",
      "description": "Brief description of what they do",
      "reasoning": "Why they are a DIRECT competitor"
    }
  ]
}"""

            # Create a more detailed user prompt
            user_prompt = f"""Identify 5 real DIRECT competitors for this company:

COMPANY DETAILS:
- Name: {company_name}
- Domain: {domain}
- Description: {description}
- Industry: {industry}

{f'ADDITIONAL CONTEXT FROM WEBSITE:{chr(10)}{website_content[:1500]}' if website_content else ''}

IMPORTANT: Focus on finding companies that:
1. Offer IDENTICAL or very similar products/services
2. Target the SAME customer segment
3. Would be considered direct alternatives by customers
4. Have similar business models and positioning

For example:
- If this is a startup-focused business school in India, find OTHER startup-focused business schools (especially in India/Asia)
- If this is a payment gateway, find OTHER payment gateways
- If this is a project management tool, find OTHER project management tools

Return the 5 most relevant DIRECT competitors, ranked by how directly they compete."""

            response = self.client.chat.completions.create(
                model="gpt-4o",  # Use more capable model for better accuracy
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,  # Slight temperature for diversity while staying accurate
                max_tokens=1200,
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
            
            print(f"✅ Identified {len(competitors)} DIRECT competitors for {company_name}")
            for comp in competitors:
                print(f"   - {comp['name']}: {comp.get('reasoning', 'N/A')[:50]}...")
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
