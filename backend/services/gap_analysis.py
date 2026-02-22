"""
Gap Analysis Service
Analyzes the gap between AI perception and real consumer/social perception of a brand.
Uses gpt-4o-mini for analysis; returns hardcoded demo data when no key is available.
"""
import os
import json
from typing import Dict, Any, List


_DEMO_DATA: Dict[str, Any] = {
    "ai_perception": {"quality": 72, "value": 65, "trust": 68},
    "social_perception": {"quality": 58, "value": 71, "trust": 52},
    "gap_score": 63,
    "crisis_alerts": [],
    "executive_summary": (
        "There is a notable gap between how AI platforms describe this brand and how "
        "real consumers experience it. AI models over-index on quality narratives while "
        "consumers rate value-for-money and trust significantly lower. Closing this gap "
        "requires publishing customer evidence and addressing trust signals on key pages."
    ),
    "gaps": [
        {
            "dimension": "Trust & Credibility",
            "ai_says": "Established brand with strong market presence and positive reviews",
            "people_say": "Limited social proof, hard to verify claims, few independent reviews",
            "severity": "high",
            "action": "Add verified customer testimonials, case studies, and third-party certifications to homepage and product pages.",
        },
        {
            "dimension": "Value for Money",
            "ai_says": "Competitively priced with good quality-to-cost ratio",
            "people_say": "Pricing feels premium without enough justification vs alternatives",
            "severity": "medium",
            "action": "Create a clear value comparison page highlighting ROI metrics and differentiators vs top competitors.",
        },
        {
            "dimension": "Customer Support",
            "ai_says": "Responsive support team available across multiple channels",
            "people_say": "Slow response times reported; resolution quality inconsistent",
            "severity": "medium",
            "action": "Publish SLA commitments, average response times, and customer satisfaction scores publicly.",
        },
    ],
}


class GapAnalysisService:
    """
    Analyzes the gap between AI-generated brand perception and real social/consumer perception.
    """

    def __init__(self) -> None:
        self.openai_key = os.getenv("OPENAI_API_KEY")

    async def analyze_gap(
        self,
        brand_name: str,
        category: str,
        ai_scores: Dict[str, Any],
        website_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Makes ONE gpt-4o-mini call to analyze perception gaps.
        Falls back to demo data if the key is missing or the call fails.
        """
        self.openai_key = os.getenv("OPENAI_API_KEY")

        if not self.openai_key:
            print("⚠️  No OPENAI_API_KEY — returning demo gap analysis")
            return self._demo(brand_name)

        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.openai_key)

            ai_scores_text = json.dumps(ai_scores, indent=2)
            website_text = (
                f"Title: {website_data.get('title', brand_name)}. "
                f"Description: {website_data.get('description', '')}. "
                f"Has FAQ: {website_data.get('hasFAQ', False)}. "
                f"Has Testimonials: {website_data.get('hasTestimonials', False)}. "
                f"Has Pricing: {website_data.get('hasPricing', False)}."
            )

            prompt = (
                f"Brand '{brand_name}' in '{category}'. "
                f"AI says: {ai_scores_text}. "
                f"Website: {website_text}. "
                f"Analyze the GAP between AI perception vs real consumer perception. "
                f"Return ONLY valid JSON, no markdown:\n"
                f'{{"ai_perception":{{"quality":0,"value":0,"trust":0}},'
                f'"social_perception":{{"quality":0,"value":0,"trust":0}},'
                f'"gaps":['
                f'{{"dimension":"","ai_says":"","people_say":"","severity":"high|medium|low","action":""}}],'
                f'"gap_score":0,'
                f'"crisis_alerts":[],'
                f'"executive_summary":""}}'
            )

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=1000,
            )

            raw = response.choices[0].message.content.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            result: Dict[str, Any] = json.loads(raw)
            return result

        except Exception as e:
            print(f"⚠️  Gap analysis error: {e} — returning demo data")
            return self._demo(brand_name)

    def _demo(self, brand_name: str) -> Dict[str, Any]:
        demo = dict(_DEMO_DATA)
        demo["executive_summary"] = (
            f"There is a notable gap between how AI platforms describe {brand_name} and how "
            "real consumers experience it. AI models over-index on quality narratives while "
            "consumers rate value-for-money and trust significantly lower. Closing this gap "
            "requires publishing customer evidence and addressing trust signals on key pages."
        )
        return demo


gap_analysis_service = GapAnalysisService()
