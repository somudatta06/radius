import DashboardHeader from '../DashboardHeader';

export default function DashboardHeaderExample() {
  return (
    <div>
      <DashboardHeader 
        websiteUrl="https://example.com"
        onNewAnalysis={() => console.log('New analysis clicked')}
      />
      <div className="p-6">
        <p className="text-muted-foreground">Content below header...</p>
      </div>
    </div>
  );
}
