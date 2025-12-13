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

CRITICAL REQUIREMENTS FOR COMPETITOR SELECTION:

1. DIRECT COMPETITORS ONLY - Companies that customers would directly compare and choose between
2. SIMILAR BUSINESS MODEL - Same type of product/service delivery
3. SAME TARGET MARKET - Companies targeting the exact same customer segment
4. SIMILAR POSITIONING - Companies with similar market positioning (premium/budget, modern/traditional, etc.)

PRIORITIZATION (in order of importance):
a) Newer/modern competitors with VERY similar positioning (HIGHEST PRIORITY)
b) Direct alternatives customers actively compare
c) Companies in the same specific niche
d) Regional competitors in the same market

For business schools example:
- If this is a MODERN, STARTUP-FOCUSED school → find OTHER modern startup schools (like Masters Union, not traditional IIMs)
- If this is a traditional MBA program → find other traditional MBA programs

For tech companies:
- If this is a specific SaaS tool → find OTHER tools in exact same category
- If this is a payment processor → find OTHER payment processors

DO NOT include:
- Companies that are only tangentially related
- Generic industry leaders that aren't true alternatives
- Companies with different business models

Return 5 competitors ranked by how DIRECTLY they compete (most similar first)."""

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
        """Fallback competitors when GPT unavailable - uses industry-specific defaults"""
        # Try to provide industry-relevant fallbacks instead of generic names
        industry_lower = industry.lower()
        
        # Industry-specific fallback competitors
        if 'fintech' in industry_lower or 'finance' in industry_lower or 'trading' in industry_lower or 'investment' in industry_lower:
            return [
                {"name": "Groww", "domain": "groww.in", "description": "Investment platform", "reasoning": "Similar financial services"},
                {"name": "Upstox", "domain": "upstox.com", "description": "Trading platform", "reasoning": "Similar trading services"},
                {"name": "5Paisa", "domain": "5paisa.com", "description": "Discount broker", "reasoning": "Similar brokerage services"},
                {"name": "Angel One", "domain": "angelone.in", "description": "Full-service broker", "reasoning": "Similar investment services"},
            ]
        elif 'education' in industry_lower or 'business school' in industry_lower or 'learning' in industry_lower:
            return [
                {"name": "Coursera", "domain": "coursera.org", "description": "Online learning platform", "reasoning": "Similar education services"},
                {"name": "Udemy", "domain": "udemy.com", "description": "Online courses", "reasoning": "Similar learning platform"},
                {"name": "LinkedIn Learning", "domain": "linkedin.com/learning", "description": "Professional development", "reasoning": "Similar professional education"},
                {"name": "edX", "domain": "edx.org", "description": "Online education", "reasoning": "Similar course platform"},
            ]
        elif 'ecommerce' in industry_lower or 'retail' in industry_lower or 'shopping' in industry_lower:
            return [
                {"name": "Amazon", "domain": "amazon.com", "description": "E-commerce platform", "reasoning": "Similar retail services"},
                {"name": "Flipkart", "domain": "flipkart.com", "description": "Online shopping", "reasoning": "Similar e-commerce platform"},
                {"name": "Myntra", "domain": "myntra.com", "description": "Fashion retail", "reasoning": "Similar online retail"},
                {"name": "Shopify", "domain": "shopify.com", "description": "E-commerce solutions", "reasoning": "Similar commerce platform"},
            ]
        elif 'saas' in industry_lower or 'software' in industry_lower or 'tech' in industry_lower:
            return [
                {"name": "Salesforce", "domain": "salesforce.com", "description": "CRM software", "reasoning": "Leading SaaS provider"},
                {"name": "HubSpot", "domain": "hubspot.com", "description": "Marketing software", "reasoning": "Similar software services"},
                {"name": "Slack", "domain": "slack.com", "description": "Communication platform", "reasoning": "Similar tech product"},
                {"name": "Notion", "domain": "notion.so", "description": "Productivity software", "reasoning": "Similar software tool"},
            ]
        else:
            # Generic fallbacks with more professional names
            return [
                {"name": f"Top {industry} Provider 1", "domain": "competitor1.com", "description": f"Leading {industry} company", "reasoning": "Market leader"},
                {"name": f"Top {industry} Provider 2", "domain": "competitor2.com", "description": f"{industry} solution provider", "reasoning": "Major player"},
                {"name": f"Top {industry} Provider 3", "domain": "competitor3.com", "description": f"{industry} platform", "reasoning": "Established competitor"},
                {"name": f"Emerging {industry} Company", "domain": "competitor4.com", "description": f"Growing {industry} service", "reasoning": "Rising competitor"},
            ]

# Singleton
competitor_service = CompetitorIntelligenceService()
