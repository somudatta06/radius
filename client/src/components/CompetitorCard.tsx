import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, DollarSign, Users, Calendar, TrendingUp } from "lucide-react";

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
      className={`group transition-all hover-elevate ${isCurrentBrand ? "border-2 border-foreground/20" : ""}`}
      data-testid={`card-competitor-${rank}`}
    >
      <CardContent className="p-0">
        <div className="p-6 pb-5 border-b border-border/50">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5 text-foreground font-bold text-sm flex-shrink-0">
                  {rank}
                </div>
                <h3 className="font-bold text-xl" data-testid={`text-competitor-name-${rank}`}>
                  {name}
                </h3>
                {isCurrentBrand && (
                  <Badge variant="default" className="text-xs font-bold">
                    YOU
                  </Badge>
                )}
              </div>
              <a 
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors group/link"
                data-testid={`link-competitor-domain-${rank}`}
              >
                <span className="group-hover/link:underline">{domain}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover/link:opacity-100 transition-opacity" />
              </a>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums" data-testid={`text-competitor-score-${rank}`}>{score}</span>
                <span className="text-sm text-muted-foreground font-medium">/100</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">{marketOverlap}%</span>
                <span className="text-xs">overlap</span>
              </div>
            </div>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4" data-testid={`text-competitor-description-${rank}`}>
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {funding !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50" data-testid={`text-competitor-funding-${rank}`}>
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">${(funding / 1000000).toFixed(1)}M</span>
              </div>
            )}
            {employees !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50" data-testid={`text-competitor-employees-${rank}`}>
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">{employees.toLocaleString()}</span>
              </div>
            )}
            {founded !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50" data-testid={`text-competitor-founded-${rank}`}>
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">{founded}</span>
              </div>
            )}
          </div>
        </div>

        {strengths.length > 0 && (
          <div className="px-6 py-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              Key Strengths
            </p>
            <ul className="space-y-2.5">
              {strengths.slice(0, 3).map((strength, idx) => (
                <li key={idx} className="text-sm text-foreground leading-relaxed flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
