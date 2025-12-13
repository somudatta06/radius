"""
Reddit Intelligence Service
Tracks Reddit mentions, sentiment, and citations with KB-aware analysis
"""
import os
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from openai import OpenAI

class RedditIntelligenceService:
    """
    Reddit Intelligence with Knowledge Base integration
    Analyzes Reddit threads for brand/competitor mentions and sentiment
    """
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.openai_key) if self.openai_key else None
    
    async def get_reddit_metrics(self, brand_name: str = "default") -> Dict:
        """
        Calculate Reddit intelligence metrics
        """
        threads = await self.get_reddit_threads(brand_name)
        
        if not threads:
            return {
                "positive_sentiment_pct": 0.0,
                "total_mention_rate": 0.0,
                "positive_mentions": 0,
                "total_mentions": 0,
                "change_vs_previous": 0.0,
                "reddit_share_of_citations": 0.0,
            }
        
        total_mentions = sum(1 for t in threads if t['brand_mentioned'] > 0)
        positive_mentions = sum(1 for t in threads if t['sentiment'] == 'positive' and t['brand_mentioned'] > 0)
        
        total_citations = sum(t['citations'] for t in threads)
        
        return {
            "positive_sentiment_pct": (positive_mentions / total_mentions * 100) if total_mentions > 0 else 0.0,
            "total_mention_rate": (total_mentions / len(threads) * 100) if threads else 0.0,
            "positive_mentions": positive_mentions,
            "total_mentions": total_mentions,
            "change_vs_previous": 0.0,  # TODO: Calculate from historical data
            "reddit_share_of_citations": 3.5,  # TODO: Calculate from total citations across all sources
        }
    
    async def get_reddit_threads(
        self,
        brand_name: str = "default",
        search_query: Optional[str] = None,
        filter_type: Optional[str] = None,
        sentiment_filter: Optional[str] = None,
    ) -> List[Dict]:
        """
        Get Reddit threads with brand/competitor mentions
        Uses KB for accurate brand understanding
        """
        # In production, this would query Reddit API or database
        # For now, generate realistic mock data
        threads = await self._generate_mock_reddit_data(brand_name)
        
        # Apply filters
        if search_query:
            threads = [t for t in threads if search_query.lower() in t['title'].lower()]
        
        if filter_type == "brand":
            threads = [t for t in threads if t['brand_mentioned'] > 0]
        elif filter_type == "competitor":
            threads = [t for t in threads if any(count > 0 for count in t['competitors_mentioned'].values())]
        
        if sentiment_filter and sentiment_filter != "all":
            threads = [t for t in threads if t['sentiment'] == sentiment_filter]
        
        return threads
    
    async def _generate_mock_reddit_data(self, brand_name: str) -> List[Dict]:
        """
        Generate realistic Reddit thread data
        In production, this would fetch from Reddit API and analyze with KB
        """
        mock_threads = [
            {
                "id": "thread_1",
                "rank": 1,
                "title": "Best payment processing solutions for startups in 2024?",
                "url": "https://reddit.com/r/startups/comments/example1",
                "subreddit": "startups",
                "citations": 847,
                "percentage": 24.5,
                "brand_mentioned": 12,
                "competitors_mentioned": {"Square": 8, "PayPal": 15},
                "sentiment": "positive",
                "sentiment_score": 0.87,
                "summary": "Discussion comparing payment processors. Users praise ease of integration and developer experience.",
                "created_at": "2024-01-15T10:30:00Z"
            },
            {
                "id": "thread_2",
                "rank": 2,
                "title": "Why we switched from PayPal to modern payment stack",
                "url": "https://reddit.com/r/SaaS/comments/example2",
                "subreddit": "SaaS",
                "citations": 623,
                "percentage": 18.2,
                "brand_mentioned": 18,
                "competitors_mentioned": {"PayPal": 25, "Square": 3},
                "sentiment": "positive",
                "sentiment_score": 0.92,
                "summary": "Detailed case study of payment infrastructure migration. Highlights improved reliability and feature set.",
                "created_at": "2024-01-14T15:20:00Z"
            },
            {
                "id": "thread_3",
                "rank": 3,
                "title": "Payment gateway fees comparison 2024",
                "url": "https://reddit.com/r/Entrepreneur/comments/example3",
                "subreddit": "Entrepreneur",
                "citations": 534,
                "percentage": 15.8,
                "brand_mentioned": 22,
                "competitors_mentioned": {"Square": 18, "PayPal": 20, "Adyen": 5},
                "sentiment": "neutral",
                "sentiment_score": 0.55,
                "summary": "Comprehensive fee breakdown and cost analysis. Mixed opinions on pricing competitiveness.",
                "created_at": "2024-01-12T09:45:00Z"
            },
            {
                "id": "thread_4",
                "rank": 4,
                "title": "International payment processing - what are your experiences?",
                "url": "https://reddit.com/r/ecommerce/comments/example4",
                "subreddit": "ecommerce",
                "citations": 412,
                "percentage": 12.1,
                "brand_mentioned": 15,
                "competitors_mentioned": {"Adyen": 12, "PayPal": 8},
                "sentiment": "positive",
                "sentiment_score": 0.78,
                "summary": "Users discuss cross-border payments. Strong feedback on multi-currency support and local payment methods.",
                "created_at": "2024-01-10T14:30:00Z"
            },
            {
                "id": "thread_5",
                "rank": 5,
                "title": "Dealing with payment disputes and chargebacks",
                "url": "https://reddit.com/r/smallbusiness/comments/example5",
                "subreddit": "smallbusiness",
                "citations": 289,
                "percentage": 8.5,
                "brand_mentioned": 7,
                "competitors_mentioned": {"Square": 5, "PayPal": 10},
                "sentiment": "negative",
                "sentiment_score": 0.42,
                "summary": "Discussion about fraud prevention tools. Some users report issues with dispute resolution process.",
                "created_at": "2024-01-08T11:15:00Z"
            },
        ]
        
        return mock_threads
    
    async def analyze_thread_with_kb(
        self,
        thread_title: str,
        thread_content: str,
        knowledge_base: Dict
    ) -> Dict:
        """
        Analyze Reddit thread using Knowledge Base for accurate sentiment & summary
        This is the MOAT - KB-aware analysis
        """
        if not self.client:
            return {
                "sentiment": "neutral",
                "sentiment_score": 0.5,
                "summary": "Analysis unavailable - OpenAI not configured"
            }
        
        try:
            # Build KB-aware prompt
            company_desc = knowledge_base.get('company_description', {})
            brand_guidelines = knowledge_base.get('brand_guidelines', {})
            
            system_prompt = f"""You are analyzing Reddit discussions about a company.

Use the following Knowledge Base to understand the brand accurately:

COMPANY:
{company_desc.get('overview', 'Not available')}

BRAND TONE: {brand_guidelines.get('tone', 'Professional')}

BRAND GUIDELINES:
{', '.join(brand_guidelines.get('dos', []))}

Do not misinterpret tone or positioning. Analyze sentiment accurately based on this context."""

            user_prompt = f"""Analyze this Reddit thread:

Title: {thread_title}
Content: {thread_content[:1000]}

Provide:
1. Sentiment (positive/neutral/negative)
2. Sentiment confidence score (0-1)
3. One-sentence summary

Return JSON:
{{
  "sentiment": "positive|neutral|negative",
  "sentiment_score": 0.0-1.0,
  "summary": "Brief summary"
}}"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
        
        except Exception as e:
            print(f"❌ Thread analysis error: {str(e)}")
            return {
                "sentiment": "neutral",
                "sentiment_score": 0.5,
                "summary": "Unable to analyze thread"
            }

# Singleton
reddit_service = RedditIntelligenceService()
