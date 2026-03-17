import { useState } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';
import { useMarginMap } from './MarginMapContext';
import type { BaselineData, SharedCostBehavior } from './marginEngine';
import { DRIVER_LABELS, JARGON_TOOLTIPS } from './marginEngine';

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

interface FieldProps {
  label: string;
  tooltip?: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}

function Field({ label, tooltip, value, onChange, prefix, suffix, step = 1 }: FieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-foreground mb-0.5">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          className={`w-full rounded-md border border-border bg-white px-2 py-1.5 text-xs
            ${prefix ? 'pl-5' : ''} ${suffix ? 'pr-5' : ''}
            focus:ring-1 focus:ring-primary/20 focus:border-primary
          `}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export function BaselineEditor({ onClose }: Props) {
  const { state, dispatch } = useMarginMap();
  const [data, setData] = useState<BaselineData>({ ...state.baseline! });

  const update = (key: keyof BaselineData, value: number | SharedCostBehavior) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const handleSave = () => {
    dispatch({ type: 'SET_BASELINE', payload: data });
    onClose();
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Editing Baseline</h3>
          <p className="text-[10px] text-muted-foreground">Changes will recalculate all scenarios</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-white">
            <X className="w-3 h-3" /> Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#4C7960] text-white rounded-lg hover:bg-[#4C7960]/90">
            <Check className="w-3 h-3" /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <h4 className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Volume</h4>
          <div className="space-y-2">
            <Field label={DRIVER_LABELS.wholesaleVolume} value={data.wholesaleVolume} onChange={(v) => update('wholesaleVolume', v)} suffix="units" />
            <Field label={DRIVER_LABELS.dtcVolume} value={data.dtcVolume} onChange={(v) => update('dtcVolume', v)} suffix="units" />
            <Field label={DRIVER_LABELS.dropshipVolume} value={data.dropshipVolume} onChange={(v) => update('dropshipVolume', v)} suffix="orders" />
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Price & Revenue</h4>
          <div className="space-y-2">
            <Field label={DRIVER_LABELS.wholesaleASP} tooltip={JARGON_TOOLTIPS['ASP']} value={data.wholesaleASP} onChange={(v) => update('wholesaleASP', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.wholesaleDiscountRate} value={data.wholesaleDiscountRate * 100} onChange={(v) => update('wholesaleDiscountRate', v / 100)} suffix="%" step={0.1} />
            <Field label={DRIVER_LABELS.dtcASP} value={data.dtcASP} onChange={(v) => update('dtcASP', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.dtcReturnRate} value={data.dtcReturnRate * 100} onChange={(v) => update('dtcReturnRate', v / 100)} suffix="%" step={0.1} />
            <Field label={DRIVER_LABELS.dropshipServiceFeeRate} value={data.dropshipServiceFeeRate * 100} onChange={(v) => update('dropshipServiceFeeRate', v / 100)} suffix="%" step={0.1} />
            <Field label={DRIVER_LABELS.dropshipMarketplaceFeeRate} value={data.dropshipMarketplaceFeeRate * 100} onChange={(v) => update('dropshipMarketplaceFeeRate', v / 100)} suffix="%" step={0.1} />
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Cost Drivers</h4>
          <div className="space-y-2">
            <Field label={DRIVER_LABELS.cogsPerUnit} tooltip={JARGON_TOOLTIPS['COGS']} value={data.cogsPerUnit} onChange={(v) => update('cogsPerUnit', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.dtcFulfillmentCostPerUnit} value={data.dtcFulfillmentCostPerUnit} onChange={(v) => update('dtcFulfillmentCostPerUnit', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.dropshipFulfillmentCostPerOrder} value={data.dropshipFulfillmentCostPerOrder} onChange={(v) => update('dropshipFulfillmentCostPerOrder', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.dtcCAC} tooltip={JARGON_TOOLTIPS['CAC']} value={data.dtcCAC} onChange={(v) => update('dtcCAC', v)} prefix="$" step={0.01} />
            <Field label={DRIVER_LABELS.wholesaleCommissionRate} value={data.wholesaleCommissionRate * 100} onChange={(v) => update('wholesaleCommissionRate', v / 100)} suffix="%" step={0.1} />
            <Field label={DRIVER_LABELS.returnProcessingCostPerUnit} value={data.returnProcessingCostPerUnit} onChange={(v) => update('returnProcessingCostPerUnit', v)} prefix="$" step={0.01} />
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-2">Shared Costs & Constraints</h4>
          <div className="space-y-2">
            <Field label={DRIVER_LABELS.totalSharedCostPool} value={data.totalSharedCostPool} onChange={(v) => update('totalSharedCostPool', v)} prefix="$" step={1000} />
            <div>
              <label className="block text-[10px] font-medium text-foreground mb-0.5">{DRIVER_LABELS.sharedCostBehavior}</label>
              <select
                value={data.sharedCostBehavior}
                onChange={(e) => update('sharedCostBehavior', e.target.value as SharedCostBehavior)}
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary/20"
              >
                <option value="fixed">Fixed</option>
                <option value="stepFixed">Step-Fixed</option>
                <option value="variable">Variable</option>
              </select>
            </div>
            <Field label={DRIVER_LABELS.warehouseCapacityUnits} value={data.warehouseCapacityUnits} onChange={(v) => update('warehouseCapacityUnits', v)} suffix="units" />
            <Field label={DRIVER_LABELS.wholesaleInventoryUnits} value={data.wholesaleInventoryUnits} onChange={(v) => update('wholesaleInventoryUnits', v)} suffix="units" />
            <Field label={DRIVER_LABELS.dtcInventoryUnits} value={data.dtcInventoryUnits} onChange={(v) => update('dtcInventoryUnits', v)} suffix="units" />
            <Field label={DRIVER_LABELS.dropshipInventoryUnits} value={data.dropshipInventoryUnits} onChange={(v) => update('dropshipInventoryUnits', v)} suffix="units" />
          </div>
        </div>
      </div>
    </div>
  );
}
