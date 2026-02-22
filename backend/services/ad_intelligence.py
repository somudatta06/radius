"""
Ad Intelligence Service
Extracts brand keywords, ad strategy, competitor ad strategies, and messaging breakdown.
Uses gpt-4o-mini; falls back to demo data when no key is available.
"""
import os
import json
from typing import Dict, Any, List


_DEMO_DATA: Dict[str, Any] = {
    "keywords_extracted": [
        "AI visibility",
        "GEO optimization",
        "brand intelligence",
        "AI search",
        "D2C growth",
        "brand perception",
        "competitor analysis",
        "AI-driven insights",
        "search optimization",
        "brand monitoring",
    ],
    "ad_strategy": {
        "format": "Video + Carousel",
        "messaging_type": "Educational + Problem-aware",
        "spend_bracket": "$5,000–$15,000 / month",
        "top_hooks": [
            "Your brand is invisible to AI — here's what you're missing",
            "ChatGPT just recommended your competitor. Here's why.",
            "60% of Gen Z starts buying decisions on ChatGPT. Are you there?",
        ],
    },
    "competitor_strategies": [
        {
            "name": "Competitor A",
            "strategy": "Heavy discount-led performance ads on Meta, retargeting warm audiences",
            "strength": "High conversion rate",
            "weakness": "Low brand recall, price war dependency",
        },
        {
            "name": "Competitor B",
            "strategy": "Aspirational lifestyle UGC on Instagram + YouTube Shorts",
            "strength": "Strong brand affinity and organic reach",
            "weakness": "Slow to convert direct response",
        },
        {
            "name": "Competitor C",
            "strategy": "Feature-comparison ads targeting bottom-of-funnel search intent",
            "strength": "High intent capture",
            "weakness": "Expensive CPCs, limited scale",
        },
    ],
    "messaging_breakdown": {
        "discount": 15,
        "aspirational": 35,
        "ugc": 20,
        "comparison": 18,
        "feature": 12,
    },
    "strategic_gaps": [
        "No AI-era content addressing ChatGPT/Perplexity discoverability",
        "Missing social proof formats (UGC, case studies) in paid media mix",
        "Comparison pages not optimised for AI-generated answers",
    ],
    "recommendations": [
        "Launch 3 short-form UGC videos showing real customer outcomes — repurpose as paid ads",
        "Create an FAQ page targeting high-intent AI queries your brand should answer",
        "Build a comparison landing page (brand vs top 2 competitors) for bottom-funnel capture",
        "Run a trust-building campaign: certifications, testimonials, and results data",
    ],
}


class AdIntelligenceService:
    """
    Analyses brand ad strategy, keyword positioning, and competitor ad approaches.
    """

    def __init__(self) -> None:
        self.openai_key = os.getenv("OPENAI_API_KEY")

    async def analyze_ads(
        self,
        brand_name: str,
        category: str,
        competitors: List[Dict[str, Any]],
        website_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Makes ONE gpt-4o-mini call to extract ad intelligence.
        Falls back to demo data if the key is missing or the call fails.
        """
        self.openai_key = os.getenv("OPENAI_API_KEY")

        if not self.openai_key:
            print("⚠️  No OPENAI_API_KEY — returning demo ad intelligence")
            return self._demo(brand_name)

        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.openai_key)

            competitor_names = [c.get("name", "") for c in competitors[:3]]
            website_text = (
                f"Title: {website_data.get('title', brand_name)}. "
                f"Description: {website_data.get('description', '')}. "
                f"Headings: {', '.join(website_data.get('headings', [])[:8])}."
            )

            prompt = (
                f"Brand '{brand_name}' in category '{category}'. "
                f"Top competitors: {', '.join(competitor_names) or 'unknown'}. "
                f"Website: {website_text}. "
                f"Analyze ad intelligence. Return ONLY valid JSON, no markdown:\n"
                f'{{"keywords_extracted":["10 keywords from brand positioning"],'
                f'"ad_strategy":{{"format":"","messaging_type":"","spend_bracket":"","top_hooks":["hook1","hook2","hook3"]}},'
                f'"competitor_strategies":['
                f'{{"name":"","strategy":"","strength":"","weakness":""}}],'
                f'"messaging_breakdown":{{"discount":0,"aspirational":0,"ugc":0,"comparison":0,"feature":0}},'
                f'"strategic_gaps":["gap1","gap2","gap3"],'
                f'"recommendations":["rec1","rec2","rec3","rec4"]}}'
            )

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=1000,
            )

            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            result: Dict[str, Any] = json.loads(raw)
            return result

        except Exception as e:
            print(f"⚠️  Ad intelligence error: {e} — returning demo data")
            return self._demo(brand_name)

    def _demo(self, brand_name: str) -> Dict[str, Any]:
        return dict(_DEMO_DATA)


ad_intelligence_service = AdIntelligenceService()
