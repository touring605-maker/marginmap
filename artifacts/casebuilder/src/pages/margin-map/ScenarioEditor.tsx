import { useState, useEffect } from 'react';
import { X, HelpCircle, RotateCcw } from 'lucide-react';
import { useMarginMap } from './MarginMapContext';
import type { Scenario, ScenarioDriverOverrides, Channel, SharedCostBehavior } from './marginEngine';
import { DRIVER_LABELS, JARGON_TOOLTIPS, RATE_DRIVERS, CURRENCY_DRIVERS } from './marginEngine';

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <button
        type="button"
        className="text-muted-foreground hover:text-primary transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <HelpCircle className="w-3 h-3" />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs bg-slate-900 text-white rounded-lg shadow-lg z-50 leading-relaxed">
          {text}
        </span>
      )}
    </span>
  );
}

const VOLUME_DRIVERS: (keyof ScenarioDriverOverrides)[] = [
  'wholesaleVolume', 'dtcVolume', 'dropshipVolume',
];

const PRICE_DRIVERS: (keyof ScenarioDriverOverrides)[] = [
  'wholesaleASP', 'wholesaleDiscountRate', 'dtcASP', 'dtcReturnRate',
  'dropshipServiceFeeRate', 'dropshipMarketplaceFeeRate',
];

const COST_DRIVERS: (keyof ScenarioDriverOverrides)[] = [
  'dtcFulfillmentCostPerUnit', 'dropshipFulfillmentCostPerOrder',
  'dtcCAC', 'wholesaleCommissionRate', 'returnProcessingCostPerUnit',
];

const SHARED_DRIVERS: (keyof ScenarioDriverOverrides)[] = [
  'totalSharedCostPool',
];

const SECTIONS = [
  { title: 'Volume Drivers', drivers: VOLUME_DRIVERS },
  { title: 'Price & Revenue', drivers: PRICE_DRIVERS },
  { title: 'Cost Drivers', drivers: COST_DRIVERS },
  { title: 'Shared Cost Pool', drivers: SHARED_DRIVERS },
];

interface Props {
  scenario: Scenario;
  onClose: () => void;
}

export function ScenarioEditor({ scenario, onClose }: Props) {
  const { state, dispatch } = useMarginMap();
  const baseline = state.baseline!;
  const [name, setName] = useState(scenario.name);
  const [drivers, setDrivers] = useState<ScenarioDriverOverrides>({ ...scenario.drivers });
  const [mixShiftEnabled, setMixShiftEnabled] = useState(!!scenario.drivers.channelMixShift);
  const [mixFrom, setMixFrom] = useState<Channel>(scenario.drivers.channelMixShift?.from ?? 'wholesale');
  const [mixTo, setMixTo] = useState<Channel>(scenario.drivers.channelMixShift?.to ?? 'dtc');
  const [mixPct, setMixPct] = useState((scenario.drivers.channelMixShift?.pct ?? 0.1) * 100);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const finalDrivers: ScenarioDriverOverrides = { ...drivers };
      if (mixShiftEnabled && mixFrom !== mixTo) {
        finalDrivers.channelMixShift = { from: mixFrom, to: mixTo, pct: mixPct / 100 };
      } else {
        delete finalDrivers.channelMixShift;
      }
      dispatch({
        type: 'UPDATE_SCENARIO',
        payload: { id: scenario.id, name, drivers: finalDrivers },
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [name, drivers, mixShiftEnabled, mixFrom, mixTo, mixPct, dispatch, scenario.id]);

  const getBaselineValue = (key: string): number => {
    return (baseline as unknown as Record<string, unknown>)[key] as number ?? 0;
  };

  const getDriverValue = (key: keyof ScenarioDriverOverrides): number | undefined => {
    return drivers[key] as number | undefined;
  };

  const setDriverValue = (key: keyof ScenarioDriverOverrides, value: number | undefined) => {
    setDrivers((d) => {
      const next = { ...d };
      if (value === undefined) {
        delete next[key];
      } else {
        (next as Record<string, unknown>)[key] = value;
      }
      return next;
    });
  };

  const renderDriver = (key: keyof ScenarioDriverOverrides) => {
    const label = DRIVER_LABELS[key] ?? key;
    const isRate = RATE_DRIVERS.has(key);
    const isCurrency = CURRENCY_DRIVERS.has(key);
    const baseVal = getBaselineValue(key);
    const displayBase = isRate ? baseVal * 100 : baseVal;
    const currentRaw = getDriverValue(key);
    const hasOverride = currentRaw !== undefined;
    const displayCurrent = hasOverride
      ? isRate ? (currentRaw as number) * 100 : currentRaw as number
      : displayBase;

    const delta = hasOverride ? (currentRaw as number) - baseVal : 0;
    const displayDelta = isRate ? delta * 100 : delta;
    const tooltip = JARGON_TOOLTIPS[label.replace(/ *\(.*\)/, '')] ?? null;

    return (
      <div key={key} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-foreground truncate flex items-center">
            {label}
            {tooltip && <Tooltip text={tooltip} />}
          </label>
          <span className="text-[10px] text-muted-foreground">
            Baseline: {isCurrency ? '$' : ''}{displayBase.toFixed(isRate ? 1 : isCurrency ? 2 : 0)}{isRate ? '%' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-28">
            {isCurrency && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>}
            <input
              type="number"
              value={displayCurrent ?? ''}
              onChange={(e) => {
                const raw = e.target.value === '' ? undefined : Number(e.target.value);
                setDriverValue(key, raw === undefined ? undefined : isRate ? raw / 100 : raw);
              }}
              step={isRate ? 0.1 : isCurrency ? 0.01 : 1}
              className={`w-full rounded-md border text-sm px-2 py-1.5 text-right
                ${isCurrency ? 'pl-5' : ''} ${isRate ? 'pr-5' : ''}
                ${hasOverride ? 'border-primary/40 bg-primary/5' : 'border-border bg-white'}
                focus:ring-1 focus:ring-primary/20 focus:border-primary
              `}
            />
            {isRate && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>}
          </div>
          {hasOverride && (
            <>
              <span className={`text-[10px] font-medium w-16 text-right ${displayDelta > 0 ? 'text-red-500' : displayDelta < 0 ? 'text-[#4C7960]' : 'text-muted-foreground'}`}>
                {displayDelta > 0 ? '+' : ''}{displayDelta.toFixed(isRate ? 1 : isCurrency ? 2 : 0)}
              </span>
              <button
                onClick={() => setDriverValue(key, undefined)}
                className="p-0.5 text-muted-foreground hover:text-foreground"
                title="Reset to baseline"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl border-l border-border overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base font-display font-bold text-foreground bg-transparent border-0 border-b border-dashed border-border focus:border-primary focus:outline-none px-0 py-0.5"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">Override any driver to model this scenario</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          <div className="bg-slate-50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Shared Cost Behavior</label>
              <Tooltip text={JARGON_TOOLTIPS['Step-Fixed Costs']} />
            </div>
            <select
              value={drivers.sharedCostBehavior ?? baseline.sharedCostBehavior}
              onChange={(e) => {
                const val = e.target.value as SharedCostBehavior;
                setDrivers((d) => ({ ...d, sharedCostBehavior: val }));
              }}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="fixed">Fixed — No change with volume</option>
              <option value="stepFixed">Step-Fixed — Jumps at threshold</option>
              <option value="variable">Variable — Scales with volume</option>
            </select>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Channel Mix Shift</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mixShiftEnabled}
                  onChange={(e) => setMixShiftEnabled(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-xs text-muted-foreground">Enable</span>
              </label>
            </div>
            {mixShiftEnabled && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">From</label>
                  <select value={mixFrom} onChange={(e) => setMixFrom(e.target.value as Channel)} className="w-full rounded border border-border text-xs px-2 py-1.5">
                    <option value="wholesale">Wholesale</option>
                    <option value="dtc">DTC</option>
                    <option value="dropship">Dropship</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">To</label>
                  <select value={mixTo} onChange={(e) => setMixTo(e.target.value as Channel)} className="w-full rounded border border-border text-xs px-2 py-1.5">
                    <option value="wholesale">Wholesale</option>
                    <option value="dtc">DTC</option>
                    <option value="dropship">Dropship</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Shift %</label>
                  <input
                    type="number"
                    value={mixPct}
                    onChange={(e) => setMixPct(Number(e.target.value))}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full rounded border border-border text-xs px-2 py-1.5 text-right"
                  />
                </div>
              </div>
            )}
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">{section.title}</h4>
              <div className="bg-white border border-border rounded-lg px-3">
                {section.drivers.map((d) => renderDriver(d))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
