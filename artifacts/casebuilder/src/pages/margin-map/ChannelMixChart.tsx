import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { ScenarioResult } from './marginEngine';
import { formatPct } from './marginEngine';

const CHANNEL_COLORS = {
  wholesale: '#131568',
  dtc: '#4C7960',
  dropship: '#6366f1',
};

interface Props {
  results: ScenarioResult[];
}

export function ChannelMixChart({ results }: Props) {
  const [mode, setMode] = useState<'revenue' | 'contribution'>('revenue');

  const data = useMemo(() => {
    return results.map((r) => {
      const mix = mode === 'revenue' ? r.aggregate.revenueMix : r.aggregate.contributionMix;
      return {
        name: r.scenario.name,
        Wholesale: +(mix.wholesale * 100).toFixed(1),
        DTC: +(mix.dtc * 100).toFixed(1),
        Dropship: +(mix.dropship * 100).toFixed(1),
      };
    });
  }, [results, mode]);

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Channel Mix</h3>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode('revenue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'revenue' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Revenue Mix
          </button>
          <button
            onClick={() => setMode('contribution')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'contribution' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Contribution Mix
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickFormatter={(v: number) => `${v}%`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={120}
            tickFormatter={(v: string) => v.length > 15 ? v.slice(0, 13) + '…' : v}
          />
          <RechartsTooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`]}
            contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Wholesale" stackId="a" fill={CHANNEL_COLORS.wholesale} radius={[0, 0, 0, 0]} />
          <Bar dataKey="DTC" stackId="a" fill={CHANNEL_COLORS.dtc} />
          <Bar dataKey="Dropship" stackId="a" fill={CHANNEL_COLORS.dropship} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
