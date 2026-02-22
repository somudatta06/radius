"""
Search Intelligence Service
India-specific search query analysis with SGE prediction
"""
import os
import json
from typing import Dict, Any


class SearchIntelligenceService:
    """Analyzes search landscape and predicts SGE impact"""

    async def analyze_search(self, brand_name: str, category: str, website_data: dict) -> dict:
        """ONE GPT call for search intelligence"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("⚠️ OPENAI_API_KEY not set — SearchIntelligenceService returning demo data")
            return self._demo_data(brand_name)

        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        try:
            site_summary = str(website_data)[:600] if website_data else ""
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{
                    "role": "user",
                    "content": f"""You are a search intelligence analyst specializing in Indian market.

Brand: '{brand_name}'
Category: '{category}'
Website: {site_summary}

Analyze the search landscape for this brand in India, including Google SGE (Search Generative Experience) impact.

You MUST respond with ONLY valid JSON. No markdown, no explanation, no backticks.
{{
  "search_visibility_score": 0-100,
  "sge_readiness_score": 0-100,
  "query_coverage": [
    {{"query": "search query", "intent": "informational/transactional/navigational", "current_position": "1-10 or 'not ranking'", "sge_risk": "high/medium/low", "action": "string"}},
    ...at least 8 queries specific to {brand_name}
  ],
  "sge_impact": {{
    "queries_at_risk": number,
    "estimated_traffic_loss": "X%",
    "mitigation_strategy": "string"
  }},
  "missing_opportunities": [
    {{"query": "string", "monthly_volume": "string", "difficulty": "easy/medium/hard", "recommendation": "string"}},
    ...at least 4 opportunities
  ],
  "featured_snippet_opportunities": [
    {{"query": "string", "snippet_type": "paragraph/list/table", "action": "string"}}
  ],
  "executive_summary": "2-3 sentence summary specific to {brand_name}"
}}"""
                }],
                max_tokens=1500,
                temperature=0.7
            )
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw.rsplit("```", 1)[0]
            raw = raw.strip()
            result = json.loads(raw)
            result["is_demo"] = False
            print(f"✅ SearchIntelligenceService returned real data for {brand_name}")
            return result
        except json.JSONDecodeError as e:
            print(f"❌ SearchIntelligenceService JSON parse error: {e}")
            return self._demo_data(brand_name)
        except Exception as e:
            print(f"❌ SearchIntelligenceService error: {e}")
            return self._demo_data(brand_name)

    def _demo_data(self, brand_name: str = "Brand"):
        return {
            "search_visibility_score": 58,
            "sge_readiness_score": 42,
            "query_coverage": [
                {"query": f"best {brand_name.lower()} products", "intent": "transactional", "current_position": "3", "sge_risk": "high", "action": "Add structured data + FAQ schema"},
                {"query": f"{brand_name.lower()} review India", "intent": "informational", "current_position": "5", "sge_risk": "high", "action": "Create comprehensive review aggregation page"},
                {"query": f"{brand_name.lower()} vs Minimalist", "intent": "informational", "current_position": "not ranking", "sge_risk": "medium", "action": "Create honest comparison content"},
                {"query": f"is {brand_name.lower()} worth it", "intent": "informational", "current_position": "8", "sge_risk": "high", "action": "Publish value analysis with price breakdown"},
                {"query": f"{brand_name.lower()} ingredients list", "intent": "informational", "current_position": "4", "sge_risk": "medium", "action": "Add full ingredient transparency page"},
                {"query": "best D2C skincare India 2024", "intent": "informational", "current_position": "not ranking", "sge_risk": "high", "action": "Get featured in listicle content and PR"},
                {"query": f"{brand_name.lower()} coupon code", "intent": "transactional", "current_position": "2", "sge_risk": "low", "action": "Maintain offers page with schema markup"},
                {"query": "affordable skincare routine India", "intent": "informational", "current_position": "not ranking", "sge_risk": "medium", "action": "Create budget-friendly routine guide featuring your products"}
            ],
            "sge_impact": {
                "queries_at_risk": 5,
                "estimated_traffic_loss": "15-25%",
                "mitigation_strategy": "Implement comprehensive structured data, create authoritative long-form content, and build topical authority through content clusters"
            },
            "missing_opportunities": [
                {"query": "best niacinamide serum India", "monthly_volume": "18,000", "difficulty": "medium", "recommendation": "Create definitive guide with product comparison"},
                {"query": "skincare routine for Indian skin", "monthly_volume": "22,000", "difficulty": "easy", "recommendation": "Publish step-by-step routine guide with season-specific tips"},
                {"query": "D2C brands honest review", "monthly_volume": "8,500", "difficulty": "easy", "recommendation": "Create transparent self-review with pros and cons"},
                {"query": "affordable anti-aging India", "monthly_volume": "12,000", "difficulty": "hard", "recommendation": "Build topical authority cluster around anti-aging for Indian skin"}
            ],
            "featured_snippet_opportunities": [
                {"query": "how to use niacinamide serum", "snippet_type": "list", "action": "Create numbered step-by-step guide with clear formatting"},
                {"query": f"what is {brand_name.lower()}", "snippet_type": "paragraph", "action": "Add clear brand description in About page with structured data"},
                {"query": "best skincare ingredients for Indian skin", "snippet_type": "table", "action": "Create comparison table of ingredients with benefits and usage"}
            ],
            "executive_summary": f"{brand_name} has moderate search visibility (58/100) but poor SGE readiness (42/100). With Google's AI-powered search results threatening 15-25% traffic loss, immediate action is needed on structured data implementation and authoritative content creation. The brand is missing several high-volume keyword opportunities that competitors are capturing.",
            "is_demo": True
        }


search_intelligence_service = SearchIntelligenceService()
