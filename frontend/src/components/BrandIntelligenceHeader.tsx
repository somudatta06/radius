import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, BarChart2, Megaphone, Users, FileText, ArrowRight } from "lucide-react";

interface BrandIntelligenceHeaderProps {
  brandName: string;
  domain: string;
  overallScore: number;
}

function getLetterGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getGradeColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

const pillars = [
  { label: "AI Score", icon: Bot, hasData: true },
  { label: "Gap Analysis", icon: BarChart2, hasData: true },
  { label: "Ad Intelligence", icon: Megaphone, hasData: true },
  { label: "Competitors", icon: Users, hasData: true },
  { label: "Content", icon: FileText, hasData: true },
];

export function BrandIntelligenceHeader({ brandName, domain, overallScore }: BrandIntelligenceHeaderProps) {
  const grade = getLetterGrade(overallScore);
  const gradeColor = getGradeColor(overallScore);
  const scoreColor = getScoreColor(overallScore);

  return (
    <Card className="rounded-2xl p-8 border border-border bg-card mb-6">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Brand identity */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground">{brandName}</h2>
            <p className="text-muted-foreground mt-1">{domain}</p>

            {/* Pillar indicators */}
            <div className="flex flex-wrap gap-3 mt-5">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                      pillar.hasData
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{pillar.label}</span>
                    {!pillar.hasData && <ArrowRight className="w-3 h-3 opacity-60" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score display */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <span className={`text-5xl font-bold ${scoreColor}`}>{overallScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
            <Badge className={`text-sm font-bold border ${gradeColor}`}>{grade}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
