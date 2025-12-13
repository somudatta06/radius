from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
import os
from datetime import datetime
import anthropic
import requests
from bs4 import BeautifulSoup
import asyncio

app = FastAPI(title="Radius GEO Analytics API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.radius_db

# Anthropic client
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# Models
class AnalyzeRequest(BaseModel):
    url: str

class AnalysisResponse(BaseModel):
    url: str
    brandInfo: Dict[str, Any]
    overallScore: int
    platformScores: List[Dict[str, Any]]
    dimensionScores: List[Dict[str, Any]]
    competitors: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    geoMetrics: Optional[Dict[str, Any]] = None

# Helper functions
def scrape_website(url: str) -> Dict[str, Any]:
    """Scrape website content"""
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract content
        title = soup.find('title')
        title_text = title.get_text().strip() if title else 'Untitled'
        
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '') if meta_desc else ''
        
        # Get text content
        for script in soup(['script', 'style']):
            script.decompose()
        text_content = soup.get_text()
        text_content = ' '.join(text_content.split())[:5000]
        
        # Get headings
        headings = [h.get_text().strip() for h in soup.find_all(['h1', 'h2', 'h3'])]
        
        return {
            'url': url,
            'title': title_text,
            'description': description,
            'textContent': text_content,
            'headings': headings,
            'hasFAQ': 'faq' in text_content.lower(),
            'hasTestimonials': 'testimonial' in text_content.lower(),
            'hasPricing': 'pricing' in text_content.lower() or 'price' in text_content.lower(),
            'hasBlog': 'blog' in text_content.lower(),
            'hasComparisons': 'vs' in text_content.lower() or 'compare' in text_content.lower(),
        }
    except Exception as e:
        print(f"Scraping error: {str(e)}")
        return {
            'url': url,
            'title': 'Error',
            'description': '',
            'textContent': '',
            'headings': [],
            'hasFAQ': False,
            'hasTestimonials': False,
            'hasPricing': False,
            'hasBlog': False,
            'hasComparisons': False,
        }

def analyze_with_claude(prompt: str, system_prompt: str = "") -> str:
    """Analyze using Claude API"""
    if not anthropic_client:
        return '{"error": "Anthropic API key not configured"}'
    
    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=2000,
            temperature=0.7,
            system=system_prompt if system_prompt else "You are a helpful AI assistant.",
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except Exception as e:
        print(f"Claude API error: {str(e)}")
        return f'{{"error": "{str(e)}"}}'

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "radius-api"}

@app.post("/api/analyze")
async def analyze_website_endpoint(request: AnalyzeRequest):
    """Analyze a website for AI visibility"""
    try:
        url = request.url
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Scrape website
        website_info = scrape_website(url)
        
        # Extract brand info from website data
        from urllib.parse import urlparse
        parsed_url = urlparse(url)
        domain_name = parsed_url.netloc.replace('www.', '')
        
        brand_info = {
            "name": website_info['title'],
            "domain": domain_name,
            "industry": "Technology",
            "description": website_info['description'] or f"Website analysis for {domain_name}"
        }
        
        # Calculate platform scores
        base_score = 60
        if website_info['hasFAQ']:
            base_score += 10
        if website_info['hasTestimonials']:
            base_score += 8
        if website_info['hasPricing']:
            base_score += 7
        if website_info['hasBlog']:
            base_score += 5
        
        platform_scores = [
            {"platform": "ChatGPT", "score": min(base_score + 5, 100), "color": "hsl(var(--chart-1))"},
            {"platform": "Claude", "score": min(base_score, 100), "color": "hsl(var(--chart-3))"},
            {"platform": "Gemini", "score": min(base_score + 3, 100), "color": "hsl(var(--chart-4))"},
            {"platform": "Perplexity", "score": min(base_score + 7, 100), "color": "hsl(var(--chart-2))"},
        ]
        
        overall_score = sum(p['score'] for p in platform_scores) // len(platform_scores)
        
        # Dimension scores
        dimension_scores = [
            {"dimension": "Mention Rate", "score": base_score + 10, "fullMark": 100},
            {"dimension": "Context Quality", "score": base_score + 5, "fullMark": 100},
            {"dimension": "Sentiment", "score": base_score + 15, "fullMark": 100},
            {"dimension": "Prominence", "score": base_score, "fullMark": 100},
            {"dimension": "Comparison", "score": base_score - 10 if not website_info['hasComparisons'] else base_score + 15, "fullMark": 100},
            {"dimension": "Recommendation", "score": base_score + 8, "fullMark": 100},
        ]
        
        # Gaps
        gaps = [
            {"element": "FAQ Section", "impact": "high", "found": website_info['hasFAQ']},
            {"element": "Comparison Pages", "impact": "high", "found": website_info['hasComparisons']},
            {"element": "Customer Testimonials", "impact": "medium", "found": website_info['hasTestimonials']},
            {"element": "Pricing Information", "impact": "medium", "found": website_info['hasPricing']},
            {"element": "Blog Content", "impact": "medium", "found": website_info['hasBlog']},
        ]
        
        # Recommendations
        recommendations = []
        if not website_info['hasFAQ']:
            recommendations.append({
                "title": "Add FAQ Section",
                "description": "Create a comprehensive FAQ to improve AI visibility",
                "priority": "high",
                "category": "content",
                "actionItems": ["Research common questions", "Create FAQ page", "Add schema markup"],
                "estimatedImpact": "+10-15 points"
            })
        
        if not website_info['hasComparisons']:
            recommendations.append({
                "title": "Create Comparison Pages",
                "description": "Build competitor comparison content",
                "priority": "high",
                "category": "competitive",
                "actionItems": ["Identify competitors", "Create comparison pages", "Optimize for search"],
                "estimatedImpact": "+15-20 points"
            })
        
        # Competitors
        competitors = [
            {
                "rank": 1,
                "name": brand_info['name'],
                "domain": brand_info['domain'],
                "score": overall_score,
                "marketOverlap": 100,
                "strengths": ["Current analysis target"],
                "isCurrentBrand": True
            }
        ]
        
        # GEO Metrics
        geo_metrics = {
            "aic": round(base_score / 10, 1),
            "ces": round((base_score + 5) / 10, 1),
            "mts": round((base_score + 10) / 10, 1),
            "overall": round((base_score + 5) / 10, 1)
        }
        
        result = {
            "url": url,
            "brandInfo": brand_info,
            "overallScore": overall_score,
            "platformScores": platform_scores,
            "dimensionScores": dimension_scores,
            "competitors": competitors,
            "gaps": gaps,
            "recommendations": recommendations,
            "geoMetrics": geo_metrics
        }
        
        # Save to MongoDB
        await db.analyses.insert_one({
            **result,
            "analyzedAt": datetime.utcnow()
        })
        
        return result
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/competitors")
async def discover_competitors(
    keyword: str,
    category: str = None,
    limit: int = 10
):
    """
    Discover and analyze competitors using Tracxn + OpenAI
    
    Query params:
    - keyword: Search term (e.g., "AI analytics")
    - category: Optional category filter
    - limit: Max results (default 10)
    """
    try:
        from services.tracxn import tracxn_service
        from services.openai_analysis import openai_analysis_service
        
        # Step 1: Get competitors from Tracxn
        if category:
            competitors = tracxn_service.discover_by_category(category, limit)
        else:
            competitors = tracxn_service.search_competitors(keyword, limit)
        
        if not competitors:
            return {
                "competitors": [],
                "analysis": {
                    "competitorScores": [],
                    "summary": "No competitors found for the given search criteria.",
                    "recommendedStrategy": "Try different keywords or categories.",
                    "marketInsights": "",
                    "keyOpportunities": []
                },
                "metadata": {
                    "keyword": keyword,
                    "category": category,
                    "count": 0
                }
            }
        
        # Step 2: Analyze with OpenAI
        analysis = openai_analysis_service.analyze_competitors(competitors)
        
        # Step 3: Combine and return
        return {
            "competitors": competitors,
            "analysis": analysis,
            "metadata": {
                "keyword": keyword,
                "category": category,
                "count": len(competitors),
                "analyzedAt": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        print(f"Competitor discovery error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Discovery failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Radius GEO Analytics API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
