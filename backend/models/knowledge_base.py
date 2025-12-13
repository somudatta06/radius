"""
Knowledge Base Data Models
Single source of truth for AI-generated content
"""
from typing import List, Optional, Dict
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime

class ICP(BaseModel):
    """Ideal Customer Profile"""
    industry: Optional[str] = None
    company_size: Optional[str] = None
    geography: Optional[str] = None
    buyer_persona: Optional[str] = None
    use_cases: List[str] = []

class Differentiator(BaseModel):
    """Key brand differentiator"""
    id: str
    title: str
    explanation: str
    order: int = 0

class CompanyDescription(BaseModel):
    """Company description and positioning"""
    id: str = Field(default="company_desc")
    overview: str = ""
    products_services: str = ""
    target_customers: str = ""
    positioning: str = ""
    icp: ICP = Field(default_factory=ICP)
    differentiators: List[Differentiator] = []
    is_ai_generated: bool = True
    last_edited: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1

class BrandGuideline(BaseModel):
    """Brand voice and style guidelines"""
    id: str = Field(default="brand_guidelines")
    tone: Optional[str] = None  # formal, bold, friendly
    words_to_prefer: List[str] = []
    words_to_avoid: List[str] = []
    dos: List[str] = []
    donts: List[str] = []
    sentence_style: Optional[str] = None
    reference_urls: List[str] = []
    uploaded_documents: List[str] = []
    is_ai_extracted: bool = False
    last_edited: datetime = Field(default_factory=datetime.utcnow)

class Evidence(BaseModel):
    """Supporting evidence for claims"""
    id: str
    type: str  # case_study, review, statistic
    title: str
    content: str
    source: Optional[str] = None
    metrics: Optional[Dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CaseStudy(Evidence):
    """Customer case study"""
    type: str = "case_study"
    client_name: str
    problem: str
    outcome: str
    metrics: Dict[str, str] = {}

class CustomerReview(Evidence):
    """Customer review/testimonial"""
    type: str = "review"
    quote: str
    attribution: str
    source_url: Optional[str] = None

class Statistic(Evidence):
    """Data point or metric"""
    type: str = "statistic"
    metric_name: str
    value: str
    source_url: Optional[str] = None

class KnowledgeBase(BaseModel):
    """Complete knowledge base"""
    company_description: CompanyDescription
    brand_guidelines: BrandGuideline
    evidence: List[Evidence] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
