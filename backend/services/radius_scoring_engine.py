"""
RADIUS PHASE 6: Scoring & Interpretation Engine
Converts raw observations into explainable scores
"""
import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

class RadiusScoringEngine:
    """
    PHASE 6: Explainable Scoring System
    
    Every score must be:
    ✅ Grounded in evidence
    ✅ Comparable across platforms
    ✅ Accompanied by a reason
    
    Scoring dimensions:
    - Accuracy: How correctly is the company described?
    - Consistency: How often does it appear?
    - Safety: How responsibly is it represented?
    - Readability: How well structured is the information?
    """
    
    def calculate_scores(
        self,
        knowledge_base: Dict,
        llm_results: Dict,
        questions: Dict
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive visibility scores
        
        Returns scores with full explanations
        """
        print("📊 PHASE 6: Calculating visibility scores...")
        
        kb = knowledge_base.get('knowledge_base', {})
        company_name = kb.get('company_overview', {}).get('name', 'Unknown')
        
        # Calculate dimension scores
        accuracy_score = self._calculate_accuracy(llm_results, kb)
        consistency_score = self._calculate_consistency(llm_results)
        safety_score = self._calculate_safety(llm_results, kb)
        readability_score = self._calculate_readability(llm_results)
        
        # Calculate platform scores
        platform_scores = self._calculate_platform_scores(llm_results)
        
        # Calculate overall score
        overall_score = self._calculate_overall(
            accuracy_score,
            consistency_score,
            safety_score,
            readability_score
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            accuracy_score,
            consistency_score,
            safety_score,
            readability_score,
            llm_results
        )
        
        result = {
            'company_name': company_name,
            'overall_score': overall_score,
            'dimension_scores': {
                'accuracy': accuracy_score,
                'consistency': consistency_score,
                'safety': safety_score,
                'readability': readability_score
            },
            'platform_scores': platform_scores,
            'recommendations': recommendations,
            'metadata': {
                'calculated_at': datetime.now(timezone.utc).isoformat(),
                'kb_confidence': knowledge_base.get('metadata', {}).get('overall_confidence', 'UNKNOWN'),
                'questions_used': questions.get('metadata', {}).get('total_questions', 0),
                'platforms_tested': llm_results.get('metadata', {}).get('platforms_available', []),
            }
        }
        
        print(f"📊 PHASE 6 Complete: Overall score {overall_score['score']}/100")
        
        return result
    
    def _calculate_accuracy(self, llm_results: Dict, kb: Dict) -> Dict:
        """Calculate accuracy score - how correctly described"""
        platforms = llm_results.get('platforms', {})
        
        total_analyzed = 0
        accurate_mentions = 0
        hallucination_risks = 0
        
        for platform, data in platforms.items():
            if not data.get('available'):
                continue
            
            for result in data.get('results', []):
                if 'error' in result:
                    continue
                
                analysis = result.get('analysis', {})
                total_analyzed += 1
                
                if analysis.get('mentioned'):
                    # Check if mention is accurate
                    if analysis.get('hallucination_risk', 'low') == 'low':
                        accurate_mentions += 1
                    else:
                        hallucination_risks += 1
        
        if total_analyzed == 0:
            return {
                'score': 0,
                'grade': 'N/A',
                'reason': 'No LLM responses to analyze',
                'details': {}
            }
        
        accuracy_rate = accurate_mentions / total_analyzed
        score = int(accuracy_rate * 100)
        
        return {
            'score': score,
            'grade': self._score_to_grade(score),
            'reason': self._generate_accuracy_reason(accuracy_rate, hallucination_risks, total_analyzed),
            'details': {
                'accurate_mentions': accurate_mentions,
                'hallucination_risks': hallucination_risks,
                'total_analyzed': total_analyzed
            }
        }
    
    def _calculate_consistency(self, llm_results: Dict) -> Dict:
        """Calculate consistency score - how often mentioned"""
        summary = llm_results.get('summary', {})
        mention_rate = summary.get('overall_mention_rate', 0)
        
        score = int(mention_rate * 100)
        
        platform_rates = {}
        for platform, data in llm_results.get('platforms', {}).items():
            if data.get('available'):
                platform_rates[platform] = data.get('mention_rate', 0)
        
        # Check variance across platforms
        if platform_rates:
            rates = list(platform_rates.values())
            variance = max(rates) - min(rates) if rates else 0
            consistency_penalty = int(variance * 20)  # Penalize high variance
            score = max(0, score - consistency_penalty)
        
        return {
            'score': score,
            'grade': self._score_to_grade(score),
            'reason': self._generate_consistency_reason(mention_rate, platform_rates),
            'details': {
                'overall_mention_rate': mention_rate,
                'platform_rates': platform_rates,
                'platforms_tested': summary.get('platforms_tested', 0)
            }
        }
    
    def _calculate_safety(self, llm_results: Dict, kb: Dict) -> Dict:
        """Calculate safety score - responsible representation"""
        platforms = llm_results.get('platforms', {})
        
        total_mentions = 0
        positive_mentions = 0
        negative_mentions = 0
        neutral_mentions = 0
        
        for platform, data in platforms.items():
            if not data.get('available'):
                continue
            
            for result in data.get('results', []):
                if 'error' in result:
                    continue
                
                analysis = result.get('analysis', {})
                if analysis.get('mentioned'):
                    total_mentions += 1
                    sentiment = analysis.get('sentiment', 'neutral')
                    if sentiment == 'positive':
                        positive_mentions += 1
                    elif sentiment == 'negative':
                        negative_mentions += 1
                    else:
                        neutral_mentions += 1
        
        if total_mentions == 0:
            return {
                'score': 50,
                'grade': 'C',
                'reason': 'Not enough data to assess safety',
                'details': {}
            }
        
        # Score based on sentiment distribution
        positive_rate = positive_mentions / total_mentions
        negative_rate = negative_mentions / total_mentions
        
        # Higher score for positive/neutral, lower for negative
        score = int((positive_rate * 100) + (neutral_mentions / total_mentions * 70) - (negative_rate * 50))
        score = max(0, min(100, score))
        
        return {
            'score': score,
            'grade': self._score_to_grade(score),
            'reason': self._generate_safety_reason(positive_rate, negative_rate, total_mentions),
            'details': {
                'positive_mentions': positive_mentions,
                'negative_mentions': negative_mentions,
                'neutral_mentions': neutral_mentions,
                'total_mentions': total_mentions
            }
        }
    
    def _calculate_readability(self, llm_results: Dict) -> Dict:
        """Calculate readability score - information structure"""
        platforms = llm_results.get('platforms', {})
        
        total_responses = 0
        recommendation_count = 0
        avg_response_length = 0
        
        for platform, data in platforms.items():
            if not data.get('available'):
                continue
            
            for result in data.get('results', []):
                if 'error' in result:
                    continue
                
                total_responses += 1
                analysis = result.get('analysis', {})
                
                if analysis.get('contains_recommendation'):
                    recommendation_count += 1
                
                avg_response_length += analysis.get('response_length', 0)
        
        if total_responses == 0:
            return {
                'score': 50,
                'grade': 'C',
                'reason': 'Not enough data to assess readability',
                'details': {}
            }
        
        avg_response_length = avg_response_length / total_responses
        recommendation_rate = recommendation_count / total_responses
        
        # Good readability: Responses are substantial and actionable
        score = 50  # Base score
        
        if avg_response_length > 500:
            score += 20  # Detailed responses
        if avg_response_length > 300:
            score += 10
        if recommendation_rate > 0.5:
            score += 20  # Actionable
        
        score = min(100, score)
        
        return {
            'score': score,
            'grade': self._score_to_grade(score),
            'reason': f"Responses average {int(avg_response_length)} characters with {int(recommendation_rate*100)}% containing recommendations",
            'details': {
                'avg_response_length': int(avg_response_length),
                'recommendation_rate': recommendation_rate,
                'total_responses': total_responses
            }
        }
    
    def _calculate_platform_scores(self, llm_results: Dict) -> Dict:
        """Calculate individual platform scores"""
        scores = {}
        
        for platform, data in llm_results.get('platforms', {}).items():
            if not data.get('available'):
                scores[platform] = {
                    'score': 0,
                    'grade': 'N/A',
                    'reason': data.get('reason', 'Platform not available'),
                    'available': False
                }
                continue
            
            mention_rate = data.get('mention_rate', 0)
            score = int(mention_rate * 100)
            
            scores[platform] = {
                'score': score,
                'grade': self._score_to_grade(score),
                'reason': f"Mentioned in {data.get('mention_count', 0)}/{data.get('questions_tested', 0)} questions",
                'available': True,
                'model': data.get('model', 'Unknown')
            }
        
        return scores
    
    def _calculate_overall(
        self,
        accuracy: Dict,
        consistency: Dict,
        safety: Dict,
        readability: Dict
    ) -> Dict:
        """Calculate weighted overall score"""
        
        weights = {
            'accuracy': 0.30,
            'consistency': 0.35,
            'safety': 0.20,
            'readability': 0.15
        }
        
        weighted_score = (
            accuracy['score'] * weights['accuracy'] +
            consistency['score'] * weights['consistency'] +
            safety['score'] * weights['safety'] +
            readability['score'] * weights['readability']
        )
        
        score = int(weighted_score)
        
        return {
            'score': score,
            'grade': self._score_to_grade(score),
            'reason': self._generate_overall_reason(score, accuracy, consistency, safety, readability),
            'weights': weights
        }
    
    def _generate_recommendations(
        self,
        accuracy: Dict,
        consistency: Dict,
        safety: Dict,
        readability: Dict,
        llm_results: Dict
    ) -> List[Dict]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Consistency recommendations
        if consistency['score'] < 50:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'visibility',
                'title': 'Improve AI Visibility',
                'description': 'Your brand is mentioned in less than 50% of relevant queries. Consider creating more content that aligns with how users search.',
                'impact': '+20-30 visibility points',
                'actions': [
                    'Create FAQ pages answering common questions',
                    'Publish comparison content',
                    'Optimize documentation for discoverability'
                ]
            })
        
        # Platform-specific recommendations
        platform_scores = llm_results.get('summary', {}).get('platform_scores', {})
        for platform, data in platform_scores.items():
            if data.get('mention_rate', 0) < 0.3:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'category': 'platform',
                    'title': f'Improve {platform.title()} Visibility',
                    'description': f'Low visibility on {platform.title()}. This platform may require specific optimization.',
                    'impact': '+10-15 points on this platform',
                    'actions': [
                        f'Analyze how {platform.title()} cites sources',
                        'Ensure key pages are indexable',
                        'Add structured data markup'
                    ]
                })
        
        # Safety recommendations
        if safety['score'] < 60:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'reputation',
                'title': 'Address Sentiment Concerns',
                'description': 'Some AI responses show neutral or negative sentiment. Monitor and address any reputation issues.',
                'impact': 'Improved brand perception',
                'actions': [
                    'Monitor AI mentions regularly',
                    'Address any negative content',
                    'Amplify positive customer stories'
                ]
            })
        
        # Accuracy recommendations
        if accuracy['score'] < 70:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'accuracy',
                'title': 'Improve Information Accuracy',
                'description': 'AI responses may contain inaccuracies. Ensure your public information is clear and consistent.',
                'impact': 'Reduced hallucination risk',
                'actions': [
                    'Update About page with clear facts',
                    'Publish verified company information',
                    'Create authoritative content'
                ]
            })
        
        return recommendations
    
    def _score_to_grade(self, score: int) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 60:
            return 'C'
        elif score >= 50:
            return 'D'
        else:
            return 'F'
    
    def _generate_accuracy_reason(self, rate: float, hallucinations: int, total: int) -> str:
        if rate >= 0.8:
            return f"High accuracy: {int(rate*100)}% of mentions are accurate with minimal hallucination risk"
        elif rate >= 0.5:
            return f"Moderate accuracy: {int(rate*100)}% accuracy rate. {hallucinations} potential hallucination risks detected"
        else:
            return f"Low accuracy: Only {int(rate*100)}% of mentions appear accurate. Review AI outputs for errors"
    
    def _generate_consistency_reason(self, rate: float, platform_rates: Dict) -> str:
        if rate >= 0.7:
            return f"Strong consistency: Mentioned in {int(rate*100)}% of queries across platforms"
        elif rate >= 0.4:
            return f"Moderate consistency: {int(rate*100)}% mention rate. Some platforms underperform"
        else:
            return f"Low consistency: Only {int(rate*100)}% mention rate. Significant visibility gap"
    
    def _generate_safety_reason(self, positive: float, negative: float, total: int) -> str:
        if negative < 0.1 and positive > 0.5:
            return f"Excellent sentiment: {int(positive*100)}% positive mentions with minimal negative content"
        elif negative < 0.2:
            return f"Good sentiment: Mostly positive/neutral with {int(negative*100)}% negative"
        else:
            return f"Sentiment concerns: {int(negative*100)}% of mentions have negative sentiment"
    
    def _generate_overall_reason(self, score: int, accuracy: Dict, consistency: Dict, safety: Dict, readability: Dict) -> str:
        parts = []
        
        if consistency['score'] < 50:
            parts.append("low visibility")
        elif consistency['score'] >= 70:
            parts.append("good visibility")
        
        if accuracy['score'] < 60:
            parts.append("accuracy concerns")
        
        if safety['score'] < 60:
            parts.append("sentiment issues")
        
        if not parts:
            return f"Overall strong AI visibility with score of {score}/100"
        
        return f"Score of {score}/100 with {', '.join(parts)}"


# Singleton
scoring_engine = RadiusScoringEngine()
