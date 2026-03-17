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

interface Props {
  baseline: BaselineData;
  scenarios: Scenario[];
}

export function SensitivityTable({ baseline, scenarios }: Props) {
  const [driverKey, setDriverKey] = useState<keyof ScenarioDriverOverrides>('dtcCAC');
  const [metricIdx, setMetricIdx] = useState(1);
  const [refIdx, setRefIdx] = useState(0);
  const [steps, setSteps] = useState(5);

  const metric = OUTPUT_METRICS[metricIdx];
  const refScenario = scenarios[refIdx];
  const isRate = RATE_DRIVERS.has(driverKey);
  const isCurrency = CURRENCY_DRIVERS.has(driverKey);

  const baseValue = useMemo(() => {
    return (baseline as unknown as Record<string, number>)[driverKey] ?? 0;
  }, [baseline, driverKey]);

  const refResult = useMemo(
    () => computeScenario(baseline, refScenario),
    [baseline, refScenario]
  );
  const refMetricValue = metric.getValue(refResult);

  const rows = useMemo(() => {
    const halfSteps = Math.floor(steps / 2);
    const range: number[] = [];
    for (let i = -halfSteps; i <= halfSteps; i++) {
      const pctShift = i * 0.3 / halfSteps;
      range.push(baseValue * (1 + pctShift));
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
  }, [baseline, refScenario, driverKey, metric, baseValue, steps, refMetricValue]);

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
              const isBaseline = Math.abs(row.driverValue - baseValue) < 0.001 * Math.max(1, Math.abs(baseValue));
              const isPositiveDelta = row.delta > 0.001;
              const isNegativeDelta = row.delta < -0.001;

              let deltaColor = 'text-muted-foreground';
              if (driverKey.includes('Cost') || driverKey.includes('CAC') || driverKey.includes('Rate') || driverKey.includes('return') || driverKey.includes('commission') || driverKey.includes('discount') || driverKey.includes('marketplace')) {
                if (isPositiveDelta) deltaColor = 'text-red-500';
                if (isNegativeDelta) deltaColor = 'text-[#4C7960]';
              } else {
                if (isPositiveDelta) deltaColor = 'text-[#4C7960]';
                if (isNegativeDelta) deltaColor = 'text-red-500';
              }

              return (
                <tr
                  key={i}
                  className={`border-b border-border/30 ${
                    isBaseline ? 'bg-[#131568]/5 font-semibold' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-2 text-foreground font-mono tabular-nums">
                    {formatDriver(row.driverValue)}
                    {isBaseline && <span className="ml-2 text-[10px] text-[#131568] font-medium">(baseline)</span>}
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
