import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitorAnalysis } from "@/lib/geo-types";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface CompetitorComparisonProps {
  userBrand: CompetitorAnalysis;
  competitors: CompetitorAnalysis[];
}

export function CompetitorComparison({ userBrand, competitors }: CompetitorComparisonProps) {
  const getComparisonIcon = (yourScore: number, competitorScore: number) => {
    if (yourScore > competitorScore) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else if (yourScore < competitorScore) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-500';
    if (score >= 6) return 'text-blue-600 dark:text-blue-500';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-500';
    if (score >= 2) return 'text-orange-600 dark:text-orange-500';
    return 'text-red-600 dark:text-red-500';
  };

  return (
    <Card data-testid="card-competitor-comparison">
      <CardHeader>
        <CardTitle className="text-2xl">Competitive Landscape</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Brand</th>
                <th className="text-center p-3 font-semibold">Discovery</th>
                <th className="text-center p-3 font-semibold">Comparison</th>
                <th className="text-center p-3 font-semibold">Utility</th>
                <th className="text-center p-3 font-semibold">Overall</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-muted/50" data-testid="row-your-brand">
                <td className="p-3">
                  <div className="font-bold">{userBrand.name}</div>
                  <div className="text-xs text-muted-foreground">Your Brand</div>
                </td>
                <td className="text-center p-3">
                  <div className={`text-lg font-bold ${getScoreColor(userBrand.discovery_score)}`}>
                    {userBrand.discovery_score.toFixed(1)}
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className={`text-lg font-bold ${getScoreColor(userBrand.comparison_score)}`}>
                    {userBrand.comparison_score.toFixed(1)}
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className={`text-lg font-bold ${getScoreColor(userBrand.utility_score)}`}>
                    {userBrand.utility_score.toFixed(1)}
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className={`text-lg font-bold ${getScoreColor(userBrand.overall_geo_score)}`}>
                    {userBrand.overall_geo_score.toFixed(1)}
                  </div>
                </td>
              </tr>
              
              {competitors.map((competitor, idx) => (
                <tr key={idx} className="border-b hover-elevate" data-testid={`row-competitor-${idx}`}>
                  <td className="p-3">
                    <div className="font-medium">{competitor.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{competitor.url}</div>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-2">
                      {getComparisonIcon(userBrand.discovery_score, competitor.discovery_score)}
                      <span className={`font-semibold ${getScoreColor(competitor.discovery_score)}`}>
                        {competitor.discovery_score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-2">
                      {getComparisonIcon(userBrand.comparison_score, competitor.comparison_score)}
                      <span className={`font-semibold ${getScoreColor(competitor.comparison_score)}`}>
                        {competitor.comparison_score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-2">
                      {getComparisonIcon(userBrand.utility_score, competitor.utility_score)}
                      <span className={`font-semibold ${getScoreColor(competitor.utility_score)}`}>
                        {competitor.utility_score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-2">
                      {getComparisonIcon(userBrand.overall_geo_score, competitor.overall_geo_score)}
                      <span className={`font-semibold ${getScoreColor(competitor.overall_geo_score)}`}>
                        {competitor.overall_geo_score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {competitors.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Key Insights</h3>
            {competitors.slice(0, 3).map((competitor, idx) => (
              <div key={idx} className="space-y-2">
                <div className="font-medium">{competitor.name}</div>
                {competitor.key_differentiators && competitor.key_differentiators.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {competitor.key_differentiators.map((diff, dIdx) => (
                      <li key={dIdx}>{diff}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
