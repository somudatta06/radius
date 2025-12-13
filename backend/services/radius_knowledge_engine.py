"""
RADIUS PHASE 2 & 3: ChatGPT-Powered Refinement & Knowledge Base Creation
Transforms raw crawl data into structured, normalized knowledge
"""
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from openai import OpenAI

class RadiusKnowledgeEngine:
    """
    PHASE 2: ChatGPT Refinement Layer
    PHASE 3: Knowledge Base Creation
    
    ChatGPT's STRICT role:
    ✅ Clean marketing language into neutral descriptions
    ✅ Resolve contradictions across pages
    ✅ Infer obvious business model details
    ✅ Convert to normalized knowledge representation
    
    ❌ Must NOT invent products/services
    ❌ Must NOT add unsupported assumptions
    ❌ Must NOT introduce competitive opinions
    """
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.openai_key) if self.openai_key else None
    
    def refine_and_create_kb(self, crawl_data: Dict) -> Dict[str, Any]:
        """
        PHASE 2 & 3: Transform raw crawl data into Knowledge Base
        
        Returns structured KB with confidence scores
        """
        if not self.client:
            # Reinitialize if key was loaded after init
            self.openai_key = os.getenv("OPENAI_API_KEY")
            if self.openai_key:
                self.client = OpenAI(api_key=self.openai_key)
        
        if not self.client:
            print("⚠️ OpenAI not available - returning low-confidence KB")
            return self._create_fallback_kb(crawl_data)
        
        print("🧠 PHASE 2: Starting ChatGPT refinement...")
        
        # Prepare context from crawl data
        context = self._prepare_context(crawl_data)
        
        try:
            # Call ChatGPT for refinement
            kb_response = self._call_gpt_for_kb(context)
            
            # Validate and score confidence
            kb = self._validate_and_score(kb_response, crawl_data)
            
            print("🧠 PHASE 2 Complete: Knowledge Base created")
            return kb
            
        except Exception as e:
            print(f"❌ GPT refinement error: {str(e)}")
            return self._create_fallback_kb(crawl_data)
    
    def _prepare_context(self, crawl_data: Dict) -> str:
        """Prepare context string from crawl data for GPT"""
        parts = []
        
        # Add metadata
        parts.append(f"DOMAIN: {crawl_data['metadata']['domain']}")
        parts.append(f"CRAWL TIME: {crawl_data['metadata']['crawl_timestamp']}")
        parts.append(f"PAGES CRAWLED: {crawl_data['metadata']['pages_successful']}")
        parts.append("")
        
        # Add extracted structured data
        extracted = crawl_data.get('extracted_data', {})
        if extracted.get('title'):
            parts.append(f"WEBSITE TITLE: {extracted['title']}")
        if extracted.get('meta_description'):
            parts.append(f"META DESCRIPTION: {extracted['meta_description']}")
        
        # Add headings
        if extracted.get('headings'):
            parts.append("\nKEY HEADINGS:")
            for h in extracted['headings'][:20]:
                parts.append(f"  - [{h['level']}] {h['text']}")
        
        # Add social proof
        if extracted.get('social_proof'):
            parts.append(f"\nSOCIAL PROOF: {', '.join(extracted['social_proof'][:10])}")
        
        # Add pricing info
        if extracted.get('pricing_info'):
            parts.append(f"\nPRICING SIGNALS: {', '.join(extracted['pricing_info'][:10])}")
        
        # Add trust signals
        if extracted.get('trust_signals'):
            parts.append(f"\nTRUST SIGNALS: {', '.join(extracted['trust_signals'][:10])}")
        
        parts.append("")
        
        # Add raw content by section
        raw = crawl_data.get('raw_content', {})
        
        if raw.get('homepage'):
            parts.append("=== HOMEPAGE CONTENT ===")
            parts.append(raw['homepage'][:3000])
            parts.append("")
        
        if raw.get('about'):
            parts.append("=== ABOUT PAGE CONTENT ===")
            parts.append(raw['about'][:2000])
            parts.append("")
        
        if raw.get('products'):
            parts.append("=== PRODUCTS/SERVICES CONTENT ===")
            parts.append(raw['products'][:2500])
            parts.append("")
        
        if raw.get('pricing'):
            parts.append("=== PRICING CONTENT ===")
            parts.append(raw['pricing'][:1500])
            parts.append("")
        
        if raw.get('customers'):
            parts.append("=== CUSTOMERS/CASE STUDIES ===")
            parts.append(raw['customers'][:1500])
            parts.append("")
        
        if raw.get('trust'):
            parts.append("=== SECURITY/COMPLIANCE ===")
            parts.append(raw['trust'][:1000])
            parts.append("")
        
        return '\n'.join(parts)[:15000]  # Limit total context
    
    def _call_gpt_for_kb(self, context: str) -> Dict:
        """Call GPT to create structured Knowledge Base"""
        
        system_prompt = """You are a business analyst for the Radius AI Visibility Engine.

Your task is to analyze raw website data and create a STRUCTURED KNOWLEDGE BASE.

STRICT RULES:
1. ONLY use information explicitly stated in the provided content
2. Clean marketing language into neutral, factual descriptions
3. Resolve any contradictions by preferring more specific information
4. If something is unclear or not stated, mark it as "Not explicitly stated"
5. DO NOT invent products, services, or capabilities
6. DO NOT add assumptions not supported by the text
7. DO NOT introduce competitive comparisons or opinions

OUTPUT FORMAT (JSON):
{
  "company_overview": {
    "name": "Company name",
    "tagline": "Main tagline or value proposition",
    "description": "2-3 sentence neutral description of what the company does",
    "founded": "Year if mentioned, else 'Not stated'",
    "headquarters": "Location if mentioned, else 'Not stated'"
  },
  "business_model": {
    "type": "B2B/B2C/B2B2C/Marketplace/etc",
    "primary_offering": "Main product or service category",
    "revenue_model": "How they make money (subscription, transaction fee, etc)"
  },
  "products_and_services": [
    {
      "name": "Product/Service name",
      "description": "What it does",
      "target_user": "Who uses it"
    }
  ],
  "target_customers": {
    "segments": ["List of customer segments"],
    "company_sizes": ["SMB", "Mid-market", "Enterprise", etc],
    "industries": ["Industries served if mentioned"],
    "use_cases": ["Primary use cases"]
  },
  "value_proposition": {
    "primary_benefit": "Main benefit to customers",
    "differentiators": ["What makes them different"],
    "proof_points": ["Customer counts, case studies, etc"]
  },
  "trust_and_safety": {
    "certifications": ["SOC2, ISO, etc if mentioned"],
    "compliance": ["GDPR, HIPAA, etc if mentioned"],
    "security_features": ["Encryption, etc if mentioned"]
  },
  "pricing": {
    "model": "Subscription/Usage/One-time/etc",
    "tiers": ["Free", "Pro", "Enterprise", etc if mentioned],
    "transparency": "Public/Contact Sales/Not stated"
  },
  "confidence_notes": {
    "high_confidence": ["Fields with clear evidence"],
    "medium_confidence": ["Fields with some evidence"],
    "low_confidence": ["Fields inferred or uncertain"]
  }
}

Return ONLY valid JSON. No explanations outside the JSON."""

        user_prompt = f"""Analyze this website data and create a structured Knowledge Base:

{context}

Remember:
- Only include what is explicitly stated or clearly implied
- Mark uncertain items in confidence_notes
- Use neutral, factual language
- Do not invent or assume

Return the Knowledge Base as JSON:"""

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0,  # Deterministic output
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        print(f"  ✅ GPT KB response received")
        return result
    
    def _validate_and_score(self, kb_response: Dict, crawl_data: Dict) -> Dict:
        """Validate KB and add confidence scores"""
        
        # Calculate overall confidence based on data availability
        pages_crawled = crawl_data['metadata'].get('pages_successful', 0)
        raw_content = crawl_data.get('raw_content', {})
        total_content = sum(len(v) for v in raw_content.values() if v)
        
        # Confidence scoring
        if pages_crawled >= 5 and total_content > 10000:
            overall_confidence = "HIGH"
            confidence_score = 0.85
        elif pages_crawled >= 3 and total_content > 5000:
            overall_confidence = "MEDIUM"
            confidence_score = 0.65
        else:
            overall_confidence = "LOW"
            confidence_score = 0.4
        
        # Build final KB structure
        kb = {
            "knowledge_base": kb_response,
            "metadata": {
                "created_at": datetime.now(timezone.utc).isoformat(),
                "source": "gpt_refined",
                "model": "gpt-4o",
                "temperature": 0,
                "pages_analyzed": pages_crawled,
                "total_content_chars": total_content,
                "overall_confidence": overall_confidence,
                "confidence_score": confidence_score,
                "cache_used": False,  # CRITICAL: Always fresh
            },
            "field_confidence": self._score_fields(kb_response),
            "raw_data_summary": {
                "domain": crawl_data['metadata']['domain'],
                "crawl_timestamp": crawl_data['metadata']['crawl_timestamp'],
                "sections_with_content": [k for k, v in raw_content.items() if v],
            }
        }
        
        return kb
    
    def _score_fields(self, kb: Dict) -> Dict[str, str]:
        """Score confidence for each KB field"""
        scores = {}
        
        def score_value(value):
            if not value:
                return "MISSING"
            if isinstance(value, str):
                if "not stated" in value.lower() or "not mentioned" in value.lower():
                    return "MISSING"
                if len(value) < 10:
                    return "PARTIAL"
                return "VERIFIED"
            if isinstance(value, list):
                if len(value) == 0:
                    return "MISSING"
                if len(value) < 2:
                    return "PARTIAL"
                return "VERIFIED"
            return "VERIFIED"
        
        # Score top-level sections
        for section, content in kb.items():
            if isinstance(content, dict):
                for field, value in content.items():
                    scores[f"{section}.{field}"] = score_value(value)
            elif isinstance(content, list):
                scores[section] = "VERIFIED" if len(content) > 0 else "MISSING"
        
        return scores
    
    def _create_fallback_kb(self, crawl_data: Dict) -> Dict:
        """Create basic KB when GPT is unavailable"""
        domain = crawl_data['metadata']['domain']
        extracted = crawl_data.get('extracted_data', {})
        
        return {
            "knowledge_base": {
                "company_overview": {
                    "name": extracted.get('title', domain.split('.')[0].capitalize()),
                    "tagline": extracted.get('meta_description', '')[:200],
                    "description": "Company information could not be fully analyzed. Manual review recommended.",
                    "founded": "Not stated",
                    "headquarters": "Not stated"
                },
                "business_model": {
                    "type": "Not determined",
                    "primary_offering": "Not determined",
                    "revenue_model": "Not determined"
                },
                "products_and_services": [],
                "target_customers": {
                    "segments": [],
                    "company_sizes": [],
                    "industries": [],
                    "use_cases": []
                },
                "value_proposition": {
                    "primary_benefit": "Not determined",
                    "differentiators": [],
                    "proof_points": extracted.get('social_proof', [])
                },
                "trust_and_safety": {
                    "certifications": extracted.get('trust_signals', []),
                    "compliance": [],
                    "security_features": []
                },
                "pricing": {
                    "model": "Not determined",
                    "tiers": [],
                    "transparency": "Not stated"
                },
                "confidence_notes": {
                    "high_confidence": [],
                    "medium_confidence": [],
                    "low_confidence": ["All fields - GPT analysis unavailable"]
                }
            },
            "metadata": {
                "created_at": datetime.now(timezone.utc).isoformat(),
                "source": "fallback",
                "overall_confidence": "LOW",
                "confidence_score": 0.2,
                "pages_analyzed": crawl_data['metadata'].get('pages_successful', 0),
                "cache_used": False,
            },
            "field_confidence": {},
            "raw_data_summary": {
                "domain": domain,
                "crawl_timestamp": crawl_data['metadata']['crawl_timestamp'],
            }
        }


# Singleton
knowledge_engine = RadiusKnowledgeEngine()
