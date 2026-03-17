import { useState, useMemo } from "react";
import { useFinancialModelData, useUpdateCase } from "@/hooks/use-cases";
import { Loader2, TrendingUp, DollarSign, Target, Activity, Shield, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ReferenceLine,
} from "recharts";
import type { BusinessCase, CashFlowPeriod } from "@workspace/api-client-react";

interface ModelTabProps {
  caseId: number;
  caseData: BusinessCase;
  scenarioId?: number;
}

type ViewMode = "months" | "years";

interface AggregatedPeriod {
  period: number;
  periodLabel: string;
  costs: number;
  benefits: number;
  netCashFlow: number;
  cumulativeNet: number;
  cumulativeCosts: number;
  cumulativeBenefits: number;
  cumulativeNpv: number;
  runningIrr: number | null;
  projectCosts: number;
  currentStateCosts: number;
  futureStateCosts: number;
}

function aggregateToYears(cashFlows: CashFlowPeriod[]): AggregatedPeriod[] {
  const years: AggregatedPeriod[] = [];
  const totalMonths = cashFlows.length;
  const numYears = Math.ceil(totalMonths / 12);

  for (let y = 0; y < numYears; y++) {
    const start = y * 12;
    const end = Math.min(start + 12, totalMonths);
    const chunk = cashFlows.slice(start, end);
    const last = chunk[chunk.length - 1];

    const irrValues = chunk.filter(c => c.runningIrr !== null && c.runningIrr !== undefined).map(c => c.runningIrr as number);
    const avgIrr = irrValues.length > 0 ? irrValues[irrValues.length - 1] : null;

    years.push({
      period: y + 1,
      periodLabel: `Year ${y + 1}`,
      costs: chunk.reduce((s, c) => s + c.costs, 0),
      benefits: chunk.reduce((s, c) => s + c.benefits, 0),
      netCashFlow: chunk.reduce((s, c) => s + c.netCashFlow, 0),
      cumulativeNet: last.cumulativeNet,
      cumulativeCosts: last.cumulativeCosts,
      cumulativeBenefits: last.cumulativeBenefits,
      cumulativeNpv: last.cumulativeNpv,
      runningIrr: avgIrr,
      projectCosts: chunk.reduce((s, c) => s + c.projectCosts, 0),
      currentStateCosts: chunk.reduce((s, c) => s + c.currentStateCosts, 0),
      futureStateCosts: chunk.reduce((s, c) => s + c.futureStateCosts, 0),
    });
  }
  return years;
}

export function ModelTab({ caseId, caseData, scenarioId }: ModelTabProps) {
  const { data, isLoading, error } = useFinancialModelData(caseId, scenarioId);
  const updateCase = useUpdateCase();
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(String((caseData.discountRate * 100)));
  const [viewMode, setViewMode] = useState<ViewMode>("months");

  const handleRateSave = () => {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      updateCase.mutate({ id: caseId, data: { discountRate: parsed / 100 } });
      setEditingRate(false);
    }
  };

  const displayData = useMemo(() => {
    if (!data) return [];
    if (viewMode === "years") return aggregateToYears(data.cashFlows);
    return data.cashFlows as AggregatedPeriod[];
  }, [data, viewMode]);

  const breakevenPeriod = useMemo(() => {
    if (!data?.breakevenMonth) return null;
    if (viewMode === "years") return Math.ceil(data.breakevenMonth / 12);
    return data.breakevenMonth;
  }, [data, viewMode]);

  const breakevenLabel = useMemo(() => {
    if (!data?.breakevenMonth) return null;
    if (viewMode === "years") return `Year ${Math.ceil(data.breakevenMonth / 12)}`;
    return `Month ${data.breakevenMonth}`;
  }, [data, viewMode]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Computing financial model...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 text-rose-600 p-6 rounded-xl border border-rose-200">
        Failed to compute financial model. Ensure you have valid costs and values.
      </div>
    );
  }

  const currency = caseData.currency || "USD";

  const formatCurrencyCompact = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(val);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(val);

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

  const tableRows: { key: string; label: string; colorClass: string; bgClass: string; getValue: (cf: AggregatedPeriod) => string; isSection?: boolean }[] = [
    { key: "currentState", label: "Current State Costs", colorClass: "text-slate-500 dark:text-slate-400", bgClass: "", getValue: (cf) => formatCurrency(cf.currentStateCosts) },
    { key: "futureState", label: "Future State Costs", colorClass: "text-slate-500 dark:text-slate-400", bgClass: "", getValue: (cf) => formatCurrency(cf.futureStateCosts) },
    { key: "projectCosts", label: "Project Costs", colorClass: "text-rose-600 dark:text-rose-400", bgClass: "", getValue: (cf) => cf.projectCosts > 0 ? formatCurrency(cf.projectCosts) : "\u2014" },
    { key: "netSavings", label: "Net Savings (Current \u2212 Future)", colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-50/40 dark:bg-emerald-500/5", getValue: (cf) => formatCurrency(cf.currentStateCosts - cf.futureStateCosts) },
    { key: "benefits", label: "Total Benefits", colorClass: "text-emerald-700 dark:text-emerald-300 font-semibold", bgClass: "bg-emerald-50/60 dark:bg-emerald-500/5", getValue: (cf) => formatCurrency(cf.benefits) },
    { key: "netCashFlow", label: "Net Cash Flow", colorClass: "", bgClass: "bg-slate-50/80 dark:bg-slate-800/30", getValue: (cf) => formatCurrency(cf.netCashFlow), isSection: true },
    { key: "cumulativeNet", label: "Cumulative Net", colorClass: "", bgClass: "", getValue: (cf) => formatCurrency(cf.cumulativeNet) },
    { key: "cumulativeNpv", label: "Cumulative NPV", colorClass: "text-indigo-600 dark:text-indigo-400", bgClass: "", getValue: (cf) => formatCurrency(cf.cumulativeNpv) },
    { key: "runningIrr", label: "Running IRR", colorClass: "text-indigo-600 dark:text-indigo-400", bgClass: "", getValue: (cf) => cf.runningIrr !== null && cf.runningIrr !== undefined ? formatPercent(cf.runningIrr) : "\u2014" },
  ];

  const ViewToggle = () => (
    <div className="inline-flex rounded-lg border border-border bg-slate-100 dark:bg-slate-800 p-0.5">
      <button
        onClick={() => setViewMode("months")}
        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "months" ? "bg-white dark:bg-slate-700 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        Months
      </button>
      <button
        onClick={() => setViewMode("years")}
        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "years" ? "bg-white dark:bg-slate-700 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        Years
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-border p-4 rounded-xl">
        <label className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Discount Rate</label>
        {editingRate ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRateSave()}
              className="w-24 px-3 py-1.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              autoFocus
            />
            <span className="text-sm text-muted-foreground">%</span>
            <button onClick={handleRateSave} className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90">Save</button>
            <button onClick={() => { setEditingRate(false); setRateInput(String(caseData.discountRate * 100)); }} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditingRate(true)} className="text-sm font-bold text-primary hover:underline">
            {(caseData.discountRate * 100).toFixed(1)}%
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">Used for NPV discounting (annual rate, applied monthly)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Present Value (NPV)"
          value={formatCurrencyCompact(data.npv)}
          subtitle="Full horizon, discounted"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: data.npv > 0 ? "Positive" : "Negative", isPositive: data.npv > 0 }}
        />
        <MetricCard
          title="Internal Rate of Return"
          value={data.irr !== null && data.irr !== undefined ? formatPercent(data.irr) : "N/A"}
          subtitle="Annualized"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Return on Investment"
          value={formatPercent(data.roi)}
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: data.roi > 0 ? "Positive" : "Negative", isPositive: data.roi > 0 }}
        />
        <MetricCard
          title="Breakeven Month"
          value={data.breakevenMonth ? `Month ${data.breakevenMonth}` : "Never"}
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Investment"
          value={formatCurrencyCompact(data.totalInvestment)}
          icon={<Wallet className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Expected Value"
          value={formatCurrencyCompact(data.totalExpectedValue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Confidence-Adjusted Value"
          value={formatCurrencyCompact(data.confidenceAdjustedValue)}
          icon={<Shield className="w-5 h-5" />}
        />
      </div>

      {data.objectiveProgress && (
        <div className={`p-5 rounded-xl border ${data.objectiveProgress.onTrack ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30" : "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30"}`}>
          <div className="flex items-start gap-3">
            {data.objectiveProgress.onTrack ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`text-sm font-bold ${data.objectiveProgress.onTrack ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"}`}>
                Financial Objective: {data.objectiveProgress.onTrack ? "On Track" : "At Risk"}
              </h3>
              <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                Target: {formatCurrency(data.objectiveProgress.targetValue)} by Month {data.objectiveProgress.targetMonth}
                {" "}&bull;{" "}
                Projected: {formatCurrency(data.objectiveProgress.projectedValue)}
              </p>
              <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${data.objectiveProgress.onTrack ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, Math.max(0, (data.objectiveProgress.projectedValue / data.objectiveProgress.targetValue) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1 text-slate-500">
                <span>0%</span>
                <span>{Math.round((data.objectiveProgress.projectedValue / data.objectiveProgress.targetValue) * 100)}% of target</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold">Breakeven Analysis</h3>
          <ViewToggle />
        </div>
        <p className="text-sm text-muted-foreground mb-6">Cumulative costs vs. benefits over the time horizon</p>
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id="benefitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="periodLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                dy={10}
                interval={viewMode === "years" ? 0 : displayData.length > 24 ? Math.ceil(displayData.length / 12) - 1 : displayData.length > 12 ? 2 : 0}
              />
              <YAxis
                tickFormatter={formatCurrencyCompact}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                dx={-10}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 12px rgb(0 0 0 / 0.12)",
                  padding: "10px 14px",
                  fontSize: "13px",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="plainline"
              />
              {breakevenLabel && (
                <ReferenceLine
                  x={breakevenLabel}
                  stroke="#f59e0b"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Breakeven (${breakevenLabel})`,
                    position: "top",
                    fill: "#d97706",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
              <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="cumulativeBenefits"
                name="Cumulative Benefits"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#benefitGradient)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#10b981" }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeCosts"
                name="Cumulative Costs"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#costGradient)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#ef4444" }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeNpv"
                name="Cumulative NPV"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#6366f1" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-bold">Detailed Breakdown</h3>
            <p className="text-sm text-muted-foreground mt-1">Full cost-phase transparency with period-by-period cash flows</p>
          </div>
          <ViewToggle />
        </div>
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse" style={{ minWidth: `${200 + displayData.length * 120}px` }}>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/50 text-left px-5 py-3 font-semibold text-muted-foreground border-r border-border min-w-[200px]">
                  Metric
                </th>
                {displayData.map((cf) => (
                  <th
                    key={cf.period}
                    className={`text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap min-w-[110px] ${cf.period === breakevenPeriod ? "bg-amber-50 dark:bg-amber-500/10" : ""}`}
                  >
                    {cf.periodLabel}
                    {cf.period === breakevenPeriod && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">BREAKEVEN</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.key} className={`border-t border-border/50 ${row.bgClass}`}>
                  <td className={`sticky left-0 z-10 bg-white dark:bg-slate-900 px-5 py-2.5 font-medium whitespace-nowrap border-r border-border ${row.bgClass} ${row.colorClass}`}>
                    {row.isSection ? <span className="font-bold">{row.label}</span> : row.label}
                  </td>
                  {displayData.map((cf) => {
                    const val = row.getValue(cf);
                    const dynamicColor = row.key === "netCashFlow" || row.key === "cumulativeNet"
                      ? cf.netCashFlow >= 0 && row.key === "netCashFlow"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : cf.cumulativeNet >= 0 && row.key === "cumulativeNet"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      : row.colorClass;
                    return (
                      <td
                        key={cf.period}
                        className={`text-right px-4 py-2.5 whitespace-nowrap ${dynamicColor} ${cf.period === breakevenPeriod ? "bg-amber-50/50 dark:bg-amber-500/5" : ""} ${row.isSection ? "font-bold" : ""}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
