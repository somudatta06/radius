import StatsCard from '../StatsCard';
import { TrendingUp, Target, Users, Zap } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatsCard
        title="Overall Score"
        value="78"
        subtitle="+12% from last month"
        icon={TrendingUp}
        trend="up"
      />
      <StatsCard
        title="Mention Rate"
        value="64%"
        subtitle="Mentioned in 64% of queries"
        icon={Target}
      />
      <StatsCard
        title="Competitor Position"
        value="#3"
        subtitle="Out of 8 competitors"
        icon={Users}
      />
      <StatsCard
        title="Platform Average"
        value="72"
        subtitle="Across 4 AI platforms"
        icon={Zap}
      />
    </div>
  );
}
