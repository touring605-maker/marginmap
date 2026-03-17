import { useState, useMemo } from 'react';
import {
  computeScenario,
  formatCurrency,
  formatPct,
  DRIVER_LABELS,
  RATE_DRIVERS,
  CURRENCY_DRIVERS,
  type BaselineData,
  type Scenario,
  type ScenarioResult,
  type ScenarioDriverOverrides,
  type Channel,
} from './marginEngine';

const NUMERIC_DRIVERS: (keyof ScenarioDriverOverrides)[] = [
  'wholesaleVolume', 'dtcVolume', 'dropshipVolume',
  'wholesaleASP', 'wholesaleDiscountRate', 'dtcASP', 'dtcReturnRate',
  'dropshipServiceFeeRate', 'dropshipMarketplaceFeeRate',
  'dtcFulfillmentCostPerUnit', 'dropshipFulfillmentCostPerOrder',
  'dtcCAC', 'wholesaleCommissionRate', 'returnProcessingCostPerUnit',
  'totalSharedCostPool',
];

interface OutputMetric {
  label: string;
  getValue: (r: ScenarioResult) => number;
  format: (v: number) => string;
}

const OUTPUT_METRICS: OutputMetric[] = [
  { label: 'Total Revenue', getValue: (r) => r.aggregate.totalRevenue, format: formatCurrency },
  { label: 'Total Contribution Margin $', getValue: (r) => r.aggregate.totalContributionMargin, format: formatCurrency },
  { label: 'Total Contribution Margin %', getValue: (r) => r.aggregate.blendedContributionMarginPct, format: formatPct },
  { label: 'Total Net Margin', getValue: (r) => r.aggregate.totalNetMargin, format: formatCurrency },
  { label: 'Wholesale CM', getValue: (r) => r.channels.wholesale.contributionMargin, format: formatCurrency },
  { label: 'DTC CM', getValue: (r) => r.channels.dtc.contributionMargin, format: formatCurrency },
  { label: 'Dropship CM', getValue: (r) => r.channels.dropship.contributionMargin, format: formatCurrency },
  { label: 'Blended Gross Margin %', getValue: (r) => r.aggregate.blendedGrossMarginPct, format: formatPct },
];

type RangeMode = 'auto' | 'custom';

interface Props {
  baseline: BaselineData;
  scenarios: Scenario[];
}

export function SensitivityTable({ baseline, scenarios }: Props) {
  const [driverKey, setDriverKey] = useState<keyof ScenarioDriverOverrides>('dtcCAC');
  const [metricIdx, setMetricIdx] = useState(1);
  const [refIdx, setRefIdx] = useState(0);
  const [steps, setSteps] = useState(5);
  const [rangeMode, setRangeMode] = useState<RangeMode>('auto');
  const [customMin, setCustomMin] = useState<string>('');
  const [customMax, setCustomMax] = useState<string>('');

  const metric = OUTPUT_METRICS[metricIdx];
  const refScenario = scenarios[refIdx];
  const isRate = RATE_DRIVERS.has(driverKey);
  const isCurrency = CURRENCY_DRIVERS.has(driverKey);

  const refDriverValue = useMemo(() => {
    const overrideVal = (refScenario.drivers as Record<string, unknown>)[driverKey];
    if (overrideVal !== undefined) return overrideVal as number;
    return (baseline as unknown as Record<string, number>)[driverKey] ?? 0;
  }, [baseline, refScenario, driverKey]);

  const refResult = useMemo(
    () => computeScenario(baseline, refScenario),
    [baseline, refScenario]
  );
  const refMetricValue = metric.getValue(refResult);

  const rows = useMemo(() => {
    let minVal: number;
    let maxVal: number;

    if (rangeMode === 'custom' && customMin !== '' && customMax !== '') {
      const rawMin = Number(customMin);
      const rawMax = Number(customMax);
      minVal = isRate ? rawMin / 100 : rawMin;
      maxVal = isRate ? rawMax / 100 : rawMax;
    } else {
      minVal = refDriverValue * 0.7;
      maxVal = refDriverValue * 1.3;
    }

    const range: number[] = [];
    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0.5 : i / (steps - 1);
      range.push(minVal + t * (maxVal - minVal));
    }

    return range.map((driverValue) => {
      const testScenario: Scenario = {
        ...refScenario,
        id: `sensitivity-${driverValue}`,
        drivers: {
          ...refScenario.drivers,
          [driverKey]: driverValue,
        },
      };
      const result = computeScenario(baseline, testScenario);
      const outputValue = metric.getValue(result);
      const delta = outputValue - refMetricValue;
      return { driverValue, outputValue, delta };
    });
  }, [baseline, refScenario, driverKey, metric, refDriverValue, steps, refMetricValue, rangeMode, customMin, customMax, isRate]);

  const formatDriver = (v: number) => {
    if (isRate) return `${(v * 100).toFixed(1)}%`;
    if (isCurrency) return formatCurrency(v);
    return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-foreground">Sensitivity Analysis</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-[10px] text-muted-foreground mb-0.5 block">Driver (X-axis)</label>
          <select
            value={driverKey}
            onChange={(e) => setDriverKey(e.target.value as keyof ScenarioDriverOverrides)}
            className="w-full rounded-md border border-border text-xs px-2 py-1.5 bg-white"
          >
            {NUMERIC_DRIVERS.map((d) => (
              <option key={d} value={d}>{DRIVER_LABELS[d] ?? d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-0.5 block">Output Metric</label>
          <select
            value={metricIdx}
            onChange={(e) => setMetricIdx(Number(e.target.value))}
            className="w-full rounded-md border border-border text-xs px-2 py-1.5 bg-white"
          >
            {OUTPUT_METRICS.map((m, i) => (
              <option key={i} value={i}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-0.5 block">Reference Scenario</label>
          <select
            value={refIdx}
            onChange={(e) => setRefIdx(Number(e.target.value))}
            className="w-full rounded-md border border-border text-xs px-2 py-1.5 bg-white"
          >
            {scenarios.map((s, i) => (
              <option key={s.id} value={i}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-0.5 block">Steps</label>
          <select
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full rounded-md border border-border text-xs px-2 py-1.5 bg-white"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={7}>7</option>
            <option value={9}>9</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setRangeMode('auto')}
            className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${
              rangeMode === 'auto' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Auto (±30%)
          </button>
          <button
            onClick={() => setRangeMode('custom')}
            className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${
              rangeMode === 'custom' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Custom Range
          </button>
        </div>
        {rangeMode === 'custom' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              {isCurrency && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>}
              <input
                type="number"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                placeholder="Min"
                className={`w-24 rounded-md border border-border text-xs px-2 py-1.5 ${isCurrency ? 'pl-5' : ''}`}
              />
              {isRate && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>}
            </div>
            <span className="text-[10px] text-muted-foreground">to</span>
            <div className="relative">
              {isCurrency && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>}
              <input
                type="number"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                placeholder="Max"
                className={`w-24 rounded-md border border-border text-xs px-2 py-1.5 ${isCurrency ? 'pl-5' : ''}`}
              />
              {isRate && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>}
            </div>
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-border">
              <th className="text-left px-4 py-2.5 font-semibold text-foreground">{DRIVER_LABELS[driverKey] ?? driverKey}</th>
              <th className="text-right px-4 py-2.5 font-semibold text-foreground">{metric.label}</th>
              <th className="text-right px-4 py-2.5 font-semibold text-foreground">Δ vs Reference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isCurrentScenarioValue = Math.abs(row.driverValue - refDriverValue) < 0.001 * Math.max(1, Math.abs(refDriverValue));

              let deltaColor = 'text-muted-foreground';
              if (row.delta > 0.001) deltaColor = 'text-[#4C7960]';
              if (row.delta < -0.001) deltaColor = 'text-red-500';

              return (
                <tr
                  key={i}
                  className={`border-b border-border/30 ${
                    isCurrentScenarioValue ? 'bg-[#131568]/5 font-semibold' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-2 text-foreground font-mono tabular-nums">
                    {formatDriver(row.driverValue)}
                    {isCurrentScenarioValue && <span className="ml-2 text-[10px] text-[#131568] font-medium">(current)</span>}
                  </td>
                  <td className="text-right px-4 py-2 font-mono tabular-nums text-foreground">
                    {metric.format(row.outputValue)}
                  </td>
                  <td className={`text-right px-4 py-2 font-mono tabular-nums ${deltaColor}`}>
                    {Math.abs(row.delta) < 0.001
                      ? '—'
                      : `${row.delta > 0 ? '+' : ''}${metric.format(row.delta)}`
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
