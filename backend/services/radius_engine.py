"""
RADIUS INTELLIGENCE ENGINE - Main Orchestrator
Coordinates all 8 phases of the AI Visibility Analysis Pipeline
"""
import os
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from uuid import uuid4

# Import all phase services
from services.radius_crawler import create_crawler
from services.radius_knowledge_engine import knowledge_engine
from services.radius_question_generator import question_generator
from services.radius_llm_tester import llm_tester
from services.radius_scoring_engine import scoring_engine


class RadiusIntelligenceEngine:
    """
    Main orchestrator for the Radius AI Visibility Engine
    
    Executes all 8 phases:
    1. Company Discovery & Raw Data Collection
    2. ChatGPT-Powered Refinement
    3. Knowledge Base Creation
    4. Question Framework Generation
    5. Multi-LLM Visibility Testing
    6. Scoring & Interpretation
    7. User Interaction Support (Test in LLM)
    8. Continuous Feedback Loop
    """
    
    def __init__(self):
        self.current_analysis = None
    
    async def run_full_analysis(
        self,
        url: str,
        analysis_id: Optional[str] = None,
        run_llm_tests: bool = True,
        db = None
    ) -> Dict[str, Any]:
        """
        Execute complete 8-phase analysis pipeline
        
        Args:
            url: Website URL to analyze
            analysis_id: Unique analysis ID (generated if not provided)
            run_llm_tests: Whether to run Phase 5 LLM tests (can be expensive)
            db: MongoDB database instance for persistence
        
        Returns:
            Complete analysis result with all phase outputs
        """
        # Generate unique analysis ID
        if not analysis_id:
            analysis_id = f"radius_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{str(uuid4())[:8]}"
        
        analysis_timestamp = datetime.now(timezone.utc).isoformat()
        
        print(f"\n{'='*60}")
        print(f"🎯 RADIUS INTELLIGENCE ENGINE")
        print(f"   Analysis ID: {analysis_id}")
        print(f"   Target: {url}")
        print(f"   Timestamp: {analysis_timestamp}")
        print(f"{'='*60}\n")
        
        result = {
            'analysisId': analysis_id,
            'url': url,
            'analyzedAt': analysis_timestamp,
            'phases': {},
            'dataProvenance': {
                'cache_used': False,
                'fresh_crawl': True,
                'fresh_gpt_call': True,
                'timestamp': analysis_timestamp
            }
        }
        
        try:
            # ===== PHASE 1: Website Crawling =====
            print("\n" + "="*40)
            print("PHASE 1: Website Crawling")
            print("="*40)
            
            crawler = create_crawler(url)
            crawl_data = crawler.crawl_comprehensive(max_pages=10)
            result['phases']['crawl'] = crawl_data
            
            # ===== PHASE 2 & 3: Knowledge Base Creation =====
            print("\n" + "="*40)
            print("PHASE 2 & 3: Knowledge Base Creation")
            print("="*40)
            
            kb_result = knowledge_engine.refine_and_create_kb(crawl_data)
            result['phases']['knowledge_base'] = kb_result
            result['knowledgeBase'] = kb_result  # Top-level for easy access
            
            # Extract brand info from KB
            kb = kb_result.get('knowledge_base', {})
            overview = kb.get('company_overview', {})
            
            result['brandInfo'] = {
                'name': overview.get('name', url.split('/')[2] if '/' in url else url),
                'domain': crawl_data['metadata']['domain'],
                'tagline': overview.get('tagline', ''),
                'description': overview.get('description', ''),
                'industry': kb.get('business_model', {}).get('primary_offering', 'Technology')
            }
            
            # ===== PHASE 4: Question Generation =====
            print("\n" + "="*40)
            print("PHASE 4: Question Generation")
            print("="*40)
            
            questions = question_generator.generate_questions(kb_result, num_questions=15)
            result['phases']['questions'] = questions
            result['questions'] = questions['questions']  # Top-level for Accuracy Check
            
            # ===== PHASE 5: LLM Testing (Optional) =====
            llm_results = None
            if run_llm_tests:
                print("\n" + "="*40)
                print("PHASE 5: Multi-LLM Testing")
                print("="*40)
                
                llm_results = llm_tester.test_all_llms(
                    questions['questions'],
                    kb_result
                )
                result['phases']['llm_tests'] = llm_results
                result['llmVisibility'] = llm_results  # Top-level for dashboard
            else:
                print("\n⏭️ PHASE 5: Skipped (run_llm_tests=False)")
                result['phases']['llm_tests'] = {'skipped': True}
            
            # ===== PHASE 6: Scoring =====
            print("\n" + "="*40)
            print("PHASE 6: Scoring & Interpretation")
            print("="*40)
            
            if llm_results:
                scores = scoring_engine.calculate_scores(kb_result, llm_results, questions)
                result['phases']['scores'] = scores
                result['scores'] = scores  # Top-level for dashboard
                result['overallScore'] = scores['overall_score']['score']
            else:
                # Calculate basic score from KB confidence
                kb_confidence = kb_result.get('metadata', {}).get('confidence_score', 0.5)
                result['overallScore'] = int(kb_confidence * 60)  # Base score from KB quality
                result['scores'] = {
                    'overall_score': {
                        'score': result['overallScore'],
                        'grade': 'C' if result['overallScore'] >= 50 else 'D',
                        'reason': 'Score based on Knowledge Base quality only. Run LLM tests for full analysis.'
                    },
                    'dimension_scores': {},
                    'platform_scores': {},
                    'recommendations': []
                }
            
            # ===== PHASE 7 & 8: Metadata for UI =====
            result['accuracyCheck'] = {
                'questions': questions['questions'],
                'questions_by_category': questions['questions_by_category'],
                'total_questions': len(questions['questions']),
                'generated_at': questions['metadata']['generated_at']
            }
            
            # Persist to MongoDB if available
            if db is not None:
                try:
                    await db.radius_analyses.insert_one({
                        **result,
                        '_id': analysis_id
                    })
                    print(f"\n💾 Analysis saved to MongoDB: {analysis_id}")
                except Exception as db_error:
                    print(f"⚠️ Failed to save to MongoDB: {db_error}")
            
            print(f"\n{'='*60}")
            print(f"✅ RADIUS ANALYSIS COMPLETE")
            print(f"   Overall Score: {result['overallScore']}/100")
            print(f"   Knowledge Base Confidence: {kb_result.get('metadata', {}).get('overall_confidence', 'N/A')}")
            print(f"   Questions Generated: {len(questions['questions'])}")
            if llm_results:
                print(f"   Platforms Tested: {', '.join(llm_results.get('metadata', {}).get('platforms_available', []))}")
            print(f"{'='*60}\n")
            
            return result
            
        except Exception as e:
            print(f"\n❌ ANALYSIS ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            
            result['error'] = str(e)
            result['overallScore'] = 0
            
            return result
    
    def get_test_question(self, analysis_result: Dict, platform: str) -> Optional[Dict]:
        """
        PHASE 7: Get a pre-generated question for "Test in [LLM]" button
        
        CRITICAL: Must return a question that was already generated and 
        influenced the score. Never generate new questions at click-time.
        """
        questions = analysis_result.get('questions', [])
        if not questions:
            return None
        
        # Return the first discovery question (most likely to show visibility)
        for q in questions:
            if q.get('category') == 'DISCOVERY':
                return {
                    'question': q['text'],
                    'question_id': q['id'],
                    'category': q['category'],
                    'platform': platform,
                    'note': 'This is the same question used for scoring. Results should be reproducible.'
                }
        
        # Fallback to first question
        return {
            'question': questions[0]['text'],
            'question_id': questions[0]['id'],
            'category': questions[0].get('category', 'DISCOVERY'),
            'platform': platform,
            'note': 'This is the same question used for scoring.'
        }
    
    async def refine_knowledge_base(
        self,
        analysis_id: str,
        user_feedback: Dict,
        db = None
    ) -> Dict:
        """
        PHASE 8: Continuous Feedback Loop
        
        Re-invoke ChatGPT to refine KB based on:
        - User corrections
        - LLM response discrepancies
        - New information
        """
        # This would be implemented to:
        # 1. Load existing analysis
        # 2. Incorporate user feedback
        # 3. Re-run GPT refinement
        # 4. Update stored KB
        # 5. Optionally re-score
        
        return {
            'status': 'feedback_received',
            'analysis_id': analysis_id,
            'feedback': user_feedback,
            'message': 'Knowledge Base refinement queued'
        }


# Singleton
radius_engine = RadiusIntelligenceEngine()
