"""
Tracxn API Integration Service
Handles competitor discovery and company data retrieval
"""
import requests
import os
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

TRACXN_API_KEY = os.getenv("TRACXN_API_KEY")
TRACXN_BASE_URL = "https://api.tracxn.com/v1"

class TracxnService:
    """Service for interacting with Tracxn API"""
    
    def __init__(self):
        self.api_key = TRACXN_API_KEY
        import base64
        # Tracxn uses Basic Auth
        auth_string = base64.b64encode(f"{self.api_key}:".encode()).decode()
        self.headers = {
            "Authorization": f"Basic {auth_string}",
            "Content-Type": "application/json"
        }
    
    def search_competitors(self, keyword: str, limit: int = 10) -> List[Dict]:
        """
        Search for companies/competitors using keyword
        
        Args:
            keyword: Search term (e.g., "AI analytics", "SaaS CRM")
            limit: Maximum number of results
            
        Returns:
            List of competitor data
        """
        try:
            url = f"{TRACXN_BASE_URL}/companies/search"
            params = {
                "q": keyword,
                "limit": limit
            }
            
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            companies = data.get("data", [])
            
            return [self._normalize_company(company) for company in companies]
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Tracxn search error: {str(e)}")
            logger.info(f"Using mock data for search: {keyword}")
            
            # Fallback to mock data
            from services.tracxn_mock import get_mock_competitors
            return get_mock_competitors(keyword, limit)
    
    def get_competitor_details(self, company_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific company
        
        Args:
            company_id: Tracxn company ID
            
        Returns:
            Detailed company data
        """
        try:
            url = f"{TRACXN_BASE_URL}/companies/{company_id}"
            
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return self._normalize_company(data.get("data", {}))
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Tracxn details error: {str(e)}")
            return None
    
    def discover_by_category(self, category: str, limit: int = 10) -> List[Dict]:
        """
        Discover competitors by category
        
        Args:
            category: Category name (e.g., "AI tools", "SaaS", "E-commerce")
            limit: Maximum number of results
            
        Returns:
            List of companies in category
        """
        try:
            url = f"{TRACXN_BASE_URL}/categories/{category}/companies"
            params = {"limit": limit}
            
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            companies = data.get("data", [])
            
            return [self._normalize_company(company) for company in companies]
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Tracxn category discovery error: {str(e)}")
            logger.info(f"Using mock data for category: {category}")
            
            # Fallback to mock data
            from services.tracxn_mock import get_mock_competitors
            return get_mock_competitors(category, limit)
    
    def _normalize_company(self, raw_data: Dict) -> Dict:
        """
        Normalize Tracxn company data to unified format
        
        Args:
            raw_data: Raw company data from Tracxn
            
        Returns:
            Normalized company dictionary matching exact spec
        """
        return {
            "name": raw_data.get("name", "Unknown"),
            "website": raw_data.get("website", raw_data.get("url", "")),
            "description": raw_data.get("description", raw_data.get("brief", "")),
            "category": raw_data.get("category", raw_data.get("sector", "Unknown")),
            "funding": raw_data.get("total_funding", raw_data.get("funding", {}).get("total", 0)),
            "stage": raw_data.get("stage", raw_data.get("funding_stage", "Unknown")),
            "investors": raw_data.get("investors", raw_data.get("investor_names", [])),
            "location": raw_data.get("location", raw_data.get("hq_location", "")),
            "foundedYear": raw_data.get("founded_year", raw_data.get("founded", None)),
            "revenue": raw_data.get("revenue", raw_data.get("annual_revenue", None)),
            "employeeSize": raw_data.get("employee_count", raw_data.get("employees", None))
        }

# Singleton instance
tracxn_service = TracxnService()
