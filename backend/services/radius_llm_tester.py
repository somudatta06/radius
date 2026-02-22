"""
RADIUS PHASE 5: Multi-LLM Visibility Testing
Tests visibility across ChatGPT, Claude, Perplexity, and Gemini.

NOTE: Only OpenAI (gpt-4o-mini) is used.
Claude, Gemini, and Perplexity results are SIMULATED via a single GPT call
that estimates how each platform would describe the brand.
"""
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from openai import OpenAI


# Hardcoded demo scores returned when OpenAI key is missing
_DEMO_PLATFORM_SCORES = {
    "chatgpt": {"score": 62, "summary": "A technology company with a growing online presence and relevant product offerings."},
    "claude":  {"score": 58, "summary": "A brand that appears in relevant search contexts with moderate visibility across AI responses."},
    "gemini":  {"score": 65, "summary": "A recognised player in its category, mentioned in industry comparisons and product reviews."},
    "perplexity": {"score": 60, "summary": "Appears in targeted search results with adequate brand representation in AI-generated answers."},
}


class RadiusLLMTester:
    """
    PHASE 5: Multi-LLM Visibility Testing

    Uses gpt-4o-mini to:
    1. Actually query ChatGPT about the brand (real responses).
    2. Simulate how Claude, Gemini, and Perplexity would describe the brand
       (one GPT call that returns estimated scores + summaries for all 4 platforms).

    If OPENAI_API_KEY is not set, returns hardcoded demo scores so the app
    never crashes.
    """

    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.openai_client = None
        self._init_client()

    def _init_client(self):
        """Initialise OpenAI client if key is available."""
        if self.openai_key:
            try:
                self.openai_client = OpenAI(api_key=self.openai_key)
            except Exception as e:
                print(f"⚠️ OpenAI client init error: {e}")
                self.openai_client = None

    def _refresh_client(self):
        """Re-read env var and re-initialise (called before each analysis run)."""
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self._init_client()

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    def test_all_llms(self, questions: List[Dict], knowledge_base: Dict) -> Dict[str, Any]:
        """
        Test visibility across all LLMs.

        Returns comprehensive test results compatible with the existing schema.
        """
        print("🔬 PHASE 5: Starting multi-LLM visibility testing...")

        self._refresh_client()

        kb = knowledge_base.get("knowledge_base", {})
        company_name = kb.get("company_overview", {}).get("name", "Unknown")

        results: Dict[str, Any] = {
            "company_name": company_name,
            "test_timestamp": datetime.now(timezone.utc).isoformat(),
            "platforms": {},
            "summary": {},
            "metadata": {
                "questions_tested": len(questions),
                "platforms_available": [],
                "cache_used": False,
                "simulation_mode": True,
            },
        }

        if not self.openai_client:
            # No API key — return demo data for all 4 platforms
            print("⚠️  No OPENAI_API_KEY — returning demo scores for all platforms")
            for platform_key, platform_label, model_label in [
                ("chatgpt",   "ChatGPT",   "demo"),
                ("claude",    "Claude",    "demo"),
                ("gemini",    "Gemini",    "demo"),
                ("perplexity","Perplexity","demo"),
            ]:
                results["platforms"][platform_key] = self._demo_result(
                    platform_label, model_label, company_name, questions
                )
                results["metadata"]["platforms_available"].append(platform_key)
        else:
            # Step 1: Real ChatGPT test
            results["platforms"]["chatgpt"] = self._test_openai(questions, company_name, kb)
            results["metadata"]["platforms_available"].append("chatgpt")

            # Step 2: Simulate Claude / Gemini / Perplexity with one GPT call
            simulated = self._simulate_other_platforms(company_name, kb, questions)
            for platform_key in ("claude", "gemini", "perplexity"):
                results["platforms"][platform_key] = simulated.get(
                    platform_key,
                    self._demo_result(platform_key.capitalize(), "simulated", company_name, questions),
                )
                results["metadata"]["platforms_available"].append(platform_key)

        # Calculate summary
        results["summary"] = self._calculate_summary(results["platforms"], company_name)

        tested_count = len(results["metadata"]["platforms_available"])
        print(f"🔬 PHASE 5 Complete: Results for {tested_count} platforms")

        return results

    # ------------------------------------------------------------------
    # Real ChatGPT test
    # ------------------------------------------------------------------

    def _test_openai(self, questions: List[Dict], company_name: str, kb: Dict) -> Dict:
        """Query ChatGPT with actual brand questions."""
        print("  Testing ChatGPT (real)...")

        results = []
        total_mentions = 0

        for q in questions[:5]:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": q["text"]}],
                    temperature=0.7,
                    max_tokens=1000,
                )
                answer = response.choices[0].message.content
                analysis = self._analyze_response(answer, company_name, kb)

                results.append({
                    "question_id": q["id"],
                    "question": q["text"],
                    "response": answer[:1500],
                    "analysis": analysis,
                })

                if analysis["mentioned"]:
                    total_mentions += 1

            except Exception as e:
                results.append({
                    "question_id": q["id"],
                    "question": q["text"],
                    "error": str(e),
                })

        return {
            "platform": "ChatGPT",
            "model": "gpt-4o-mini",
            "available": True,
            "simulated": False,
            "questions_tested": len(results),
            "mention_count": total_mentions,
            "mention_rate": total_mentions / len(results) if results else 0,
            "results": results,
            "tested_at": datetime.now(timezone.utc).isoformat(),
        }

    # ------------------------------------------------------------------
    # Simulation: Claude / Gemini / Perplexity via one GPT call
    # ------------------------------------------------------------------

    def _simulate_other_platforms(
        self, company_name: str, kb: Dict, questions: List[Dict]
    ) -> Dict[str, Dict]:
        """
        Use GPT-4o-mini to estimate how Claude, Gemini, and Perplexity
        would each describe and score the brand.

        Returns a dict keyed by platform name.
        """
        print("  Simulating Claude / Gemini / Perplexity via GPT-4o-mini...")

        # Build a short content summary from the knowledge base
        overview = kb.get("company_overview", {})
        products = kb.get("products_and_services", [])
        content_summary = (
            f"Company: {overview.get('name', company_name)}. "
            f"Description: {overview.get('description', '')}. "
            f"Products: {', '.join([p.get('name','') for p in products[:5]])}."
        )

        sample_questions = " | ".join([q["text"] for q in questions[:3]])

        prompt = (
            f"Simulate how ChatGPT, Claude, Gemini, and Perplexity would each respond "
            f"to queries about {company_name}. "
            f"Based on this website content: {content_summary}. "
            f"Sample queries: {sample_questions}. "
            f"For each platform, estimate a visibility score 0-100 and a one-sentence "
            f"summary of how they would describe the brand. "
            f"Return ONLY valid JSON in this exact shape, no markdown, no extra text: "
            f'{{"chatgpt": {{"score": 0, "summary": ""}}, '
            f'"claude": {{"score": 0, "summary": ""}}, '
            f'"gemini": {{"score": 0, "summary": ""}}, '
            f'"perplexity": {{"score": 0, "summary": ""}}}}'
        )

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=400,
            )
            raw = response.choices[0].message.content.strip()
            simulated_data: Dict = json.loads(raw)
        except Exception as e:
            print(f"⚠️  Simulation call failed: {e} — using demo scores")
            simulated_data = _DEMO_PLATFORM_SCORES

        now = datetime.now(timezone.utc).isoformat()
        platform_map = {
            "claude":     ("Claude",     "claude-simulated"),
            "gemini":     ("Gemini",     "gemini-simulated"),
            "perplexity": ("Perplexity", "perplexity-simulated"),
        }

        output: Dict[str, Dict] = {}
        for key, (label, model) in platform_map.items():
            sim = simulated_data.get(key, _DEMO_PLATFORM_SCORES[key])
            score = int(sim.get("score", 60))
            summary = sim.get("summary", "")
            mention_rate = round(score / 100, 2)

            # Build synthetic question results based on the simulated score
            sim_results = []
            for q in questions[:5]:
                sim_results.append({
                    "question_id": q["id"],
                    "question": q["text"],
                    "response": summary,
                    "analysis": {
                        "mentioned": score >= 50,
                        "mention_position": 0 if score >= 50 else -1,
                        "product_mentions": 0,
                        "sentiment": "positive" if score >= 65 else "neutral" if score >= 45 else "negative",
                        "competitors_mentioned": [],
                        "hallucination_risk": "low",
                        "response_length": len(summary),
                        "contains_recommendation": score >= 70,
                    },
                })

            total_mentions = sum(1 for r in sim_results if r["analysis"]["mentioned"])

            output[key] = {
                "platform": label,
                "model": model,
                "available": True,
                "simulated": True,
                "questions_tested": len(sim_results),
                "mention_count": total_mentions,
                "mention_rate": mention_rate,
                "results": sim_results,
                "tested_at": now,
            }

        return output

    # ------------------------------------------------------------------
    # Demo data (no API key)
    # ------------------------------------------------------------------

    def _demo_result(
        self, platform: str, model: str, company_name: str, questions: List[Dict]
    ) -> Dict:
        """Build a realistic-looking result when we have no API key at all."""
        key = platform.lower()
        demo = _DEMO_PLATFORM_SCORES.get(key, {"score": 60, "summary": "A recognised brand in its category."})
        score = demo["score"]
        summary = demo["summary"]
        mention_rate = round(score / 100, 2)

        demo_results = []
        for q in questions[:5]:
            demo_results.append({
                "question_id": q["id"],
                "question": q["text"],
                "response": summary,
                "analysis": {
                    "mentioned": score >= 50,
                    "mention_position": 0 if score >= 50 else -1,
                    "product_mentions": 0,
                    "sentiment": "positive" if score >= 65 else "neutral",
                    "competitors_mentioned": [],
                    "hallucination_risk": "low",
                    "response_length": len(summary),
                    "contains_recommendation": score >= 70,
                },
            })

        total_mentions = sum(1 for r in demo_results if r["analysis"]["mentioned"])

        return {
            "platform": platform,
            "model": model,
            "available": True,
            "simulated": True,
            "demo_mode": True,
            "questions_tested": len(demo_results),
            "mention_count": total_mentions,
            "mention_rate": mention_rate,
            "results": demo_results,
            "tested_at": datetime.now(timezone.utc).isoformat(),
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _analyze_response(self, response: str, company_name: str, kb: Dict) -> Dict:
        """Analyse LLM response for visibility metrics."""
        response_lower = response.lower()
        company_lower = company_name.lower()

        mentioned = company_lower in response_lower

        products = kb.get("products_and_services", [])
        product_mentions = sum(
            1 for p in products if p.get("name", "").lower() in response_lower
        )

        positive_words = ["best", "excellent", "great", "leading", "top", "recommended", "popular", "trusted"]
        negative_words = ["avoid", "issue", "problem", "concern", "limited", "expensive", "difficult"]

        positive_count = sum(1 for w in positive_words if w in response_lower)
        negative_count = sum(1 for w in negative_words if w in response_lower)

        if positive_count > negative_count:
            sentiment = "positive"
        elif negative_count > positive_count:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        hallucination_risk = "low"
        if mentioned and "founded" in response_lower:
            hallucination_risk = "medium"

        return {
            "mentioned": mentioned,
            "mention_position": response_lower.find(company_lower) if mentioned else -1,
            "product_mentions": product_mentions,
            "sentiment": sentiment,
            "competitors_mentioned": [],
            "hallucination_risk": hallucination_risk,
            "response_length": len(response),
            "contains_recommendation": any(
                w in response_lower for w in ["recommend", "suggest", "consider", "try"]
            ),
        }

    def _calculate_summary(self, platforms: Dict, company_name: str) -> Dict:
        """Calculate overall visibility summary across all platforms."""
        total_mentions = 0
        total_questions = 0
        platform_scores: Dict[str, Dict] = {}

        for platform, data in platforms.items():
            if data.get("available"):
                total_mentions += data.get("mention_count", 0)
                total_questions += data.get("questions_tested", 0)
                platform_scores[platform] = {
                    "mention_rate": data.get("mention_rate", 0),
                    "questions_tested": data.get("questions_tested", 0),
                }

        overall_mention_rate = total_mentions / total_questions if total_questions > 0 else 0

        return {
            "company_name": company_name,
            "overall_mention_rate": overall_mention_rate,
            "total_mentions": total_mentions,
            "total_questions": total_questions,
            "platform_scores": platform_scores,
            "visibility_grade": self._calculate_grade(overall_mention_rate),
            "platforms_tested": len([p for p in platforms.values() if p.get("available")]),
        }

    def _calculate_grade(self, mention_rate: float) -> str:
        if mention_rate >= 0.8:
            return "A"
        elif mention_rate >= 0.6:
            return "B"
        elif mention_rate >= 0.4:
            return "C"
        elif mention_rate >= 0.2:
            return "D"
        else:
            return "F"


# Singleton
llm_tester = RadiusLLMTester()
