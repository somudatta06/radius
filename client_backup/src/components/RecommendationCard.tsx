import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationCardProps {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "content" | "technical" | "seo" | "competitive";
  actionItems: string[];
  estimatedImpact: string;
}

export default function RecommendationCard({
  title,
  description,
  priority,
  category,
  actionItems,
  estimatedImpact
}: RecommendationCardProps) {
  const getPriorityBadgeStyle = () => {
    switch (priority) {
      case "high":
        return "bg-foreground text-background px-3 py-1 rounded-full text-xs font-medium";
      case "medium":
        return "border border-border text-foreground px-3 py-1 rounded-full text-xs font-medium";
      case "low":
        return "bg-muted text-foreground px-3 py-1 rounded-full text-xs font-medium";
    }
  };

  return (
    <Card data-testid={`card-recommendation-${category}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col gap-2 items-end flex-shrink-0">
            <span className={getPriorityBadgeStyle()} data-testid={`badge-priority-${priority}`}>
              {priority.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{category}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-3">Action Items:</h4>
          <ul className="space-y-2.5">
            {actionItems.map((item, idx) => (
              <li key={idx} className="text-sm text-card-foreground flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-3 border-t flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Estimated Impact:</span>
          <span className="font-semibold">{estimatedImpact}</span>
        </div>
      </CardContent>
    </Card>
  );
}
