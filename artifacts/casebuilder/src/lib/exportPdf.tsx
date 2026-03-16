import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type {
  BusinessCase,
  CostLineItem,
  ValueDriver,
  FinancialModel,
} from "@workspace/api-client-react";

const colors = {
  primary: "#4f46e5",
  dark: "#1e293b",
  muted: "#64748b",
  light: "#f8fafc",
  border: "#e2e8f0",
  green: "#10b981",
  red: "#ef4444",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: colors.dark },
  coverPage: { padding: 60, justifyContent: "center", alignItems: "center", backgroundColor: colors.light },
  coverTitle: { fontSize: 28, fontWeight: "bold", color: colors.primary, textAlign: "center", marginBottom: 12 },
  coverSubtitle: { fontSize: 14, color: colors.muted, textAlign: "center", marginBottom: 40 },
  coverMeta: { fontSize: 10, color: colors.muted, textAlign: "center", marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.primary, marginBottom: 12, marginTop: 20, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 6 },
  text: { fontSize: 10, lineHeight: 1.5, marginBottom: 4 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 4 },
  headerRow: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: colors.dark, paddingVertical: 6, backgroundColor: colors.light },
  cellSmall: { width: "15%", paddingHorizontal: 4 },
  cellMed: { width: "25%", paddingHorizontal: 4 },
  cellLarge: { width: "35%", paddingHorizontal: 4 },
  cellRight: { textAlign: "right" },
  bold: { fontWeight: "bold" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 12 },
  metricBox: { width: "25%", padding: 8, marginBottom: 8 },
  metricLabel: { fontSize: 8, color: colors.muted, textTransform: "uppercase", marginBottom: 2 },
  metricValue: { fontSize: 14, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, textAlign: "center", fontSize: 8, color: colors.muted },
  chartContainer: { marginVertical: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 4 },
  chartTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 10, paddingHorizontal: 12 },
  chartRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 3 },
  chartLabel: { width: 50, fontSize: 7, color: colors.muted },
  chartBarContainer: { flex: 1, height: 10, backgroundColor: "#f1f5f9", borderRadius: 2, overflow: "hidden" },
  chartValue: { width: 60, fontSize: 7, textAlign: "right", color: colors.muted },
});

function formatCurrency(val: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(val);
}

function formatPercent(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

interface PdfData {
  caseData: BusinessCase;
  costs: CostLineItem[];
  values: ValueDriver[];
  model: FinancialModel;
  ownerName?: string;
}

function CashFlowChart({ cashFlows, currency }: { cashFlows: FinancialModel["cashFlows"]; currency: string }) {
  const maxAbs = Math.max(...cashFlows.map(cf => Math.abs(cf.cumulativeNet)), 1);
  const displayFlows = cashFlows.length > 24
    ? cashFlows.filter((_, i) => i % Math.ceil(cashFlows.length / 24) === 0 || i === cashFlows.length - 1)
    : cashFlows;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Cumulative Cash Flow Chart</Text>
      {displayFlows.map((cf, i) => {
        const pct = Math.abs(cf.cumulativeNet) / maxAbs;
        const isPositive = cf.cumulativeNet >= 0;
        return (
          <View key={i} style={styles.chartRow}>
            <Text style={styles.chartLabel}>M{cf.period}</Text>
            <View style={styles.chartBarContainer}>
              <View
                style={{
                  width: `${Math.max(pct * 100, 1)}%`,
                  height: 10,
                  backgroundColor: isPositive ? colors.green : colors.red,
                  borderRadius: 2,
                  marginLeft: isPositive ? "50%" : undefined,
                  marginRight: !isPositive ? "50%" : undefined,
                  alignSelf: isPositive ? "flex-start" : "flex-end",
                }}
              />
            </View>
            <Text style={styles.chartValue}>{formatCurrency(cf.cumulativeNet, currency)}</Text>
          </View>
        );
      })}
      <View style={{ flexDirection: "row", paddingHorizontal: 12, marginTop: 6 }}>
        <View style={{ width: 50 }} />
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 7, color: colors.red }}>Negative</Text>
          <Text style={{ fontSize: 7, color: colors.muted }}>Breakeven</Text>
          <Text style={{ fontSize: 7, color: colors.green }}>Positive</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>
    </View>
  );
}

function CaseDocument({ caseData, costs, values, model, ownerName }: PdfData) {
  const cur = caseData.currency || "USD";

  return (
    <Document>
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>{caseData.name}</Text>
        <Text style={styles.coverSubtitle}>Business Case Report</Text>
        <View style={{ borderTopWidth: 2, borderTopColor: colors.primary, width: 60, marginBottom: 30 }} />
        <Text style={styles.coverMeta}>{caseData.industry || "General"} &bull; {cur} &bull; {caseData.timeHorizonMonths} Months</Text>
        <Text style={styles.coverMeta}>Status: {caseData.status.replace("_", " ").toUpperCase()}</Text>
        <Text style={styles.coverMeta}>Owner: {ownerName || caseData.ownerId}</Text>
        <Text style={styles.coverMeta}>Generated: {new Date().toLocaleDateString()}</Text>
        {caseData.description && <Text style={[styles.text, { marginTop: 30, textAlign: "center", maxWidth: 400 }]}>{caseData.description}</Text>}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Net Present Value</Text>
            <Text style={styles.metricValue}>{formatCurrency(model.npv, cur)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>IRR</Text>
            <Text style={styles.metricValue}>{model.irr != null ? formatPercent(model.irr) : "N/A"}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>ROI</Text>
            <Text style={styles.metricValue}>{formatPercent(model.roi)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Breakeven</Text>
            <Text style={styles.metricValue}>{model.breakevenMonth ? `Month ${model.breakevenMonth}` : "N/A"}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Investment</Text>
            <Text style={styles.metricValue}>{formatCurrency(model.totalInvestment, cur)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Expected Value</Text>
            <Text style={styles.metricValue}>{formatCurrency(model.totalExpectedValue, cur)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Confidence-Adjusted</Text>
            <Text style={styles.metricValue}>{formatCurrency(model.confidenceAdjustedValue, cur)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Payback Period</Text>
            <Text style={styles.metricValue}>{model.paybackPeriodMonths ? `${model.paybackPeriodMonths} mos` : "N/A"}</Text>
          </View>
        </View>

        <CashFlowChart cashFlows={model.cashFlows} currency={cur} />

        <Text style={styles.sectionTitle}>Assumptions</Text>
        <Text style={styles.text}>Currency: {cur}</Text>
        <Text style={styles.text}>Time Horizon: {caseData.timeHorizonMonths} months</Text>
        <Text style={styles.text}>Discount Rate: {((caseData.discountRate || 0) * 100).toFixed(1)}%</Text>
        <Text style={styles.text}>Industry: {caseData.industry || "General"}</Text>
        <Text style={styles.footer}>CaseBuilder Report &bull; {caseData.name}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Cost Model</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.cellLarge, styles.bold]}>Name</Text>
          <Text style={[styles.cellSmall, styles.bold]}>Type</Text>
          <Text style={[styles.cellSmall, styles.bold, styles.cellRight]}>Amount</Text>
          <Text style={[styles.cellSmall, styles.bold]}>Frequency</Text>
        </View>
        {costs.map((c, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cellLarge}>{c.name}</Text>
            <Text style={styles.cellSmall}>{c.type}</Text>
            <Text style={[styles.cellSmall, styles.cellRight]}>{formatCurrency(c.amount, c.currency || cur)}</Text>
            <Text style={styles.cellSmall}>{c.frequency}</Text>
          </View>
        ))}
        {costs.length === 0 && <Text style={styles.text}>No cost items.</Text>}

        <Text style={styles.sectionTitle}>Value Model</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.cellLarge, styles.bold]}>Name</Text>
          <Text style={[styles.cellSmall, styles.bold]}>Type</Text>
          <Text style={[styles.cellSmall, styles.bold, styles.cellRight]}>Annual Value</Text>
          <Text style={[styles.cellSmall, styles.bold]}>Confidence</Text>
        </View>
        {values.map((v, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cellLarge}>{v.name}</Text>
            <Text style={styles.cellSmall}>{v.type}</Text>
            <Text style={[styles.cellSmall, styles.cellRight]}>{formatCurrency(v.annualValue, v.currency || cur)}</Text>
            <Text style={styles.cellSmall}>{v.confidenceLevel}</Text>
          </View>
        ))}
        {values.length === 0 && <Text style={styles.text}>No value drivers.</Text>}
        <Text style={styles.footer}>CaseBuilder Report &bull; {caseData.name}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Cash Flow Projection</Text>
        <View style={styles.headerRow}>
          <Text style={[{ width: "14%" }, styles.bold]}>Period</Text>
          <Text style={[{ width: "14%" }, styles.bold, styles.cellRight]}>Costs</Text>
          <Text style={[{ width: "14%" }, styles.bold, styles.cellRight]}>Benefits</Text>
          <Text style={[{ width: "16%" }, styles.bold, styles.cellRight]}>Net</Text>
          <Text style={[{ width: "20%" }, styles.bold, styles.cellRight]}>Cum. Cash Flow</Text>
          <Text style={[{ width: "22%" }, styles.bold, styles.cellRight]}>Cum. NPV</Text>
        </View>
        {model.cashFlows.map((cf, i) => (
          <View key={i} style={styles.row}>
            <Text style={{ width: "14%" }}>{cf.periodLabel}</Text>
            <Text style={[{ width: "14%" }, styles.cellRight]}>{formatCurrency(cf.costs, cur)}</Text>
            <Text style={[{ width: "14%" }, styles.cellRight]}>{formatCurrency(cf.benefits, cur)}</Text>
            <Text style={[{ width: "16%" }, styles.cellRight]}>{formatCurrency(cf.netCashFlow, cur)}</Text>
            <Text style={[{ width: "20%" }, styles.cellRight]}>{formatCurrency(cf.cumulativeNet, cur)}</Text>
            <Text style={[{ width: "22%" }, styles.cellRight]}>{formatCurrency(cf.cumulativeNpv, cur)}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Financial Summary</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.cellLarge, styles.bold]}>Metric</Text>
          <Text style={[styles.cellLarge, styles.bold, styles.cellRight]}>Value</Text>
        </View>
        {[
          ["Net Present Value (NPV)", formatCurrency(model.npv, cur)],
          ["Internal Rate of Return (IRR)", model.irr != null ? formatPercent(model.irr) : "N/A"],
          ["Return on Investment (ROI)", formatPercent(model.roi)],
          ["Breakeven Month", model.breakevenMonth ? `Month ${model.breakevenMonth}` : "N/A"],
          ["Total Investment", formatCurrency(model.totalInvestment, cur)],
          ["Total Expected Value", formatCurrency(model.totalExpectedValue, cur)],
          ["Confidence-Adjusted Value", formatCurrency(model.confidenceAdjustedValue, cur)],
        ].map(([label, val], i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cellLarge}>{label}</Text>
            <Text style={[styles.cellLarge, styles.cellRight, styles.bold]}>{val}</Text>
          </View>
        ))}
        <Text style={styles.footer}>CaseBuilder Report &bull; {caseData.name}</Text>
      </Page>
    </Document>
  );
}

export async function generatePdf(data: PdfData): Promise<void> {
  const blob = await pdf(<CaseDocument {...data} />).toBlob();
  const fileName = `${data.caseData.name.replace(/[^a-zA-Z0-9]/g, "_")}_report.pdf`;
  saveAs(blob, fileName);
}
