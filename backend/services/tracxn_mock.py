"""
Tracxn Mock Service
Provides mock competitor data for testing when Tracxn API is not available
"""
from typing import List, Dict
import random

MOCK_COMPANIES = [
    {
        "name": "DataRobot",
        "website": "datarobot.com",
        "description": "Enterprise AI platform that accelerates and democratizes data science",
        "category": "AI/ML Platform",
        "funding": 1000000000,
        "stage": "Series G",
        "investors": ["Tiger Global", "Sapphire Ventures", "NEA"],
        "location": "Boston, MA",
        "foundedYear": 2012,
        "revenue": 200000000,
        "employeeSize": 1000
    },
    {
        "name": "Alteryx",
        "website": "alteryx.com",
        "description": "Self-service data analytics platform for business analysts",
        "category": "Data Analytics",
        "funding": 163000000,
        "stage": "IPO",
        "investors": ["Insight Partners", "Sapphire Ventures", "Iconiq Capital"],
        "location": "Irvine, CA",
        "foundedYear": 1997,
        "revenue": 500000000,
        "employeeSize": 1500
    },
    {
        "name": "Tableau",
        "website": "tableau.com",
        "description": "Visual analytics platform transforming data into actionable insights",
        "category": "Business Intelligence",
        "funding": 246700000,
        "stage": "Acquired",
        "investors": ["New Enterprise Associates", "Accel"],
        "location": "Seattle, WA",
        "foundedYear": 2003,
        "revenue": 1000000000,
        "employeeSize": 4000
    },
    {
        "name": "Looker",
        "website": "looker.com",
        "description": "Business intelligence and big data analytics platform",
        "category": "Business Intelligence",
        "funding": 181500000,
        "stage": "Acquired",
        "investors": ["Kleiner Perkins", "First Round Capital", "PremjiInvest"],
        "location": "Santa Cruz, CA",
        "foundedYear": 2012,
        "revenue": 150000000,
        "employeeSize": 800
    },
    {
        "name": "Domo",
        "website": "domo.com",
        "description": "Cloud-based business intelligence and data visualization platform",
        "category": "Business Intelligence",
        "funding": 690000000,
        "stage": "IPO",
        "investors": ["Bezos Expeditions", "Blackrock", "IVP"],
        "location": "American Fork, UT",
        "foundedYear": 2010,
        "revenue": 250000000,
        "employeeSize": 1200
    },
    {
        "name": "Sisense",
        "website": "sisense.com",
        "description": "End-to-end business analytics software",
        "category": "Analytics Platform",
        "funding": 200000000,
        "stage": "Series E",
        "investors": ["Insight Partners", "Battery Ventures", "DFJ Growth"],
        "location": "New York, NY",
        "foundedYear": 2004,
        "revenue": 100000000,
        "employeeSize": 600
    },
    {
        "name": "ThoughtSpot",
        "website": "thoughtspot.com",
        "description": "AI-powered analytics platform for search-driven insights",
        "category": "AI Analytics",
        "funding": 663000000,
        "stage": "Series F",
        "investors": ["Silver Lake", "Lightspeed Venture Partners", "Khosla Ventures"],
        "location": "Sunnyvale, CA",
        "foundedYear": 2012,
        "revenue": 200000000,
        "employeeSize": 1000
    },
    {
        "name": "Amplitude",
        "website": "amplitude.com",
        "description": "Product analytics for web and mobile apps",
        "category": "Product Analytics",
        "funding": 336000000,
        "stage": "IPO",
        "investors": ["Sequoia Capital", "Battery Ventures", "IVP"],
        "location": "San Francisco, CA",
        "foundedYear": 2012,
        "revenue": 200000000,
        "employeeSize": 900
    },
    {
        "name": "Mixpanel",
        "website": "mixpanel.com",
        "description": "Product analytics platform to understand user behavior",
        "category": "Product Analytics",
        "funding": 277000000,
        "stage": "Series C",
        "investors": ["Sequoia Capital", "Andreessen Horowitz", "Max Levchin"],
        "location": "San Francisco, CA",
        "foundedYear": 2009,
        "revenue": 100000000,
        "employeeSize": 400
    },
    {
        "name": "Segment",
        "website": "segment.com",
        "description": "Customer data platform for data collection and routing",
        "category": "Data Infrastructure",
        "funding": 283700000,
        "stage": "Acquired",
        "investors": ["Accel", "Thrive Capital", "Y Combinator"],
        "location": "San Francisco, CA",
        "foundedYear": 2011,
        "revenue": 150000000,
        "employeeSize": 600
    }
]

def get_mock_competitors(query: str, limit: int = 10) -> List[Dict]:
    """
    Return mock competitor data based on search query
    
    Args:
        query: Search keyword
        limit: Maximum results
        
    Returns:
        List of mock companies
    """
    # Filter companies based on query keywords
    query_lower = query.lower()
    
    filtered = MOCK_COMPANIES
    
    # Simple keyword matching
    if 'ai' in query_lower:
        filtered = [c for c in filtered if 'AI' in c['category'] or 'AI' in c['description']]
    elif 'analytics' in query_lower:
        filtered = [c for c in filtered if 'Analytics' in c['category'] or 'analytics' in c['description'].lower()]
    elif 'intelligence' in query_lower or 'bi' in query_lower:
        filtered = [c for c in filtered if 'Intelligence' in c['category']]
    
    # If no specific match, return random sample
    if not filtered:
        filtered = MOCK_COMPANIES
    
    # Shuffle and limit
    random.shuffle(filtered)
    return filtered[:limit]
