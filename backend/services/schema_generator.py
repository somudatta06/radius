"""
Schema Generator Service
Generates JSON-LD structured data schemas to boost AI visibility in Google SGE
and AI-powered search results.
"""
import os
import json
from typing import Dict, Any


class SchemaGeneratorService:
    """Generates JSON-LD schema markup using GPT to improve AI visibility."""

    async def generate_schemas(self, brand_name: str, domain: str, website_data: dict, analysis_data: dict) -> dict:
        """ONE GPT call to generate relevant JSON-LD schemas."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("⚠️ OPENAI_API_KEY not set — SchemaGenerator returning demo data")
            return self._demo_data(brand_name, domain)

        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        industry = analysis_data.get("industry", website_data.get("industry", "E-commerce"))
        products = analysis_data.get("products", [])
        products_text = ", ".join(products[:5]) if products else "Various products/services"
        website_summary = str(website_data)[:800] if website_data else "No website data available"
        overall_score = analysis_data.get("overallScore", 65)

        prompt = f"""You are a technical SEO expert specializing in structured data for AI search visibility.

Brand: {brand_name}
Domain: {domain}
Industry: {industry}
Products/Services: {products_text}
Website Content: {website_summary}
Current AI Visibility Score: {overall_score}/100

Generate JSON-LD structured data schemas that would significantly improve this brand's visibility in Google AI Overviews (SGE) and AI chatbot responses.

You MUST respond with ONLY valid JSON. No markdown, no explanation, no backticks.

{{
  "schemas": [
    {{
      "type": "Organization",
      "description": "Why this schema helps AI visibility (1 sentence)",
      "json_ld": {{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "{brand_name}",
        "url": "https://{domain}",
        "description": "brand description here",
        "foundingDate": "year",
        "areaServed": "India",
        "sameAs": []
      }},
      "implementation_note": "Add to every page <head>"
    }},
    {{
      "type": "FAQPage",
      "description": "Why this schema helps AI visibility (1 sentence)",
      "json_ld": {{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {{"@type": "Question", "name": "relevant FAQ question 1?", "acceptedAnswer": {{"@type": "Answer", "text": "detailed answer"}}}},
          {{"@type": "Question", "name": "relevant FAQ question 2?", "acceptedAnswer": {{"@type": "Answer", "text": "detailed answer"}}}},
          {{"@type": "Question", "name": "relevant FAQ question 3?", "acceptedAnswer": {{"@type": "Answer", "text": "detailed answer"}}}},
          {{"@type": "Question", "name": "relevant FAQ question 4?", "acceptedAnswer": {{"@type": "Answer", "text": "detailed answer"}}}},
          {{"@type": "Question", "name": "relevant FAQ question 5?", "acceptedAnswer": {{"@type": "Answer", "text": "detailed answer"}}}}
        ]
      }},
      "implementation_note": "Add to FAQ page or any page with Q&A content"
    }},
    {{
      "type": "Product",
      "description": "Why this schema helps AI visibility (1 sentence)",
      "json_ld": {{
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "example product name",
        "brand": {{"@type": "Brand", "name": "{brand_name}"}},
        "description": "product description",
        "offers": {{"@type": "Offer", "priceCurrency": "INR", "availability": "https://schema.org/InStock"}}
      }},
      "implementation_note": "Add to individual product pages"
    }},
    {{
      "type": "WebSite",
      "description": "Why this schema helps AI visibility (1 sentence)",
      "json_ld": {{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "{brand_name}",
        "url": "https://{domain}",
        "potentialAction": {{
          "@type": "SearchAction",
          "target": {{"@type": "EntryPoint", "urlTemplate": "https://{domain}/search?q={{search_term_string}}"}},
          "query-input": "required name=search_term_string"
        }}
      }},
      "implementation_note": "Add once to homepage"
    }}
  ],
  "total_schemas": 4,
  "estimated_visibility_boost": "high",
  "priority_order": ["FAQPage", "Organization", "Product", "WebSite"],
  "implementation_summary": "Implementing these 4 schemas will significantly improve your brand's citation rate in AI-generated search results."
}}"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3000,
                temperature=0.3,
            )
            raw = response.choices[0].message.content.strip()
            # Strip markdown fences
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw.rsplit("```", 1)[0]
            raw = raw.strip()

            result = json.loads(raw)
            result["is_demo"] = False
            print(f"✅ SchemaGeneratorService returned real data for {brand_name}")
            return result
        except json.JSONDecodeError as e:
            print(f"❌ SchemaGeneratorService JSON parse error: {e}")
            return self._demo_data(brand_name, domain)
        except Exception as e:
            print(f"❌ SchemaGeneratorService error: {e}")
            return self._demo_data(brand_name, domain)

    def _demo_data(self, brand_name: str = "Brand", domain: str = "example.com") -> dict:
        return {
            "schemas": [
                {
                    "type": "Organization",
                    "description": "Establishes brand identity in AI knowledge graphs — chatbots cite Organization schema to describe brands",
                    "json_ld": {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": brand_name,
                        "url": f"https://{domain}",
                        "description": f"{brand_name} is an Indian D2C brand offering high-quality products with a focus on transparency and customer trust.",
                        "foundingDate": "2020",
                        "areaServed": "India",
                        "sameAs": [
                            f"https://www.instagram.com/{brand_name.lower().replace(' ', '')}",
                            f"https://twitter.com/{brand_name.lower().replace(' ', '')}",
                        ]
                    },
                    "implementation_note": "Add to <head> on every page of your website"
                },
                {
                    "type": "FAQPage",
                    "description": "FAQPage schema is the #1 way to capture AI Overview slots — Google uses these to generate direct answers",
                    "json_ld": {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": f"What is {brand_name}?",
                                "acceptedAnswer": {"@type": "Answer", "text": f"{brand_name} is an Indian D2C brand founded to offer high-quality, transparent products to Indian consumers. All products are dermatologically tested and cruelty-free."}
                            },
                            {
                                "@type": "Question",
                                "name": f"Is {brand_name} safe to use?",
                                "acceptedAnswer": {"@type": "Answer", "text": f"Yes, all {brand_name} products are tested by certified dermatologists, free from harmful parabens and sulfates, and manufactured in ISO-certified facilities."}
                            },
                            {
                                "@type": "Question",
                                "name": f"Where can I buy {brand_name} products?",
                                "acceptedAnswer": {"@type": "Answer", "text": f"You can buy {brand_name} products on our official website {domain}, Amazon India, Nykaa, Flipkart, and select offline retail stores across India."}
                            },
                            {
                                "@type": "Question",
                                "name": f"What is {brand_name}'s return policy?",
                                "acceptedAnswer": {"@type": "Answer", "text": f"{brand_name} offers a 30-day hassle-free return policy. If you are not satisfied with your purchase, you can return it for a full refund or replacement."}
                            },
                            {
                                "@type": "Question",
                                "name": f"Are {brand_name} products made in India?",
                                "acceptedAnswer": {"@type": "Answer", "text": f"Yes, {brand_name} products are proudly made in India in GMP-certified manufacturing facilities with globally sourced, ethically obtained ingredients."}
                            }
                        ]
                    },
                    "implementation_note": "Add to your FAQ page, About page, or any page with Q&A content"
                },
                {
                    "type": "Product",
                    "description": "Product schema enables rich results in Google Shopping and AI product recommendations",
                    "json_ld": {
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": f"{brand_name} Signature Product",
                        "brand": {"@type": "Brand", "name": brand_name},
                        "description": f"Bestselling product from {brand_name} — formulated with premium ingredients for visible results.",
                        "sku": "SKU001",
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "INR",
                            "price": "499",
                            "availability": "https://schema.org/InStock",
                            "url": f"https://{domain}/products/bestseller"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.5",
                            "reviewCount": "2847"
                        }
                    },
                    "implementation_note": "Add to each product page — customize name, price, SKU per product"
                },
                {
                    "type": "WebSite",
                    "description": "WebSite schema with SearchAction lets Google and AI crawlers understand your site structure",
                    "json_ld": {
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": brand_name,
                        "url": f"https://{domain}",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": {"@type": "EntryPoint", "urlTemplate": f"https://{domain}/search?q={{search_term_string}}"},
                            "query-input": "required name=search_term_string"
                        }
                    },
                    "implementation_note": "Add once to your homepage only"
                }
            ],
            "total_schemas": 4,
            "estimated_visibility_boost": "high",
            "priority_order": ["FAQPage", "Organization", "Product", "WebSite"],
            "implementation_summary": f"Implementing these 4 schemas will significantly improve {brand_name}'s citation rate in AI-generated search results. FAQPage schema alone can increase AI Overview appearances by 40-60%.",
            "is_demo": True
        }


schema_generator_service = SchemaGeneratorService()
