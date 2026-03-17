import { useState, useMemo, useRef, useEffect } from 'react';
import type { ScenarioResult, Channel } from './marginEngine';
import { formatCurrency } from './marginEngine';

const CHANNEL_LABELS: Record<Channel, string> = {
  wholesale: 'Wholesale',
  dtc: 'DTC E-Commerce',
  dropship: 'Dropship',
};

interface WaterfallStep {
  name: string;
  lines: string[];
  value: number;
  offset: number;
  fill: string;
  isTotal: boolean;
  displayValue: number;
}

function buildWaterfallData(result: ScenarioResult, channel: Channel): WaterfallStep[] {
  const ch = result.channels[channel];
  const dna = ch.allocatedDNA ?? 0;
  const cashSharedCosts = ch.allocatedSharedCosts - dna;

  type StepDef = { name: string; value: number; type: 'total' | 'negative' | 'positive' };

  // EBITDA = Earnings Before D&A: subtract Cash Shared Costs first to reach EBITDA,
  // then subtract D&A to reach Net Margin.
  // Order: Contribution Margin → Cash Shared Costs → EBITDA → D&A → Net Margin
  const stepDefs: StepDef[] = [
    { name: 'Gross Revenue', value: ch.grossRevenue, type: 'total' },
    { name: 'Returns / Discounts', value: -(ch.grossRevenue - ch.netRevenue), type: 'negative' },
    { name: 'Net Revenue', value: ch.netRevenue, type: 'total' },
    { name: 'COGS', value: -(ch.netRevenue - ch.grossMargin), type: 'negative' },
    { name: 'Gross Margin', value: ch.grossMargin, type: 'total' },
    { name: 'Variable Costs', value: -ch.channelVariableCosts, type: 'negative' },
    { name: 'Contribution Margin', value: ch.contributionMargin, type: 'total' },
    { name: 'Cash Shared Costs', value: -cashSharedCosts, type: 'negative' },
    { name: 'EBITDA', value: ch.channelEBITDA, type: 'total' },
    { name: 'D&A', value: -dna, type: 'negative' },
    { name: 'Net Margin', value: ch.channelNetMargin, type: 'total' },
  ];

  const data: WaterfallStep[] = [];
  let running = 0;

  for (const step of stepDefs) {
    const lines = step.name.split(' / ');

    if (step.type === 'total') {
      data.push({
        name: step.name,
        lines,
        value: step.value,
        offset: 0,
        fill: step.value >= 0 ? '#131568' : '#dc2626',
        isTotal: true,
        displayValue: step.value,
      });
      running = step.value;
    } else {
      const absValue = Math.abs(step.value);
      const bottom = running + step.value;
      data.push({
        name: step.name,
        lines,
        value: absValue,
        offset: Math.min(running, bottom),
        fill: step.value < 0 ? '#ef4444' : '#4C7960',
        isTotal: false,
        displayValue: step.value,
      });
      running += step.value;
    }
  }

  return data;
}

const CHART_HEIGHT = 400;
const M_TOP = 32;
const M_BOTTOM = 96;
const M_LEFT = 76;
const M_RIGHT = 20;
const PLOT_H = CHART_HEIGHT - M_TOP - M_BOTTOM;

function computeYDomain(
  primary: WaterfallStep[],
  compare: WaterfallStep[] | null
): [number, number] {
  const vals: number[] = [0];
  const collect = (steps: WaterfallStep[]) => {
    for (const s of steps) {
      if (s.isTotal) {
        vals.push(s.value);
      } else {
        vals.push(s.offset, s.offset + s.value);
      }
    }
  };
  collect(primary);
  if (compare) collect(compare);

  const rawMin = Math.min(...vals);
  const rawMax = Math.max(...vals);
  const range = rawMax - rawMin || 1;
  const pad = range * 0.12;
  return [rawMin - pad, rawMax + pad];
}

function makeYScale(yMin: number, yMax: number) {
  return (v: number) =>
    M_TOP + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;
}

function WaterfallSVG({
  primary,
  compare,
  primaryName,
  compareName,
  width,
}: {
  primary: WaterfallStep[];
  compare: WaterfallStep[] | null;
  primaryName: string;
  compareName?: string;
  width: number;
}) {
  const plotW = width - M_LEFT - M_RIGHT;
  const [yMin, yMax] = useMemo(
    () => computeYDomain(primary, compare),
    [primary, compare]
  );
  const yScale = useMemo(() => makeYScale(yMin, yMax), [yMin, yMax]);
  const y0 = yScale(0);

  const n = primary.length;
  const groupW = plotW / n;
  const hasCompare = compare !== null;
  const singleW = hasCompare ? groupW * 0.38 : groupW * 0.6;
  const gap = hasCompare ? groupW * 0.04 : 0;

  const groupCenterX = (i: number) => M_LEFT + i * groupW + groupW / 2;
  const primaryX = (i: number) =>
    hasCompare
      ? groupCenterX(i) - singleW - gap / 2
      : groupCenterX(i) - singleW / 2;
  const compareX = (i: number) => groupCenterX(i) + gap / 2;

  const TICK_COUNT = 5;
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const t = i / (TICK_COUNT - 1);
    return yMin + t * (yMax - yMin);
  });

  const barRect = (step: WaterfallStep) => {
    if (step.isTotal) {
      const top = step.value >= 0 ? yScale(step.value) : y0;
      const bot = step.value >= 0 ? y0 : yScale(step.value);
      return { y: top, h: Math.max(bot - top, 1) };
    } else {
      const floatTop = yScale(step.offset + step.value);
      const floatBot = yScale(step.offset);
      return { y: Math.min(floatTop, floatBot), h: Math.max(Math.abs(floatBot - floatTop), 1) };
    }
  };

  return (
    <svg width={width} height={CHART_HEIGHT} style={{ display: 'block' }}>
      {/* Horizontal grid lines */}
      {ticks.map((t, i) => (
        <line
          key={`grid-${i}`}
          x1={M_LEFT}
          y1={yScale(t)}
          x2={width - M_RIGHT}
          y2={yScale(t)}
          stroke="#e2e8f0"
          strokeDasharray="3 3"
        />
      ))}

      {/* Zero reference line */}
      <line x1={M_LEFT} y1={y0} x2={width - M_RIGHT} y2={y0} stroke="#94a3b8" strokeWidth={1.5} />

      {/* Y axis labels */}
      {ticks.map((t, i) => (
        <text
          key={`ytick-${i}`}
          x={M_LEFT - 6}
          y={yScale(t)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={9}
          fill="#64748b"
        >
          {formatCurrency(t)}
        </text>
      ))}

      {/* Plot-area clip path: keeps bar value labels inside the chart area */}
      <defs>
        <clipPath id="plot-clip">
          <rect x={M_LEFT} y={M_TOP - 18} width={width - M_LEFT - M_RIGHT} height={PLOT_H + 18} />
        </clipPath>
      </defs>

      {/* Primary bars */}
      {primary.map((step, i) => {
        const { y, h } = barRect(step);
        const bx = primaryX(i);
        const cx = bx + singleW / 2;
        // Clamp label positions so they never escape the SVG bounds
        const totalLabelY = Math.max(M_TOP + 10, y - 5);
        const deltaLabelY = Math.min(CHART_HEIGHT - M_BOTTOM - 4, y + h + 10);

        return (
          <g key={`p-${i}`} clipPath="url(#plot-clip)">
            <rect x={bx} y={y} width={singleW} height={h} fill={step.fill} rx={2} />

            {step.isTotal ? (
              /* Total label: above the bar, clamped to top margin */
              <text
                x={cx}
                y={totalLabelY}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={9}
                fontWeight="700"
                fill={step.fill}
              >
                {formatCurrency(step.displayValue)}
              </text>
            ) : (
              /* Incremental label: below the floating bar, clamped to bottom margin */
              <text
                x={cx}
                y={deltaLabelY}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={9}
                fill={step.fill}
              >
                {formatCurrency(step.displayValue)}
              </text>
            )}
          </g>
        );
      })}

      {/* Compare bars (no labels, semi-transparent) */}
      {compare &&
        compare.map((step, i) => {
          const { y, h } = barRect(step);
          return (
            <rect
              key={`c-${i}`}
              x={compareX(i)}
              y={y}
              width={singleW}
              height={h}
              fill={step.fill}
              rx={2}
              opacity={0.45}
            />
          );
        })}

      {/* X axis step labels — rotated -45° to prevent overlap with 11 steps */}
      {primary.map((step, i) => {
        const cx = groupCenterX(i);
        const labelY = CHART_HEIGHT - M_BOTTOM + 8;
        return (
          <text
            key={`xlabel-${i}`}
            x={cx}
            y={labelY}
            textAnchor="end"
            fontSize={9}
            fill={step.isTotal ? '#334155' : '#64748b'}
            fontWeight={step.isTotal ? '600' : '400'}
            transform={`rotate(-45, ${cx}, ${labelY})`}
          >
            {step.name}
          </text>
        );
      })}

      {/* Legend — names truncated to 18 chars to prevent overflow */}
      {hasCompare && (
        <g>
          <rect x={M_LEFT} y={CHART_HEIGHT - 14} width={10} height={8} fill="#131568" rx={1} />
          <text x={M_LEFT + 13} y={CHART_HEIGHT - 7} fontSize={9} fill="#334155">
            {primaryName.length > 18 ? primaryName.slice(0, 16) + '…' : primaryName}
          </text>
          <rect x={M_LEFT + 130} y={CHART_HEIGHT - 14} width={10} height={8} fill="#131568" rx={1} opacity={0.45} />
          <text x={M_LEFT + 143} y={CHART_HEIGHT - 7} fontSize={9} fill="#334155">
            {(compareName ?? '').length > 18 ? (compareName ?? '').slice(0, 16) + '…' : (compareName ?? '')}
          </text>
        </g>
      )}
    </svg>
  );
}

interface Props {
  results: ScenarioResult[];
}

export function WaterfallChart({ results }: Props) {
  const [channel, setChannel] = useState<Channel>('wholesale');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const primaryData = useMemo(
    () => buildWaterfallData(results[selectedIdx], channel),
    [results, selectedIdx, channel]
  );

  const compareData = useMemo(
    () =>
      compareIdx !== null
        ? buildWaterfallData(results[compareIdx], channel)
        : null,
    [results, compareIdx, channel]
  );

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          Contribution Margin Waterfall
        </h3>
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-muted-foreground">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
              className="rounded-md border border-border text-xs px-2 py-1 bg-white"
            >
              {(['wholesale', 'dtc', 'dropship'] as Channel[]).map((ch) => (
                <option key={ch} value={ch}>
                  {CHANNEL_LABELS[ch]}
                </option>
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
                <option key={r.scenario.id} value={i}>
                  {r.scenario.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-muted-foreground">Compare</label>
            <select
              value={compareIdx ?? ''}
              onChange={(e) =>
                setCompareIdx(e.target.value === '' ? null : Number(e.target.value))
              }
              className="rounded-md border border-border text-xs px-2 py-1 bg-white"
            >
              <option value="">None</option>
              {results.map(
                (r, i) =>
                  i !== selectedIdx && (
                    <option key={r.scenario.id} value={i}>
                      {r.scenario.name}
                    </option>
                  )
              )}
            </select>
          </div>
        </div>
      </div>

      <div ref={containerRef} style={{ width: '100%' }}>
        {containerWidth > 0 && (
          <WaterfallSVG
            primary={primaryData}
            compare={compareData}
            primaryName={results[selectedIdx]?.scenario.name ?? ''}
            compareName={compareIdx !== null ? results[compareIdx]?.scenario.name : undefined}
            width={containerWidth}
          />
        )}
      </div>
    </div>
  );
}
