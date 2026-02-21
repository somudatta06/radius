"""
Ad Intelligence Service
Extracts positioning keywords, ad strategy, competitor messaging, and strategic gaps
"""
import os
import json
from typing import Dict, Any
from openai import OpenAI


class AdIntelligenceService:
    """Generates advertising intelligence insights for a brand"""

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None

    async def analyze_ads(self, brand_name: str, category: str, website_data: dict) -> dict:
        """
        ONE gpt-4o-mini call.
        Returns ad strategy intelligence with keywords, messaging, competitor analysis.
        """
        if not self.client:
            return self._demo_data(brand_name)

        try:
            site_summary = str(website_data)[:800] if website_data else "No website data"

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{
                    "role": "user",
                    "content": f"""You are a digital advertising strategist for Indian D2C brands.

Brand: '{brand_name}'
Category: '{category}'
Website: {site_summary}

Analyze the brand's likely advertising positioning and generate intelligence.

Return ONLY valid JSON:
{{
  "spotlight_keywords": [
    {{"keyword": "string", "search_volume": "high/medium/low", "competition": "high/medium/low", "opportunity": "string"}},
    ...at least 6 keywords
  ],
  "messaging_breakdown": [
    {{"channel": "Google Ads", "strategy": "string", "estimated_cpc": "$X.XX", "effectiveness": 0-100}},
    {{"channel": "Instagram", "strategy": "string", "estimated_cpc": "$X.XX", "effectiveness": 0-100}},
    {{"channel": "YouTube", "strategy": "string", "estimated_cpc": "$X.XX", "effectiveness": 0-100}},
    {{"channel": "Reddit", "strategy": "string", "estimated_cpc": "$X.XX", "effectiveness": 0-100}}
  ],
  "competitor_strategies": [
    {{"competitor": "string", "positioning": "string", "ad_spend_estimate": "string", "key_message": "string"}},
    ...at least 3 competitors
  ],
  "strategic_gaps": [
    {{"gap": "string", "impact": "high/medium/low", "recommendation": "string"}},
    ...at least 3 gaps
  ],
  "budget_recommendation": {{
    "monthly_minimum": "string",
    "optimal_split": {{"search": 0-100, "social": 0-100, "display": 0-100, "video": 0-100}},
    "priority_channel": "string"
  }},
  "executive_summary": "2-3 sentence summary of ad intelligence findings"
}}"""
                }],
                max_tokens=1500,
                temperature=0.7
            )

            result = json.loads(response.choices[0].message.content)
            result["is_demo"] = False
            return result

        except Exception as e:
            print(f"Ad intelligence error: {e}")
            return self._demo_data(brand_name)

    def _demo_data(self, brand_name: str = "Brand"):
        return {
            "spotlight_keywords": [
                {"keyword": f"best {brand_name.lower()} products", "search_volume": "high", "competition": "medium", "opportunity": "Strong branded search — build authority pages"},
                {"keyword": f"{brand_name.lower()} vs competitors", "search_volume": "medium", "competition": "low", "opportunity": "Create comparison landing pages to capture decision-stage traffic"},
                {"keyword": f"{brand_name.lower()} reviews India", "search_volume": "high", "competition": "medium", "opportunity": "User-generated content strategy to dominate review searches"},
                {"keyword": "best D2C brands India", "search_volume": "high", "competition": "high", "opportunity": "Feature in listicle-style content and PR placements"},
                {"keyword": f"{brand_name.lower()} coupon code", "search_volume": "medium", "competition": "low", "opportunity": "Create exclusive offer pages to capture deal-seekers"},
                {"keyword": f"is {brand_name.lower()} worth it", "search_volume": "medium", "competition": "low", "opportunity": "Publish detailed value analysis content"}
            ],
            "messaging_breakdown": [
                {"channel": "Google Ads", "strategy": "Branded search + competitor targeting with USP callouts",
                 "estimated_cpc": "$0.45", "effectiveness": 78},
                {"channel": "Instagram", "strategy": "Influencer collab reels + UGC testimonial carousels",
                 "estimated_cpc": "$0.25", "effectiveness": 82},
                {"channel": "YouTube", "strategy": "Before/after transformation videos + expert reviews",
                 "estimated_cpc": "$0.12", "effectiveness": 71},
                {"channel": "Reddit", "strategy": "Native community engagement in r/IndianSkincareAddicts",
                 "estimated_cpc": "$0.35", "effectiveness": 65}
            ],
            "competitor_strategies": [
                {"competitor": "Minimalist", "positioning": "Science-backed, ingredient-first",
                 "ad_spend_estimate": "₹15-20L/month", "key_message": "Clinical-grade ingredients at honest prices"},
                {"competitor": "Dot & Key", "positioning": "Premium Aesthetic, Gen-Z appeal",
                 "ad_spend_estimate": "₹25-30L/month", "key_message": "Self-care is an experience, not a routine"},
                {"competitor": "Plum Goodness", "positioning": "Clean beauty, sustainability",
                 "ad_spend_estimate": "₹20-25L/month", "key_message": "Good for you, good for the planet"}
            ],
            "strategic_gaps": [
                {"gap": "No competitor comparison content", "impact": "high",
                 "recommendation": "Create honest comparison pages showing where you win and acknowledge where competitors excel — builds trust"},
                {"gap": "Missing video testimonials", "impact": "high",
                 "recommendation": "Collect 50+ video reviews from real customers and syndicate across YouTube, Instagram, and product pages"},
                {"gap": "Weak Reddit presence", "impact": "medium",
                 "recommendation": "Build authentic community presence — respond to mentions, share ingredient insights, never hard-sell"}
            ],
            "budget_recommendation": {
                "monthly_minimum": "₹5-8L for meaningful impact",
                "optimal_split": {"search": 35, "social": 40, "display": 10, "video": 15},
                "priority_channel": "Instagram Reels + Google Branded Search"
            },
            "executive_summary": f"{brand_name} has strong organic positioning but significant gaps in paid advertising strategy. Instagram Reels and Google branded search should be immediate priorities, with competitor comparison content as the highest-impact quick win. Current ad messaging lacks differentiation — the brand needs a clear, ownable positioning statement that separates it from the 50+ D2C competitors in this space.",
            "is_demo": True
        }
