import ScoreBreakdown from '../ScoreBreakdown';

export default function ScoreBreakdownExample() {
  const mockData = [
    { dimension: 'Mention Rate', score: 82, fullMark: 100 },
    { dimension: 'Context Quality', score: 75, fullMark: 100 },
    { dimension: 'Sentiment', score: 88, fullMark: 100 },
    { dimension: 'Prominence', score: 68, fullMark: 100 },
    { dimension: 'Competitor Comparison', score: 72, fullMark: 100 },
    { dimension: 'Recommendation Likelihood', score: 78, fullMark: 100 },
  ];

  return (
    <div className="p-6">
      <ScoreBreakdown data={mockData} />
    </div>
  );
}
