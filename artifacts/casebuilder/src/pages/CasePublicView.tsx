import { useRoute, useSearch } from "wouter";
import { useGetPublicCase, getGetPublicCaseQueryKey } from "@workspace/api-client-react";
import { Loader2, Lock, DollarSign, TrendingUp, Activity, Target, Wallet, Clock, Shield } from "lucide-react";

export default function CasePublicView() {
  const [, params] = useRoute("/cases/:id/view");
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const token = searchParams.get("token") || "";

  const { data, isLoading, error } = useGetPublicCase(token, {
    query: { queryKey: getGetPublicCaseQueryKey(token), enabled: !!token, retry: false }
  });

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">A share token is required to view this case.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">This link is invalid or has expired.</p>
      </div>
    );
  }

  const bc = data.case;
  const model = data.financialModel;
  const costs = data.costs;
  const values = data.values;
  const cur = bc.currency || "USD";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(val);

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display font-bold text-lg text-primary">CaseBuilder</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded-full">Public Report</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-4">{bc.name}</h1>
          {bc.description && <p className="text-muted-foreground mt-2 text-lg">{bc.description}</p>}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>{bc.industry || "General"}</span>
            <span>&bull;</span>
            <span>{cur}</span>
            <span>&bull;</span>
            <span>{bc.timeHorizonMonths} months</span>
            <span>&bull;</span>
            <span>Discount Rate: {((bc.discountRate || 0) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "NPV", value: formatCurrency(model.npv), icon: DollarSign, color: "text-emerald-600" },
            { label: "IRR", value: model.irr != null ? formatPercent(model.irr) : "N/A", icon: TrendingUp, color: "text-blue-600" },
            { label: "ROI", value: formatPercent(model.roi), icon: Activity, color: "text-indigo-600" },
            { label: "Breakeven", value: model.breakevenMonth ? `Month ${model.breakevenMonth}` : "N/A", icon: Target, color: "text-amber-600" },
            { label: "Total Investment", value: formatCurrency(model.totalInvestment), icon: Wallet, color: "text-rose-600" },
            { label: "Expected Value", value: formatCurrency(model.totalExpectedValue), icon: DollarSign, color: "text-emerald-600" },
            { label: "Confidence-Adj.", value: formatCurrency(model.confidenceAdjustedValue), icon: Shield, color: "text-violet-600" },
            { label: "Payback", value: model.paybackPeriodMonths ? `${model.paybackPeriodMonths} mos` : "N/A", icon: Clock, color: "text-slate-600" },
          ].map((m, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <p className="text-xs text-muted-foreground font-semibold uppercase">{m.label}</p>
              </div>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {costs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold">Cost Model</h2>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Type</th>
                    <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((c) => (
                    <tr key={c.id} className="border-t border-border/50">
                      <td className="px-6 py-3 font-medium">{c.name}</td>
                      <td className="px-6 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800">{c.type}</span></td>
                      <td className="px-6 py-3 text-right font-medium">{formatCurrency(c.amount)}</td>
                      <td className="px-6 py-3">{c.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {values.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold">Value Model</h2>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Type</th>
                    <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Annual Value</th>
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {values.map((v) => (
                    <tr key={v.id} className="border-t border-border/50">
                      <td className="px-6 py-3 font-medium">{v.name}</td>
                      <td className="px-6 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800">{v.type}</span></td>
                      <td className="px-6 py-3 text-right font-medium text-emerald-600">{formatCurrency(v.annualValue)}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          v.confidenceLevel === "high" ? "bg-emerald-100 text-emerald-700" :
                          v.confidenceLevel === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>{v.confidenceLevel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground py-6 border-t border-border">
          Generated via CaseBuilder &bull; {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
