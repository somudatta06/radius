import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PlatformScore {
  platform: string;
  score: number;
  color: string;
}

interface PlatformComparisonProps {
  data: PlatformScore[];
}

export default function PlatformComparison({ data }: PlatformComparisonProps) {
  return (
    <Card data-testid="card-platform-comparison">
      <CardHeader>
        <CardTitle>Platform Visibility Scores</CardTitle>
        <CardDescription>
          How your brand performs across different AI platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="0" stroke="hsl(var(--border))" strokeWidth={1} />
            <XAxis 
              dataKey="platform" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                color: 'hsl(var(--foreground))'
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar 
              dataKey="score" 
              radius={[4, 4, 0, 0]}
              fill="hsl(var(--foreground))"
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
