"""
Knowledge Base Service
AI-powered knowledge generation and management
"""
from typing import Optional, Dict, List
import os
import random
from datetime import datetime
from services.website_scraper import WebsiteScraper
from services.knowledge_synthesizer import KnowledgeSynthesizer

# Mock knowledge base storage (in production, use MongoDB)
_knowledge_store = {}

class KnowledgeService:
    """Service for managing knowledge base"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.synthesizer = KnowledgeSynthesizer()
    
    async def get_knowledge_base(self, company_id: str = "default") -> Dict:
        """Get knowledge base for company"""
        if company_id not in _knowledge_store:
            # Return empty structure if not generated yet
            # (Generation happens during analysis, not on first access)
            _knowledge_store[company_id] = self._empty_knowledge_base()
        
        return _knowledge_store[company_id]
    
    async def generate_from_website(self, website_url: str, company_id: str = "default") -> Dict:
        """
        Generate Knowledge Base by scraping and analyzing website.
        Runs the synchronous scraper in a thread to avoid blocking the event loop.
        """
        import asyncio
        try:
            print(f"🔍 Scraping website: {website_url}")

            # Run synchronous scraper in a thread pool so it doesn't block the event loop
            loop = asyncio.get_event_loop()
            def _scrape():
                scraper = WebsiteScraper(website_url)
                return scraper.scrape_comprehensive(max_pages=3)  # cap at 3 pages

            scraped_data = await asyncio.wait_for(
                loop.run_in_executor(None, _scrape),
                timeout=15.0  # hard 15s cap for knowledge base scraping
            )

            print(f"✅ Scraped {scraped_data['total_pages']} pages")

            # Synthesize knowledge using GPT
            print(f"🤖 Synthesizing knowledge with GPT...")
            knowledge = self.synthesizer.synthesize_knowledge_base(scraped_data)

            knowledge['created_at'] = datetime.utcnow().isoformat()
            knowledge['updated_at'] = datetime.utcnow().isoformat()
            knowledge['company_description']['last_edited'] = datetime.utcnow().isoformat()
            knowledge['brand_guidelines']['last_edited'] = datetime.utcnow().isoformat()

            _knowledge_store[company_id] = knowledge
            print(f"✅ Knowledge Base generated for {company_id}")
            return knowledge

        except asyncio.TimeoutError:
            print(f"⚠️ KB scraping timed out for {website_url} — using empty KB")
            _knowledge_store[company_id] = self._empty_knowledge_base()
            return _knowledge_store[company_id]
        except Exception as e:
            print(f"❌ Error generating KB from website: {str(e)}")
            return self._empty_knowledge_base()
    
    def _empty_knowledge_base(self) -> Dict:
        """Empty KB structure for fallback"""
        return {
            "company_description": {
                "overview": "",
                "products_services": "",
                "target_customers": "",
                "positioning": "",
                "is_ai_generated": False,
                "last_edited": datetime.utcnow().isoformat(),
            },
            "brand_guidelines": {
                "tone": None,
                "words_to_prefer": [],
                "words_to_avoid": [],
                "dos": [],
                "donts": [],
                "is_ai_extracted": False,
                "last_edited": datetime.utcnow().isoformat(),
            },
            "evidence": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
    
    async def generate_initial_knowledge(self, company_id: str, website_url: Optional[str] = None) -> Dict:
        """
        AI auto-generates initial knowledge base
        Triggered on first load
        """
        # In production, this would:
        # 1. Crawl the website
        # 2. Analyze previous analyses
        # 3. Extract competitor context
        # 4. Use GPT-4 to generate structured description
        
        generated_description = f"""## Overview
A leading technology company specializing in innovative solutions for modern businesses.

## Products & Services
Our platform provides comprehensive analytics and insights powered by artificial intelligence, enabling businesses to make data-driven decisions with confidence.

## Target Customers
We serve mid-market to enterprise companies across technology, finance, and e-commerce sectors who are looking to leverage AI for competitive advantage.

## Positioning
Positioned as a premium AI-powered analytics solution that combines ease of use with enterprise-grade capabilities, setting us apart from traditional analytics tools."""
        
        return {
            "company_description": {
                "id": "company_desc",
                "overview": generated_description,
                "products_services": "AI-powered analytics platform with real-time insights",
                "target_customers": "Mid-market to enterprise B2B companies",
                "positioning": "Premium, easy-to-use, AI-native solution",
                "icp": {
                    "industry": "Technology, SaaS, E-commerce",
                    "company_size": "50-5000 employees",
                    "geography": "North America, Europe",
                    "buyer_persona": "VP of Marketing, Head of Product",
                    "use_cases": ["Competitive intelligence", "Market analysis", "Brand monitoring"]
                },
                "differentiators": [
                    {
                        "id": "diff1",
                        "title": "AI-Native Architecture",
                        "explanation": "Built from ground up with AI at the core, not bolted on",
                        "order": 1
                    },
                    {
                        "id": "diff2",
                        "title": "Real-Time Analysis",
                        "explanation": "Get insights in seconds, not hours or days",
                        "order": 2
                    }
                ],
                "is_ai_generated": True,
                "last_edited": datetime.utcnow().isoformat(),
                "version": 1
            },
            "brand_guidelines": {
                "id": "brand_guidelines",
                "tone": "professional yet approachable",
                "words_to_prefer": ["innovative", "intelligent", "powerful", "insights"],
                "words_to_avoid": ["cheap", "basic", "simple"],
                "dos": ["Use active voice", "Lead with benefits", "Be specific"],
                "donts": ["Don't overpromise", "Avoid jargon", "Don't compare negatively"],
                "sentence_style": "Clear, concise, confident",
                "reference_urls": [],
                "uploaded_documents": [],
                "is_ai_extracted": False,
                "last_edited": datetime.utcnow().isoformat()
            },
            "evidence": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    async def update_company_description(self, company_id: str, description: Dict) -> Dict:
        """Update company description"""
        if company_id not in _knowledge_store:
            _knowledge_store[company_id] = await self.generate_initial_knowledge(company_id)
        
        _knowledge_store[company_id]["company_description"].update(description)
        _knowledge_store[company_id]["company_description"]["is_ai_generated"] = False
        _knowledge_store[company_id]["company_description"]["last_edited"] = datetime.utcnow().isoformat()
        _knowledge_store[company_id]["updated_at"] = datetime.utcnow().isoformat()
        
        return _knowledge_store[company_id]["company_description"]
    
    async def improve_with_ai(self, text: str, mode: str = "improve") -> str:
        """
        AI improvement modes:
        - improve: general enhancement
        - concise: make shorter
        - authoritative: make more confident
        - regenerate: start fresh
        """
        # Mock improvement (in production, use GPT-4)
        improvements = {
            "improve": lambda t: t.replace("good", "excellent").replace("nice", "outstanding"),
            "concise": lambda t: " ".join(t.split()[:len(t.split())//2]) + "...",
            "authoritative": lambda t: t.replace("We think", "We know").replace("might", "will"),
            "regenerate": lambda t: "Regenerated content based on latest analysis..."
        }
        
        return improvements.get(mode, lambda t: t)(text)
    
    async def update_brand_guidelines(self, company_id: str, guidelines: Dict) -> Dict:
        """Update brand guidelines"""
        if company_id not in _knowledge_store:
            _knowledge_store[company_id] = await self.generate_initial_knowledge(company_id)
        
        _knowledge_store[company_id]["brand_guidelines"].update(guidelines)
        _knowledge_store[company_id]["brand_guidelines"]["last_edited"] = datetime.utcnow().isoformat()
        _knowledge_store[company_id]["updated_at"] = datetime.utcnow().isoformat()
        
        return _knowledge_store[company_id]["brand_guidelines"]
    
    async def extract_guidelines_from_url(self, url: str) -> Dict:
        """Extract brand guidelines from URL using AI"""
        # Mock extraction (in production, crawl + GPT-4 analysis)
        return {
            "tone": "professional, data-driven",
            "words_to_prefer": ["analyze", "insight", "optimize"],
            "words_to_avoid": ["guess", "assume", "maybe"],
            "dos": ["Use concrete examples", "Cite data"],
            "donts": ["Avoid vague claims"],
            "sentence_style": "Clear and direct"
        }
    
    async def add_evidence(self, company_id: str, evidence: Dict) -> Dict:
        """Add evidence item"""
        if company_id not in _knowledge_store:
            _knowledge_store[company_id] = await self.generate_initial_knowledge(company_id)
        
        evidence["id"] = f"evidence_{len(_knowledge_store[company_id]['evidence']) + 1}"
        evidence["created_at"] = datetime.utcnow().isoformat()
        
        _knowledge_store[company_id]["evidence"].append(evidence)
        _knowledge_store[company_id]["updated_at"] = datetime.utcnow().isoformat()
        
        return evidence
    
    async def get_evidence(self, company_id: str) -> List[Dict]:
        """Get all evidence"""
        if company_id not in _knowledge_store:
            _knowledge_store[company_id] = await self.generate_initial_knowledge(company_id)
        
        return _knowledge_store[company_id]["evidence"]
    
    async def delete_evidence(self, company_id: str, evidence_id: str) -> bool:
        """Delete evidence item"""
        if company_id not in _knowledge_store:
            return False
        
        _knowledge_store[company_id]["evidence"] = [
            e for e in _knowledge_store[company_id]["evidence"] 
            if e["id"] != evidence_id
        ]
        _knowledge_store[company_id]["updated_at"] = datetime.utcnow().isoformat()
        
        return True

# Singleton
knowledge_service = KnowledgeService()
