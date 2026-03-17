import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, HelpCircle } from 'lucide-react';
import { useMarginMap } from './MarginMapContext';
import type { BaselineData, SharedCostBehavior } from './marginEngine';
import { DRIVER_LABELS, JARGON_TOOLTIPS } from './marginEngine';

const STEPS = [
  { title: 'Volume Drivers', description: 'How much you sell through each channel' },
  { title: 'Price & Revenue', description: 'What you charge and what you actually collect' },
  { title: 'Cost Drivers', description: 'Variable costs by channel' },
  { title: 'Shared Costs & Constraints', description: 'Overhead allocation and capacity limits' },
];

const DEFAULT_BASELINE: BaselineData = {
  wholesaleVolume: 10000,
  dtcVolume: 5000,
  dropshipVolume: 3000,
  wholesaleASP: 50,
  wholesaleDiscountRate: 0.15,
  dtcASP: 75,
  dtcReturnRate: 0.12,
  dropshipServiceFeeRate: 0.20,
  dropshipMarketplaceFeeRate: 0.08,
  cogsPerUnit: 20,
  dtcFulfillmentCostPerUnit: 8,
  dropshipFulfillmentCostPerOrder: 6,
  dtcCAC: 25,
  wholesaleCommissionRate: 0.05,
  returnProcessingCostPerUnit: 4,
  totalSharedCostPool: 200000,
  sharedCostBehavior: 'fixed',
  stepFixedThresholdVolume: 20000,
  stepFixedIncrease: 50000,
  warehouseCapacityUnits: 25000,
  wholesaleInventoryUnits: 12000,
  dtcInventoryUnits: 6000,
  dropshipInventoryUnits: 4000,
};

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <button
        type="button"
        className="text-muted-foreground hover:text-primary transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs bg-slate-900 text-white rounded-lg shadow-lg z-50 leading-relaxed">
          {text}
        </span>
      )}
    </span>
  );
}

interface FieldProps {
  label: string;
  tooltip?: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  locked?: boolean;
}

function Field({ label, tooltip, value, onChange, prefix, suffix, step = 1, min, max, locked }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          disabled={locked}
          className={`w-full rounded-lg border border-border bg-white px-3 py-2 text-sm
            ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-7' : ''}
            ${locked ? 'bg-slate-50 text-muted-foreground cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}
          `}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export function SetupWizard() {
  const { dispatch } = useMarginMap();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BaselineData>({ ...DEFAULT_BASELINE });

  const update = (key: keyof BaselineData, value: number | SharedCostBehavior) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const handleComplete = () => {
    dispatch({ type: 'SET_BASELINE', payload: data });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-display font-bold text-foreground">Setup Baseline Model</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your current business data. This becomes the locked baseline that all scenarios are measured against.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all w-full
                ${i === step ? 'bg-[#131568] text-white shadow-md' : i < step ? 'bg-[#4C7960]/10 text-[#4C7960]' : 'bg-slate-100 text-muted-foreground'}
              `}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                ${i === step ? 'bg-white/20 text-white' : i < step ? 'bg-[#4C7960] text-white' : 'bg-slate-200 text-slate-500'}
              `}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden lg:inline truncate">{s.title}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-1">{STEPS[step].title}</h3>
        <p className="text-xs text-muted-foreground mb-6">{STEPS[step].description}</p>

        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={DRIVER_LABELS.wholesaleVolume} value={data.wholesaleVolume} onChange={(v) => update('wholesaleVolume', v)} suffix="units" />
            <Field label={DRIVER_LABELS.dtcVolume} value={data.dtcVolume} onChange={(v) => update('dtcVolume', v)} suffix="units" />
            <Field label={DRIVER_LABELS.dropshipVolume} value={data.dropshipVolume} onChange={(v) => update('dropshipVolume', v)} suffix="orders" />
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={DRIVER_LABELS.wholesaleASP} tooltip={JARGON_TOOLTIPS['ASP']} value={data.wholesaleASP} onChange={(v) => update('wholesaleASP', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.wholesaleDiscountRate} value={data.wholesaleDiscountRate * 100} onChange={(v) => update('wholesaleDiscountRate', v / 100)} suffix="%" step={0.1} min={0} max={100} />
            <Field label={DRIVER_LABELS.dtcASP} tooltip={JARGON_TOOLTIPS['ASP']} value={data.dtcASP} onChange={(v) => update('dtcASP', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.dtcReturnRate} value={data.dtcReturnRate * 100} onChange={(v) => update('dtcReturnRate', v / 100)} suffix="%" step={0.1} min={0} max={100} />
            <Field label={DRIVER_LABELS.dropshipServiceFeeRate} value={data.dropshipServiceFeeRate * 100} onChange={(v) => update('dropshipServiceFeeRate', v / 100)} suffix="%" step={0.1} min={0} max={100} />
            <Field label={DRIVER_LABELS.dropshipMarketplaceFeeRate} value={data.dropshipMarketplaceFeeRate * 100} onChange={(v) => update('dropshipMarketplaceFeeRate', v / 100)} suffix="%" step={0.1} min={0} max={100} />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={DRIVER_LABELS.cogsPerUnit} tooltip={JARGON_TOOLTIPS['COGS']} value={data.cogsPerUnit} onChange={(v) => update('cogsPerUnit', v)} prefix="$" step={0.01} locked />
            <Field label={DRIVER_LABELS.dtcFulfillmentCostPerUnit} value={data.dtcFulfillmentCostPerUnit} onChange={(v) => update('dtcFulfillmentCostPerUnit', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.dropshipFulfillmentCostPerOrder} value={data.dropshipFulfillmentCostPerOrder} onChange={(v) => update('dropshipFulfillmentCostPerOrder', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.dtcCAC} tooltip={JARGON_TOOLTIPS['CAC']} value={data.dtcCAC} onChange={(v) => update('dtcCAC', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.wholesaleCommissionRate} value={data.wholesaleCommissionRate * 100} onChange={(v) => update('wholesaleCommissionRate', v / 100)} suffix="%" step={0.1} min={0} max={100} />
            <Field label={DRIVER_LABELS.returnProcessingCostPerUnit} value={data.returnProcessingCostPerUnit} onChange={(v) => update('returnProcessingCostPerUnit', v)} prefix="$" step={0.01} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={DRIVER_LABELS.totalSharedCostPool} value={data.totalSharedCostPool} onChange={(v) => update('totalSharedCostPool', v)} prefix="$" step={1000} />
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  {DRIVER_LABELS.sharedCostBehavior}
                  <Tooltip text={JARGON_TOOLTIPS['Step-Fixed Costs']} />
                </label>
                <select
                  value={data.sharedCostBehavior}
                  onChange={(e) => update('sharedCostBehavior', e.target.value as SharedCostBehavior)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="fixed">Fixed — Pool stays the same regardless of volume</option>
                  <option value="stepFixed">Step-Fixed — Pool jumps at a capacity threshold</option>
                  <option value="variable">Variable — Pool scales proportionally with volume</option>
                </select>
              </div>
            </div>

            {data.sharedCostBehavior === 'stepFixed' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Field label={DRIVER_LABELS.stepFixedThresholdVolume} value={data.stepFixedThresholdVolume ?? 0} onChange={(v) => update('stepFixedThresholdVolume', v)} suffix="units" />
                <Field label={DRIVER_LABELS.stepFixedIncrease} value={data.stepFixedIncrease ?? 0} onChange={(v) => update('stepFixedIncrease', v)} prefix="$" step={1000} />
              </div>
            )}

            <div className="border-t border-border pt-4">
              <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Operational Constraints</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={DRIVER_LABELS.warehouseCapacityUnits} value={data.warehouseCapacityUnits} onChange={(v) => update('warehouseCapacityUnits', v)} suffix="units" />
                <Field label={DRIVER_LABELS.wholesaleInventoryUnits} value={data.wholesaleInventoryUnits} onChange={(v) => update('wholesaleInventoryUnits', v)} suffix="units" />
                <Field label={DRIVER_LABELS.dtcInventoryUnits} value={data.dtcInventoryUnits} onChange={(v) => update('dtcInventoryUnits', v)} suffix="units" />
                <Field label={DRIVER_LABELS.dropshipInventoryUnits} value={data.dropshipInventoryUnits} onChange={(v) => update('dropshipInventoryUnits', v)} suffix="units" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium bg-[#131568] text-white rounded-lg hover:bg-[#131568]/90 transition-colors shadow-md"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium bg-[#4C7960] text-white rounded-lg hover:bg-[#4C7960]/90 transition-colors shadow-md"
          >
            <Check className="w-4 h-4" /> Save & Start Planning
          </button>
        )}
      </div>
    </div>
  );
}
