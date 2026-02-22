"""
Social Scraper Service
Generates social conversation intelligence from keywords
"""
import os
import json
from typing import Dict, List, Any


class SocialScraperService:
    """Generates social intelligence from brand keywords via GPT"""

    async def scrape_social(self, keywords: list, brand_name: str) -> dict:
        """ONE GPT call to generate social conversation intelligence"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("⚠️ OPENAI_API_KEY not set — SocialScraperService returning demo data")
            return self._demo_data()

        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        try:
            kw_text = ", ".join(keywords[:10]) if keywords else brand_name
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{
                    "role": "user",
                    "content": f"""You are a social media intelligence analyst for Indian D2C brands.

Brand: '{brand_name}'
Keywords: {kw_text}

Generate social conversation intelligence — what Indian consumers are saying about this brand/category on Reddit (r/IndianSkincareAddicts, r/india), Twitter/X, and Instagram.

You MUST respond with ONLY valid JSON. No markdown, no explanation, no backticks.
{{
  "conversations": [
    {{"platform": "Reddit", "subreddit": "string", "title": "string", "sentiment": "positive/negative/neutral", "engagement": "high/medium/low", "key_insight": "one sentence", "content_opportunity": "one sentence about content to create"}},
    ...at least 6 conversations
  ],
  "trending_topics": ["topic1", "topic2", ...at least 5],
  "sentiment_breakdown": {{"positive": 0-100, "neutral": 0-100, "negative": 0-100}},
  "content_angles": [
    {{"angle": "string", "source": "string", "potential_reach": "high/medium/low"}}
  ]
}}"""
                }],
                max_tokens=1200,
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
            print(f"✅ SocialScraperService returned real data for {brand_name}")
            return result
        except json.JSONDecodeError as e:
            print(f"❌ SocialScraperService JSON parse error: {e}")
            return self._demo_data()
        except Exception as e:
            print(f"❌ SocialScraperService error: {e}")
            return self._demo_data()

    def _demo_data(self):
        return {
            "conversations": [
                {"platform": "Reddit", "subreddit": "r/IndianSkincareAddicts", "title": "Has anyone tried this brand? Honest reviews needed",
                 "sentiment": "neutral", "engagement": "high", "key_insight": "Consumers seeking authentic reviews before purchase",
                 "content_opportunity": "Create a dedicated reviews/testimonials page with verified purchases"},
                {"platform": "Reddit", "subreddit": "r/india", "title": "Overpriced D2C brands — are we paying for packaging or product?",
                 "sentiment": "negative", "engagement": "high", "key_insight": "Price sensitivity is the #1 concern for Indian consumers",
                 "content_opportunity": "Publish transparent cost breakdown showing ingredient quality justifies pricing"},
                {"platform": "Twitter/X", "subreddit": "N/A", "title": "Thread: Best Indian alternatives to international brands",
                 "sentiment": "positive", "engagement": "medium", "key_insight": "Growing 'vocal for local' movement creates opportunity",
                 "content_opportunity": "Position brand in 'Made in India' comparison content"},
                {"platform": "Instagram", "subreddit": "N/A", "title": "Influencer review showing before/after results",
                 "sentiment": "positive", "engagement": "high", "key_insight": "Visual proof of efficacy drives purchase decisions",
                 "content_opportunity": "Launch UGC campaign collecting transformation stories"},
                {"platform": "Reddit", "subreddit": "r/IndianSkincareAddicts", "title": "Ingredient analysis: Is this worth ₹999?",
                 "sentiment": "neutral", "engagement": "medium", "key_insight": "Educated consumers comparing ingredient percentages",
                 "content_opportunity": "Create ingredient deck with full formulation details and sourcing info"},
                {"platform": "Twitter/X", "subreddit": "N/A", "title": "Customer service nightmare — 3 weeks for refund",
                 "sentiment": "negative", "engagement": "medium", "key_insight": "Post-purchase experience is a pain point",
                 "content_opportunity": "Publish customer service SLA commitments and refund tracking dashboard"}
            ],
            "trending_topics": [
                "ingredient transparency", "affordable skincare", "D2C vs international",
                "clean beauty India", "customer service complaints"
            ],
            "sentiment_breakdown": {"positive": 35, "neutral": 40, "negative": 25},
            "content_angles": [
                {"angle": "Ingredient Transparency Deep-Dive", "source": "Reddit discussions", "potential_reach": "high"},
                {"angle": "Made in India Quality Story", "source": "Twitter movement", "potential_reach": "high"},
                {"angle": "Real Customer Transformation Gallery", "source": "Instagram UGC", "potential_reach": "medium"},
                {"angle": "Honest Price Breakdown", "source": "Reddit price complaints", "potential_reach": "high"}
            ],
            "is_demo": True
        }


social_scraper_service = SocialScraperService()
