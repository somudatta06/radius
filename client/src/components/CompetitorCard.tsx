import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, TrendingDown, DollarSign, Users, Calendar } from "lucide-react";

interface CompetitorCardProps {
  rank: number;
  name: string;
  domain: string;
  score: number;
  marketOverlap: number;
  strengths: string[];
  isCurrentBrand?: boolean;
  funding?: number;
  employees?: number;
  founded?: number;
  description?: string;
}

export default function CompetitorCard({
  rank,
  name,
  domain,
  score,
  marketOverlap,
  strengths,
  isCurrentBrand = false,
  funding,
  employees,
  founded,
  description
}: CompetitorCardProps) {
  return (
    <Card 
      className={isCurrentBrand ? "border-primary" : ""}
      data-testid={`card-competitor-${rank}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-bold text-lg">
              {rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate" data-testid={`text-competitor-name-${rank}`}>
                  {name}
                </h3>
                {isCurrentBrand && (
                  <Badge variant="default" className="text-xs">You</Badge>
                )}
              </div>
              <a 
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-3"
                data-testid={`link-competitor-domain-${rank}`}
              >
                {domain}
                <ExternalLink className="w-3 h-3" />
              </a>
              
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-semibold" data-testid={`text-competitor-score-${rank}`}>{score}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Overlap:</span>
                  <span className="font-semibold">{marketOverlap}%</span>
                </div>
                {funding !== undefined && (
                  <div className="flex items-center gap-1 text-sm" data-testid={`text-competitor-funding-${rank}`}>
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <span className="font-semibold">${(funding / 1000000).toFixed(1)}M</span>
                  </div>
                )}
                {employees !== undefined && (
                  <div className="flex items-center gap-1 text-sm" data-testid={`text-competitor-employees-${rank}`}>
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="font-semibold">{employees.toLocaleString()}</span>
                  </div>
                )}
                {founded !== undefined && (
                  <div className="flex items-center gap-1 text-sm" data-testid={`text-competitor-founded-${rank}`}>
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="font-semibold">{founded}</span>
                  </div>
                )}
              </div>

              {strengths.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Key Strengths:</p>
                  <ul className="text-sm space-y-1">
                    {strengths.slice(0, 2).map((strength, idx) => (
                      <li key={idx} className="text-muted-foreground">• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {isCurrentBrand ? (
              <TrendingUp className="w-5 h-5 text-chart-2" />
            ) : rank < 3 ? (
              <TrendingDown className="w-5 h-5 text-destructive" />
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
