import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoButton } from "./InfoButton";
import { METRIC_DEFINITIONS, AIC_SUB_METRICS, CES_SUB_METRICS, MTS_SUB_METRICS } from "@/lib/geo-constants";

export function CalculationMethodology() {
  return (
    <Card data-testid="card-methodology">
      <CardHeader>
        <CardTitle className="text-2xl">How We Calculate Your Score</CardTitle>
        <CardDescription>
          Transparent methodology behind your GEO visibility score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Overall Score Formula</h3>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="text-foreground">Final GEO Score = (AIC × 0.40) + (CES × 0.35) + (MTS × 0.25)</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your final score is a weighted average of three core factors, each measuring different aspects of AI visibility.
          </p>
        </div>

        <Tabs defaultValue="AIC" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="AIC">AIC (40%)</TabsTrigger>
            <TabsTrigger value="CES">CES (35%)</TabsTrigger>
            <TabsTrigger value="MTS">MTS (25%)</TabsTrigger>
          </TabsList>

          <TabsContent value="AIC" className="space-y-4">
            <div className="flex items-start gap-2">
              <h4 className="text-lg font-semibold">{METRIC_DEFINITIONS.AIC.title}</h4>
              <InfoButton metric="AIC" definition={METRIC_DEFINITIONS.AIC} />
            </div>
            <p className="text-sm text-muted-foreground">{METRIC_DEFINITIONS.AIC.description}</p>
            
            <div className="space-y-3">
              <h5 className="text-sm font-semibold">Sub-Metrics (5 components)</h5>
              {Object.entries(AIC_SUB_METRICS).map(([key, subMetric]) => (
                <div key={key} className="border-l-2 border-border pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{subMetric.name}</span>
                    <InfoButton metric={subMetric.code} definition={subMetric} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{subMetric.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="font-mono">AIC Score = (s1 + s2 + s3 + s4 + s5) / 5</div>
            </div>
          </TabsContent>

          <TabsContent value="CES" className="space-y-4">
            <div className="flex items-start gap-2">
              <h4 className="text-lg font-semibold">{METRIC_DEFINITIONS.CES.title}</h4>
              <InfoButton metric="CES" definition={METRIC_DEFINITIONS.CES} />
            </div>
            <p className="text-sm text-muted-foreground">{METRIC_DEFINITIONS.CES.description}</p>
            
            <div className="space-y-3">
              <h5 className="text-sm font-semibold">Sub-Metrics (5 components)</h5>
              {Object.entries(CES_SUB_METRICS).map(([key, subMetric]) => (
                <div key={key} className="border-l-2 border-border pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{subMetric.name}</span>
                    <InfoButton metric={subMetric.code} definition={subMetric} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{subMetric.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="font-mono">CES Score = (s1 + s2 + s3 + s4 + s5) / 5</div>
            </div>
          </TabsContent>

          <TabsContent value="MTS" className="space-y-4">
            <div className="flex items-start gap-2">
              <h4 className="text-lg font-semibold">{METRIC_DEFINITIONS.MTS.title}</h4>
              <InfoButton metric="MTS" definition={METRIC_DEFINITIONS.MTS} />
            </div>
            <p className="text-sm text-muted-foreground">{METRIC_DEFINITIONS.MTS.description}</p>
            
            <div className="space-y-3">
              <h5 className="text-sm font-semibold">Sub-Metrics (5 components)</h5>
              {Object.entries(MTS_SUB_METRICS).map(([key, subMetric]) => (
                <div key={key} className="border-l-2 border-border pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{subMetric.name}</span>
                    <InfoButton metric={subMetric.code} definition={subMetric} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{subMetric.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="font-mono">MTS Score = (s1 + s2 + s3 + s4 + s5) / 5</div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-lg font-semibold">Multi-Platform Aggregation</h4>
          <p className="text-sm text-muted-foreground">
            We test your visibility across 4 major AI platforms and average the results:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {['ChatGPT (GPT-4)', 'Claude (Sonnet 4)', 'Google Gemini', 'Perplexity AI'].map((platform) => (
              <div key={platform} className="bg-muted p-2 rounded text-center">
                {platform}
              </div>
            ))}
          </div>
          <div className="bg-muted p-3 rounded-lg text-sm mt-3">
            <div className="font-mono">Overall Platform Score = Average across all 4 platforms</div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-lg font-semibold">Confidence Scoring</h4>
          <p className="text-sm text-muted-foreground">
            Each score includes a confidence metric (0-1) based on:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Data completeness (50%)</li>
            <li>Consistency across platforms (30%)</li>
            <li>Evidence quality (20%)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
