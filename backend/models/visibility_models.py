"""
Visibility Analytics Data Models
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class Competitor(BaseModel):
    """Competitor model for visibility tracking"""
    id: str
    name: str
    aliases: List[str] = []
    website: Optional[str] = None
    is_manual: bool = False
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PromptRun(BaseModel):
    """AI prompt execution record"""
    id: str
    prompt: str
    provider: str  # ChatGPT, Claude, Gemini, Perplexity
    geo: Optional[str] = None  # Geographic targeting
    response_text: str
    keyword: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Mention(BaseModel):
    """Brand mention within AI response"""
    id: str
    brand_id: str
    brand_name: str
    prompt_run_id: str
    position: Optional[int] = None  # Position in response (1-10)
    sentiment: float = 0.0  # -1 to 1 (negative to positive)
    context: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VisibilityMetrics(BaseModel):
    """Aggregated visibility metrics for a brand"""
    brand_id: str
    brand_name: str
    mention_rate: float  # % of prompts where mentioned
    avg_position: Optional[float] = None  # Average ranking position
    sentiment_score: float  # 0-100 scale
    share_of_voice: float  # % of total mentions
    total_mentions: int
    total_prompts: int

class GeoPerformance(BaseModel):
    """Geographic performance metrics"""
    region: str
    country_code: str
    mention_rate: float
    share_of_voice: float
    total_mentions: int
    total_prompts: int

class TimeSeriesData(BaseModel):
    """Time series data point"""
    date: str
    value: float
    label: Optional[str] = None
