import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, DollarSign, Users, Calendar } from "lucide-react";

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
      className={`transition-all hover-elevate ${isCurrentBrand ? "border-2 border-foreground bg-accent/5" : ""}`}
      data-testid={`card-competitor-${rank}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-muted font-bold text-lg flex-shrink-0 border border-border">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-lg" data-testid={`text-competitor-name-${rank}`}>
                {name}
              </h3>
              {isCurrentBrand && (
                <span className="bg-foreground text-background text-xs font-bold px-2.5 py-1 rounded-md">YOU</span>
              )}
            </div>
            <a 
              href={`https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4 transition-colors"
              data-testid={`link-competitor-domain-${rank}`}
            >
              {domain}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Score:</span>
                <span className="font-bold text-base" data-testid={`text-competitor-score-${rank}`}>{score}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Overlap:</span>
                <span className="font-bold text-base">{marketOverlap}%</span>
              </div>
              {funding !== undefined && (
                <div className="flex items-center gap-1.5" data-testid={`text-competitor-funding-${rank}`}>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">${(funding / 1000000).toFixed(1)}M</span>
                </div>
              )}
              {employees !== undefined && (
                <div className="flex items-center gap-1.5" data-testid={`text-competitor-employees-${rank}`}>
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{employees.toLocaleString()}</span>
                </div>
              )}
              {founded !== undefined && (
                <div className="flex items-center gap-1.5" data-testid={`text-competitor-founded-${rank}`}>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{founded}</span>
                </div>
              )}
            </div>

            {description && (
              <div className="mb-4 pb-4 border-b border-border/50">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">About</p>
                <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed" data-testid={`text-competitor-description-${rank}`}>
                  {description}
                </p>
              </div>
            )}

            {strengths.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2.5">Key Strengths</p>
                <ul className="space-y-2">
                  {strengths.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="text-sm text-foreground/90 flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/70 mt-1.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
