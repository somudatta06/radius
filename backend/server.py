from fastapi import FastAPI, HTTPException, Request, Query
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
    allow_origins=[
        "http://localhost:3000",
        "https://knowledge-hub-303.preview.emergentagent.com"
    ],
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
        
        # AUTOMATIC KNOWLEDGE BASE GENERATION
        # Generate KB from website (fire and forget - runs in background)
        try:
            from services.knowledge_service import knowledge_service
            # Start KB generation but don't wait for it (non-blocking)
            task = asyncio.create_task(knowledge_service.generate_from_website(url, company_id="default"))
            # Optional: Add callback to log completion
            task.add_done_callback(lambda t: print(f"✅ KB generation completed for {url}"))
        except Exception as kb_error:
            print(f"⚠️  KB generation failed (non-critical): {str(kb_error)}")
        
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
        
        # Identify real competitors using AI
        from services.competitor_intelligence import competitor_service
        
        print(f"🔍 Identifying competitors for: {brand_info['name']}")
        print(f"   Domain: {brand_info['domain']}")
        print(f"   Description: {brand_info.get('description', 'N/A')[:100]}")
        
        identified_competitors = competitor_service.identify_competitors(
            company_name=brand_info['name'],
            domain=brand_info['domain'],
            description=brand_info.get('description', brand_info['name']),
            industry=brand_info.get('industry', 'Technology')
        )
        
        print(f"✅ Got {len(identified_competitors)} competitors from service")
        
        # Build competitors list with current brand first
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
        
        # Add identified competitors with simulated scores
        for idx, comp in enumerate(identified_competitors, start=2):
            # Simulate competitive scores (slightly varied from main brand)
            comp_score = overall_score + ((idx - 2) * -3)  # Slight degradation for lower ranks
            competitors.append({
                "rank": idx,
                "name": comp['name'],
                "domain": comp['domain'],
                "score": max(comp_score, 40),  # Minimum score of 40
                "marketOverlap": max(100 - (idx * 10), 50),  # Decreasing overlap
                "strengths": [comp.get('description', 'Competitor in same space')],
                "isCurrentBrand": False
            })
        
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
async def competitors_endpoint(
    query: str = Query(..., description="Search query or keyword"),
    category: str = Query(None, description="Optional category filter"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    analyze: bool = Query(False, description="Include AI analysis")
):
    """
    Discover competitors using Tracxn API
    
    Example: GET /api/competitors?query=AI%20marketing&limit=5
    
    Query params:
    - query: Search term (required, e.g., "AI analytics")
    - category: Optional category filter
    - limit: Max results (1-50, default 10)
    - analyze: Include OpenAI analysis (default false)
    
    Returns:
        {
            "success": true,
            "competitors": [...],
            "analysis": {...},  // if analyze=true
            "metadata": {...}
        }
    """
    from controllers.competitor_controller import discover_and_analyze_competitors
    return await discover_and_analyze_competitors(query, category, limit, analyze)

@app.get("/api/visibility/mention-rate")
async def get_mention_rate(
    brand_id: str = Query("current", description="Brand ID"),
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)"),
    provider: str = Query(None, description="AI provider filter")
):
    """Get mention rate metrics"""
    from services.visibility_service import visibility_service
    from datetime import datetime, timedelta
    
    # Parse dates
    end = datetime.fromisoformat(end_date) if end_date else datetime.utcnow()
    start = datetime.fromisoformat(start_date) if start_date else end - timedelta(days=30)
    
    metrics = visibility_service.calculate_mention_rate(brand_id, start, end, provider)
    rankings = visibility_service.get_mention_rate_rankings()
    
    return {
        "metrics": metrics,
        "rankings": rankings
    }

@app.get("/api/visibility/position")
async def get_position_metrics(
    brand_id: str = Query("current"),
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    """Get average position metrics"""
    from services.visibility_service import visibility_service
    from datetime import datetime, timedelta
    
    end = datetime.fromisoformat(end_date) if end_date else datetime.utcnow()
    start = datetime.fromisoformat(start_date) if start_date else end - timedelta(days=30)
    
    metrics = visibility_service.calculate_average_position(brand_id, start, end)
    rankings = visibility_service.get_position_rankings()
    
    return {
        "metrics": metrics,
        "rankings": rankings
    }

@app.get("/api/visibility/sentiment")
async def get_sentiment_metrics(
    brand_id: str = Query("current"),
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    """Get sentiment analysis"""
    from services.visibility_service import visibility_service
    from datetime import datetime, timedelta
    
    end = datetime.fromisoformat(end_date) if end_date else datetime.utcnow()
    start = datetime.fromisoformat(start_date) if start_date else end - timedelta(days=30)
    
    return visibility_service.calculate_sentiment(brand_id, start, end)

@app.get("/api/visibility/share-of-voice")
async def get_share_of_voice():
    """Get share of voice metrics"""
    from services.visibility_service import visibility_service
    return visibility_service.calculate_share_of_voice()

@app.get("/api/visibility/geographic")
async def get_geographic_performance():
    """Get geographic performance data"""
    from services.visibility_service import visibility_service
    return visibility_service.get_geographic_performance()

@app.get("/api/knowledge-base")
async def get_knowledge_base(company_id: str = Query("default")):
    """Get complete knowledge base"""
    from services.knowledge_service import knowledge_service
    return await knowledge_service.get_knowledge_base(company_id)

@app.post("/api/knowledge-base/company-description")
async def update_company_description(
    company_id: str = Query("default"),
    description: Dict = None
):
    """Update company description"""
    from services.knowledge_service import knowledge_service
    return await knowledge_service.update_company_description(company_id, description)

@app.post("/api/knowledge-base/improve")
async def improve_text(
    text: str,
    mode: str = Query("improve", regex="^(improve|concise|authoritative|regenerate)$")
):
    """AI text improvement"""
    from services.knowledge_service import knowledge_service
    result = await knowledge_service.improve_with_ai(text, mode)
    return {"improved_text": result}

@app.post("/api/knowledge-base/brand-guidelines")
async def update_brand_guidelines(
    company_id: str = Query("default"),
    guidelines: Dict = None
):
    """Update brand guidelines"""
    from services.knowledge_service import knowledge_service
    return await knowledge_service.update_brand_guidelines(company_id, guidelines)

@app.post("/api/knowledge-base/extract-guidelines")
async def extract_guidelines(url: str):
    """Extract guidelines from URL"""
    from services.knowledge_service import knowledge_service
    return await knowledge_service.extract_guidelines_from_url(url)

@app.post("/api/knowledge-base/evidence")
async def add_evidence(
    company_id: str = Query("default"),
    evidence: Dict = None
):
    """Add evidence item"""
    from services.knowledge_service import knowledge_service
    return await knowledge_service.add_evidence(company_id, evidence)

@app.get("/api/knowledge-base/evidence")
async def get_evidence(company_id: str = Query("default")):
    """Get all evidence"""
    from services.knowledge_service import knowledge_service
    return await knowledge_service.get_evidence(company_id)

@app.delete("/api/knowledge-base/evidence/{evidence_id}")
async def delete_evidence(
    evidence_id: str,
    company_id: str = Query("default")
):
    """Delete evidence item"""
    from services.knowledge_service import knowledge_service
    success = await knowledge_service.delete_evidence(company_id, evidence_id)
    return {"success": success}

@app.post("/api/knowledge-base/regenerate")
async def regenerate_knowledge_base(
    website_url: str = Query(..., description="Website URL to analyze"),
    company_id: str = Query("default")
):
    """
    Regenerate Knowledge Base from website
    Scrapes website and uses GPT to generate fresh KB content
    """
    from services.knowledge_service import knowledge_service
    
    try:
        knowledge = await knowledge_service.generate_from_website(website_url, company_id)
        return {
            "success": True,
            "knowledge_base": knowledge,
            "message": "Knowledge Base regenerated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")

@app.get("/api/reddit/metrics")
async def get_reddit_metrics(
    brand_name: str = Query("default")
):
    """Get Reddit intelligence metrics"""
    from services.reddit_intelligence import reddit_service
    metrics = await reddit_service.get_reddit_metrics(brand_name)
    return metrics

@app.get("/api/reddit/threads")
async def get_reddit_threads(
    brand_name: str = Query("default"),
    search: Optional[str] = Query(None),
    filter: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None)
):
    """Get Reddit threads with brand/competitor mentions"""
    from services.reddit_intelligence import reddit_service
    threads = await reddit_service.get_reddit_threads(
        brand_name=brand_name,
        search_query=search,
        filter_type=filter,
        sentiment_filter=sentiment
    )
    return threads

@app.post("/api/reddit/analyze-thread")
async def analyze_reddit_thread(
    title: str = Query(...),
    content: str = Query(...),
    company_id: str = Query("default")
):
    """
    Analyze a Reddit thread with Knowledge Base context
    Returns KB-aware sentiment and summary
    """
    from services.reddit_intelligence import reddit_service
    from services.knowledge_service import knowledge_service
    
    # Get KB for context
    kb = await knowledge_service.get_knowledge_base(company_id)
    
    # Analyze with KB
    analysis = await reddit_service.analyze_thread_with_kb(title, content, kb)
    
    return analysis

@app.post("/api/generate-brief")
async def generate_brief(request: dict):
    """
    Generate AI-powered analysis brief from scores
    """
    import os
    from openai import OpenAI
    
    overall_score = request.get('overallScore', 0)
    platform_scores = request.get('platformScores', [])
    brand_name = request.get('brandName', 'the brand')
    domain = request.get('domain', '')
    
    # Get OpenAI client
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        return {"brief": f"With an overall score of {overall_score}/100, {brand_name} shows moderate visibility across AI platforms."}
    
    try:
        client = OpenAI(api_key=openai_key)
        
        # Build platform performance text
        platform_text = "\n".join([f"- {p['platform']}: {p['score']}" for p in platform_scores])
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI visibility analyst. Generate a concise 2-3 sentence analysis brief based on the provided scores. Be factual and specific."
                },
                {
                    "role": "user",
                    "content": f"""Analyze this AI visibility performance:

Brand: {brand_name}
Domain: {domain}
Overall Score: {overall_score}/100

Platform Scores:
{platform_text}

Generate a brief 2-3 sentence analysis of their performance."""
                }
            ],
            temperature=0,
            max_tokens=150
        )
        
        brief = response.choices[0].message.content.strip()
        return {"brief": brief}
    
    except Exception as e:
        print(f"Brief generation error: {str(e)}")
        return {"brief": f"With an overall score of {overall_score}/100, {brand_name} demonstrates solid performance across AI platforms."}

@app.get("/")
async def root():
    return {"message": "Radius GEO Analytics API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
