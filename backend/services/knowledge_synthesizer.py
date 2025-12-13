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
        """Advanced reasoning engine prompt for implicit business understanding"""
        return """You are a senior product analyst, business researcher, and AI systems architect.

Your task: Reconstruct a COMPLETE, ACCURATE company knowledge base from website content — even when information is implicit, narrative-driven, or philosophy-based.

YOU ARE NOT A SCRAPER. YOU ARE NOT A SUMMARIZER. YOU ARE A REASONING ENGINE.

CRITICAL PERMISSIONS:
✅ You ARE ALLOWED and REQUIRED to INFER
✅ You MUST reason about implicit information
✅ You MUST reconstruct business models from signals

REASONING METHODOLOGY:
1. Extract signals: What problem are they solving? Who are they speaking to? What actions do they encourage?
2. Identify business type: Education? SaaS? Community? Marketplace? Hybrid?
3. Infer business model from: curriculum structure, pricing, cohorts, applications, outcomes, philosophy
4. Reconstruct target audience from: language tone, pain points addressed, success metrics
5. Determine positioning from: comparison language, alternative approaches mentioned

INFERENCE RULES:
- If information is IMPLIED through context → infer logically and state: "Inferred from website context: [reasoning]"
- If something is SHOWN through examples → extract the pattern
- If philosophy suggests approach → deduce the business model

ABSOLUTE PROHIBITIONS:
❌ Never leave a field empty
❌ Never output placeholders ("Please describe...", "N/A", "Not available")
❌ Never ask user to fill in information
❌ Never copy raw website text verbatim
❌ Never hallucinate facts not supported by content

WRITING STANDARDS:
- Write like a human business analyst
- Neutral, confident, non-marketing tone
- No buzzwords unless clearly implied by content
- Substantive content: aim for 500+ words total
- Each section must be complete and informative

QUALITY GATE:
Before outputting, verify:
- Every field has substantive content (not placeholders)
- Total output ≥ 300 words
- The summary alone could explain the business to an investor
- Confidence levels are stated clearly

Your output will be marked as "ai_generated_inferred" with transparency about inference."""

    def _get_structured_user_prompt(self, corpus: Dict, domain: str) -> str:
        """Advanced reasoning prompt that forces signal extraction and inference"""
        return f"""Domain: {domain}

WEBSITE CONTENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOMEPAGE:
{corpus.get('homepage_summary', 'Limited content')}

ABOUT PAGE:
{corpus.get('about_summary', 'Limited content')}

OFFERINGS/PRODUCTS:
{corpus.get('offerings_summary', 'Limited content')}

POSITIONING SIGNALS:
{corpus.get('positioning_clues', 'Limited content')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERNAL REASONING STEP (DO NOT OUTPUT THIS):
Before generating the JSON, internally answer:
1. What problem is this organization solving?
2. Who is the website speaking to? (language, tone, promises)
3. What is the business model? (education, SaaS, marketplace, community, cohort-based, etc.)
4. What action is the user encouraged to take? (apply, buy, join, learn, etc.)
5. How is success defined for the user? (career outcomes, skills, revenue, connections, etc.)
6. What alternatives exist and how does this differ?

GENERATE COMPLETE KNOWLEDGE BASE AS JSON:

{{
  "company_overview": {{
    "summary": "2-3 sentences: what this company/organization is, what it does, and its core purpose. If not explicitly stated, infer from: page structure, language, user journey, outcomes promised.",
    "mission": "The fundamental problem solved or value created. Infer from: pain points addressed, transformation promised, philosophy stated.",
    "business_type": "Category: e.g., 'Alternative business school', 'Cohort-based learning program', 'B2B SaaS platform', 'Community marketplace'. Infer from: application processes, pricing structure, delivery format.",
    "operating_model": "How it operates: 'Cohort-based online program', 'Subscription SaaS', 'Membership community', etc. Infer from: enrollment, pricing, duration, format."
  }},
  "products_and_services": {{
    "offerings": ["Primary offering 1", "Primary offering 2", "Primary offering 3"],
    "delivery_format": "Detailed description of HOW it's delivered: online/offline, synchronous/asynchronous, cohort-based, self-paced, apprenticeship, etc. Infer from: program structure, timeline, interaction model.",
    "learning_or_value_outcomes": ["Outcome 1 users achieve", "Outcome 2", "Outcome 3"]
  }},
  "target_customers": {{
    "primary_audience": "Specific description: not just 'entrepreneurs' but 'early-stage founders building their first company' or 'professionals transitioning to product roles'. Infer from: language complexity, prerequisites, testimonials, pricing.",
    "secondary_audience": "Any additional segment served, or 'None clearly identified'.",
    "customer_pain_points": ["Specific pain 1 this solves", "Pain 2", "Pain 3"]
  }},
  "market_positioning": {{
    "category": "Primary category/industry. If hybrid, state both.",
    "positioning_statement": "How this company positions itself vs. alternatives. Infer from: comparison language, 'unlike traditional X' statements, unique approach claims.",
    "how_it_differs_from_traditional_alternatives": "Concrete differentiation: what traditional alternatives do vs. what this does differently. Infer from: philosophy, approach, structure, outcomes focus."
  }},
  "credibility_and_signals": {{
    "founding_story_or_philosophy": "Founder background, origin story, or core philosophy if mentioned. Helps explain 'why this exists'.",
    "proof_points": ["Specific credential 1", "Outcome stat 2", "Social proof 3"],
    "institutional_or_social_signals": ["Signal 1: e.g., 'backed by Y Combinator'", "Signal 2: 'featured in TechCrunch'", "Signal 3: '500+ alumni'"]
  }},
  "confidence_metadata": {{
    "explicit_information_ratio": "Estimate % of output based on explicit website statements",
    "inferred_information_ratio": "Estimate % of output inferred from context/signals",
    "notes_on_inference": "Brief note on what was most inferred and why confidence is high/medium"
  }}
}}

CRITICAL RULES:
1. Every field MUST have substantive content - no "N/A", no placeholders
2. If information is not explicit, use: "Inferred from [signal]: [reasoning]"
3. Write complete sentences and paragraphs
4. Minimum 400 words total across all fields
5. Output ONLY valid JSON matching the schema exactly"""
    
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
        Transform reasoning-based GPT output into Knowledge Base format
        Preserves inference metadata and confidence levels
        """
        overview_data = knowledge.get('company_overview', {})
        products_data = knowledge.get('products_and_services', {})
        customers_data = knowledge.get('target_customers', {})
        positioning_data = knowledge.get('market_positioning', {})
        credibility_data = knowledge.get('credibility_and_signals', {})
        confidence_data = knowledge.get('confidence_metadata', {})
        
        # Build cohesive overview section
        overview_text = f"{overview_data.get('summary', '')}\n\n"
        overview_text += f"Mission: {overview_data.get('mission', '')}\n\n"
        overview_text += f"Business Type: {overview_data.get('business_type', '')}\n\n"
        overview_text += f"Operating Model: {overview_data.get('operating_model', '')}"
        
        # Build products section with delivery format emphasis
        products_text = "Primary Offerings:\n"
        for offering in products_data.get('offerings', []):
            products_text += f"• {offering}\n"
        products_text += f"\nDelivery Format:\n{products_data.get('delivery_format', '')}\n\n"
        products_text += "Learning/Value Outcomes:\n"
        for outcome in products_data.get('learning_or_value_outcomes', []):
            products_text += f"• {outcome}\n"
        
        # Build target customers section
        customers_text = f"Primary Audience:\n{customers_data.get('primary_audience', '')}\n\n"
        if customers_data.get('secondary_audience') and customers_data.get('secondary_audience') != 'None clearly identified':
            customers_text += f"Secondary Audience:\n{customers_data.get('secondary_audience', '')}\n\n"
        customers_text += "Pain Points Addressed:\n"
        for pain in customers_data.get('customer_pain_points', []):
            customers_text += f"• {pain}\n"
        
        # Build positioning section with differentiation emphasis
        positioning_text = f"Category: {positioning_data.get('category', '')}\n\n"
        positioning_text += f"Positioning:\n{positioning_data.get('positioning_statement', '')}\n\n"
        positioning_text += f"How It Differs:\n{positioning_data.get('how_it_differs_from_traditional_alternatives', '')}"
        
        # Add credibility signals if present
        if credibility_data.get('founding_story_or_philosophy'):
            positioning_text += f"\n\nFounder Philosophy:\n{credibility_data.get('founding_story_or_philosophy', '')}"
        
        if credibility_data.get('proof_points'):
            positioning_text += "\n\nProof Points:\n"
            for proof in credibility_data.get('proof_points', []):
                positioning_text += f"• {proof}\n"
        
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
                "tone": "Professional",  # Can be enhanced from content analysis
                "words_to_prefer": [],  # User should fill based on their brand
                "words_to_avoid": [],
                "dos": ["Use clear, specific language", "Focus on outcomes and value"],
                "donts": [],
                "is_ai_extracted": True,
            },
            "evidence": [],
            "metadata": {
                "source": "ai_generated_inferred",
                "generated_from": domain,
                "pages_analyzed": pages_analyzed,
                "quality": "validated",
                "confidence": {
                    "explicit_ratio": confidence_data.get('explicit_information_ratio', '50%'),
                    "inferred_ratio": confidence_data.get('inferred_information_ratio', '50%'),
                    "notes": confidence_data.get('notes_on_inference', 'Analysis based on website signals and patterns')
                }
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
