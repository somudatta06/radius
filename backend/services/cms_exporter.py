"""
CMS Exporter Service
Exports blog content for WordPress, Webflow, or generic JSON
"""
import json
from typing import Dict, Any
from datetime import datetime, timezone


class CMSExporterService:
    """Exports blog content in CMS-compatible formats"""

    def export(self, content: dict, format: str = "json") -> dict:
        """Export content in specified format"""
        if format == "wordpress":
            return self._export_wordpress(content)
        elif format == "webflow":
            return self._export_webflow(content)
        else:
            return self._export_json(content)

    def _export_json(self, content: dict) -> dict:
        """Generic JSON export"""
        return {
            "format": "json",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "content": {
                "title": content.get("title", "Untitled"),
                "slug": content.get("slug", "untitled"),
                "meta_description": content.get("meta_description", ""),
                "body": content.get("content_body", ""),
                "keywords": content.get("target_keywords", []),
                "seo_score": content.get("seo_score", 0),
            },
            "download_ready": True
        }

    def _export_wordpress(self, content: dict) -> dict:
        """WordPress-compatible XML/JSON export"""
        body = content.get("content_body", "")
        # Convert markdown headings to HTML
        html_body = body.replace("## ", "<h2>").replace("\n\n##", "</h2>\n\n<h2>")
        html_body = html_body.replace("### ", "<h3>").replace("\n\n###", "</h3>\n\n<h3>")

        return {
            "format": "wordpress",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "content": {
                "post_title": content.get("title", "Untitled"),
                "post_name": content.get("slug", "untitled"),
                "post_content": html_body,
                "post_excerpt": content.get("meta_description", ""),
                "post_status": "draft",
                "post_type": "post",
                "meta": {
                    "_yoast_wpseo_title": content.get("title", ""),
                    "_yoast_wpseo_metadesc": content.get("meta_description", ""),
                    "_yoast_wpseo_focuskw": content.get("target_keywords", [""])[0] if content.get("target_keywords") else "",
                }
            },
            "download_ready": True
        }

    def _export_webflow(self, content: dict) -> dict:
        """Webflow CMS collection item format"""
        return {
            "format": "webflow",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "content": {
                "name": content.get("title", "Untitled"),
                "slug": content.get("slug", "untitled"),
                "post-body": content.get("content_body", ""),
                "post-summary": content.get("meta_description", ""),
                "seo-title": content.get("title", ""),
                "seo-description": content.get("meta_description", ""),
                "_archived": False,
                "_draft": True,
            },
            "download_ready": True
        }
