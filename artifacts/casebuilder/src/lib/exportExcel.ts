import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type {
  BusinessCase,
  CostLineItem,
  ValueDriver,
  FinancialModel,
} from "@workspace/api-client-react";

interface ExcelData {
  caseData: BusinessCase;
  costs: CostLineItem[];
  values: ValueDriver[];
  model: FinancialModel;
}

export function generateExcel({ caseData, costs, values, model }: ExcelData): void {
  const wb = XLSX.utils.book_new();
  const cur = caseData.currency || "USD";

  const assumptionsData = [
    ["Assumptions"],
    [],
    ["Case Name", caseData.name],
    ["Description", caseData.description || ""],
    ["Industry", caseData.industry || "General"],
    ["Currency", cur],
    ["Time Horizon (Months)", caseData.timeHorizonMonths],
    ["Discount Rate", `${((caseData.discountRate || 0) * 100).toFixed(1)}%`],
    ["Status", caseData.status],
    [],
    ["Financial Summary"],
    [],
    ["Metric", "Value"],
    ["Net Present Value (NPV)", model.npv],
    ["Internal Rate of Return (IRR)", model.irr != null ? `${(model.irr * 100).toFixed(1)}%` : "N/A"],
    ["Return on Investment (ROI)", `${(model.roi * 100).toFixed(1)}%`],
    ["Breakeven Month", model.breakevenMonth || "N/A"],
    ["Payback Period (Months)", model.paybackPeriodMonths || "N/A"],
    ["Total Investment", model.totalInvestment],
    ["Total Expected Value", model.totalExpectedValue],
    ["Confidence-Adjusted Value", model.confidenceAdjustedValue],
  ];
  const wsAssumptions = XLSX.utils.aoa_to_sheet(assumptionsData);
  wsAssumptions["!cols"] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsAssumptions, "Assumptions");

  const costHeaders = ["Name", "Type", "Amount", "Currency", "Frequency", "Description", "Depreciation (Years)", "Escalation Rate (%)"];
  const costRows = costs.map(c => [
    c.name,
    c.type,
    c.amount,
    c.currency || cur,
    c.frequency,
    c.description || "",
    c.depreciationYears || "",
    c.escalationRate || "",
  ]);
  const wsCosts = XLSX.utils.aoa_to_sheet([costHeaders, ...costRows]);
  wsCosts["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsCosts, "Cost Model");

  const valueHeaders = ["Name", "Type", "Annual Value", "Currency", "Confidence", "Months to Realize", "Description"];
  const valueRows = values.map(v => [
    v.name,
    v.type,
    v.annualValue,
    v.currency || cur,
    v.confidenceLevel,
    v.monthsToRealize,
    v.description || "",
  ]);
  const wsValues = XLSX.utils.aoa_to_sheet([valueHeaders, ...valueRows]);
  wsValues["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsValues, "Value Model");

  const cfHeaders = ["Period", "Costs", "Benefits", "Net Cash Flow", "Cumulative Cash Flow", "Cumulative NPV", "Running IRR"];
  const cfRows = model.cashFlows.map(cf => [
    cf.periodLabel,
    cf.costs,
    cf.benefits,
    cf.netCashFlow,
    cf.cumulativeNet,
    cf.cumulativeNpv,
    cf.runningIrr != null ? `${(cf.runningIrr * 100).toFixed(1)}%` : "",
  ]);
  const wsCashFlow = XLSX.utils.aoa_to_sheet([cfHeaders, ...cfRows]);
  wsCashFlow["!cols"] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsCashFlow, "Cash Flow Projection");

  const summaryData = [
    ["NPV / IRR Summary"],
    [],
    ["Metric", "Value"],
    ["Net Present Value (NPV)", model.npv],
    ["Internal Rate of Return (IRR)", model.irr != null ? `${(model.irr * 100).toFixed(1)}%` : "N/A"],
    ["Return on Investment (ROI)", `${(model.roi * 100).toFixed(1)}%`],
    ["Breakeven Month", model.breakevenMonth || "N/A"],
    ["Payback Period", model.paybackPeriodMonths ? `${model.paybackPeriodMonths} months` : "N/A"],
    ["Total Investment", model.totalInvestment],
    ["Total Expected Value", model.totalExpectedValue],
    ["Confidence-Adjusted Value", model.confidenceAdjustedValue],
    [],
    ...(model.objectiveProgress ? [
      ["Financial Objective"],
      [],
      ["Target Value", model.objectiveProgress.targetValue],
      ["Target Month", model.objectiveProgress.targetMonth],
      ["Projected Value", model.objectiveProgress.projectedValue],
      ["On Track", model.objectiveProgress.onTrack ? "Yes" : "No"],
    ] : []),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "NPV IRR Summary");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const fileName = `${caseData.name.replace(/[^a-zA-Z0-9]/g, "_")}_model.xlsx`;
  saveAs(blob, fileName);
}
