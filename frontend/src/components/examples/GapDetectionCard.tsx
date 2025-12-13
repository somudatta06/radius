import GapDetectionCard from '../GapDetectionCard';

export default function GapDetectionCardExample() {
  const mockGaps = [
    { element: 'FAQ Section', impact: 'high' as const, found: false },
    { element: 'Comparison Pages', impact: 'high' as const, found: false },
    { element: 'Customer Testimonials', impact: 'medium' as const, found: false },
    { element: 'Pricing Information', impact: 'medium' as const, found: true },
    { element: 'About Page', impact: 'low' as const, found: true },
    { element: 'Blog Content', impact: 'medium' as const, found: true },
    { element: 'Documentation', impact: 'high' as const, found: false },
    { element: 'Use Cases', impact: 'medium' as const, found: false },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <GapDetectionCard gaps={mockGaps} />
    </div>
  );
}
