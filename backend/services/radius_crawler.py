"""
RADIUS PHASE 1: Enhanced Multi-Page Website Crawler
Comprehensive website data collection for AI visibility analysis
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Any
import re
import time
import random
from datetime import datetime, timezone

class RadiusWebCrawler:
    """
    Enterprise-grade website crawler for Radius AI Visibility Engine
    
    PHASE 1 RESPONSIBILITIES:
    - Crawl homepage, products, pricing, about, docs, blogs
    - Extract raw, unfiltered business facts
    - No interpretation - only collection
    """
    
    def __init__(self, base_url: str):
        self.base_url = base_url if base_url.startswith('http') else f'https://{base_url}'
        self.domain = urlparse(self.base_url).netloc.replace('www.', '')
        self.crawl_timestamp = datetime.now(timezone.utc).isoformat()
        
        # Rotate user agents to avoid blocks
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        ]
        
        # Priority pages to crawl (in order of importance)
        self.priority_paths = [
            ('/', 'homepage'),
            ('/about', 'about'),
            ('/about-us', 'about'),
            ('/company', 'about'),
            ('/products', 'products'),
            ('/product', 'products'),
            ('/services', 'products'),
            ('/solutions', 'products'),
            ('/features', 'products'),
            ('/pricing', 'pricing'),
            ('/plans', 'pricing'),
            ('/docs', 'documentation'),
            ('/documentation', 'documentation'),
            ('/help', 'support'),
            ('/support', 'support'),
            ('/blog', 'blog'),
            ('/resources', 'resources'),
            ('/customers', 'customers'),
            ('/case-studies', 'customers'),
            ('/security', 'trust'),
            ('/privacy', 'trust'),
            ('/compliance', 'trust'),
        ]
    
    def _get_headers(self) -> Dict:
        """Get request headers with rotating User-Agent"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        }
    
    def crawl_comprehensive(self, max_pages: int = 10) -> Dict[str, Any]:
        """
        PHASE 1: Comprehensive website crawl
        
        Returns structured raw data for Phase 2 refinement
        """
        print(f"🕷️ PHASE 1: Starting comprehensive crawl of {self.domain}")
        
        crawl_result = {
            'metadata': {
                'domain': self.domain,
                'base_url': self.base_url,
                'crawl_timestamp': self.crawl_timestamp,
                'pages_attempted': 0,
                'pages_successful': 0,
                'cache_used': False,  # CRITICAL: Always false
            },
            'pages': {},
            'raw_content': {
                'homepage': '',
                'about': '',
                'products': '',
                'pricing': '',
                'documentation': '',
                'support': '',
                'blog': '',
                'customers': '',
                'trust': '',
                'resources': '',
            },
            'extracted_data': {
                'title': '',
                'meta_description': '',
                'headings': [],
                'links': [],
                'social_proof': [],
                'pricing_info': [],
                'product_names': [],
                'customer_mentions': [],
                'trust_signals': [],
            }
        }
        
        pages_crawled = 0
        
        for path, page_type in self.priority_paths:
            if pages_crawled >= max_pages:
                break
            
            url = urljoin(self.base_url, path)
            crawl_result['metadata']['pages_attempted'] += 1
            
            page_data = self._crawl_page(url)
            
            if page_data and page_data['success']:
                pages_crawled += 1
                crawl_result['metadata']['pages_successful'] += 1
                
                # Store page data
                crawl_result['pages'][path] = page_data
                
                # Append to raw content by type
                if crawl_result['raw_content'].get(page_type) is not None:
                    crawl_result['raw_content'][page_type] += '\n\n' + page_data['text']
                
                # Extract structured data
                self._extract_structured_data(page_data, crawl_result['extracted_data'])
                
                print(f"  ✅ {path} ({page_type}): {len(page_data['text'])} chars")
            else:
                print(f"  ❌ {path}: Failed or empty")
            
            # Respectful crawling delay
            time.sleep(0.3)
        
        # Clean up raw content
        for key in crawl_result['raw_content']:
            crawl_result['raw_content'][key] = self._clean_text(
                crawl_result['raw_content'][key]
            )[:8000]  # Limit per section
        
        print(f"🕷️ PHASE 1 Complete: {pages_crawled} pages crawled")
        
        return crawl_result
    
    def _crawl_page(self, url: str) -> Optional[Dict]:
        """Crawl a single page and extract content"""
        try:
            response = requests.get(
                url,
                headers=self._get_headers(),
                timeout=15,
                allow_redirects=True
            )
            
            if response.status_code == 429:
                print(f"    ⚠️ Rate limited, waiting...")
                time.sleep(2)
                return None
            
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove noise elements
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 
                           'aside', 'iframe', 'noscript', 'svg']):
                tag.decompose()
            
            # Extract title
            title = None
            og_title = soup.find('meta', property='og:title')
            if og_title and og_title.get('content'):
                title = og_title.get('content').strip()
            if not title:
                title_tag = soup.find('title')
                title = title_tag.get_text().strip() if title_tag else ''
            
            # Extract meta description
            meta_desc = ''
            meta_tag = soup.find('meta', attrs={'name': 'description'})
            if not meta_tag:
                meta_tag = soup.find('meta', property='og:description')
            if meta_tag and meta_tag.get('content'):
                meta_desc = meta_tag.get('content').strip()
            
            # Extract headings
            headings = []
            for h in soup.find_all(['h1', 'h2', 'h3']):
                text = h.get_text().strip()
                if text and len(text) > 3:
                    headings.append({
                        'level': h.name,
                        'text': text[:200]
                    })
            
            # Extract main text
            main_content = soup.find('main') or soup.find('body')
            text = main_content.get_text(separator=' ', strip=True) if main_content else ''
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Extract links (for discovering more pages)
            links = []
            for a in soup.find_all('a', href=True):
                href = a.get('href', '')
                link_text = a.get_text().strip()
                if href and link_text:
                    links.append({
                        'href': href,
                        'text': link_text[:100]
                    })
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'meta_description': meta_desc,
                'headings': headings[:30],
                'text': text[:15000],
                'links': links[:50],
                'crawled_at': datetime.now(timezone.utc).isoformat()
            }
            
        except requests.exceptions.Timeout:
            print(f"    ⚠️ Timeout for {url}")
            return None
        except Exception as e:
            print(f"    ❌ Error: {str(e)[:50]}")
            return None
    
    def _extract_structured_data(self, page_data: Dict, extracted: Dict):
        """Extract structured business data from page"""
        text = page_data.get('text', '').lower()
        
        # Set title and description from first successful page
        if not extracted['title'] and page_data.get('title'):
            extracted['title'] = page_data['title']
        if not extracted['meta_description'] and page_data.get('meta_description'):
            extracted['meta_description'] = page_data['meta_description']
        
        # Collect headings
        for h in page_data.get('headings', []):
            if h not in extracted['headings']:
                extracted['headings'].append(h)
        
        # Look for social proof patterns
        social_patterns = [
            r'(\d+)\+?\s*(customers|clients|users|companies|businesses)',
            r'trusted by\s*(\d+)',
            r'(\d+)\s*(million|billion|k)\s*(users|customers)',
            r'(fortune\s*\d+|forbes|techcrunch|bloomberg)',
        ]
        for pattern in social_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                proof = ' '.join(str(m) for m in match if m)
                if proof and proof not in extracted['social_proof']:
                    extracted['social_proof'].append(proof)
        
        # Look for pricing patterns
        price_patterns = [
            r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:/|per)?\s*(month|year|user|seat)?',
            r'(free|freemium|free trial|free tier)',
            r'(enterprise|custom pricing|contact sales)',
        ]
        for pattern in price_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                price = ' '.join(str(m) for m in match if m)
                if price and price not in extracted['pricing_info']:
                    extracted['pricing_info'].append(price)
        
        # Look for trust signals
        trust_patterns = [
            r'(soc\s*2|iso\s*27001|gdpr|hipaa|pci|ccpa)',
            r'(encrypted|secure|compliant|certified)',
            r'(99\.\d+%\s*uptime|sla)',
        ]
        for pattern in trust_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                signal = match if isinstance(match, str) else match[0]
                if signal and signal not in extracted['trust_signals']:
                    extracted['trust_signals'].append(signal)
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ''
        
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        text = re.sub(r'\t+', ' ', text)
        
        return text.strip()


# Factory function
def create_crawler(url: str) -> RadiusWebCrawler:
    return RadiusWebCrawler(url)
