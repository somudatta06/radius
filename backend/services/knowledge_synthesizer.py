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
