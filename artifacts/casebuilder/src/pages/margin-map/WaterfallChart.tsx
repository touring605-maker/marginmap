import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, ReferenceLine, Legend,
} from 'recharts';
import type { ScenarioResult, Channel } from './marginEngine';
import { formatCurrency } from './marginEngine';

const CHANNEL_LABELS: Record<Channel, string> = {
  wholesale: 'Wholesale',
  dtc: 'DTC E-Commerce',
  dropship: 'Dropship',
};

interface WaterfallStep {
  name: string;
  value: number;
  offset: number;
  fill: string;
  isTotal?: boolean;
}

function buildWaterfallData(result: ScenarioResult, channel: Channel): WaterfallStep[] {
  const ch = result.channels[channel];
  const steps: { name: string; value: number; type: 'positive' | 'negative' | 'total' }[] = [
    { name: 'Gross Revenue', value: ch.grossRevenue, type: 'total' },
    { name: 'Returns/Discounts', value: -(ch.grossRevenue - ch.netRevenue), type: 'negative' },
    { name: 'Net Revenue', value: ch.netRevenue, type: 'total' },
    { name: 'COGS', value: -(ch.netRevenue - ch.grossMargin), type: 'negative' },
    { name: 'Gross Margin', value: ch.grossMargin, type: 'total' },
    { name: 'Variable Costs', value: -ch.channelVariableCosts, type: 'negative' },
    { name: 'Contribution Margin', value: ch.contributionMargin, type: 'total' },
    { name: 'Shared Costs', value: -ch.allocatedSharedCosts, type: 'negative' },
    { name: 'Net Margin', value: ch.channelNetMargin, type: 'total' },
  ];

  const data: WaterfallStep[] = [];
  let running = 0;

  for (const step of steps) {
    if (step.type === 'total') {
      data.push({
        name: step.name,
        value: step.value,
        offset: 0,
        fill: step.value >= 0 ? '#131568' : '#dc2626',
        isTotal: true,
      });
      running = step.value;
    } else {
      const absValue = Math.abs(step.value);
      const offset = running + step.value;
      data.push({
        name: step.name,
        value: absValue,
        offset: Math.min(running, offset),
        fill: step.value < 0 ? '#ef4444' : '#4C7960',
      });
      running += step.value;
    }
  }

  return data;
}

interface Props {
  results: ScenarioResult[];
}

export function WaterfallChart({ results }: Props) {
  const [channel, setChannel] = useState<Channel>('wholesale');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);

  const primaryData = useMemo(
    () => buildWaterfallData(results[selectedIdx], channel),
    [results, selectedIdx, channel]
  );

  const compareData = useMemo(
    () => compareIdx !== null ? buildWaterfallData(results[compareIdx], channel) : null,
    [results, compareIdx, channel]
  );

  const combinedData = useMemo(() => {
    if (!compareData) return primaryData.map((d) => ({ ...d, compareValue: 0, compareOffset: 0, compareFill: '#94a3b8' }));
    return primaryData.map((d, i) => ({
      ...d,
      compareValue: compareData[i]?.value ?? 0,
      compareOffset: compareData[i]?.offset ?? 0,
      compareFill: compareData[i]?.fill ?? '#94a3b8',
    }));
  }, [primaryData, compareData]);

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-foreground">Contribution Margin Waterfall</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-muted-foreground">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
              className="rounded-md border border-border text-xs px-2 py-1 bg-white"
            >
              {(['wholesale', 'dtc', 'dropship'] as Channel[]).map((ch) => (
                <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-muted-foreground">Scenario</label>
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="rounded-md border border-border text-xs px-2 py-1 bg-white"
            >
              {results.map((r, i) => (
                <option key={r.scenario.id} value={i}>{r.scenario.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-muted-foreground">Compare</label>
            <select
              value={compareIdx ?? ''}
              onChange={(e) => setCompareIdx(e.target.value === '' ? null : Number(e.target.value))}
              className="rounded-md border border-border text-xs px-2 py-1 bg-white"
            >
              <option value="">None</option>
              {results.map((r, i) => i !== selectedIdx && (
                <option key={r.scenario.id} value={i}>{r.scenario.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={combinedData} barGap={compareData ? 2 : 0}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickFormatter={(v: number) => formatCurrency(v)}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <RechartsTooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#e2e8f0' }}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
          <Bar dataKey="offset" stackId="primary" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="value" stackId="primary" name={results[selectedIdx]?.scenario.name} radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {combinedData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
          {compareData && (
            <>
              <Bar dataKey="compareOffset" stackId="compare" fill="transparent" isAnimationActive={false} />
              <Bar dataKey="compareValue" stackId="compare" name={results[compareIdx!]?.scenario.name} radius={[3, 3, 0, 0]} opacity={0.5} isAnimationActive={false}>
                {combinedData.map((entry, i) => (
                  <Cell key={i} fill={entry.compareFill ?? '#94a3b8'} />
                ))}
              </Bar>
            </>
          )}
          {compareData && <Legend wrapperStyle={{ fontSize: 11 }} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
