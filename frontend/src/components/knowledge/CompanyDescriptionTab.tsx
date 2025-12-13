import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, Edit2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface CompanyDescriptionData {
  overview: string;
  products_services: string;
  target_customers: string;
  positioning: string;
  is_ai_generated: boolean;
  last_edited: string;
}

interface CompanyDescriptionTabProps {
  data?: CompanyDescriptionData;
}

export function CompanyDescriptionTab({ data }: CompanyDescriptionTabProps) {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<CompanyDescriptionData>) => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/knowledge-base/company-description?company_id=default`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({ title: "Updated successfully" });
      setEditingField(null);
      setEditValues({});
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  const improveMutation = useMutation({
    mutationFn: async ({ text, mode }: { text: string; mode: string }) => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(
        `${backendUrl}/api/knowledge-base/improve?mode=${mode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );
      if (!res.ok) throw new Error("Failed to improve");
      return await res.json();
    },
    onSuccess: (result, variables) => {
      setEditValues((prev) => ({ ...prev, [editingField!]: result.improved_text }));
      toast({ title: "AI improvement applied" });
    },
  });

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: currentValue });
  };

  const handleSave = (field: string) => {
    updateMutation.mutate({ [field]: editValues[field] } as any);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleImprove = (mode: string) => {
    if (editingField && editValues[editingField]) {
      improveMutation.mutate({ text: editValues[editingField], mode });
    }
  };

  const renderField = (field: string, title: string, value: string, description?: string) => {
    const isEditing = editingField === field;
    const currentValue = isEditing ? editValues[field] : value;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("Edit clicked for field:", field);
                  handleEdit(field, value || "");
                }}
                data-testid={`edit-${field}`}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <Textarea
                value={currentValue}
                onChange={(e) =>
                  setEditValues({ ...editValues, [field]: e.target.value })
                }
                rows={8}
                className="w-full font-mono text-sm"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => handleSave(field)}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <div className="border-l pl-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImprove("improve")}
                    disabled={improveMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Improve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImprove("concise")}
                    disabled={improveMutation.isPending}
                  >
                    Make Concise
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {currentValue ? (
                currentValue.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('•') ? 'ml-4' : ''}>
                    {line || <br />}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground italic">No content yet. Click edit to add.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {data?.is_ai_generated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-900 font-semibold">
                  AI-Generated Content (Editable)
                </p>
              </div>
              <p className="text-xs text-blue-800">
                This content was generated by analyzing your website. 
                It may include inferences based on content patterns and structure.
                All fields are editable - you can refine or replace any information.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-blue-700">
                  🟢 Based on verified website content
                </span>
                <span className="text-xs text-blue-700">
                  🟡 Some information inferred from context
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {renderField(
        "overview",
        "Company Overview",
        data?.overview || "",
        "High-level description of your company"
      )}

      {renderField(
        "products_services",
        "Products & Services",
        data?.products_services || "",
        "What you offer to customers"
      )}

      {renderField(
        "target_customers",
        "Target Customers",
        data?.target_customers || "",
        "Who your ideal customers are"
      )}

      {renderField(
        "positioning",
        "Market Positioning",
        data?.positioning || "",
        "How you differentiate from competitors"
      )}
    </div>
  );
}
