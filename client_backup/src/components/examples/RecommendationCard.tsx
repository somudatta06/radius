import RecommendationCard from '../RecommendationCard';

export default function RecommendationCardExample() {
  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <RecommendationCard
        title="Add Comprehensive FAQ Section"
        description="Your website lacks a dedicated FAQ page. AI platforms favor websites with structured Q&A content."
        priority="high"
        category="content"
        actionItems={[
          "Create a dedicated FAQ page with at least 15-20 common questions",
          "Use schema markup for FAQ content (application/ld+json)",
          "Include questions that mention competitor comparisons"
        ]}
        estimatedImpact="+12-15 points"
      />
      
      <RecommendationCard
        title="Improve Technical SEO Signals"
        description="Missing Open Graph tags and incomplete schema markup reduce AI platform trust."
        priority="medium"
        category="technical"
        actionItems={[
          "Add Open Graph meta tags to all pages",
          "Implement Organization schema markup",
          "Create and submit XML sitemap"
        ]}
        estimatedImpact="+8-10 points"
      />
      
      <RecommendationCard
        title="Expand Blog Content"
        description="More long-form content will increase your visibility in AI responses."
        priority="low"
        category="seo"
        actionItems={[
          "Publish 2-3 in-depth articles per month",
          "Focus on use cases and comparison topics",
          "Aim for 1500+ words per article"
        ]}
        estimatedImpact="+5-7 points"
      />
    </div>
  );
}
