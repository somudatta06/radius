"""
RADIUS PHASE 5: Multi-LLM Visibility Testing
Tests visibility across ChatGPT, Claude, Perplexity, and Gemini
"""
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from openai import OpenAI
import anthropic
import google.generativeai as genai
import requests

class RadiusLLMTester:
    """
    PHASE 5: Multi-LLM Visibility Testing
    
    Tests visibility across:
    - ChatGPT (OpenAI)
    - Claude (Anthropic)
    - Gemini (Google)
    - Perplexity (API)
    
    Each LLM is treated as an independent black box.
    We OBSERVE, we do NOT correct.
    """
    
    def __init__(self):
        # Initialize API clients (will be None if keys not set)
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        
        self.openai_client = None
        self.anthropic_client = None
        self.gemini_model = None
        
        self._init_clients()
    
    def _init_clients(self):
        """Initialize LLM clients"""
        if self.openai_key:
            self.openai_client = OpenAI(api_key=self.openai_key)
        
        if self.anthropic_key:
            self.anthropic_client = anthropic.Anthropic(api_key=self.anthropic_key)
        
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    
    def test_all_llms(self, questions: List[Dict], knowledge_base: Dict) -> Dict[str, Any]:
        """
        Test visibility across all available LLMs
        
        Returns comprehensive test results with analysis
        """
        print("🔬 PHASE 5: Starting multi-LLM visibility testing...")
        
        # Refresh clients in case keys were loaded after init
        self._refresh_clients()
        
        kb = knowledge_base.get('knowledge_base', {})
        company_name = kb.get('company_overview', {}).get('name', 'Unknown')
        
        results = {
            'company_name': company_name,
            'test_timestamp': datetime.now(timezone.utc).isoformat(),
            'platforms': {},
            'summary': {},
            'metadata': {
                'questions_tested': len(questions),
                'platforms_available': [],
                'cache_used': False,
            }
        }
        
        # Test each platform
        if self.openai_client:
            results['platforms']['chatgpt'] = self._test_openai(questions, company_name, kb)
            results['metadata']['platforms_available'].append('chatgpt')
        else:
            results['platforms']['chatgpt'] = self._create_unavailable_result('ChatGPT', 'OPENAI_API_KEY not set')
        
        if self.anthropic_client:
            results['platforms']['claude'] = self._test_anthropic(questions, company_name, kb)
            results['metadata']['platforms_available'].append('claude')
        else:
            results['platforms']['claude'] = self._create_unavailable_result('Claude', 'ANTHROPIC_API_KEY not set')
        
        if self.gemini_model:
            results['platforms']['gemini'] = self._test_gemini(questions, company_name, kb)
            results['metadata']['platforms_available'].append('gemini')
        else:
            results['platforms']['gemini'] = self._create_unavailable_result('Gemini', 'GEMINI_API_KEY not set')
        
        if self.perplexity_key:
            results['platforms']['perplexity'] = self._test_perplexity(questions, company_name, kb)
            results['metadata']['platforms_available'].append('perplexity')
        else:
            results['platforms']['perplexity'] = self._create_unavailable_result('Perplexity', 'PERPLEXITY_API_KEY not set')
        
        # Calculate summary
        results['summary'] = self._calculate_summary(results['platforms'], company_name)
        
        print(f"🔬 PHASE 5 Complete: Tested on {len(results['metadata']['platforms_available'])} platforms")
        
        return results
    
    def _refresh_clients(self):
        """Refresh clients with latest env vars"""
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        self._init_clients()
    
    def _test_openai(self, questions: List[Dict], company_name: str, kb: Dict) -> Dict:
        """Test visibility on ChatGPT"""
        print("  Testing ChatGPT...")
        
        results = []
        total_mentions = 0
        
        for q in questions[:5]:  # Limit to 5 questions to save API costs
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "user", "content": q['text']}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                answer = response.choices[0].message.content
                analysis = self._analyze_response(answer, company_name, kb)
                
                results.append({
                    'question_id': q['id'],
                    'question': q['text'],
                    'response': answer[:1500],
                    'analysis': analysis
                })
                
                if analysis['mentioned']:
                    total_mentions += 1
                    
            except Exception as e:
                results.append({
                    'question_id': q['id'],
                    'question': q['text'],
                    'error': str(e)
                })
        
        return {
            'platform': 'ChatGPT',
            'model': 'gpt-4o-mini',
            'available': True,
            'questions_tested': len(results),
            'mention_count': total_mentions,
            'mention_rate': total_mentions / len(results) if results else 0,
            'results': results,
            'tested_at': datetime.now(timezone.utc).isoformat()
        }
    
    def _test_anthropic(self, questions: List[Dict], company_name: str, kb: Dict) -> Dict:
        """Test visibility on Claude"""
        print("  Testing Claude...")
        
        results = []
        total_mentions = 0
        
        for q in questions[:5]:
            try:
                response = self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=1000,
                    messages=[
                        {"role": "user", "content": q['text']}
                    ]
                )
                
                answer = response.content[0].text
                analysis = self._analyze_response(answer, company_name, kb)
                
                results.append({
                    'question_id': q['id'],
                    'question': q['text'],
                    'response': answer[:1500],
                    'analysis': analysis
                })
                
                if analysis['mentioned']:
                    total_mentions += 1
                    
            except Exception as e:
                results.append({
                    'question_id': q['id'],
                    'question': q['text'],
                    'error': str(e)
                })
        
        return {
            'platform': 'Claude',
            'model': 'claude-3-haiku',
            'available': True,
            'questions_tested': len(results),
            'mention_count': total_mentions,
            'mention_rate': total_mentions / len(results) if results else 0,
            'results': results,
            'tested_at': datetime.now(timezone.utc).isoformat()
        }
    
    def _test_gemini(self, questions: List[Dict], company_name: str, kb: Dict) -> Dict:
        """Test visibility on Gemini"""
        print("  Testing Gemini...")
        
        results = []
        total_mentions = 0
        
        for q in questions[:5]:
            try:
                response = self.gemini_model.generate_content(q['text'])
                answer = response.text
                analysis = self._analyze_response(answer, company_name, kb)
                
                results.append({
                    'question_id': q['id'],
                    'question': q['text'],
                    'response': answer[:1500],
                    'analysis': analysis
                })
                
                if analysis['mentioned']:
                    total_mentions += 1
                    
            except Exception as e:
                results.append({
                    'question_id': q['id'],
                    'question': q['text'],
                    'error': str(e)
                })
        
        return {
            'platform': 'Gemini',
            'model': 'gemini-1.5-flash',
            'available': True,
            'questions_tested': len(results),
            'mention_count': total_mentions,
            'mention_rate': total_mentions / len(results) if results else 0,
            'results': results,
            'tested_at': datetime.now(timezone.utc).isoformat()
        }
    
    def _test_perplexity(self, questions: List[Dict], company_name: str, kb: Dict) -> Dict:
        """Test visibility on Perplexity"""
        print("  Testing Perplexity...")
        
        results = []
        total_mentions = 0
        
        headers = {
            "Authorization": f"Bearer {self.perplexity_key}",
            "Content-Type": "application/json"
        }
        
        for q in questions[:5]:
            try:
                response = requests.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers=headers,
                    json={
                        "model": "llama-3.1-sonar-small-128k-online",
                        "messages": [{"role": "user", "content": q['text']}],
                        "max_tokens": 1000
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    answer = data['choices'][0]['message']['content']
                    analysis = self._analyze_response(answer, company_name, kb)
                    
                    results.append({
                        'question_id': q['id'],
                        'question': q['text'],
                        'response': answer[:1500],
                        'analysis': analysis
                    })
                    
                    if analysis['mentioned']:
                        total_mentions += 1
                else:
                    results.append({
                        'question_id': q['id'],
                        'question': q['text'],
                        'error': f"API error: {response.status_code}"
                    })
                    
            except Exception as e:
                results.append({
                    'question_id': q['id'],
                    'question': q['text'],
                    'error': str(e)
                })
        
        return {
            'platform': 'Perplexity',
            'model': 'llama-3.1-sonar-small-128k-online',
            'available': True,
            'questions_tested': len(results),
            'mention_count': total_mentions,
            'mention_rate': total_mentions / len(results) if results else 0,
            'results': results,
            'tested_at': datetime.now(timezone.utc).isoformat()
        }
    
    def _analyze_response(self, response: str, company_name: str, kb: Dict) -> Dict:
        """Analyze LLM response for visibility metrics"""
        response_lower = response.lower()
        company_lower = company_name.lower()
        
        # Check if company mentioned
        mentioned = company_lower in response_lower
        
        # Check for product mentions
        products = kb.get('products_and_services', [])
        product_mentions = 0
        for p in products:
            if p.get('name', '').lower() in response_lower:
                product_mentions += 1
        
        # Sentiment analysis (simple keyword-based)
        positive_words = ['best', 'excellent', 'great', 'leading', 'top', 'recommended', 'popular', 'trusted']
        negative_words = ['avoid', 'issue', 'problem', 'concern', 'limited', 'expensive', 'difficult']
        
        positive_count = sum(1 for w in positive_words if w in response_lower)
        negative_count = sum(1 for w in negative_words if w in response_lower)
        
        if positive_count > negative_count:
            sentiment = 'positive'
        elif negative_count > positive_count:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # Check for competitor dominance
        competitors_mentioned = []
        # This would be enhanced with actual competitor data
        
        # Check for potential hallucinations
        hallucination_risk = 'low'
        if mentioned and 'founded' in response_lower and 'not stated' not in str(kb.get('company_overview', {}).get('founded', '')).lower():
            hallucination_risk = 'medium'
        
        return {
            'mentioned': mentioned,
            'mention_position': response_lower.find(company_lower) if mentioned else -1,
            'product_mentions': product_mentions,
            'sentiment': sentiment,
            'competitors_mentioned': competitors_mentioned,
            'hallucination_risk': hallucination_risk,
            'response_length': len(response),
            'contains_recommendation': any(w in response_lower for w in ['recommend', 'suggest', 'consider', 'try'])
        }
    
    def _calculate_summary(self, platforms: Dict, company_name: str) -> Dict:
        """Calculate overall visibility summary"""
        total_mentions = 0
        total_questions = 0
        platform_scores = {}
        
        for platform, data in platforms.items():
            if data.get('available'):
                total_mentions += data.get('mention_count', 0)
                total_questions += data.get('questions_tested', 0)
                platform_scores[platform] = {
                    'mention_rate': data.get('mention_rate', 0),
                    'questions_tested': data.get('questions_tested', 0)
                }
        
        overall_mention_rate = total_mentions / total_questions if total_questions > 0 else 0
        
        return {
            'company_name': company_name,
            'overall_mention_rate': overall_mention_rate,
            'total_mentions': total_mentions,
            'total_questions': total_questions,
            'platform_scores': platform_scores,
            'visibility_grade': self._calculate_grade(overall_mention_rate),
            'platforms_tested': len([p for p in platforms.values() if p.get('available')])
        }
    
    def _calculate_grade(self, mention_rate: float) -> str:
        """Calculate visibility grade based on mention rate"""
        if mention_rate >= 0.8:
            return 'A'
        elif mention_rate >= 0.6:
            return 'B'
        elif mention_rate >= 0.4:
            return 'C'
        elif mention_rate >= 0.2:
            return 'D'
        else:
            return 'F'
    
    def _create_unavailable_result(self, platform: str, reason: str) -> Dict:
        """Create result for unavailable platform"""
        return {
            'platform': platform,
            'available': False,
            'reason': reason,
            'questions_tested': 0,
            'mention_count': 0,
            'mention_rate': 0,
            'results': [],
            'tested_at': datetime.now(timezone.utc).isoformat()
        }


# Singleton
llm_tester = RadiusLLMTester()
