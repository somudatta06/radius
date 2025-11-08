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
      className={isCurrentBrand ? "border-2 border-foreground" : ""}
      data-testid={`card-competitor-${rank}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted font-bold text-lg flex-shrink-0">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate" data-testid={`text-competitor-name-${rank}`}>
                {name}
              </h3>
              {isCurrentBrand && (
                <span className="bg-foreground text-background text-xs px-2 py-0.5 rounded">You</span>
              )}
            </div>
            <a 
              href={`https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
              data-testid={`link-competitor-domain-${rank}`}
            >
              {domain}
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <div className="flex flex-wrap gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-bold" data-testid={`text-competitor-score-${rank}`}>{score}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Overlap:</span>
                <span className="font-bold">{marketOverlap}%</span>
              </div>
              {funding !== undefined && (
                <div className="flex items-center gap-1 text-sm" data-testid={`text-competitor-funding-${rank}`}>
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold">${(funding / 1000000).toFixed(1)}M</span>
                </div>
              )}
              {employees !== undefined && (
                <div className="flex items-center gap-1 text-sm" data-testid={`text-competitor-employees-${rank}`}>
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold">{employees.toLocaleString()}</span>
                </div>
              )}
              {founded !== undefined && (
                <div className="flex items-center gap-1 text-sm" data-testid={`text-competitor-founded-${rank}`}>
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold">{founded}</span>
                </div>
              )}
            </div>

            {description && (
              <div className="mb-3 pb-3 border-b">
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Description:</p>
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-competitor-description-${rank}`}>
                  {description}
                </p>
              </div>
            )}

            {strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Key Strengths:</p>
                <ul className="text-sm space-y-1.5">
                  {strengths.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="text-card-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-foreground mt-2 flex-shrink-0" />
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
