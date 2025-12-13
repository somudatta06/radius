"""
Enhanced Website Scraper for Knowledge Base Generation
Scrapes multiple pages from a website to extract comprehensive content
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional
import re

class WebsiteScraper:
    """Multi-page website scraper optimized for knowledge extraction"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url if base_url.startswith('http') else f'https://{base_url}'
        self.domain = urlparse(self.base_url).netloc
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def scrape_comprehensive(self, max_pages: int = 5) -> Dict:
        """
        Scrape multiple key pages from website
        Returns structured content optimized for GPT synthesis
        """
        # Define priority pages to scrape
        priority_paths = [
            '/',           # Homepage
            '/about',
            '/about-us',
            '/products',
            '/services',
            '/programs',
            '/pricing',
            '/how-it-works',
            '/careers',
            '/blog',
        ]
        
        scraped_pages = []
        total_text = []
        
        # Scrape homepage (mandatory)
        homepage = self._scrape_page(self.base_url)
        if homepage:
            scraped_pages.append({
                'url': self.base_url,
                'title': homepage['title'],
                'content': homepage['text'],
                'type': 'homepage'
            })
            total_text.append(homepage['text'])
        
        # Try to find and scrape priority pages
        for path in priority_paths:
            if len(scraped_pages) >= max_pages:
                break
            
            url = urljoin(self.base_url, path)
            if url == self.base_url:  # Skip duplicate homepage
                continue
            
            page_data = self._scrape_page(url)
            if page_data and page_data['text']:
                scraped_pages.append({
                    'url': url,
                    'title': page_data['title'],
                    'content': page_data['text'],
                    'type': self._classify_page_type(path, page_data['title'])
                })
                total_text.append(page_data['text'])
        
        # Combine and clean all text
        combined_text = '\n\n'.join(total_text)
        cleaned_text = self._clean_text(combined_text)
        
        # Limit token count (roughly 3000 tokens = 12000 chars)
        if len(cleaned_text) > 12000:
            cleaned_text = cleaned_text[:12000] + '...'
        
        return {
            'raw_text': cleaned_text,
            'page_summaries': scraped_pages,
            'domain': self.domain,
            'total_pages': len(scraped_pages)
        }
    
    def _scrape_page(self, url: str) -> Optional[Dict]:
        """Scrape a single page and extract clean content"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10, allow_redirects=True)
            if response.status_code != 200:
                print(f"❌ Status {response.status_code} for {url}")
                return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove noise
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe']):
                tag.decompose()
            
            # Extract title
            title = soup.find('title')
            title_text = title.get_text().strip() if title else url
            
            # Extract main content - be more lenient
            main_content = soup.find('body')
            
            if not main_content:
                print(f"❌ No body found for {url}")
                return None
            
            # Get text
            text = main_content.get_text(separator=' ', strip=True)
            
            # Basic cleaning
            text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
            text = text.strip()
            
            if len(text) < 50:  # Reduced minimum (was 100)
                print(f"❌ Too little content ({len(text)} chars) for {url}")
                return None
            
            print(f"✅ Scraped {url}: {len(text)} chars")
            
            return {
                'title': title_text,
                'text': text[:5000]  # Limit per page
            }
        
        except Exception as e:
            print(f"❌ Error scraping {url}: {str(e)}")
            return None
    
    def _classify_page_type(self, path: str, title: str) -> str:
        """Classify page type based on URL and title"""
        path_lower = path.lower()
        title_lower = title.lower()
        
        if 'about' in path_lower or 'about' in title_lower:
            return 'about'
        elif any(word in path_lower for word in ['product', 'service', 'program']):
            return 'products'
        elif 'pricing' in path_lower or 'pricing' in title_lower:
            return 'pricing'
        elif 'career' in path_lower or 'job' in path_lower:
            return 'careers'
        elif 'blog' in path_lower:
            return 'blog'
        else:
            return 'general'
    
    def _clean_text(self, text: str) -> str:
        """Clean and deduplicate text content"""
        # Remove repeated phrases (common in nav/footer)
        lines = text.split('\n')
        seen = set()
        unique_lines = []
        
        for line in lines:
            line = line.strip()
            if len(line) > 20 and line not in seen:  # Only dedupe longer lines
                seen.add(line)
                unique_lines.append(line)
        
        cleaned = '\n'.join(unique_lines)
        
        # Remove excessive whitespace
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        cleaned = re.sub(r' {2,}', ' ', cleaned)
        
        return cleaned.strip()
