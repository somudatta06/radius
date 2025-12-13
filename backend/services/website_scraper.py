"""
Enhanced Website Scraper for Knowledge Base Generation
Scrapes multiple pages from a website to extract comprehensive content
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional
import re
import time
import random

class WebsiteScraper:
    """Multi-page website scraper optimized for knowledge extraction"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url if base_url.startswith('http') else f'https://{base_url}'
        self.domain = urlparse(self.base_url).netloc.replace('www.', '')
        # Rotate user agents to avoid blocks
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        ]
    
    def _get_headers(self) -> Dict:
        """Get request headers with rotating User-Agent"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        }
    
    def scrape_comprehensive(self, max_pages: int = 5) -> Dict:
        """
        Scrape multiple key pages from website
        Returns STRUCTURED summaries optimized for GPT reasoning
        ALWAYS returns useful data even if scraping fails
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
            '/team',
            '/why-us',
        ]
        
        scraped_pages = []
        
        # Scrape homepage (mandatory) with retries
        homepage = self._scrape_page_with_retry(self.base_url, max_retries=3)
        if homepage:
            scraped_pages.append({
                'url': self.base_url,
                'title': homepage['title'],
                'content': homepage['text'],
                'type': 'homepage'
            })
        
        # Try to find and scrape priority pages
        for path in priority_paths:
            if len(scraped_pages) >= max_pages:
                break
            
            url = urljoin(self.base_url, path)
            if url == self.base_url:  # Skip duplicate homepage
                continue
            
            page_data = self._scrape_page_with_retry(url, max_retries=2)
            if page_data and page_data['text']:
                scraped_pages.append({
                    'url': url,
                    'title': page_data['title'],
                    'content': page_data['text'],
                    'type': self._classify_page_type(path, page_data['title'])
                })
            
            # Add small delay to avoid rate limiting
            time.sleep(0.5)
        
        print(f"✅ Scraped {len(scraped_pages)} pages")
        
        # Build STRUCTURED corpus for GPT reasoning
        corpus = self._build_structured_corpus(scraped_pages)
        
        # If we got very little content, add domain-based context
        total_content = sum(len(v) for v in corpus.values())
        if total_content < 200:
            corpus = self._enrich_with_domain_info(corpus)
        
        return {
            'structured_corpus': corpus,
            'page_summaries': scraped_pages,
            'domain': self.domain,
            'total_pages': len(scraped_pages),
            'raw_text': ' '.join([p['content'] for p in scraped_pages])[:5000]
        }
    
    def _scrape_page_with_retry(self, url: str, max_retries: int = 3) -> Optional[Dict]:
        """Scrape a page with retry logic"""
        for attempt in range(max_retries):
            result = self._scrape_page(url)
            if result:
                return result
            
            # Wait before retry with exponential backoff
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 1.5
                time.sleep(wait_time)
        
        return None
    
    def _enrich_with_domain_info(self, corpus: Dict) -> Dict:
        """Enrich corpus with domain-based info when scraping fails"""
        # Extract potential brand name from domain
        brand_parts = self.domain.split('.')
        brand_name = brand_parts[0].capitalize() if brand_parts else 'Company'
        
        # Add basic context
        if not corpus['homepage_summary']:
            corpus['homepage_summary'] = f"{brand_name} is a company operating at {self.domain}. Analysis based on domain information."
        
        return corpus
    
    def _build_structured_corpus(self, pages: List[Dict]) -> Dict:
        """
        Build structured summaries by page type for GPT reasoning
        This is CRITICAL for quality output
        """
        corpus = {
            'homepage_summary': '',
            'about_summary': '',
            'offerings_summary': '',
            'positioning_clues': ''
        }
        
        for page in pages:
            content = page['content'][:2000]  # Limit per page
            page_type = page['type']
            
            if page_type == 'homepage':
                corpus['homepage_summary'] = content
            elif page_type == 'about':
                corpus['about_summary'] = content
            elif page_type in ['products', 'general']:
                if corpus['offerings_summary']:
                    corpus['offerings_summary'] += '\n\n' + content
                else:
                    corpus['offerings_summary'] = content
            elif page_type in ['careers', 'pricing']:
                if corpus['positioning_clues']:
                    corpus['positioning_clues'] += '\n\n' + content
                else:
                    corpus['positioning_clues'] = content
        
        # Clean each summary
        for key in corpus:
            if corpus[key]:
                corpus[key] = self._clean_text(corpus[key])[:1500]  # Limit each section
        
        return corpus
    
    def _scrape_page(self, url: str) -> Optional[Dict]:
        """Scrape a single page and extract clean content"""
        try:
            response = requests.get(
                url, 
                headers=self._get_headers(), 
                timeout=15, 
                allow_redirects=True
            )
            
            if response.status_code == 429:
                print(f"⚠️  Rate limited (429) for {url} - waiting...")
                time.sleep(2)
                return None
            
            if response.status_code != 200:
                print(f"❌ Status {response.status_code} for {url}")
                return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove noise
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe', 'noscript']):
                tag.decompose()
            
            # Extract title with fallbacks
            title = None
            og_title = soup.find('meta', property='og:title')
            if og_title and og_title.get('content'):
                title = og_title.get('content').strip()
            if not title:
                title_tag = soup.find('title')
                title = title_tag.get_text().strip() if title_tag else url
            
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
            
            if len(text) < 50:  # Reduced minimum
                print(f"❌ Too little content ({len(text)} chars) for {url}")
                return None
            
            print(f"✅ Scraped {url}: {len(text)} chars")
            
            return {
                'title': title,
                'text': text[:5000]  # Limit per page
            }
        
        except requests.exceptions.Timeout:
            print(f"⚠️  Timeout for {url}")
            return None
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
