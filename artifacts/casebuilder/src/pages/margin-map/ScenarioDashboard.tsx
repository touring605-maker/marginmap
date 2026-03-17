import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { useMarginMap } from './MarginMapContext';
import { ScenarioEditor } from './ScenarioEditor';
import { BaselineEditor } from './BaselineEditor';
import { WaterfallChart } from './WaterfallChart';
import { ChannelMixChart } from './ChannelMixChart';
import { SensitivityTable } from './SensitivityTable';
import { ConstraintFlagsPanel } from './ConstraintFlagsPanel';
import { JargonTooltip } from './JargonTooltip';
import {
  computeAllScenarios,
  formatCurrency,
  formatPct,
  formatNumber,
  type Scenario,
  type ScenarioResult,
  type Channel,
} from './marginEngine';

function Tip({ term }: { term: string }) {
  return <JargonTooltip term={term} />;
}

const CHANNEL_LABELS: Record<Channel, string> = {
  wholesale: 'Wholesale',
  dtc: 'DTC E-Commerce',
  dropship: 'Dropship',
};

const BEHAVIOR_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  stepFixed: 'Step-Fixed',
  variable: 'Variable',
};

interface MetricRow {
  label: string;
  tooltip?: string;
  getValue: (r: ScenarioResult) => number;
  format: (v: number) => string;
  isHeader?: boolean;
  indent?: boolean;
}

function buildChannelRows(channel: Channel): MetricRow[] {
  return [
    { label: `${CHANNEL_LABELS[channel]}`, isHeader: true, getValue: () => 0, format: () => '' },
    { label: 'Gross Revenue', tooltip: 'Gross Revenue', getValue: (r) => r.channels[channel].grossRevenue, format: formatCurrency },
    { label: 'Net Revenue', tooltip: 'Net Revenue', getValue: (r) => r.channels[channel].netRevenue, format: formatCurrency },
    { label: 'Gross Margin', tooltip: 'Gross Margin', getValue: (r) => r.channels[channel].grossMargin, format: formatCurrency, indent: true },
    { label: 'Gross Margin %', tooltip: 'Gross Margin', getValue: (r) => r.channels[channel].grossMarginPct, format: formatPct, indent: true },
    { label: 'Variable Costs', tooltip: 'Channel Variable Costs', getValue: (r) => r.channels[channel].channelVariableCosts, format: formatCurrency, indent: true },
    { label: 'Contribution Margin', tooltip: 'Contribution Margin', getValue: (r) => r.channels[channel].contributionMargin, format: formatCurrency },
    { label: 'Contribution Margin %', tooltip: 'Contribution Margin', getValue: (r) => r.channels[channel].contributionMarginPct, format: formatPct },
    { label: 'Allocated Shared Costs', tooltip: 'Allocated Shared Costs', getValue: (r) => r.channels[channel].allocatedSharedCosts, format: formatCurrency, indent: true },
    { label: 'Channel Net Margin', tooltip: 'Channel Net Margin', getValue: (r) => r.channels[channel].channelNetMargin, format: formatCurrency },
    { label: 'Channel Net Margin %', tooltip: 'Channel Net Margin', getValue: (r) => r.channels[channel].channelNetMarginPct, format: formatPct },
  ];
}

const AGGREGATE_ROWS: MetricRow[] = [
  { label: 'Aggregate', isHeader: true, getValue: () => 0, format: () => '' },
  { label: 'Total Revenue', getValue: (r) => r.aggregate.totalRevenue, format: formatCurrency },
  { label: 'Blended Gross Margin %', tooltip: 'Gross Margin', getValue: (r) => r.aggregate.blendedGrossMarginPct, format: formatPct },
  { label: 'Total Contribution Margin', tooltip: 'Contribution Margin', getValue: (r) => r.aggregate.totalContributionMargin, format: formatCurrency },
  { label: 'Blended CM %', tooltip: 'Contribution Margin', getValue: (r) => r.aggregate.blendedContributionMarginPct, format: formatPct },
  { label: 'Total Net Margin', getValue: (r) => r.aggregate.totalNetMargin, format: formatCurrency },
];

const MIX_ROWS: MetricRow[] = [
  { label: 'Revenue & Contribution Mix', isHeader: true, getValue: () => 0, format: () => '' },
  { label: 'Revenue Mix — Wholesale', tooltip: 'Revenue Mix', getValue: (r) => r.aggregate.revenueMix.wholesale, format: formatPct },
  { label: 'Revenue Mix — DTC', tooltip: 'Revenue Mix', getValue: (r) => r.aggregate.revenueMix.dtc, format: formatPct },
  { label: 'Revenue Mix — Dropship', tooltip: 'Revenue Mix', getValue: (r) => r.aggregate.revenueMix.dropship, format: formatPct },
  { label: 'CM Mix — Wholesale', tooltip: 'Contribution Mix', getValue: (r) => r.aggregate.contributionMix.wholesale, format: formatPct },
  { label: 'CM Mix — DTC', tooltip: 'Contribution Mix', getValue: (r) => r.aggregate.contributionMix.dtc, format: formatPct },
  { label: 'CM Mix — Dropship', tooltip: 'Contribution Mix', getValue: (r) => r.aggregate.contributionMix.dropship, format: formatPct },
];

export function ScenarioDashboard() {
  const { state, dispatch } = useMarginMap();
  const baseline = state.baseline!;
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [editingBaseline, setEditingBaseline] = useState(false);

  const baselineScenario = state.scenarios.find((s) => s.isBaseline)!;
  const activeScenarios = state.scenarios.filter(
    (s) => !s.isBaseline && state.activeScenarioIds.includes(s.id)
  );
  const displayScenarios = [baselineScenario, ...activeScenarios];

  const results = useMemo(
    () => computeAllScenarios(baseline, displayScenarios),
    [baseline, displayScenarios]
  );

  const baselineResult = results[0];

  const allRows: MetricRow[] = [
    ...buildChannelRows('wholesale'),
    ...buildChannelRows('dtc'),
    ...buildChannelRows('dropship'),
    ...AGGREGATE_ROWS,
    ...MIX_ROWS,
  ];

  const addScenario = () => {
    const count = state.scenarios.filter((s) => !s.isBaseline).length;
    dispatch({
      type: 'ADD_SCENARIO',
      payload: { name: `Scenario ${count + 1}` },
    });
  };

  const allNonBaseline = state.scenarios.filter((s) => !s.isBaseline);

  const behaviorLabel = BEHAVIOR_LABELS[baseline.sharedCostBehavior] || baseline.sharedCostBehavior;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Scenario Dashboard</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              Shared Cost Allocation: <span className="font-semibold text-foreground">{baseline.sharedCostBehavior === 'variable' ? 'Volume-Weighted' : 'Revenue-Weighted'}</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
              Behavior: {behaviorLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingBaseline(!editingBaseline)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-slate-50 transition-colors"
          >
            {editingBaseline ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {editingBaseline ? 'Lock Baseline' : 'Edit Baseline'}
          </button>
          <button
            onClick={addScenario}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#131568] text-white rounded-lg hover:bg-[#131568]/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Scenario
          </button>
        </div>
      </div>

      {editingBaseline && (
        <BaselineEditor onClose={() => setEditingBaseline(false)} />
      )}

      {allNonBaseline.length > 3 && (
        <div className="bg-slate-50 border border-border rounded-lg p-3">
          <p className="text-xs font-medium text-foreground mb-2">
            Select up to 3 scenarios to compare (you have {allNonBaseline.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {allNonBaseline.map((s) => {
              const isActive = state.activeScenarioIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => dispatch({ type: 'TOGGLE_ACTIVE_SCENARIO', payload: s.id })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors
                    ${isActive ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'bg-white border-border text-muted-foreground hover:border-primary/20'}
                  `}
                >
                  {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ConstraintFlagsPanel results={results} />

      <div className="border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left text-xs font-semibold text-foreground px-4 py-3 sticky left-0 bg-slate-50 min-w-[200px] z-10">
                  Metric
                </th>
                {displayScenarios.map((s, i) => (
                  <th key={s.id} className="text-right text-xs font-semibold text-foreground px-4 py-3 min-w-[140px]">
                    <div className="flex items-center justify-end gap-1">
                      <span className={s.isBaseline ? 'text-[#131568]' : 'text-foreground'}>{s.name}</span>
                      {!s.isBaseline && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            onClick={() => setEditingScenario(s)}
                            className="p-0.5 text-muted-foreground hover:text-primary"
                            title="Edit scenario"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'DELETE_SCENARIO', payload: s.id })}
                            className="p-0.5 text-muted-foreground hover:text-destructive"
                            title="Delete scenario"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {!s.isBaseline && i > 0 && (
                      <span className="text-[10px] text-muted-foreground font-normal">vs Baseline</span>
                    )}
                  </th>
                ))}
                {displayScenarios.length > 1 && displayScenarios.slice(1).map((s) => (
                  <th key={`delta-${s.id}`} className="text-right text-xs font-semibold px-4 py-3 min-w-[100px] bg-slate-100/50">
                    <span className="text-muted-foreground">Δ {s.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRows.map((row, rowIdx) => {
                if (row.isHeader) {
                  return (
                    <tr key={rowIdx} className="bg-[#131568]/5">
                      <td
                        colSpan={1 + displayScenarios.length + (displayScenarios.length > 1 ? displayScenarios.length - 1 : 0)}
                        className="text-xs font-bold text-[#131568] px-4 py-2 uppercase tracking-wider sticky left-0 bg-[#131568]/5 z-10"
                      >
                        {row.label}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={rowIdx} className="border-b border-border/30 hover:bg-slate-50/50">
                    <td className={`text-xs text-foreground px-4 py-2 sticky left-0 bg-white z-10 ${row.indent ? 'pl-8 text-muted-foreground' : 'font-medium'}`}>
                      {row.label}
                      {row.tooltip && <Tip term={row.tooltip} />}
                    </td>
                    {results.map((r, i) => (
                      <td key={r.scenario.id} className="text-right text-xs px-4 py-2 font-mono tabular-nums">
                        {row.format(row.getValue(r))}
                      </td>
                    ))}
                    {displayScenarios.length > 1 && results.slice(1).map((r) => {
                      const baseVal = row.getValue(baselineResult);
                      const scenarioVal = row.getValue(r);
                      const delta = scenarioVal - baseVal;
                      const isPct = row.format === formatPct;
                      const isPositive = delta > 0.001;
                      const isNegative = delta < -0.001;

                      let colorClass = 'text-muted-foreground';
                      if (isPositive) colorClass = 'text-[#4C7960]';
                      if (isNegative) colorClass = 'text-red-500';

                      return (
                        <td key={`delta-${r.scenario.id}`} className={`text-right text-xs px-4 py-2 font-mono tabular-nums bg-slate-50/50 ${colorClass}`}>
                          {Math.abs(delta) < 0.001
                            ? '—'
                            : `${delta > 0 ? '+' : ''}${isPct ? formatPct(delta) : formatCurrency(delta)}`
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WaterfallChart results={results} />
        <ChannelMixChart results={results} />
      </div>

      <SensitivityTable baseline={baseline} scenarios={displayScenarios} />

      {editingScenario && (
        <ScenarioEditor
          scenario={editingScenario}
          onClose={() => setEditingScenario(null)}
        />
      )}
    </div>
  );
}
