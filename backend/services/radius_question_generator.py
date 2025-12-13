"""
RADIUS PHASE 4: Intelligent Question Framework Generation
Generates business-specific visibility questions based on Knowledge Base
"""
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from openai import OpenAI

class RadiusQuestionGenerator:
    """
    PHASE 4: Generate intelligent, business-specific questions
    
    Questions must:
    ✅ Emerge from the company's actual products
    ✅ Reflect real user intent
    ✅ Consider trust factors
    ✅ Include competitive context
    ✅ Match common decision-making moments
    
    Questions must NOT:
    ❌ Be generic or templated
    ❌ Be identical across different business types
    """
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.openai_key) if self.openai_key else None
    
    def generate_questions(self, knowledge_base: Dict, num_questions: int = 15) -> Dict[str, Any]:
        """
        Generate business-specific visibility questions from Knowledge Base
        
        Returns categorized questions with metadata
        """
        if not self.client:
            self.openai_key = os.getenv("OPENAI_API_KEY")
            if self.openai_key:
                self.client = OpenAI(api_key=self.openai_key)
        
        if not self.client:
            print("⚠️ OpenAI not available - using fallback questions")
            return self._create_fallback_questions(knowledge_base)
        
        print("❓ PHASE 4: Generating intelligent questions...")
        
        try:
            # Extract KB content
            kb = knowledge_base.get('knowledge_base', {})
            
            # Generate questions via GPT
            questions = self._call_gpt_for_questions(kb, num_questions)
            
            # Add metadata and structure
            result = self._structure_questions(questions, kb)
            
            print(f"❓ PHASE 4 Complete: {len(result['questions'])} questions generated")
            return result
            
        except Exception as e:
            print(f"❌ Question generation error: {str(e)}")
            return self._create_fallback_questions(knowledge_base)
    
    def _call_gpt_for_questions(self, kb: Dict, num_questions: int) -> List[Dict]:
        """Generate questions using GPT"""
        
        # Build KB summary for context
        kb_summary = self._summarize_kb(kb)
        
        system_prompt = """You are a question designer for the Radius AI Visibility Engine.

Your task is to generate REALISTIC questions that real users would ask LLMs about this company.

CRITICAL REQUIREMENTS:
1. Questions must be SPECIFIC to this company's business model
2. Questions must reflect how REAL USERS search for solutions
3. Questions must be NEUTRAL (not leading or biased)
4. Questions must cover different user intents:
   - Discovery ("What is the best X for Y?")
   - Comparison ("How does X compare to Y?")
   - Trust ("Is X secure/reliable?")
   - Decision ("Should I use X for my needs?")
   - Problem-solving ("How do I solve X problem?")

QUESTION CATEGORIES:
1. DISCOVERY - Finding solutions in the category
2. COMPARISON - Comparing against alternatives
3. TRUST - Security, reliability, compliance questions
4. USE_CASE - Specific use case fit questions
5. DECISION - Final buying decision questions

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "id": "q1",
      "text": "The question text",
      "category": "DISCOVERY|COMPARISON|TRUST|USE_CASE|DECISION",
      "user_intent": "What the user is trying to accomplish",
      "expected_mention": "How the company should ideally appear in the answer",
      "business_relevance": "Why this question matters for visibility"
    }
  ]
}

EXAMPLES OF BAD QUESTIONS (DO NOT GENERATE):
- "What is [Company]?" (too direct, not how users search)
- "Is [Company] good?" (too vague)
- Generic questions that work for any company

EXAMPLES OF GOOD QUESTIONS:
- For a payment processor: "What payment gateway has the best developer API for startups?"
- For a CRM: "What CRM is best for sales teams under 50 people?"
- For a business school: "What are the best startup-focused MBA programs in India?"

Return ONLY valid JSON."""

        user_prompt = f"""Generate {num_questions} visibility test questions for this company:

{kb_summary}

Requirements:
1. Questions must be specific to THIS company's business model
2. Include a mix of all 5 categories (DISCOVERY, COMPARISON, TRUST, USE_CASE, DECISION)
3. Questions should be what real users would type into ChatGPT/Claude/Perplexity
4. Do NOT use the company name in discovery questions (users don't know about them yet)
5. Include some questions where competitors might dominate

Generate {num_questions} unique, business-relevant questions:"""

        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,  # Slight creativity for diverse questions
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get('questions', [])
    
    def _summarize_kb(self, kb: Dict) -> str:
        """Create a summary of KB for question generation"""
        parts = []
        
        # Company overview
        overview = kb.get('company_overview', {})
        parts.append(f"COMPANY: {overview.get('name', 'Unknown')}")
        parts.append(f"TAGLINE: {overview.get('tagline', 'N/A')}")
        parts.append(f"DESCRIPTION: {overview.get('description', 'N/A')}")
        
        # Business model
        biz = kb.get('business_model', {})
        parts.append(f"\nBUSINESS TYPE: {biz.get('type', 'N/A')}")
        parts.append(f"PRIMARY OFFERING: {biz.get('primary_offering', 'N/A')}")
        parts.append(f"REVENUE MODEL: {biz.get('revenue_model', 'N/A')}")
        
        # Products
        products = kb.get('products_and_services', [])
        if products:
            parts.append("\nPRODUCTS/SERVICES:")
            for p in products[:5]:
                parts.append(f"  - {p.get('name', 'N/A')}: {p.get('description', 'N/A')[:100]}")
        
        # Target customers
        target = kb.get('target_customers', {})
        if target.get('segments'):
            parts.append(f"\nTARGET SEGMENTS: {', '.join(target['segments'][:5])}")
        if target.get('industries'):
            parts.append(f"INDUSTRIES: {', '.join(target['industries'][:5])}")
        if target.get('use_cases'):
            parts.append(f"USE CASES: {', '.join(target['use_cases'][:5])}")
        
        # Value prop
        value = kb.get('value_proposition', {})
        if value.get('primary_benefit'):
            parts.append(f"\nPRIMARY BENEFIT: {value['primary_benefit']}")
        if value.get('differentiators'):
            parts.append(f"DIFFERENTIATORS: {', '.join(value['differentiators'][:3])}")
        
        # Trust
        trust = kb.get('trust_and_safety', {})
        if trust.get('certifications'):
            parts.append(f"\nCERTIFICATIONS: {', '.join(trust['certifications'])}")
        
        # Pricing
        pricing = kb.get('pricing', {})
        parts.append(f"\nPRICING MODEL: {pricing.get('model', 'N/A')}")
        if pricing.get('tiers'):
            parts.append(f"TIERS: {', '.join(pricing['tiers'])}")
        
        return '\n'.join(parts)
    
    def _structure_questions(self, questions: List[Dict], kb: Dict) -> Dict:
        """Structure questions with metadata"""
        
        company_name = kb.get('company_overview', {}).get('name', 'Unknown')
        
        # Categorize questions
        categorized = {
            'DISCOVERY': [],
            'COMPARISON': [],
            'TRUST': [],
            'USE_CASE': [],
            'DECISION': []
        }
        
        for q in questions:
            cat = q.get('category', 'DISCOVERY')
            if cat in categorized:
                categorized[cat].append(q)
        
        return {
            'company_name': company_name,
            'questions': questions,
            'questions_by_category': categorized,
            'metadata': {
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'total_questions': len(questions),
                'categories': {cat: len(qs) for cat, qs in categorized.items()},
                'source': 'gpt_generated',
                'cache_used': False,
            }
        }
    
    def _create_fallback_questions(self, knowledge_base: Dict) -> Dict:
        """Create basic questions when GPT unavailable"""
        kb = knowledge_base.get('knowledge_base', {})
        company = kb.get('company_overview', {}).get('name', 'this company')
        offering = kb.get('business_model', {}).get('primary_offering', 'services')
        
        questions = [
            {
                "id": "q1",
                "text": f"What are the best {offering} providers?",
                "category": "DISCOVERY",
                "user_intent": "Finding options",
                "expected_mention": "Company should appear as an option",
                "business_relevance": "Core visibility"
            },
            {
                "id": "q2",
                "text": f"How do I choose a {offering} solution?",
                "category": "DECISION",
                "user_intent": "Decision making",
                "expected_mention": "Company criteria should match",
                "business_relevance": "Decision influence"
            },
            {
                "id": "q3",
                "text": f"What should I look for in a {offering}?",
                "category": "USE_CASE",
                "user_intent": "Understanding requirements",
                "expected_mention": "Features should align",
                "business_relevance": "Feature visibility"
            }
        ]
        
        return {
            'company_name': company,
            'questions': questions,
            'questions_by_category': {
                'DISCOVERY': [questions[0]],
                'COMPARISON': [],
                'TRUST': [],
                'USE_CASE': [questions[2]],
                'DECISION': [questions[1]]
            },
            'metadata': {
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'total_questions': len(questions),
                'source': 'fallback',
                'cache_used': False,
            }
        }


# Singleton
question_generator = RadiusQuestionGenerator()
