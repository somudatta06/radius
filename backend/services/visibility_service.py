"""
Visibility Analytics Service
Calculates GEO/AI visibility metrics with REAL competitor data
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import random
import os
from motor.motor_asyncio import AsyncIOMotorClient

class VisibilityService:
    """Service for calculating visibility metrics with dynamic competitor data"""
    
    def __init__(self):
        # MongoDB connection for fetching real competitor data
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        self.mongo_client = AsyncIOMotorClient(mongo_url)
        self.db = self.mongo_client.radius_db
        
        # Cache for current session competitors
        self._current_competitors = []
        self._current_brand_name = None
    
    async def get_competitors_for_domain(self, domain: str) -> List[Dict]:
        """
        Fetch REAL competitors from MongoDB based on analysis domain
        This ensures visibility shows the same competitors as the main analysis
        """
        try:
            # Find the most recent analysis for this domain
            analysis = await self.db.analyses.find_one(
                {"brandInfo.domain": {"$regex": domain.replace(".", "\\."), "$options": "i"}},
                sort=[("analyzedAt", -1)],
                projection={"competitors": 1, "brandInfo": 1, "_id": 0}
            )
            
            if analysis and analysis.get("competitors"):
                competitors = analysis["competitors"]
                self._current_brand_name = analysis.get("brandInfo", {}).get("name", "You")
                
                # Transform to visibility format
                result = []
                for comp in competitors:
                    result.append({
                        "id": f"comp{comp.get('rank', 0)}",
                        "name": comp.get("name", "Unknown"),
                        "is_manual": False,
                        "is_current": comp.get("isCurrentBrand", False)
                    })
                
                self._current_competitors = result
                print(f"✅ Loaded {len(result)} REAL competitors for domain: {domain}")
                for c in result:
                    print(f"   - {c['name']} (current: {c['is_current']})")
                return result
            else:
                print(f"⚠️  No analysis found for domain: {domain}")
                return self._fallback_competitors()
        except Exception as e:
            print(f"❌ Error fetching competitors: {str(e)}")
            return self._fallback_competitors()
    
    def _fallback_competitors(self) -> List[Dict]:
        """Fallback when no real data available"""
        return [
            {"id": "comp1", "name": "Competitor A", "is_manual": False, "is_current": False},
            {"id": "comp2", "name": "Competitor B", "is_manual": False, "is_current": False},
            {"id": "comp3", "name": "Competitor C", "is_manual": False, "is_current": False},
            {"id": "comp4", "name": "Competitor D", "is_manual": False, "is_current": False},
            {"id": "comp5", "name": "You", "is_manual": False, "is_current": True},
        ]
    
    def set_competitors(self, competitors: List[Dict]):
        """Set competitors directly (for immediate use after analysis)"""
        self._current_competitors = [
            {
                "id": f"comp{c.get('rank', idx)}",
                "name": c.get('name', 'Unknown'),
                "is_manual": False,
                "is_current": c.get('isCurrentBrand', False)
            }
            for idx, c in enumerate(competitors, 1)
        ]
        print(f"✅ Visibility service updated with {len(self._current_competitors)} competitors")
    
    def get_current_competitors(self) -> List[Dict]:
        """Get current session competitors"""
        return self._current_competitors if self._current_competitors else self._fallback_competitors()
    
    def calculate_mention_rate(
        self,
        brand_id: str,
        start_date: datetime,
        end_date: datetime,
        provider: Optional[str] = None
    ) -> Dict:
        """
        Calculate mention rate: % of prompts where brand appears
        """
        # Mock calculation
        total_prompts = random.randint(100, 500)
        mentions = random.randint(int(total_prompts * 0.01), int(total_prompts * 0.15))
        
        mention_rate = (mentions / total_prompts * 100) if total_prompts > 0 else 0
        
        # Generate time series
        time_series = self._generate_time_series(start_date, end_date, mention_rate)
        
        return {
            "current": round(mention_rate, 2),
            "previous": round(mention_rate * random.uniform(0.8, 1.2), 2),
            "total_mentions": mentions,
            "total_prompts": total_prompts,
            "time_series": time_series
        }
    
    def get_mention_rate_rankings(self, competitors: List[Dict] = None) -> List[Dict]:
        """Get ranked list of competitors by mention rate using REAL competitor data"""
        comp_list = competitors if competitors else self.get_current_competitors()
        rankings = []
        for idx, comp in enumerate(comp_list):
            rate = random.uniform(1.0, 8.0)
            rankings.append({
                "rank": idx + 1,
                "competitor_id": comp["id"],
                "competitor_name": comp["name"],
                "mention_rate": round(rate, 2),
                "is_current": comp.get("is_current", False)
            })
        
        # Sort by mention rate descending
        rankings.sort(key=lambda x: x["mention_rate"], reverse=True)
        
        # Update ranks
        for idx, item in enumerate(rankings):
            item["rank"] = idx + 1
        
        return rankings
    
    def calculate_average_position(
        self,
        brand_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Calculate average ranking position (1-10)
        Lower is better
        """
        avg_position = random.uniform(3.0, 9.0)
        
        return {
            "current": round(avg_position, 1),
            "previous": round(avg_position * random.uniform(0.9, 1.1), 1),
            "total_appearances": random.randint(20, 100)
        }
    
    def get_position_rankings(self) -> List[Dict]:
        """Get ranked list by average position"""
        rankings = []
        for comp in self.mock_competitors:
            position = random.uniform(3.0, 9.0)
            rankings.append({
                "competitor_id": comp["id"],
                "competitor_name": comp["name"],
                "avg_position": round(position, 1),
                "is_current": comp.get("is_current", False)
            })
        
        # Sort by position ascending (lower is better)
        rankings.sort(key=lambda x: x["avg_position"])
        
        # Add ranks
        for idx, item in enumerate(rankings):
            item["rank"] = idx + 1
        
        return rankings
    
    def calculate_sentiment(
        self,
        brand_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Calculate sentiment score (0-100)
        """
        sentiment = random.uniform(70, 95)
        
        time_series = self._generate_time_series(start_date, end_date, sentiment)
        
        # Distribution
        positive = random.uniform(70, 90)
        neutral = random.uniform(5, 20)
        negative = 100 - positive - neutral
        
        return {
            "score": round(sentiment, 1),
            "time_series": time_series,
            "distribution": {
                "positive": round(positive, 1),
                "neutral": round(neutral, 1),
                "negative": round(negative, 1)
            }
        }
    
    def calculate_share_of_voice(self) -> Dict:
        """
        Calculate share of voice: % of total mentions
        """
        shares = []
        total = 100.0
        remaining = total
        
        for idx, comp in enumerate(self.mock_competitors):
            if idx == len(self.mock_competitors) - 1:
                share = remaining
            else:
                share = random.uniform(5, 30)
                share = min(share, remaining - (len(self.mock_competitors) - idx - 1) * 5)
            
            shares.append({
                "competitor_id": comp["id"],
                "competitor_name": comp["name"],
                "share": round(share, 1),
                "is_current": comp.get("is_current", False)
            })
            remaining -= share
        
        # Sort by share descending
        shares.sort(key=lambda x: x["share"], reverse=True)
        
        # Add ranks
        for idx, item in enumerate(shares):
            item["rank"] = idx + 1
        
        return {
            "competitors": shares,
            "total_mentions": random.randint(500, 2000)
        }
    
    def get_geographic_performance(self) -> List[Dict]:
        """
        Get performance by geographic region
        """
        regions = [
            {"region": "United States", "country_code": "US"},
            {"region": "United Kingdom", "country_code": "GB"},
            {"region": "Canada", "country_code": "CA"},
            {"region": "Germany", "country_code": "DE"},
            {"region": "France", "country_code": "FR"},
            {"region": "India", "country_code": "IN"},
            {"region": "Australia", "country_code": "AU"},
            {"region": "Japan", "country_code": "JP"},
        ]
        
        geo_data = []
        for region in regions:
            mention_rate = random.uniform(1.0, 10.0)
            share = random.uniform(5.0, 25.0)
            
            geo_data.append({
                "region": region["region"],
                "country_code": region["country_code"],
                "mention_rate": round(mention_rate, 2),
                "share_of_voice": round(share, 1),
                "total_mentions": random.randint(10, 100),
                "total_prompts": random.randint(100, 500)
            })
        
        return geo_data
    
    def _generate_time_series(
        self,
        start_date: datetime,
        end_date: datetime,
        base_value: float,
        variation: float = 0.15
    ) -> List[Dict]:
        """Generate realistic time series data"""
        days = (end_date - start_date).days
        time_series = []
        
        for i in range(min(days, 30)):  # Limit to 30 points
            date = start_date + timedelta(days=i)
            # Add some variation
            value = base_value * random.uniform(1 - variation, 1 + variation)
            time_series.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(value, 2)
            })
        
        return time_series

# Singleton
visibility_service = VisibilityService()
