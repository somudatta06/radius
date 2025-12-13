import PlatformComparison from '../PlatformComparison';

export default function PlatformComparisonExample() {
  const mockData = [
    { platform: 'ChatGPT', score: 82, color: 'hsl(var(--chart-1))' },
    { platform: 'Claude', score: 75, color: 'hsl(var(--chart-3))' },
    { platform: 'Gemini', score: 78, color: 'hsl(var(--chart-4))' },
    { platform: 'Perplexity', score: 71, color: 'hsl(var(--chart-2))' },
  ];

  return (
    <div className="p-6">
      <PlatformComparison data={mockData} />
    </div>
  );
}
