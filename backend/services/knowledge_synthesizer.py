"""
GPT-Powered Knowledge Base Synthesizer
Transforms scraped website content into structured company knowledge
"""
import os
import json
from typing import Dict, Optional
from openai import OpenAI

class KnowledgeSynthesizer:
    """Uses GPT to synthesize structured knowledge from website content"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_key:
            print("Warning: OPENAI_API_KEY not configured")
            self.client = None
        else:
            self.client = OpenAI(api_key=self.openai_key)
    
    def synthesize_knowledge_base(self, scraped_data: Dict) -> Dict:
        """
        Generate HIGH-QUALITY Knowledge Base using structured GPT reasoning
        Returns validated, cohesive business description
        """
        if not self.client:
            print("⚠️  No OpenAI client - using fallback")
            return self._fallback_knowledge_base(scraped_data)
        
        try:
            corpus = scraped_data.get('structured_corpus', {})
            domain = scraped_data.get('domain', 'website')
            
            # Validate we have enough content
            total_content = sum(len(v) for v in corpus.values())
            if total_content < 200:
                print(f"⚠️  Insufficient content ({total_content} chars) - using fallback")
                return self._fallback_knowledge_base(scraped_data)
            
            print(f"🤖 Synthesizing knowledge with GPT (content: {total_content} chars)...")
            
            # Generate structured knowledge using GPT WITH REASONING
            system_prompt = self._get_reasoning_system_prompt()
            user_prompt = self._get_structured_user_prompt(corpus, domain)
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=3000,  # Increased for detailed output
                response_format={"type": "json_object"}
            )
            
            # Parse GPT response
            raw_output = response.choices[0].message.content
            print(f"📄 GPT response length: {len(raw_output)} chars")
            
            knowledge = json.loads(raw_output)
            
            # QUALITY VALIDATION (reject low-quality output)
            if not self._validate_quality(knowledge):
                print("❌ Quality validation failed - using fallback")
                return self._fallback_knowledge_base(scraped_data)
            
            # Transform structured GPT output into KB format
            formatted_kb = self._format_knowledge_base(knowledge, domain, scraped_data.get('total_pages', 0))
            
            print("✅ High-quality KB generated and validated")
            return formatted_kb
        
        except Exception as e:
            print(f"❌ GPT synthesis error: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._fallback_knowledge_base(scraped_data)
    
    def _get_reasoning_system_prompt(self) -> str:
        """High-quality reasoning-first system prompt"""
        return """You are a senior business analyst and brand strategist with deep expertise in company positioning.

Your task: INFER and SYNTHESIZE a high-quality company description from website summaries.

CRITICAL REQUIREMENTS:
1. UNDERSTAND the business - don't just summarize text
2. REASON about what makes this company unique
3. IDENTIFY patterns in their positioning and messaging
4. WRITE like a professional analyst, not a web scraper
5. Be FACTUAL - only state what is clearly implied by the content
6. Use CONFIDENT, clear language - no placeholders or "please describe"
7. If uncertain, write "Not explicitly stated, but appears to be: [inference]"

OUTPUT QUALITY STANDARDS:
- Each section must be cohesive and well-written
- Minimum 50 words per major section
- No raw website text dumps
- No placeholder phrases
- Professional business profile quality

You are NOT copying website text - you are SYNTHESIZING a business description."""

    def _get_structured_user_prompt(self, corpus: Dict, domain: str) -> str:
        """Structured reasoning prompt with clear sections"""
        return f"""Analyze this company's website content and produce a COMPLETE, PROFESSIONAL company profile.

Domain: {domain}

WEBSITE SUMMARIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOMEPAGE:
{corpus.get('homepage_summary', 'Not available')}

ABOUT PAGE:
{corpus.get('about_summary', 'Not available')}

OFFERINGS/PRODUCTS:
{corpus.get('offerings_summary', 'Not available')}

POSITIONING SIGNALS:
{corpus.get('positioning_clues', 'Not available')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now SYNTHESIZE a complete company description using this EXACT JSON structure:

{{
  "company_overview": {{
    "what_the_company_is": "Clear 2-3 sentence description of what this company does and its core purpose",
    "core_mission": "The fundamental problem they solve or value they create",
    "where_it_operates": "Geographic scope, market segment, or operational model"
  }},
  "products_and_services": {{
    "primary_offerings": ["Offering 1", "Offering 2", "Offering 3"],
    "delivery_model": "How these offerings are delivered (online, in-person, hybrid, B2B, B2C, etc.)",
    "key_outcomes_for_users": ["Outcome 1", "Outcome 2", "Outcome 3"]
  }},
  "target_customers": {{
    "primary_audience": "Who is the main customer segment?",
    "secondary_audience": "Any secondary customer group, or 'None identified'",
    "customer_needs_solved": ["Need 1", "Need 2", "Need 3"]
  }},
  "market_positioning": {{
    "category": "What category/industry is this company in?",
    "how_it_is_different": "What makes this company distinct from alternatives?",
    "alternatives_it_replaces": ["Alternative 1", "Alternative 2"] or ["None explicitly stated"]
  }},
  "key_differentiators": [
    "Differentiator 1 - be specific",
    "Differentiator 2 - be specific",
    "Differentiator 3 - be specific"
  ],
  "brand_tone_and_voice": {{
    "tone": "Professional | Academic | Founder-led | Bold | Technical | Friendly",
    "writing_style_rules": [
      "Rule 1 based on actual content style",
      "Rule 2 based on actual content style"
    ],
    "phrases_to_avoid": ["Generic phrase 1", "Generic phrase 2"]
  }}
}}

IMPORTANT:
- Write full, cohesive descriptions - NOT bullet points or fragments
- Base everything on the provided content
- If uncertain, state "Appears to be [inference based on context]"
- No placeholder text like "Please describe..." - write actual content
- Ensure total output is substantial (aim for 500+ words across all fields)"""
    
    def _validate_quality(self, knowledge: Dict) -> bool:
        """
        Quality gate - reject low-quality GPT output
        Returns True only if output meets professional standards
        """
        try:
            # Check company_overview exists and has content
            overview = knowledge.get('company_overview', {})
            if not overview.get('what_the_company_is') or len(overview.get('what_the_company_is', '')) < 50:
                print("❌ Validation failed: Company overview too short or missing")
                return False
            
            # Check products section exists
            products = knowledge.get('products_and_services', {})
            if not products.get('primary_offerings') or len(products.get('primary_offerings', [])) == 0:
                print("❌ Validation failed: No products/offerings listed")
                return False
            
            # Check for placeholder language
            all_text = json.dumps(knowledge).lower()
            placeholder_phrases = [
                'please describe',
                'please edit',
                'not available',
                'coming soon',
                'lorem ipsum',
                'placeholder'
            ]
            for phrase in placeholder_phrases:
                if phrase in all_text:
                    print(f"❌ Validation failed: Contains placeholder phrase '{phrase}'")
                    return False
            
            # Check minimum total word count
            total_words = len(all_text.split())
            if total_words < 100:
                print(f"❌ Validation failed: Total content too short ({total_words} words)")
                return False
            
            print(f"✅ Quality validation passed ({total_words} words)")
            return True
        
        except Exception as e:
            print(f"❌ Validation error: {str(e)}")
            return False
    
    def _format_knowledge_base(self, knowledge: Dict, domain: str, pages_analyzed: int) -> Dict:
        """
        Transform structured GPT output into Knowledge Base format
        Combines multiple fields into cohesive sections
        """
        overview_data = knowledge.get('company_overview', {})
        products_data = knowledge.get('products_and_services', {})
        customers_data = knowledge.get('target_customers', {})
        positioning_data = knowledge.get('market_positioning', {})
        differentiators = knowledge.get('key_differentiators', [])
        brand_data = knowledge.get('brand_tone_and_voice', {})
        
        # Build cohesive overview section
        overview_text = f"{overview_data.get('what_the_company_is', '')}\n\n"
        overview_text += f"Mission: {overview_data.get('core_mission', '')}\n\n"
        overview_text += f"Operations: {overview_data.get('where_it_operates', '')}"
        
        # Build products section
        products_text = f"Primary Offerings:\n"
        for offering in products_data.get('primary_offerings', []):
            products_text += f"• {offering}\n"
        products_text += f"\nDelivery: {products_data.get('delivery_model', '')}\n\n"
        products_text += "Key Outcomes:\n"
        for outcome in products_data.get('key_outcomes_for_users', []):
            products_text += f"• {outcome}\n"
        
        # Build target customers section
        customers_text = f"Primary Audience: {customers_data.get('primary_audience', '')}\n\n"
        if customers_data.get('secondary_audience'):
            customers_text += f"Secondary Audience: {customers_data.get('secondary_audience', '')}\n\n"
        customers_text += "Customer Needs Addressed:\n"
        for need in customers_data.get('customer_needs_solved', []):
            customers_text += f"• {need}\n"
        
        # Build positioning section
        positioning_text = f"Category: {positioning_data.get('category', '')}\n\n"
        positioning_text += f"Differentiation: {positioning_data.get('how_it_is_different', '')}\n\n"
        if positioning_data.get('alternatives_it_replaces'):
            positioning_text += "Alternatives Replaced:\n"
            for alt in positioning_data.get('alternatives_it_replaces', []):
                positioning_text += f"• {alt}\n"
        
        # Add differentiators to positioning
        if differentiators:
            positioning_text += "\nKey Differentiators:\n"
            for diff in differentiators:
                positioning_text += f"• {diff}\n"
        
        return {
            "company_description": {
                "overview": overview_text.strip(),
                "products_services": products_text.strip(),
                "target_customers": customers_text.strip(),
                "positioning": positioning_text.strip(),
                "is_ai_generated": True,
                "generated_from": domain,
            },
            "brand_guidelines": {
                "tone": brand_data.get('tone', 'Professional'),
                "words_to_prefer": [],  # Intentionally empty - user should fill
                "words_to_avoid": brand_data.get('phrases_to_avoid', [])[:5],
                "dos": brand_data.get('writing_style_rules', [])[:5],
                "donts": [],
                "is_ai_extracted": True,
            },
            "evidence": [],
            "metadata": {
                "source": "ai_generated_validated",
                "generated_from": domain,
                "pages_analyzed": pages_analyzed,
                "quality": "validated"
            }
        }
    
    def _fallback_knowledge_base(self, scraped_data: Dict) -> Dict:
        """Fallback KB when GPT is unavailable"""
        domain = scraped_data.get('domain', 'your company')
        raw_text = scraped_data.get('raw_text', '')[:500]
        
        return {
            "company_description": {
                "overview": f"A company operating at {domain}. {raw_text[:200] if raw_text else 'Please edit this description with your company details.'}",
                "products_services": "Please describe your products and services.",
                "target_customers": "Please describe your target customers.",
                "positioning": "Please describe your market positioning.",
                "is_ai_generated": False,
                "generated_from": domain,
            },
            "brand_guidelines": {
                "tone": "Professional",
                "words_to_prefer": [],
                "words_to_avoid": [],
                "dos": ["Use clear, specific language"],
                "donts": [],
                "is_ai_extracted": False,
            },
            "evidence": [],
            "metadata": {
                "source": "fallback",
                "generated_from": domain,
                "pages_analyzed": 0
            }
        }
