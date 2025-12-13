import CompetitorCard from '../CompetitorCard';

export default function CompetitorCardExample() {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <CompetitorCard
        rank={1}
        name="Market Leader Inc"
        domain="marketleader.com"
        score={94}
        marketOverlap={85}
        strengths={[
          "Strong FAQ and documentation",
          "High-quality comparison pages"
        ]}
      />
      <CompetitorCard
        rank={2}
        name="Your Company"
        domain="yourcompany.com"
        score={78}
        marketOverlap={100}
        strengths={[
          "Good technical content",
          "Active blog presence"
        ]}
        isCurrentBrand={true}
      />
      <CompetitorCard
        rank={3}
        name="Competitor Two"
        domain="competitor2.com"
        score={72}
        marketOverlap={65}
        strengths={[
          "Clear pricing information",
          "Customer testimonials"
        ]}
      />
    </div>
  );
}
