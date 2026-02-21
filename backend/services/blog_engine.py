"""
Blog Engine Service
Generates SEO-optimized blog posts from social intelligence
"""
import os
import json
from typing import Dict, List, Any
from openai import OpenAI


class BlogEngineService:
    """Generates SEO blog content from social intelligence"""

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None

    async def generate_blog(self, topic: str, brand_name: str, keywords: list, social_data: dict) -> dict:
        """ONE GPT call to generate an SEO blog post"""
        if not self.client:
            return self._demo_data()

        try:
            kw_text = ", ".join(keywords[:8]) if keywords else topic
            social_summary = str(social_data)[:500] if social_data else "No social data"

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{
                    "role": "user",
                    "content": f"""You are an SEO content strategist for Indian D2C brands.

Brand: '{brand_name}'
Topic: '{topic}'
Target Keywords: {kw_text}
Social Intelligence: {social_summary}

Generate an SEO-optimized blog post that addresses real consumer concerns found in social discussions.

Return ONLY valid JSON:
{{
  "title": "SEO-optimized title (55-60 chars)",
  "meta_description": "Meta description (150-160 chars)",
  "slug": "url-friendly-slug",
  "estimated_word_count": number,
  "target_keywords": ["primary", "secondary1", "secondary2"],
  "outline": [
    {{"heading": "H2 heading", "key_points": ["point1", "point2"]}},
    ...at least 4 sections
  ],
  "introduction": "2-3 sentence introduction paragraph",
  "content_body": "Full blog post body (500+ words with H2/H3 markdown headings)",
  "seo_score": 0-100,
  "readability_score": 0-100
}}"""
                }],
                max_tokens=2000,
                temperature=0.7
            )
            result = json.loads(response.choices[0].message.content)
            result["is_demo"] = False
            return result
        except Exception as e:
            print(f"Blog engine error: {e}")
            return self._demo_data()

    def _demo_data(self):
        return {
            "title": "Is Your Skincare Routine Worth the Price? An Honest Breakdown",
            "meta_description": "Discover whether premium D2C skincare is worth the investment. Honest ingredient analysis, price comparisons, and expert recommendations for Indian consumers.",
            "slug": "skincare-routine-worth-price-honest-breakdown",
            "estimated_word_count": 1200,
            "target_keywords": ["skincare worth it", "D2C skincare India", "ingredient analysis"],
            "outline": [
                {"heading": "Why Indian Consumers Are Questioning D2C Pricing", "key_points": ["Rising costs", "International alternatives"]},
                {"heading": "What Actually Goes Into Your Products", "key_points": ["Ingredient sourcing", "Formulation costs", "Quality testing"]},
                {"heading": "Price Comparison: D2C vs International vs Pharmacy", "key_points": ["Cost per ml analysis", "Ingredient concentration comparison"]},
                {"heading": "How to Evaluate If a Product Is Worth It", "key_points": ["Ingredient checklist", "Red flags to watch for"]},
                {"heading": "Our Commitment to Transparency", "key_points": ["Full ingredient disclosure", "Third-party testing results"]}
            ],
            "introduction": "Indian consumers are becoming increasingly savvy about their skincare purchases. With dozens of D2C brands launching every month, the question on everyone's mind is: am I paying for the product or the packaging? Let's break it down honestly.",
            "content_body": "## Why Indian Consumers Are Questioning D2C Pricing\n\nThe Indian D2C skincare market has exploded, with over 200 brands competing for your attention. Reddit threads on r/IndianSkincareAddicts consistently question whether premium pricing is justified. The honest answer? It depends.\n\n## What Actually Goes Into Your Products\n\nIngredient sourcing accounts for 40-60% of a premium skincare product's cost. Clinical-grade Niacinamide from reputable suppliers costs 3-4x more than generic alternatives. The difference shows in stability, purity, and efficacy.\n\n## Price Comparison\n\n| Factor | D2C Premium | International | Pharmacy |\n|--------|------------|---------------|----------|\n| Cost/ml | ₹15-25 | ₹30-50 | ₹5-10 |\n| Active % | 5-10% | 5-15% | 1-3% |\n| Testing | In-house + 3rd party | Extensive | Basic |\n\n## How to Evaluate Worth\n\n1. Check active ingredient percentages\n2. Look for third-party test certificates\n3. Compare cost per active percentage, not just per ml\n4. Read verified purchase reviews, not sponsored content\n\n## Our Commitment\n\nWe publish our full ingredient deck with percentages, sourcing origins, and test certificates because transparency shouldn't be optional in 2024.",
            "seo_score": 82,
            "readability_score": 78,
            "is_demo": True
        }
