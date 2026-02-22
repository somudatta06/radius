from fastapi import FastAPI, HTTPException, Request, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, HttpUrl, EmailStr
from typing import Optional, List, Dict, Any
import os
import json
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup
import asyncio
from dotenv import load_dotenv
import hashlib
import secrets
from uuid import uuid4

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Radius GEO Analytics API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_origin_regex=r"https://.*\.preview\.emergentagent\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection — short timeouts so the server never hangs waiting for Mongo
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=2000,
    connectTimeoutMS=2000,
    socketTimeoutMS=2000,
)
db = client.radius_db

# OpenAI client (only supported LLM)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# In-memory session storage (for simplicity - use Redis in production)
sessions: Dict[str, Dict] = {}

# In-memory analysis cache — ensures retrieval works even when MongoDB is down
# Keeps last 200 analyses (FIFO eviction)
_analyses_cache: Dict[str, Dict] = {}
_CACHE_MAX = 200

def _cache_put(analysis_id: str, data: Dict) -> None:
    """Insert analysis into in-memory cache with FIFO eviction."""
    if len(_analyses_cache) >= _CACHE_MAX:
        oldest = next(iter(_analyses_cache))
        del _analyses_cache[oldest]
    _analyses_cache[analysis_id] = data

def _cache_get(analysis_id: str) -> Optional[Dict]:
    """Retrieve analysis from in-memory cache."""
    return _analyses_cache.get(analysis_id)

# Auth Models
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

# Helper functions for auth
def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, hashed = stored_hash.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == hashed
    except:
        return False

def create_session(user_id: str) -> str:
    """Create a session token"""
    token = secrets.token_urlsafe(32)
    sessions[token] = {"user_id": user_id, "created_at": datetime.now(timezone.utc)}
    return token

def get_session_user(token: str) -> Optional[str]:
    """Get user ID from session token"""
    session = sessions.get(token)
    if session:
        return session["user_id"]
    return None

# Auth Routes
@app.post("/api/auth/signup")
async def signup(request: SignupRequest, response: Response):
    """Create a new user account"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid4())
    user = {
        "id": user_id,
        "name": request.name,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Create session
    token = create_session(user_id)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7  # 7 days
    )
    
    return {"id": user_id, "name": request.name, "email": request.email}

@app.post("/api/auth/login")
async def login(request: LoginRequest, response: Response):
    """Login with email and password"""
    # Find user
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    token = create_session(user["id"])
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )
    
    return {"id": user["id"], "name": user["name"], "email": user["email"]}

@app.post("/api/auth/logout")
async def logout(request: Request, response: Response):
    """Logout current user"""
    token = request.cookies.get("session_token")
    if token and token in sessions:
        del sessions[token]
    
    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
async def get_current_user(request: Request):
    """Get current authenticated user"""
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_id = get_session_user(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"id": user["id"], "name": user["name"], "email": user["email"]}

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
def extract_brand_name_from_url(url: str) -> str:
    """Extract a clean brand name from URL as fallback"""
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url if url.startswith('http') else f'https://{url}')
        domain = parsed.netloc.replace('www.', '')
        # Get the main part before TLD
        brand = domain.split('.')[0]
        # Capitalize first letter
        return brand.capitalize() if brand else "Unknown Brand"
    except:
        return "Unknown Brand"

def scrape_website(url: str) -> Dict[str, Any]:
    """Scrape website content with robust error handling"""
    # Extract domain for fallback brand name
    from urllib.parse import urlparse
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.replace('www.', '')
    fallback_brand = extract_brand_name_from_url(url)
    
    # Default response that never shows "Error"
    default_response = {
        'url': url,
        'title': fallback_brand,  # Use brand name, never "Error"
        'description': f'Analysis for {domain}',
        'textContent': '',
        'headings': [],
        'hasFAQ': False,
        'hasTestimonials': False,
        'hasPricing': False,
        'hasBlog': False,
        'hasComparisons': False,
        'scrapeSuccess': False
    }
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        response = requests.get(url, headers=headers, timeout=6, allow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title with multiple fallbacks
        title_text = None
        
        # Try og:title first (usually cleaner)
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            title_text = og_title.get('content').strip()
        
        # Try regular title
        if not title_text:
            title_tag = soup.find('title')
            if title_tag:
                title_text = title_tag.get_text().strip()
        
        # Try h1
        if not title_text:
            h1_tag = soup.find('h1')
            if h1_tag:
                title_text = h1_tag.get_text().strip()
        
        # Clean up title - remove common suffixes
        if title_text:
            # Remove common website title patterns
            for sep in [' | ', ' - ', ' — ', ' : ', ' :: ']:
                if sep in title_text:
                    parts = title_text.split(sep)
                    # Take the shortest meaningful part (usually brand name)
                    title_text = min([p.strip() for p in parts if len(p.strip()) > 2], key=len, default=title_text)
                    break
        
        # Final fallback to domain-based brand name
        if not title_text or title_text.lower() in ['error', 'untitled', '404', 'not found', 'access denied']:
            title_text = fallback_brand
        
        # Get meta description with fallback
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if not meta_desc:
            meta_desc = soup.find('meta', property='og:description')
        description = meta_desc.get('content', '').strip() if meta_desc else f'{title_text} - {domain}'
        
        # Get text content
        for script in soup(['script', 'style', 'nav', 'footer', 'header']):
            script.decompose()
        text_content = soup.get_text()
        text_content = ' '.join(text_content.split())[:5000]
        
        # Get headings
        headings = [h.get_text().strip() for h in soup.find_all(['h1', 'h2', 'h3']) if h.get_text().strip()][:20]
        
        return {
            'url': url,
            'title': title_text,
            'description': description,
            'textContent': text_content,
            'headings': headings,
            'hasFAQ': 'faq' in text_content.lower(),
            'hasTestimonials': 'testimonial' in text_content.lower() or 'review' in text_content.lower(),
            'hasPricing': 'pricing' in text_content.lower() or 'price' in text_content.lower(),
            'hasBlog': 'blog' in text_content.lower(),
            'hasComparisons': 'vs' in text_content.lower() or 'compare' in text_content.lower(),
            'scrapeSuccess': True
        }
    except requests.exceptions.Timeout:
        print(f"⚠️  Scraping timeout for {url}")
        default_response['description'] = f'{fallback_brand} - Website took too long to respond'
        return default_response
    except requests.exceptions.HTTPError as e:
        print(f"⚠️  HTTP error scraping {url}: {e}")
        default_response['description'] = f'{fallback_brand} - {domain}'
        return default_response
    except Exception as e:
        print(f"⚠️  Scraping error for {url}: {str(e)}")
        return default_response

def analyze_with_openai(prompt: str, system_prompt: str = "") -> str:
    """Analyze using OpenAI gpt-4o-mini (sole supported LLM)."""
    if not OPENAI_API_KEY:
        return '{"error": "OPENAI_API_KEY not configured"}'
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=2000,
            temperature=0.7,
            messages=[
                {"role": "system", "content": system_prompt or "You are a helpful AI assistant."},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        return f'{{"error": "{str(e)}"}}'

def enhance_analysis_with_ai(website_info: Dict, brand_name: str, domain: str) -> Dict:
    """
    Use GPT-4o-mini to generate accurate industry detection, GEO scores,
    platform-level visibility, and actionable recommendations.
    Returns an empty dict on failure so callers can fall back gracefully.
    """
    if not OPENAI_API_KEY:
        return {}
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        content_summary = (
            f"Brand: {brand_name}\n"
            f"Domain: {domain}\n"
            f"Page title: {website_info.get('title', '')}\n"
            f"Meta description: {website_info.get('description', '')}\n"
            f"Has FAQ: {website_info.get('hasFAQ', False)}\n"
            f"Has Testimonials: {website_info.get('hasTestimonials', False)}\n"
            f"Has Pricing: {website_info.get('hasPricing', False)}\n"
            f"Has Blog: {website_info.get('hasBlog', False)}\n"
            f"Has Comparisons: {website_info.get('hasComparisons', False)}\n"
            f"Headings: {', '.join(website_info.get('headings', [])[:10])}\n"
            f"Content preview: {website_info.get('textContent', '')[:1500]}"
        )

        prompt = f"""You are an expert in Generative Engine Optimization (GEO) — improving brand visibility in AI-generated answers (ChatGPT, Claude, Gemini, Perplexity).

Analyze this brand's website content and return a JSON object with accurate AI visibility metrics.

WEBSITE DATA:
{content_summary}

SCORING CALIBRATION GUIDE (very important — do not score too low):
- A real, live e-commerce or SaaS website with product pages should score AIC >= 4, MTS >= 4
- Only score below 3 if the page is completely blank, broken, or has < 100 words of content
- A website with products, descriptions, and headings is a functioning brand and deserves fair scoring
- Most real websites fall between 35-75 on overall_score; only truly empty sites score below 25

SCORING FORMULA — compute overall_score EXACTLY as:
  overall_score = round( (AIC * 0.40 + CES * 0.35 + MTS * 0.25) * 10 )
Example: AIC=5, CES=4, MTS=6 → (5*0.40 + 4*0.35 + 6*0.25)*10 = (2.0+1.4+1.5)*10 = 49

Return ONLY this JSON (no markdown, no extra text):
{{
  "industry": "<specific industry, e.g. D2C Fashion, SaaS, E-commerce, Fintech, Healthcare, EdTech>",
  "aic": <1-10, Answerability & Intent Coverage — how well site answers questions AI would ask about this brand>,
  "ces": <1-10, Credibility Evidence & Safety — trust signals: reviews, certifications, case studies, about page>,
  "mts": <1-10, Machine-Readability & Technical — schema markup, clean HTML, meta tags, structured data>,
  "overall_score": <compute exactly as (AIC*0.40 + CES*0.35 + MTS*0.25)*10, round to integer>,
  "platform_scores": {{
    "chatgpt": <overall_score ± 5, integer 0-100>,
    "claude": <overall_score ± 5, integer 0-100>,
    "gemini": <overall_score ± 5, integer 0-100>,
    "perplexity": <overall_score ± 5, integer 0-100>
  }},
  "dimension_scores": [
    {{"dimension": "Mention Rate", "score": <0-100>, "fullMark": 100}},
    {{"dimension": "Context Quality", "score": <0-100>, "fullMark": 100}},
    {{"dimension": "Sentiment", "score": <0-100>, "fullMark": 100}},
    {{"dimension": "Prominence", "score": <0-100>, "fullMark": 100}},
    {{"dimension": "Comparison", "score": <0-100>, "fullMark": 100}},
    {{"dimension": "Recommendation", "score": <0-100>, "fullMark": 100}}
  ],
  "gaps": [
    {{"element": "<specific missing content element for this brand>", "impact": "high|medium|low", "found": true|false}},
    {{"element": "<specific missing content element>", "impact": "high|medium|low", "found": true|false}},
    {{"element": "<specific missing content element>", "impact": "high|medium|low", "found": true|false}},
    {{"element": "<specific missing content element>", "impact": "high|medium|low", "found": true|false}},
    {{"element": "<specific missing content element>", "impact": "high|medium|low", "found": true|false}}
  ],
  "recommendations": [
    {{
      "title": "<specific actionable title for this brand>",
      "description": "<2 sentence description of what to do and why it matters for AI visibility>",
      "priority": "high|medium|low",
      "category": "content|technical|seo|competitive",
      "actionItems": ["<step 1>", "<step 2>", "<step 3>"],
      "estimatedImpact": "+X-Y points"
    }}
  ]
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)

    except Exception as e:
        print(f"⚠️  AI analysis enhancement error: {e}")
        return {}


# API Routes
@app.get("/api/health")
async def health_check():
    mongo_ok = False
    try:
        await client.admin.command("ping")
        mongo_ok = True
    except Exception:
        pass
    return {
        "status": "ok",
        "service": "radius-api",
        "mongodb": mongo_ok,
        "openai_configured": bool(OPENAI_API_KEY),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@app.post("/api/analyze")
async def analyze_website_endpoint(request: AnalyzeRequest):
    """
    Analyze a website for AI visibility
    
    ARCHITECTURAL RULES:
    - Generate unique analysisId for each run
    - NO CACHING - fresh data every time
    - Store all data with analysisId and timestamps
    - Return analysisId for redirect to /analysis/:analysisId
    """
    try:
        # Generate unique analysisId (CRITICAL - no cache reuse)
        analysis_id = f"analysis_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{str(uuid4())[:8]}"
        analysis_timestamp = datetime.now(timezone.utc).isoformat()

        print(f"🔍 Starting FRESH analysis: {analysis_id}")

        url = request.url
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        # Extract domain
        from urllib.parse import urlparse
        parsed_url = urlparse(url)
        domain_name = parsed_url.netloc.replace('www.', '')

        # KNOWLEDGE BASE GENERATION (non-blocking background task)
        try:
            from services.knowledge_service import knowledge_service
            task = asyncio.create_task(knowledge_service.generate_from_website(url, company_id=analysis_id))
            task.add_done_callback(lambda t: print(f"✅ KB ready for {analysis_id}"))
        except Exception as kb_error:
            print(f"⚠️  KB generation skipped: {kb_error}")

        # FRESH WEBSITE SCRAPE — hard 10s timeout so slow sites don't block analysis
        print(f"🌐 Scraping: {url}")
        try:
            loop = asyncio.get_event_loop()
            website_info = await asyncio.wait_for(
                loop.run_in_executor(None, scrape_website, url),
                timeout=10.0
            )
        except asyncio.TimeoutError:
            print(f"⚠️  Scrape timeout for {url} — continuing with fallbacks")
            from urllib.parse import urlparse as _up
            _d = _up(url).netloc.replace("www.", "")
            website_info = {
                "url": url, "title": extract_brand_name_from_url(url),
                "description": f"Analysis for {_d}",
                "textContent": "", "headings": [],
                "hasFAQ": False, "hasTestimonials": False,
                "hasPricing": False, "hasBlog": False,
                "hasComparisons": False, "scrapeSuccess": False
            }

        # Brand name cleanup
        brand_name = website_info['title']
        if not brand_name or brand_name.lower() in ['error', 'untitled', '404', 'not found', 'access denied', 'forbidden']:
            brand_name = extract_brand_name_from_url(url)
        if len(brand_name) > 100:
            brand_name = brand_name[:100].rsplit(' ', 1)[0] + '...'

        # ── AI-POWERED ANALYSIS ─────────────────────────────────────────────
        print(f"🤖 Running GPT-4o-mini analysis for {brand_name}...")
        ai_data = enhance_analysis_with_ai(website_info, brand_name, domain_name)

        # ── INDUSTRY ───────────────────────────────────────────────────────
        industry = ai_data.get("industry", "Technology")

        brand_info = {
            "name": brand_name,
            "domain": domain_name,
            "industry": industry,
            "description": website_info['description'] or f"Analysis for {brand_name}",
        }

        # ── PLATFORM SCORES ────────────────────────────────────────────────
        if ai_data.get("platform_scores"):
            ps = ai_data["platform_scores"]
            platform_scores = [
                {"platform": "ChatGPT",    "score": int(ps.get("chatgpt", 65)),    "color": "hsl(var(--chart-1))"},
                {"platform": "Claude",     "score": int(ps.get("claude", 60)),     "color": "hsl(var(--chart-3))"},
                {"platform": "Gemini",     "score": int(ps.get("gemini", 63)),     "color": "hsl(var(--chart-4))"},
                {"platform": "Perplexity", "score": int(ps.get("perplexity", 67)), "color": "hsl(var(--chart-2))"},
            ]
        else:
            base_score = 60
            if website_info['hasFAQ']:       base_score += 10
            if website_info['hasTestimonials']: base_score += 8
            if website_info['hasPricing']:   base_score += 7
            if website_info['hasBlog']:      base_score += 5
            platform_scores = [
                {"platform": "ChatGPT",    "score": min(base_score + 5, 100), "color": "hsl(var(--chart-1))"},
                {"platform": "Claude",     "score": min(base_score,     100), "color": "hsl(var(--chart-3))"},
                {"platform": "Gemini",     "score": min(base_score + 3, 100), "color": "hsl(var(--chart-4))"},
                {"platform": "Perplexity", "score": min(base_score + 7, 100), "color": "hsl(var(--chart-2))"},
            ]

        # ── OVERALL SCORE — always recalculate from sub-scores to avoid GPT formula errors
        aic_raw = float(ai_data.get("aic") or 0)
        ces_raw = float(ai_data.get("ces") or 0)
        mts_raw = float(ai_data.get("mts") or 0)
        if aic_raw and ces_raw and mts_raw:
            # Correct formula: (AIC*0.40 + CES*0.35 + MTS*0.25) * 10
            calculated_score = round((aic_raw * 0.40 + ces_raw * 0.35 + mts_raw * 0.25) * 10)
            # Use server-calculated score; fall back to GPT overall_score, then platform average
            overall_score = max(calculated_score, 10)  # minimum 10 for any reachable site
        else:
            gpt_overall = ai_data.get("overall_score")
            if gpt_overall and int(gpt_overall) > 5:
                overall_score = int(gpt_overall)
            else:
                overall_score = sum(p['score'] for p in platform_scores) // len(platform_scores)
        overall_score = max(0, min(100, overall_score))

        # ── DIMENSION SCORES ───────────────────────────────────────────────
        dimension_scores = ai_data.get("dimension_scores") or [
            {"dimension": "Mention Rate",    "score": overall_score + 5,  "fullMark": 100},
            {"dimension": "Context Quality", "score": overall_score,      "fullMark": 100},
            {"dimension": "Sentiment",       "score": overall_score + 10, "fullMark": 100},
            {"dimension": "Prominence",      "score": overall_score - 5,  "fullMark": 100},
            {"dimension": "Comparison",      "score": overall_score - 8,  "fullMark": 100},
            {"dimension": "Recommendation",  "score": overall_score + 3,  "fullMark": 100},
        ]
        # Clamp all scores to 0–100
        for d in dimension_scores:
            d["score"] = max(0, min(100, int(d["score"])))

        # ── GAPS ───────────────────────────────────────────────────────────
        gaps = ai_data.get("gaps") or [
            {"element": "FAQ Section",          "impact": "high",   "found": website_info['hasFAQ']},
            {"element": "Comparison Pages",     "impact": "high",   "found": website_info['hasComparisons']},
            {"element": "Customer Testimonials","impact": "medium", "found": website_info['hasTestimonials']},
            {"element": "Pricing Information",  "impact": "medium", "found": website_info['hasPricing']},
            {"element": "Blog Content",         "impact": "medium", "found": website_info['hasBlog']},
        ]

        # ── RECOMMENDATIONS ────────────────────────────────────────────────
        recommendations = ai_data.get("recommendations") or []
        if not recommendations:
            if not website_info['hasFAQ']:
                recommendations.append({
                    "title": "Add FAQ Section",
                    "description": "Create a comprehensive FAQ to improve AI answerability. AI engines heavily reference FAQ content when answering brand queries.",
                    "priority": "high",
                    "category": "content",
                    "actionItems": ["Research top 20 customer questions", "Create FAQ page with schema markup", "Include questions AI engines ask about your category"],
                    "estimatedImpact": "+10-15 points"
                })
            if not website_info['hasComparisons']:
                recommendations.append({
                    "title": "Create Comparison Pages",
                    "description": "Build vs-competitor pages to capture comparison queries. These are the most common AI-assisted purchase-intent queries.",
                    "priority": "high",
                    "category": "competitive",
                    "actionItems": ["Identify top 3-5 competitors", "Build dedicated comparison pages", "Add structured data for comparison tables"],
                    "estimatedImpact": "+12-18 points"
                })
            if not website_info['hasTestimonials']:
                recommendations.append({
                    "title": "Add Social Proof",
                    "description": "AI models weigh credibility signals heavily. Third-party reviews and case studies dramatically improve trust scores.",
                    "priority": "medium",
                    "category": "content",
                    "actionItems": ["Add customer testimonials", "Embed G2/Trustpilot widgets", "Publish 2-3 case studies"],
                    "estimatedImpact": "+8-12 points"
                })

        # ── COMPETITORS ────────────────────────────────────────────────────
        try:
            from services.competitor_intelligence import competitor_service
            website_context = (
                f"{website_info.get('title', '')}. "
                f"{website_info.get('description', '')}. "
                f"Headings: {', '.join(website_info.get('headings', [])[:10])}"
            )
            identified_competitors = competitor_service.identify_competitors(
                company_name=brand_info['name'],
                domain=brand_info['domain'],
                description=brand_info.get('description', brand_info['name']),
                industry=industry,
                website_content=website_context,
            )
            print(f"✅ {len(identified_competitors)} competitors identified")
        except Exception as comp_err:
            print(f"⚠️  Competitor service error: {comp_err}")
            identified_competitors = []

        competitors = [{
            "rank": 1,
            "name": brand_info['name'],
            "domain": brand_info['domain'],
            "score": overall_score,
            "marketOverlap": 100,
            "strengths": ["Current analysis target"],
            "isCurrentBrand": True,
        }]
        for idx, comp in enumerate(identified_competitors, start=2):
            comp_score = max(overall_score + ((idx - 2) * -3), 40)
            competitors.append({
                "rank": idx,
                "name": comp['name'],
                "domain": comp['domain'],
                "score": comp_score,
                "marketOverlap": max(100 - (idx * 10), 50),
                "strengths": [comp.get('description', 'Competitor in same space')],
                "isCurrentBrand": False,
            })

        # ── GEO METRICS — derived consistently from the same aic/ces/mts used above ──────
        geo_metrics = {
            "aic": round(aic_raw or (overall_score * 0.40 / 10), 1),
            "ces": round(ces_raw or (overall_score * 0.35 / 10), 1),
            "mts": round(mts_raw or (overall_score * 0.25 / 10), 1),
            # overall on 0-10 scale for the metric cards
            "overall": round(overall_score / 10, 1),
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
            "geoMetrics": geo_metrics,
            "analysisId": analysis_id,
            "analyzedAt": analysis_timestamp,
            "dataProvenance": {
                "cache_used": False,
                "fresh_crawl": True,
                "ai_powered": bool(ai_data),
                "timestamp": analysis_timestamp,
            },
        }

        # ── PERSIST ────────────────────────────────────────────────────────
        # Always cache in memory first (works even without MongoDB)
        _cache_put(analysis_id, result)

        # Try MongoDB (non-critical)
        try:
            await db.analyses.insert_one({**result, "_analysis_id": analysis_id})
        except Exception as db_err:
            print(f"⚠️  MongoDB write skipped (non-critical): {db_err}")

        print(f"✅ Analysis complete: {analysis_id}  score={overall_score}  industry={industry}")
        return result

    except Exception as e:
        print(f"❌ Analysis error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """
    Retrieve a specific analysis by ID
    
    ARCHITECTURAL RULES:
    - Returns stored analysis data
    - Validates data provenance
    - NO re-caching - just retrieves stored data
    """
    try:
        # 1. Check in-memory cache first (always available, survives MongoDB being down)
        cached = _cache_get(analysis_id)
        if cached:
            print(f"✅ Served from cache: {analysis_id}")
            return cached

        # 2. Fallback to MongoDB
        try:
            analysis = await db.analyses.find_one(
                {"analysisId": analysis_id},
                {"_id": 0},
            )
        except Exception as db_err:
            print(f"⚠️  MongoDB read failed: {db_err}")
            raise HTTPException(
                status_code=503,
                detail="Analysis not found in cache and database is unavailable. Please run a new analysis."
            )

        if not analysis:
            raise HTTPException(status_code=404, detail=f"Analysis not found: {analysis_id}")

        # Warm the cache for subsequent requests
        _cache_put(analysis_id, analysis)
        return analysis

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analysis: {str(e)}")

# ============================================
# RADIUS INTELLIGENCE ENGINE ENDPOINTS
# Full 8-Phase Analysis Pipeline
# ============================================

@app.post("/api/radius/analyze")
async def radius_full_analysis(request: AnalyzeRequest):
    """
    RADIUS: Full 8-Phase AI Visibility Analysis
    
    Executes:
    1. Company Discovery & Raw Data Collection
    2. ChatGPT-Powered Refinement
    3. Knowledge Base Creation
    4. Question Framework Generation
    5. Multi-LLM Visibility Testing
    6. Scoring & Interpretation
    7. User Interaction Support
    8. Continuous Feedback Loop
    """
    from services.radius_engine import radius_engine
    
    try:
        url = request.url
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Run full analysis pipeline
        result = await radius_engine.run_full_analysis(
            url=url,
            run_llm_tests=True,  # Run full LLM tests
            db=db
        )
        
        return result
        
    except Exception as e:
        print(f"❌ Radius analysis error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Radius analysis failed: {str(e)}")

@app.post("/api/radius/analyze-quick")
async def radius_quick_analysis(request: AnalyzeRequest):
    """
    RADIUS: Quick Analysis (Phases 1-4 + Basic Scoring)
    Skips LLM testing for faster results
    """
    from services.radius_engine import radius_engine
    
    try:
        url = request.url
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Run analysis without LLM tests
        result = await radius_engine.run_full_analysis(
            url=url,
            run_llm_tests=False,  # Skip expensive LLM tests
            db=db
        )
        
        return result
        
    except Exception as e:
        print(f"❌ Radius quick analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/radius/analysis/{analysis_id}")
async def get_radius_analysis(analysis_id: str):
    """
    Retrieve a Radius analysis by ID
    """
    try:
        analysis = await db.radius_analyses.find_one(
            {"analysisId": analysis_id},
            {"_id": 0}
        )
        
        if not analysis:
            raise HTTPException(status_code=404, detail=f"Analysis not found: {analysis_id}")
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analysis: {str(e)}")

@app.get("/api/radius/test-question/{analysis_id}/{platform}")
async def get_test_question(analysis_id: str, platform: str):
    """
    PHASE 7: Get pre-generated question for "Test in [LLM]" button
    
    CRITICAL: Returns question that was already generated and influenced score.
    Never generates new questions at click-time.
    """
    from services.radius_engine import radius_engine
    
    try:
        # Fetch analysis
        analysis = await db.radius_analyses.find_one(
            {"analysisId": analysis_id},
            {"_id": 0}
        )
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Get pre-generated question
        question = radius_engine.get_test_question(analysis, platform)
        
        if not question:
            raise HTTPException(status_code=404, detail="No questions available")
        
        return question
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/radius/feedback/{analysis_id}")
async def submit_kb_feedback(analysis_id: str, feedback: Dict[str, Any]):
    """
    PHASE 8: Submit feedback to refine Knowledge Base
    """
    from services.radius_engine import radius_engine
    
    try:
        result = await radius_engine.refine_knowledge_base(
            analysis_id=analysis_id,
            user_feedback=feedback,
            db=db
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/radius/api-status")
async def check_api_status():
    """
    Check which LLM APIs are configured
    """
    import os
    
    return {
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
        "gemini": bool(os.getenv("GEMINI_API_KEY")),
        "perplexity": bool(os.getenv("PERPLEXITY_API_KEY")),
        "message": "Configure missing API keys in backend/.env for full multi-LLM testing"
    }

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
    domain: str = Query(None, description="Domain to fetch competitors for"),
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)"),
    provider: str = Query(None, description="AI provider filter")
):
    """Get mention rate metrics with REAL competitors"""
    from services.visibility_service import visibility_service
    from datetime import datetime, timedelta
    
    # Parse dates
    end = datetime.fromisoformat(end_date) if end_date else datetime.utcnow()
    start = datetime.fromisoformat(start_date) if start_date else end - timedelta(days=30)
    
    # Fetch REAL competitors if domain provided
    competitors = None
    if domain:
        competitors = await visibility_service.get_competitors_for_domain(domain)
    
    metrics = visibility_service.calculate_mention_rate(brand_id, start, end, provider)
    rankings = visibility_service.get_mention_rate_rankings(competitors)
    
    return {
        "metrics": metrics,
        "rankings": rankings
    }

@app.get("/api/visibility/position")
async def get_position_metrics(
    brand_id: str = Query("current"),
    domain: str = Query(None, description="Domain to fetch competitors for"),
    start_date: str = Query(None),
    end_date: str = Query(None)
):
    """Get average position metrics with REAL competitors"""
    from services.visibility_service import visibility_service
    from datetime import datetime, timedelta
    
    end = datetime.fromisoformat(end_date) if end_date else datetime.utcnow()
    start = datetime.fromisoformat(start_date) if start_date else end - timedelta(days=30)
    
    # Fetch REAL competitors if domain provided
    competitors = None
    if domain:
        competitors = await visibility_service.get_competitors_for_domain(domain)
    
    metrics = visibility_service.calculate_average_position(brand_id, start, end)
    rankings = visibility_service.get_position_rankings(competitors)
    
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
async def get_share_of_voice(
    domain: str = Query(None, description="Domain to fetch competitors for")
):
    """Get share of voice metrics with REAL competitors"""
    from services.visibility_service import visibility_service
    
    # Fetch REAL competitors if domain provided
    competitors = None
    if domain:
        competitors = await visibility_service.get_competitors_for_domain(domain)
    
    return visibility_service.calculate_share_of_voice(competitors)

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
    mode: str = Query("improve", pattern="^(improve|concise|authoritative|regenerate)$")
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

@app.post("/api/gap-analysis")
async def gap_analysis_endpoint(request: dict):
    """
    Analyze the gap between AI perception and real consumer perception of a brand.
    """
    from services.gap_analysis import gap_analysis_service

    try:
        result = await gap_analysis_service.analyze_gap(
            brand_name=request.get("brand_name", "Unknown Brand"),
            category=request.get("category", "Technology"),
            ai_scores=request.get("ai_scores", {}),
            website_data=request.get("website_data", {}),
        )
        return result
    except Exception as e:
        print(f"⚠️  Gap analysis endpoint error: {e}")
        from services.gap_analysis import _DEMO_DATA
        return _DEMO_DATA


@app.post("/api/ad-intelligence")
async def ad_intelligence_endpoint(request: dict):
    """
    Extract ad strategy, keyword intelligence, and competitor ad strategies for a brand.
    """
    from services.ad_intelligence import ad_intelligence_service

    try:
        result = await ad_intelligence_service.analyze_ads(
            brand_name=request.get("brand_name", "Unknown Brand"),
            category=request.get("category", "Technology"),
            competitors=request.get("competitors", []),
            website_data=request.get("website_data", {}),
        )
        return result
    except Exception as e:
        print(f"⚠️  Ad intelligence endpoint error: {e}")
        from services.ad_intelligence import _DEMO_DATA
        return _DEMO_DATA


@app.post("/api/content-pipeline/social")
async def content_pipeline_social(request: dict):
    """Generate social conversation intelligence for the content pipeline."""
    from services.social_scraper import SocialScraperService
    service = SocialScraperService()
    try:
        result = await service.scrape_social(
            keywords=request.get("keywords", []),
            brand_name=request.get("brand_name", "Brand"),
        )
        return result
    except Exception as e:
        print(f"⚠️ content-pipeline/social error: {e}")
        return service._demo_data()


@app.post("/api/content-pipeline/blog")
async def content_pipeline_blog(request: dict):
    """Generate a blog post from social intelligence."""
    from services.blog_engine import BlogEngineService
    service = BlogEngineService()
    try:
        result = await service.generate_blog(
            topic=request.get("topic", "Brand Content"),
            brand_name=request.get("brand_name", "Brand"),
            keywords=request.get("keywords", []),
            social_data=request.get("social_data", {}),
        )
        return result
    except Exception as e:
        print(f"⚠️ content-pipeline/blog error: {e}")
        return service._demo_data()


@app.post("/api/content-pipeline/export")
async def content_pipeline_export(request: dict):
    """Export blog content for WordPress, Webflow, or generic JSON."""
    from services.cms_exporter import CMSExporterService
    service = CMSExporterService()
    try:
        result = service.export(
            content=request.get("content", {}),
            format=request.get("format", "json"),
        )
        return result
    except Exception as e:
        print(f"⚠️ content-pipeline/export error: {e}")
        return {"error": str(e), "download_ready": False}


@app.post("/api/search-intelligence")
async def search_intelligence_endpoint(request: dict):
    """Analyze search landscape and SGE readiness for a brand."""
    from services.search_intelligence import SearchIntelligenceService
    service = SearchIntelligenceService()
    try:
        result = await service.analyze_search(
            brand_name=request.get("brand_name", "Brand"),
            category=request.get("category", "Technology"),
            website_data=request.get("website_data", {}),
        )
        return result
    except Exception as e:
        print(f"⚠️ search-intelligence error: {e}")
        return service._demo_data(request.get("brand_name", "Brand"))


@app.post("/api/schema-generator")
async def schema_generator_endpoint(request: dict):
    """Generate JSON-LD schema markup to boost AI visibility."""
    from services.schema_generator import SchemaGeneratorService
    service = SchemaGeneratorService()
    try:
        result = await service.generate_schemas(
            brand_name=request.get("brand_name", "Brand"),
            domain=request.get("domain", ""),
            website_data=request.get("website_data", {}),
            analysis_data=request.get("analysis_data", {}),
        )
        return result
    except Exception as e:
        print(f"⚠️ schema-generator error: {e}")
        return service._demo_data(request.get("brand_name", "Brand"))


@app.get("/")
async def root():
    return {"message": "Radius GEO Analytics API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
