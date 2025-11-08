import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReportData } from "@/lib/geo-types";
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  coverPage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center'
  },
  scoreCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300
  },
  bigScore: {
    fontSize: 48,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  scoreLabel: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
    color: '#666666'
  },
  section: {
    margin: 10,
    padding: 15,
    borderBottom: '1px solid #E5E5E5'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000'
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#333333'
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333'
  },
  table: {
    display: 'flex',
    width: '100%',
    marginVertical: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E5E5',
    paddingVertical: 8
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '2px solid #000000',
    paddingVertical: 8,
    backgroundColor: '#F5F5F5'
  },
  tableCell: {
    padding: 4,
    fontSize: 10,
    flex: 1
  },
  tableCellBold: {
    padding: 4,
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999'
  },
  listItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 10,
    color: '#333333'
  },
  metricBox: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    marginVertical: 6,
    borderRadius: 4
  },
  metricScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 10,
    color: '#666666'
  }
});

interface RadiusPDFDocumentProps {
  data: ReportData;
}

function RadiusPDFDocument({ data }: RadiusPDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.title}>Radius GEO Analysis Report</Text>
          <Text style={styles.subtitle}>{data.websiteUrl}</Text>
          <Text style={{ ...styles.text, marginBottom: 20 }}>
            Generated: {format(data.generatedAt, 'MMMM dd, yyyy')}
          </Text>
          <View style={styles.scoreCard}>
            <Text style={styles.bigScore}>{data.overallScore.toFixed(1)}/10</Text>
            <Text style={styles.scoreLabel}>Overall GEO Score</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.section}>
          <Text style={styles.text}>{data.executiveSummary}</Text>
        </View>

        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableCellBold, flex: 2 }}>Metric</Text>
            <Text style={styles.tableCellBold}>Score</Text>
            <Text style={styles.tableCellBold}>Weight</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Answerability & Intent Coverage (AIC)</Text>
            <Text style={styles.tableCell}>{data.aic.toFixed(1)}/10</Text>
            <Text style={styles.tableCell}>40%</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Credibility, Evidence & Safety (CES)</Text>
            <Text style={styles.tableCell}>{data.ces.toFixed(1)}/10</Text>
            <Text style={styles.tableCell}>35%</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Machine-Readability & Technical Signals (MTS)</Text>
            <Text style={styles.tableCell}>{data.mts.toFixed(1)}/10</Text>
            <Text style={styles.tableCell}>25%</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>AI Platform Visibility Analysis</Text>
        {data.platforms.map((platform, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>
              {platform.platform}: {platform.overall_score.toFixed(1)}/10
            </Text>
            <Text style={styles.text}>{platform.analysis}</Text>
            
            {platform.strengths.length > 0 && (
              <>
                <Text style={styles.sectionSubtitle}>Strengths:</Text>
                {platform.strengths.map((strength, sIdx) => (
                  <Text key={sIdx} style={styles.listItem}>• {strength}</Text>
                ))}
              </>
            )}
            
            {platform.weaknesses.length > 0 && (
              <>
                <Text style={styles.sectionSubtitle}>Weaknesses:</Text>
                {platform.weaknesses.map((weakness, wIdx) => (
                  <Text key={wIdx} style={styles.listItem}>• {weakness}</Text>
                ))}
              </>
            )}
          </View>
        ))}
      </Page>

      {data.competitors.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Competitive Landscape</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableCellBold, flex: 2 }}>Competitor</Text>
              <Text style={styles.tableCellBold}>Discovery</Text>
              <Text style={styles.tableCellBold}>Comparison</Text>
              <Text style={styles.tableCellBold}>Utility</Text>
              <Text style={styles.tableCellBold}>Overall</Text>
            </View>
            {data.competitors.slice(0, 10).map((competitor, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, flex: 2 }}>{competitor.name}</Text>
                <Text style={styles.tableCell}>{competitor.discovery_score.toFixed(1)}</Text>
                <Text style={styles.tableCell}>{competitor.comparison_score.toFixed(1)}</Text>
                <Text style={styles.tableCell}>{competitor.utility_score.toFixed(1)}</Text>
                <Text style={styles.tableCell}>{competitor.overall_geo_score.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {data.quickWins.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Quick Wins</Text>
          <Text style={{ ...styles.text, marginBottom: 15 }}>
            High-impact, low-effort improvements you can implement immediately:
          </Text>
          {data.quickWins.map((win, idx) => (
            <View key={idx} style={styles.metricBox}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{win.title}</Text>
              <Text style={styles.text}>{win.description}</Text>
              <Text style={{ ...styles.text, marginTop: 6, fontSize: 9, color: '#666666' }}>
                Owner: {win.owner}
              </Text>
            </View>
          ))}
        </Page>
      )}

      {data.strategicBets.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Strategic Bets</Text>
          <Text style={{ ...styles.text, marginBottom: 15 }}>
            High-impact, strategic initiatives for long-term AI visibility:
          </Text>
          {data.strategicBets.map((bet, idx) => (
            <View key={idx} style={styles.metricBox}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>{bet.title}</Text>
              <Text style={styles.text}>{bet.description}</Text>
              <Text style={{ ...styles.text, marginTop: 6, fontSize: 9, color: '#666666' }}>
                Owner: {bet.owner} | Timeline: {bet.timeline || 'TBD'}
              </Text>
            </View>
          ))}
        </Page>
      )}

      {data.accuracyChecks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>LLM Accuracy Verification</Text>
          {data.accuracyChecks.map((check, idx) => (
            <View key={idx} style={styles.metricBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{check.platform}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{check.overall_accuracy}%</Text>
              </View>
              
              {check.hallucinations.length > 0 && (
                <>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 6, color: '#DC2626' }}>
                    Hallucinations Detected: {check.hallucinations.length}
                  </Text>
                  {check.hallucinations.slice(0, 3).map((h, hIdx) => (
                    <Text key={hIdx} style={{ fontSize: 9, marginTop: 2, color: '#666666' }}>
                      • "{h.claim}" - {h.reason}
                    </Text>
                  ))}
                </>
              )}
            </View>
          ))}
        </Page>
      )}

      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.title}>Thank You</Text>
          <Text style={{ ...styles.text, textAlign: 'center', marginBottom: 20 }}>
            For more information about improving your AI visibility, visit:
          </Text>
          <Text style={{ ...styles.subtitle, fontSize: 14 }}>
            https://radius.ai
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface PDFReportProps {
  data: ReportData;
  filename?: string;
}

export function PDFReport({ data, filename }: PDFReportProps) {
  const defaultFilename = `radius-demo-report-${format(data.generatedAt, 'yyyy-MM-dd')}.pdf`;
  
  return (
    <div className="flex items-center gap-2">
      <PDFDownloadLink
        document={<RadiusPDFDocument data={data} />}
        fileName={filename || defaultFilename}
      >
        {({ loading }) => (
          <Button
            variant="outline"
            disabled={loading}
            data-testid="button-download-pdf"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {loading ? 'Generating...' : 'Preview PDF (Demo)'}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
}
