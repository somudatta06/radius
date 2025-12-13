import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X, Link as LinkIcon, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface BrandGuidelinesData {
  tone?: string;
  words_to_prefer: string[];
  words_to_avoid: string[];
  dos: string[];
  donts: string[];
  sentence_style?: string;
  reference_urls: string[];
  is_ai_extracted: boolean;
}

interface BrandGuidelinesTabProps {
  data?: BrandGuidelinesData;
}

export function BrandGuidelinesTab({ data }: BrandGuidelinesTabProps) {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState<Record<string, string>>({});
  const [extractUrl, setExtractUrl] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<BrandGuidelinesData>) => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/knowledge-base/brand-guidelines?company_id=default`, {
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
      setNewItem({});
    },
  });

  const extractMutation = useMutation({
    mutationFn: async (url: string) => {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/knowledge-base/extract-guidelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Failed to extract");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({ title: "Guidelines extracted successfully" });
      setExtractUrl("");
    },
  });

  const addItem = (field: string, value: string) => {
    if (!value.trim()) return;
    const currentList = (data?.[field as keyof BrandGuidelinesData] as string[]) || [];
    updateMutation.mutate({ [field]: [...currentList, value.trim()] } as any);
  };

  const removeItem = (field: string, index: number) => {
    const currentList = (data?.[field as keyof BrandGuidelinesData] as string[]) || [];
    updateMutation.mutate({ [field]: currentList.filter((_, i) => i !== index) } as any);
  };

  const renderListField = (field: string, title: string, items: string[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={`Add ${title.toLowerCase()}...`}
            value={newItem[field] || ""}
            onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addItem(field, newItem[field] || "");
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => addItem(field, newItem[field] || "")}
            disabled={updateMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="gap-2">
              {item}
              <button
                onClick={() => removeItem(field, idx)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No items added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Extract from URL */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">Extract Guidelines from URL</CardTitle>
          <CardDescription>
            Provide a link to your brand guidelines document or style guide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/brand-guidelines"
              value={extractUrl}
              onChange={(e) => setExtractUrl(e.target.value)}
            />
            <Button
              onClick={() => extractMutation.mutate(extractUrl)}
              disabled={extractMutation.isPending || !extractUrl}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Extract
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Tone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {["Professional", "Friendly", "Bold", "Formal", "Casual"].map((tone) => (
              <Badge
                key={tone}
                variant={data?.tone === tone ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => updateMutation.mutate({ tone })}
              >
                {tone}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {renderListField("words_to_prefer", "Words to Prefer", data?.words_to_prefer || [])}
      {renderListField("words_to_avoid", "Words to Avoid", data?.words_to_avoid || [])}
      {renderListField("dos", "Do's", data?.dos || [])}
      {renderListField("donts", "Don'ts", data?.donts || [])}
    </div>
  );
}
