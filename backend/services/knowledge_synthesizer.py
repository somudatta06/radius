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
                temperature=0,  # CRITICAL: Zero temperature for factual, deterministic output
                max_tokens=3000,
                response_format={"type": "json_object"}
            )
            
            # Parse GPT response
            raw_output = response.choices[0].message.content
            print(f"📄 GPT response length: {len(raw_output)} chars")
            
            # Debug: print first 500 chars of response
            print(f"🔍 GPT response preview: {raw_output[:500]}")
            
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
        """Context-only reasoning prompt - NO HALLUCINATION"""
        return """You are a business analyst AI with strict anti-hallucination protocols.

CRITICAL RULES (ABSOLUTE):
✅ You may ONLY use the supplied website content
✅ You may reason about implicit information from the content
✅ You MUST state confidence for each inference
❌ You may NOT add facts not supported by the content
❌ You may NOT invent customer names, funding, partnerships, or statistics
❌ You may NOT fabricate URLs, locations, or specific claims

REASONING METHODOLOGY:
1. Read the provided website content carefully
2. Extract explicit statements (confidence: high)
3. Infer business model from structure/language (confidence: medium)
4. Deduce positioning from comparisons mentioned (confidence: medium)
5. For ANY field without supporting content, mark: "Not explicitly stated in source content"

INFERENCE PERMISSION:
You MAY infer:
- Business type from: page structure, application flow, pricing model
- Target audience from: language complexity, tone, pain points addressed
- Delivery format from: program structure, enrollment process
- Value proposition from: outcomes promised, testimonials

You MUST NOT infer:
- Specific customer names or companies
- Funding amounts or investors (unless stated)
- Employee counts or revenue (unless stated)
- Partnerships or integrations (unless stated)

CONFIDENCE SCORING:
For each section, internally rate confidence:
- HIGH (0.8-1.0): Explicitly stated in content
- MEDIUM (0.5-0.7): Strongly implied by structure/patterns
- LOW (0.0-0.4): Weak signals, mark as "insufficient data"

OUTPUT REQUIREMENTS:
- Every field must be filled OR marked "Not explicitly stated"
- State reasoning: "Inferred from [signal]: [conclusion]"
- No placeholders like "Please describe..."
- Minimum 300 words total
- Include confidence metadata

SAFETY CHECK:
Before outputting, verify you have NOT:
- Invented any URLs or links
- Fabricated customer names
- Made up statistics
- Assumed partnerships
- Guessed funding or revenue

Your analysis will be verified against source content."""

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
            
            # Handle both old and new schema
            overview_text = overview.get('summary') or overview.get('what_the_company_is') or ''
            
            if not overview_text or len(overview_text) < 50:
                print(f"❌ Validation failed: Company overview too short or missing (len: {len(overview_text)})")
                print(f"   Keys found: {list(overview.keys())}")
                return False
            
            # Check products section exists (handle both schemas)
            products = knowledge.get('products_and_services', {})
            offerings = products.get('offerings') or products.get('primary_offerings') or []
            
            if not offerings or len(offerings) == 0:
                print(f"❌ Validation failed: No products/offerings listed")
                print(f"   Keys found: {list(products.keys())}")
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
        
        from datetime import datetime
        
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
                "tone": "Professional",
                "words_to_prefer": [],
                "words_to_avoid": [],
                "dos": ["Use clear, specific language", "Focus on outcomes and value"],
                "donts": [],
                "is_ai_extracted": True,
            },
            "evidence": [],
            "metadata": {
                "source": "ai_generated_context_only",
                "generated_from": domain,
                "pages_analyzed": pages_analyzed,
                "quality": "validated",
                "timestamp": datetime.utcnow().isoformat(),
                "model": "gpt-4o-mini",
                "temperature": 0,
                "confidence": {
                    "explicit_ratio": confidence_data.get('explicit_information_ratio', '50%'),
                    "inferred_ratio": confidence_data.get('inferred_information_ratio', '50%'),
                    "notes": confidence_data.get('notes_on_inference', 'Analysis based on website content only. No external data sources.')
                },
                "provenance": {
                    "data_source": "website_scraper",
                    "gpt_role": "analysis_only",
                    "verification": "content_based",
                    "hallucination_risk": "low"
                }
            }
        }
    
    def _fallback_knowledge_base(self, scraped_data: Dict) -> Dict:
        """
        Generate KB using OpenAI when scraping fails
        NEVER returns placeholder text - always generates useful content
        """
        domain = scraped_data.get('domain', 'website')
        raw_text = scraped_data.get('raw_text', '')[:500]
        
        # Try to use OpenAI to generate content based on domain
        if self.client:
            try:
                print(f"🤖 Generating KB from domain knowledge for {domain}...")
                
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": """You are a business analyst. Generate a concise company profile based on the domain name.
                        
If you know this company, provide accurate information.
If you don't know this company, make reasonable inferences from the domain name but mark them as inferences.

CRITICAL: Never use placeholder text like "Please describe..." - always provide substantive content."""},
                        {"role": "user", "content": f"""Generate a brief company profile for: {domain}

Additional context (if any): {raw_text[:300] if raw_text else 'No additional content available'}

Provide:
1. Company Overview (2-3 sentences about what this company does)
2. Products/Services (what they likely offer based on the domain/industry)
3. Target Customers (who they serve)
4. Market Positioning (how they position themselves)

Format as clear paragraphs, not placeholders."""}
                    ],
                    temperature=0.3,
                    max_tokens=800
                )
                
                generated_text = response.choices[0].message.content
                
                # Parse the response into sections
                sections = self._parse_generated_sections(generated_text)
                
                from datetime import datetime
                
                return {
                    "company_description": {
                        "overview": sections.get('overview', f"A company operating at {domain}."),
                        "products_services": sections.get('products', f"Products and services offered by {domain}."),
                        "target_customers": sections.get('customers', f"Customers served by {domain}."),
                        "positioning": sections.get('positioning', f"Market positioning of {domain}."),
                        "is_ai_generated": True,
                        "generated_from": domain,
                        "generation_note": "Generated from domain knowledge (website scraping was limited)"
                    },
                    "brand_guidelines": {
                        "tone": "Professional",
                        "words_to_prefer": [],
                        "words_to_avoid": [],
                        "dos": ["Use clear, specific language"],
                        "donts": [],
                        "is_ai_extracted": True,
                    },
                    "evidence": [],
                    "metadata": {
                        "source": "ai_generated_fallback",
                        "generated_from": domain,
                        "pages_analyzed": scraped_data.get('total_pages', 0),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }
            except Exception as e:
                print(f"❌ Fallback generation error: {str(e)}")
        
        # Ultimate fallback - domain-based content (no placeholders)
        brand_name = domain.split('.')[0].capitalize()
        
        from datetime import datetime
        
        return {
            "company_description": {
                "overview": f"{brand_name} is a company operating at {domain}. The company provides products and services in its industry sector.",
                "products_services": f"{brand_name} offers various products and services to its customers. Visit {domain} for detailed information about their offerings.",
                "target_customers": f"{brand_name} serves customers looking for solutions in their industry. The company targets businesses and individuals seeking quality services.",
                "positioning": f"{brand_name} positions itself as a trusted provider in the market, focusing on delivering value to its customers.",
                "is_ai_generated": False,
                "generated_from": domain,
                "generation_note": "Basic profile generated from domain (scraping and AI generation unavailable)"
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
                "source": "domain_fallback",
                "generated_from": domain,
                "pages_analyzed": 0,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    
    def _parse_generated_sections(self, text: str) -> Dict:
        """Parse generated text into sections"""
        sections = {
            'overview': '',
            'products': '',
            'customers': '',
            'positioning': ''
        }
        
        current_section = 'overview'
        lines = text.split('\n')
        
        for line in lines:
            line_lower = line.lower()
            
            if 'overview' in line_lower or 'company' in line_lower and ':' in line:
                current_section = 'overview'
                continue
            elif 'product' in line_lower or 'service' in line_lower and ':' in line:
                current_section = 'products'
                continue
            elif 'customer' in line_lower or 'target' in line_lower and ':' in line:
                current_section = 'customers'
                continue
            elif 'position' in line_lower or 'market' in line_lower and ':' in line:
                current_section = 'positioning'
                continue
            
            # Add content to current section
            if line.strip() and not line.startswith('#'):
                if sections[current_section]:
                    sections[current_section] += ' ' + line.strip()
                else:
                    sections[current_section] = line.strip()
        
        return sections
