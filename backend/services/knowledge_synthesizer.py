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
        Generate complete Knowledge Base from scraped website content
        Returns structured KB ready for UI prefill
        """
        if not self.client:
            return self._fallback_knowledge_base(scraped_data)
        
        try:
            # Build context from scraped pages
            context = self._build_context(scraped_data)
            
            # Generate structured knowledge using GPT
            system_prompt = self._get_system_prompt()
            user_prompt = self._get_user_prompt(context, scraped_data['domain'])
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Parse GPT response
            knowledge = json.loads(response.choices[0].message.content)
            
            # Structure for backend
            return {
                "company_description": {
                    "overview": knowledge.get("company_description", {}).get("overview", ""),
                    "products_services": knowledge.get("company_description", {}).get("products_and_services", ""),
                    "target_customers": knowledge.get("company_description", {}).get("target_customers", ""),
                    "positioning": knowledge.get("company_description", {}).get("positioning", ""),
                    "is_ai_generated": True,
                    "generated_from": scraped_data.get('domain', 'website'),
                },
                "brand_guidelines": {
                    "tone": knowledge.get("brand_guidelines", {}).get("brand_tone", "Professional"),
                    "words_to_prefer": knowledge.get("brand_guidelines", {}).get("preferred_words", [])[:10],
                    "words_to_avoid": knowledge.get("brand_guidelines", {}).get("words_to_avoid", [])[:10],
                    "dos": knowledge.get("brand_guidelines", {}).get("style_rules", [])[:5],
                    "donts": [],
                    "is_ai_extracted": True,
                },
                "evidence": [],
                "metadata": {
                    "source": "ai_generated",
                    "generated_from": scraped_data.get('domain', 'website'),
                    "pages_analyzed": scraped_data.get('total_pages', 0)
                }
            }
        
        except Exception as e:
            print(f"GPT synthesis error: {str(e)}")
            return self._fallback_knowledge_base(scraped_data)
    
    def _build_context(self, scraped_data: Dict) -> str:
        """Build rich context from scraped pages"""
        context_parts = []
        
        # Add page summaries
        for page in scraped_data.get('page_summaries', []):
            page_type = page.get('type', 'general')
            content = page.get('content', '')[:1000]  # Limit per page
            
            context_parts.append(f"[{page_type.upper()} PAGE]\n{content}\n")
        
        # Add raw text if page summaries are empty
        if not context_parts and scraped_data.get('raw_text'):
            context_parts.append(scraped_data['raw_text'][:3000])
        
        return '\n\n'.join(context_parts)
    
    def _get_system_prompt(self) -> str:
        """System prompt for GPT knowledge synthesis"""
        return """You are an expert brand analyst specializing in extracting company positioning and brand voice from website content.

Your task: Analyze the provided website content and generate a structured Knowledge Base.

CRITICAL RULES:
1. Base ALL outputs ONLY on the provided content - DO NOT hallucinate facts
2. If information is unclear, infer conservatively
3. Be specific and factual - avoid generic marketing speak
4. Extract actual tone and voice from the content
5. Identify concrete differentiators, not vague claims
6. Return ONLY valid JSON in the exact structure requested

The output will be user-editable, so prioritize accuracy over completeness."""
    
    def _get_user_prompt(self, context: str, domain: str) -> str:
        """User prompt with context and structure requirements"""
        return f"""Analyze this website content for {domain} and generate a structured Knowledge Base.

WEBSITE CONTENT:
{context}

Generate a JSON response with this EXACT structure:

{{
  "company_description": {{
    "overview": "2-3 sentences describing what the company does, who they serve, and their mission. Be specific and factual.",
    "products_and_services": "Concrete description of their main offerings. What do they actually provide?",
    "target_customers": "Who are their ideal customers? Be specific about industries, company sizes, roles, or demographics.",
    "positioning": "How do they position themselves in the market? What makes them unique?"
  }},
  "brand_guidelines": {{
    "brand_tone": "Choose ONE: Professional, Friendly, Bold, Technical, Formal, Casual",
    "preferred_words": ["word1", "word2", "word3", "word4", "word5"],
    "words_to_avoid": ["word1", "word2", "word3"],
    "style_rules": [
      "Do: Clear, specific writing rule based on their style",
      "Do: Another concrete style guideline",
      "Don't: What they seem to avoid in their communication"
    ]
  }}
}}

Base everything on the actual content provided. Be factual and specific."""
    
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
