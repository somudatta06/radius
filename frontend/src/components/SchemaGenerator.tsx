import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, AlertTriangle, Zap, Code2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SchemaItem {
    type: string;
    description: string;
    json_ld: Record<string, unknown>;
    implementation_note: string;
}

interface SchemaData {
    schemas: SchemaItem[];
    total_schemas: number;
    estimated_visibility_boost: "high" | "medium" | "low";
    priority_order: string[];
    implementation_summary: string;
    is_demo?: boolean;
}

interface SchemaGeneratorProps {
    brandName?: string;
    domain?: string;
    websiteData?: Record<string, unknown>;
    analysisData?: Record<string, unknown>;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs gap-1">
            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
        </Button>
    );
}

const boostColors: Record<string, string> = {
    high: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
};

const schemaTypeColors: Record<string, string> = {
    Organization: "bg-blue-100 text-blue-800",
    FAQPage: "bg-purple-100 text-purple-800",
    Product: "bg-orange-100 text-orange-800",
    WebSite: "bg-teal-100 text-teal-800",
    Article: "bg-pink-100 text-pink-800",
    BreadcrumbList: "bg-indigo-100 text-indigo-800",
};

export function SchemaGenerator({ brandName, domain, websiteData, analysisData }: SchemaGeneratorProps) {
    const { data, isLoading, error } = useQuery<SchemaData>({
        queryKey: ["schema-generator", brandName],
        queryFn: async () => {
            const res = await fetch("/api/schema-generator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brand_name: brandName || "Brand",
                    domain: domain || "",
                    website_data: websiteData || {},
                    analysis_data: analysisData || {},
                }),
            });
            if (!res.ok) throw new Error("Schema generation failed");
            return res.json();
        },
        enabled: !!brandName,
        staleTime: 1000 * 60 * 10,
    });

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-muted rounded-xl" />
                <div className="h-64 bg-muted rounded-xl" />
                <div className="h-64 bg-muted rounded-xl" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>Failed to generate schemas. Check that the backend is running.</span>
            </div>
        );
    }

    const scriptTagFor = (jsonLd: Record<string, unknown>) =>
        `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Schema Generator</h2>
                <p className="text-muted-foreground mt-1">
                    JSON-LD structured data to improve your visibility in Google AI Overviews and AI chatbot citations
                </p>
            </div>

            {data.is_demo && (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Demo schemas — add <code className="font-mono bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> in{" "}
                    <code className="font-mono bg-amber-100 px-1 rounded">backend/.env</code> for brand-specific schemas
                </div>
            )}

            {/* Impact + Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-muted-foreground">Estimated Visibility Boost</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${boostColors[data.estimated_visibility_boost]}`}>
                        {data.estimated_visibility_boost.toUpperCase()}
                    </span>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{data.implementation_summary}</p>
                </div>

                <div className="border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Code2 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-muted-foreground">Implementation Priority</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.priority_order.map((type, i) => (
                            <div key={type} className="flex items-center gap-1.5">
                                {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${schemaTypeColors[type] || "bg-gray-100 text-gray-700"}`}>
                                    #{i + 1} {type}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">{data.total_schemas} schemas total — implement in the order shown above for maximum impact</p>
                </div>
            </div>

            {/* Schema Cards */}
            <div className="space-y-5">
                {data.schemas.map((schema, idx) => {
                    const jsonStr = JSON.stringify(schema.json_ld, null, 2);
                    const scriptTag = scriptTagFor(schema.json_ld);
                    const priority = data.priority_order.indexOf(schema.type) + 1;

                    return (
                        <div key={idx} className="border rounded-xl overflow-hidden">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-4 px-5 py-4 bg-muted/30 border-b">
                                <div className="flex items-center gap-3">
                                    {priority > 0 && (
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                                            {priority}
                                        </span>
                                    )}
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${schemaTypeColors[schema.type] || "bg-gray-100 text-gray-700"}`}>
                                            {schema.type}
                                        </span>
                                        <p className="text-sm text-muted-foreground mt-1">{schema.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Implementation Note */}
                            <div className="px-5 py-3 border-b bg-blue-50/50 flex items-center gap-2 text-xs text-blue-700">
                                <span className="font-medium">📌 Where to add:</span>
                                <span>{schema.implementation_note}</span>
                            </div>

                            {/* Code Block */}
                            <div className="relative">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono">JSON-LD</span>
                                    <div className="flex gap-2">
                                        <CopyButton text={jsonStr} />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigator.clipboard.writeText(scriptTag)}
                                            className="h-7 px-2 text-xs gap-1 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                                        >
                                            <Code2 className="w-3 h-3" />
                                            Copy &lt;script&gt; tag
                                        </Button>
                                    </div>
                                </div>
                                <pre className="bg-gray-950 text-gray-100 p-4 text-xs font-mono overflow-auto max-h-72 leading-relaxed">
                                    {jsonStr}
                                </pre>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
