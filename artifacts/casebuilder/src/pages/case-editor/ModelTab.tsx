import { useState } from "react";
import { useFinancialModelData, useUpdateCase } from "@/hooks/use-cases";
import { Loader2, TrendingUp, DollarSign, Target, Activity, Clock, Shield, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import type { BusinessCase } from "@workspace/api-client-react";

interface ModelTabProps {
  caseId: number;
  caseData: BusinessCase;
  scenarioId?: number;
}

export function ModelTab({ caseId, caseData, scenarioId }: ModelTabProps) {
  const { data, isLoading, error } = useFinancialModelData(caseId, scenarioId);
  const updateCase = useUpdateCase();
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(String((caseData.discountRate * 100)));

  const handleRateSave = () => {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      updateCase.mutate({ id: caseId, data: { discountRate: parsed / 100 } });
      setEditingRate(false);
    }
  };

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
          value={formatCurrency(data.npv)}
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
          value={formatCurrency(data.totalInvestment)}
          icon={<Wallet className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Expected Value"
          value={formatCurrency(data.totalExpectedValue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Confidence-Adjusted Value"
          value={formatCurrency(data.confidenceAdjustedValue)}
          icon={<Shield className="w-5 h-5" />}
        />
        <MetricCard
          title="Payback Period"
          value={data.paybackPeriodMonths ? `${data.paybackPeriodMonths} months` : "N/A"}
          icon={<Clock className="w-5 h-5" />}
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
        <h3 className="text-lg font-bold mb-1">Breakeven Analysis</h3>
        <p className="text-sm text-muted-foreground mb-6">Cumulative costs vs. benefits over the time horizon</p>
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.cashFlows} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
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
                interval={data.cashFlows.length > 24 ? Math.ceil(data.cashFlows.length / 12) - 1 : data.cashFlows.length > 12 ? 2 : 0}
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
              {data.breakevenMonth && (
                <ReferenceLine
                  x={`Month ${data.breakevenMonth}`}
                  stroke="#f59e0b"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Breakeven (Month ${data.breakevenMonth})`,
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
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold">Monthly Breakdown</h3>
          <p className="text-sm text-muted-foreground mt-1">Period-by-period cash flows, cumulative NPV, and running IRR</p>
        </div>
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Period</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Costs</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Benefits</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Net Cash Flow</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Cumulative Cash Flow</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Cumulative NPV</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Running IRR</th>
              </tr>
            </thead>
            <tbody>
              {data.cashFlows.map((cf) => (
                <tr key={cf.period} className={`border-t border-border/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 ${cf.period === data.breakevenMonth ? "bg-amber-50/50 dark:bg-amber-500/5" : ""}`}>
                  <td className="px-6 py-3 font-medium">{cf.periodLabel}</td>
                  <td className="px-6 py-3 text-right text-rose-600 dark:text-rose-400">{formatCurrency(cf.costs)}</td>
                  <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(cf.benefits)}</td>
                  <td className={`px-6 py-3 text-right font-medium ${cf.netCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatCurrency(cf.netCashFlow)}
                  </td>
                  <td className={`px-6 py-3 text-right font-medium ${cf.cumulativeNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatCurrency(cf.cumulativeNet)}
                  </td>
                  <td className={`px-6 py-3 text-right text-indigo-600 dark:text-indigo-400 font-medium`}>
                    {formatCurrency(cf.cumulativeNpv)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {cf.runningIrr !== null && cf.runningIrr !== undefined ? formatPercent(cf.runningIrr) : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
