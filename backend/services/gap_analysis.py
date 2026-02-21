"""
Gap Analysis Service
Analyzes perception gap between AI platforms and real consumer sentiment
"""
import os
import json
from typing import Dict, Any
from openai import OpenAI


class GapAnalysisService:
    """Analyzes perception gap between AI platforms and real consumer sentiment"""

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None

    async def analyze_gap(self, brand_name: str, category: str, ai_scores: dict, website_data: dict) -> dict:
        """
        Main analysis method.
        Makes ONE gpt-4o-mini call.
        Returns structured gap analysis with severity scoring.
        """
        if not self.client:
            return self._demo_data()

        try:
            scores_summary = json.dumps(ai_scores)[:500] if ai_scores else "No scores available"
            site_summary = str(website_data)[:800] if website_data else "No website data"

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{
                    "role": "user",
                    "content": f"""You are a brand perception analyst specializing in Indian D2C brands.

Brand: '{brand_name}'
Category: '{category}'
AI Platform Scores: {scores_summary}
Website Content: {site_summary}

Analyze the likely GAP between how AI platforms (ChatGPT, Claude, Gemini, Perplexity) describe this brand versus how real Indian consumers discuss it on Reddit (r/IndianSkincareAddicts, r/india, etc.), Twitter/X, and product review forums.

Consider common Indian D2C perception issues:
- Price perception gaps (AI says "premium", consumers say "overpriced for India")
- Ingredient/quality trust gaps
- Customer service perception
- Comparison with international alternatives
- Value-for-money debates

Return ONLY valid JSON:
{{
  "ai_perception": {{
    "quality": "one sentence on how AI describes quality",
    "value": "one sentence on how AI describes value",
    "trust": "one sentence on how AI describes trustworthiness",
    "innovation": "one sentence on how AI describes innovation"
  }},
  "social_perception": {{
    "quality": "one sentence on how consumers actually perceive quality",
    "value": "one sentence on how consumers actually perceive value",
    "trust": "one sentence on how consumers actually perceive trust",
    "innovation": "one sentence on how consumers actually perceive innovation"
  }},
  "gaps": [
    {{
      "dimension": "specific dimension name",
      "ai_says": "what AI platforms claim (one sentence)",
      "people_say": "what consumers actually say (one sentence)",
      "severity": "high or medium or low",
      "action": "one specific actionable fix"
    }}
  ],
  "gap_score": 0-100,
  "crisis_alerts": ["array of urgent items, empty if none"],
  "executive_summary": "2-3 sentence executive summary of the biggest perception gaps and what to do about them"
}}"""
                }],
                max_tokens=1200,
                temperature=0.7
            )

            result = json.loads(response.choices[0].message.content)
            result["is_demo"] = False
            return result

        except Exception as e:
            print(f"Gap analysis error: {e}")
            return self._demo_data()

    def _demo_data(self):
        return {
            "ai_perception": {
                "quality": "Premium quality brand with carefully sourced ingredients",
                "value": "Good value proposition for the quality offered",
                "trust": "Established and trusted brand in the market",
                "innovation": "Innovative approach to product formulation"
            },
            "social_perception": {
                "quality": "Decent products but nothing exceptional for the price point",
                "value": "Frequently criticized as overpriced compared to alternatives",
                "trust": "Mixed trust — some ingredient sourcing claims questioned",
                "innovation": "Seen as following trends rather than innovating"
            },
            "gaps": [
                {
                    "dimension": "Price vs Value",
                    "ai_says": "Premium pricing justified by quality ingredients and research",
                    "people_say": "Way too expensive — Minimalist and Deconstruct offer the same at half the price",
                    "severity": "high",
                    "action": "Create transparent cost breakdown page showing why your pricing is justified with ingredient sourcing details"
                },
                {
                    "dimension": "Ingredient Transparency",
                    "ai_says": "Clean, well-researched formulations with proven actives",
                    "people_say": "Marketing claims don't match ingredient lists — seen as greenwashing",
                    "severity": "high",
                    "action": "Publish detailed ingredient deck with percentages, sourcing origins, and third-party test certificates"
                },
                {
                    "dimension": "Customer Experience",
                    "ai_says": "Responsive customer support with easy returns",
                    "people_say": "Return process is a nightmare — takes 3-4 weeks for refund",
                    "severity": "medium",
                    "action": "Implement instant refund tracking page and reduce refund SLA to 7 days"
                },
                {
                    "dimension": "Brand Authenticity",
                    "ai_says": "Authentic Indian brand building for Indian consumers",
                    "people_say": "Feels like another VC-funded brand prioritizing growth over product",
                    "severity": "medium",
                    "action": "Share founder story, manufacturing process videos, and behind-the-scenes content"
                }
            ],
            "gap_score": 62,
            "crisis_alerts": [
                "AI platforms actively recommend this brand but Reddit sentiment is declining — address the price perception gap immediately before it affects AI recommendations"
            ],
            "executive_summary": "Significant perception gap exists between AI platform descriptions (premium, trusted, innovative) and consumer reality (overpriced, questionable transparency, poor returns experience). The brand scores well with AI due to strong SEO and content, but real consumer sentiment on Reddit and X tells a different story. Immediate action needed on pricing transparency and ingredient documentation.",
            "is_demo": True
        }
