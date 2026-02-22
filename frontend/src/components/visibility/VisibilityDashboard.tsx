import { useQuery } from '@tanstack/react-query';
import { TrendingUp, MapPin, Award, BarChart3, Heart, Target } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VisibilityDashboardProps {
  brandId?: string;
  domain?: string;  // Added domain prop for REAL competitor data
}

export function VisibilityDashboard({ brandId = 'current', domain }: VisibilityDashboardProps) {
  // Build query params with domain for REAL competitor data
  const domainParam = domain ? `&domain=${encodeURIComponent(domain)}` : '';
  
  // Fetch all visibility metrics with REAL competitor data
  const { data: mentionData, isLoading: mentionLoading } = useQuery({
    queryKey: ['visibility-mention', brandId, domain],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/visibility/mention-rate?brand_id=${brandId}${domainParam}`);
      return res.json();
    }
  });

  const { data: positionData, isLoading: positionLoading } = useQuery({
    queryKey: ['visibility-position', brandId, domain],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/visibility/position?brand_id=${brandId}${domainParam}`);
      return res.json();
    }
  });

  const { data: sentimentData, isLoading: sentimentLoading } = useQuery({
    queryKey: ['visibility-sentiment', brandId, domain],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/visibility/sentiment?brand_id=${brandId}${domainParam}`);
      return res.json();
    }
  });

  const { data: shareData, isLoading: shareLoading } = useQuery({
    queryKey: ['visibility-share', domain],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/visibility/share-of-voice?${domain ? `domain=${encodeURIComponent(domain)}` : ''}`);
      return res.json();
    }
  });

  const { data: geoData, isLoading: geoLoading } = useQuery({
    queryKey: ['visibility-geo'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/visibility/geographic`);
      return res.json();
    }
  });

  const isLoading = mentionLoading || positionLoading || sentimentLoading || shareLoading || geoLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Visibility Analytics</h2>
        <p className="text-muted-foreground">
          Track how visible your brand is across AI-generated answers compared to competitors
        </p>
      </div>

      {/* Mention Rate Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Average Mention Rate</h3>
          </div>
          
          <div className="mb-4">
            <div className="text-4xl font-bold">{mentionData?.metrics?.current || 0}%</div>
            <div className="text-sm text-muted-foreground">Current Period</div>
          </div>

          {mentionData?.metrics?.time_series && (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={mentionData.metrics.time_series}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h4 className="font-semibold mb-4">Mention Rate Rankings</h4>
          <div className="space-y-2">
            {mentionData?.rankings?.slice(0, 5).map((rank: any) => (
              <div
                key={rank.rank}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  rank.is_current ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">#{rank.rank}</span>
                  <span>{rank.competitor_name}</span>
                  {rank.is_current && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">You</span>
                  )}
                </div>
                <span className="font-bold">{rank.mention_rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Position & Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Average Position</h3>
          </div>
          
          <div className="mb-4">
            <div className="text-4xl font-bold">#{positionData?.metrics?.current || 0}</div>
            <div className="text-sm text-muted-foreground">Average Ranking (Lower is Better)</div>
          </div>

          <div className="space-y-2">
            {positionData?.rankings?.slice(0, 5).map((rank: any) => (
              <div
                key={rank.rank}
                className={`flex justify-between items-center p-2 rounded ${
                  rank.is_current ? 'bg-primary/10' : ''
                }`}
              >
                <span>#{rank.rank} {rank.competitor_name}</span>
                <span className="font-semibold">#{rank.avg_position}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
          </div>
          
          <div className="mb-4">
            <div className="text-4xl font-bold">{sentimentData?.score || 0}%</div>
            <div className="text-sm text-muted-foreground">Positive Sentiment</div>
          </div>

          {sentimentData?.time_series && (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={sentimentData.time_series}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#00C49F" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Share of Voice */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Share of Voice</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {shareData?.competitors && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shareData.competitors}
                    dataKey="share"
                    nameKey="competitor_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry: any) => `${entry.competitor_name}: ${entry.share}%`}
                  >
                    {shareData.competitors.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4">Share of Voice Rankings</h4>
            <div className="space-y-2">
              {shareData?.competitors?.map((comp: any) => (
                <div
                  key={comp.rank}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    comp.is_current ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{comp.rank}</span>
                    <span>{comp.competitor_name}</span>
                    {comp.is_current && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">You</span>
                    )}
                  </div>
                  <span className="font-bold">{comp.share}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Geographic Performance</h3>
        </div>
        
        {geoData && geoData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geoData}>
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mention_rate" fill="#8884d8" name="Mention Rate %" />
              <Bar dataKey="share_of_voice" fill="#82ca9d" name="Share of Voice %" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Run prompts with geo targeting enabled to see geographic performance</p>
          </div>
        )}
      </div>
    </div>
  );
}
