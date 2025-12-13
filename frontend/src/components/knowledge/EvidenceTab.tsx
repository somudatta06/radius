import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, Star, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Evidence {
  id: string;
  type: string;
  title: string;
  content: string;
  source?: string;
  created_at: string;
}

interface EvidenceTabProps {
  data: Evidence[];
}

export function EvidenceTab({ data }: EvidenceTabProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    type: "case_study",
    title: "",
    content: "",
    source: "",
  });

  const addMutation = useMutation({
    mutationFn: async (evidence: typeof newEvidence) => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/knowledge-base/evidence?company_id=default`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence }),
      });
      if (!res.ok) throw new Error("Failed to add evidence");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({ title: "Evidence added successfully" });
      setIsAddDialogOpen(false);
      setNewEvidence({ type: "case_study", title: "", content: "", source: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (evidenceId: string) => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/knowledge-base/evidence/${evidenceId}?company_id=default`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({ title: "Evidence deleted" });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "case_study":
        return <FileText className="h-5 w-5" />;
      case "review":
        return <Star className="h-5 w-5" />;
      case "statistic":
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "case_study":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-green-100 text-green-800";
      case "statistic":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Evidence Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Supporting Evidence</h3>
          <p className="text-sm text-muted-foreground">
            Case studies, testimonials, and statistics that back up your claims
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Evidence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Evidence</DialogTitle>
              <DialogDescription>
                Add supporting evidence to strengthen your brand claims
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newEvidence.type}
                  onValueChange={(value) =>
                    setNewEvidence({ ...newEvidence, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="case_study">Case Study</SelectItem>
                    <SelectItem value="review">Customer Review</SelectItem>
                    <SelectItem value="statistic">Statistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newEvidence.title}
                  onChange={(e) =>
                    setNewEvidence({ ...newEvidence, title: e.target.value })
                  }
                  placeholder="e.g., Acme Corp increases ROI by 300%"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newEvidence.content}
                  onChange={(e) =>
                    setNewEvidence({ ...newEvidence, content: e.target.value })
                  }
                  rows={6}
                  placeholder="Detailed description of the evidence..."
                />
              </div>
              <div className="space-y-2">
                <Label>Source (Optional)</Label>
                <Input
                  value={newEvidence.source}
                  onChange={(e) =>
                    setNewEvidence({ ...newEvidence, source: e.target.value })
                  }
                  placeholder="https://example.com/source"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log("Add Evidence clicked, newEvidence:", newEvidence);
                  addMutation.mutate(newEvidence);
                }}
                disabled={addMutation.isPending || !newEvidence.title.trim() || !newEvidence.content.trim()}
                data-testid="submit-evidence"
              >
                Add Evidence
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Evidence List */}
      {data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No evidence yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Add case studies, testimonials, and statistics to support your brand claims.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((evidence) => (
            <Card key={evidence.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getTypeIcon(evidence.type)}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{evidence.title}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={`mt-2 ${getTypeBadgeColor(evidence.type)}`}
                      >
                        {evidence.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(evidence.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{evidence.content}</p>
                {evidence.source && (
                  <a
                    href={evidence.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View Source →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
