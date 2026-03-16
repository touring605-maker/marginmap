import { useFinancialModelData } from "@/hooks/use-cases";
import { Loader2, TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from "recharts";

export function ModelTab({ caseId }: { caseId: number }) {
  const { data, isLoading, error } = useFinancialModelData(caseId);

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

  const formatCurrencyCompact = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(val);
  
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Net Present Value (NPV)" 
          value={formatCurrency(data.npv)} 
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: "Discounted", isPositive: data.npv > 0 }}
        />
        <MetricCard 
          title="Internal Rate of Return (IRR)" 
          value={data.irr ? `${data.irr.toFixed(1)}%` : 'N/A'} 
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard 
          title="Return on Investment (ROI)" 
          value={`${data.roi.toFixed(0)}%`} 
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard 
          title="Breakeven Month" 
          value={data.breakevenMonth ? `Month ${data.breakevenMonth}` : 'Never'} 
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold mb-6">Cumulative Cash Flow Projection</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.cashFlows} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="periodLabel" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis 
                tickFormatter={formatCurrencyCompact} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dx={-10}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="netCashFlow" name="Net Cash Flow (Monthly)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="cumulativeNet" 
                name="Cumulative Net Benefit" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
