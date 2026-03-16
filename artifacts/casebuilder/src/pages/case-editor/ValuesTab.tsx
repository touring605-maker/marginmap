import { useState } from "react";
import { useValues, useCreateValue, useUpdateValue, useDeleteValue } from "@/hooks/use-values";
import { useListCaseDependencies, useListBusinessCases } from "@workspace/api-client-react";
import { Plus, Trash2, Loader2, Pencil, Link2 } from "lucide-react";

const VALUE_TYPES = [
  { value: "cost_reduction", label: "Cost Reduction" },
  { value: "revenue", label: "Revenue" },
  { value: "margin", label: "Margin" },
  { value: "productivity", label: "Productivity" },
  { value: "risk", label: "Risk Mitigation" },
] as const;

const CONFIDENCE_LEVELS = [
  { value: "high", label: "High (90%)", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  { value: "medium", label: "Medium (70%)", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  { value: "low", label: "Low (50%)", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" },
] as const;

type ValueType = "cost_reduction" | "revenue" | "margin" | "productivity" | "risk";
type Confidence = "high" | "medium" | "low";

interface ValueFormData {
  name: string;
  type: ValueType;
  annualValue: string;
  confidenceLevel: Confidence;
  monthsToRealize: string;
  description: string;
}

const emptyForm: ValueFormData = {
  name: "",
  type: "cost_reduction",
  annualValue: "",
  confidenceLevel: "medium",
  monthsToRealize: "0",
  description: "",
};

function ValueForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  data: ValueFormData;
  onChange: (d: ValueFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-border space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Driver Name</label>
          <input
            required type="text" value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Type</label>
          <select
            value={data.type}
            onChange={(e) => onChange({ ...data, type: e.target.value as ValueType })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            {VALUE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Annual Value</label>
          <input
            required type="number" min="0" step="0.01" value={data.annualValue}
            onChange={(e) => onChange({ ...data, annualValue: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Confidence Level</label>
          <select
            value={data.confidenceLevel}
            onChange={(e) => onChange({ ...data, confidenceLevel: e.target.value as Confidence })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Months to Realize</label>
          <input
            required type="number" min="0" value={data.monthsToRealize}
            onChange={(e) => onChange({ ...data, monthsToRealize: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Description (Optional)</label>
        <input
          type="text" value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Brief description..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}

const CASCADE_LABELS: Record<string, string> = {
  npv: "Net Present Value",
  totalAnnualSavings: "Total Annual Savings",
  totalExpectedValue: "Total Expected Value",
  confidenceAdjustedValue: "Confidence-Adjusted Value",
};

export function ValuesTab({ caseId, scenarioId }: { caseId: number; scenarioId?: number }) {
  const { data: values, isLoading } = useValues(caseId, scenarioId);
  const { data: allDeps } = useListCaseDependencies();
  const { data: allCases } = useListBusinessCases();

  const incomingCascades = (allDeps || []).filter(d => d.toCaseId === caseId && d.cascadeField);
  const caseNameMap = new Map((allCases || []).map(c => [c.id, c.name]));
  const createMutation = useCreateValue();
  const updateMutation = useUpdateValue();
  const deleteMutation = useDeleteValue();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ValueFormData>({ ...emptyForm });
  const [editData, setEditData] = useState<ValueFormData>({ ...emptyForm });

  const handleCreate = () => {
    createMutation.mutate(
      {
        id: caseId,
        data: {
          name: formData.name,
          type: formData.type,
          annualValue: parseFloat(formData.annualValue),
          confidenceLevel: formData.confidenceLevel,
          monthsToRealize: parseInt(formData.monthsToRealize, 10),
          ...(formData.description ? { description: formData.description } : {}),
          ...(scenarioId ? { scenarioId } : {}),
        },
      },
      {
        onSuccess: () => {
          setIsAdding(false);
          setFormData({ ...emptyForm });
        },
      }
    );
  };

  const startEdit = (val: { id: number; name: string; type: string; annualValue: number; confidenceLevel: string; monthsToRealize: number; description?: string | null }) => {
    setEditingId(val.id);
    setEditData({
      name: val.name,
      type: val.type as ValueType,
      annualValue: String(val.annualValue),
      confidenceLevel: val.confidenceLevel as Confidence,
      monthsToRealize: String(val.monthsToRealize),
      description: val.description || "",
    });
  };

  const handleUpdate = () => {
    if (editingId === null) return;
    updateMutation.mutate(
      {
        id: caseId,
        valueId: editingId,
        data: {
          name: editData.name,
          type: editData.type,
          annualValue: parseFloat(editData.annualValue),
          confidenceLevel: editData.confidenceLevel,
          monthsToRealize: parseInt(editData.monthsToRealize, 10),
          ...(editData.description ? { description: editData.description } : {}),
        },
      },
      { onSuccess: () => setEditingId(null) }
    );
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const totalValue = values?.reduce((sum, v) => sum + v.annualValue, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold">Value Drivers</h2>
          <p className="text-muted-foreground text-sm">
            Define expected savings, revenue, and productivity gains.
            {values && values.length > 0 && (
              <span className="ml-2 font-semibold text-foreground">{values.length} drivers, total: {formatCurrency(totalValue)}/yr</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Value
        </button>
      </div>

      {isAdding && (
        <ValueForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleCreate}
          onCancel={() => { setIsAdding(false); setFormData({ ...emptyForm }); }}
          isPending={createMutation.isPending}
          submitLabel="Save Driver"
        />
      )}

      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Annual Value</th>
              <th className="px-4 py-3 font-semibold">Confidence</th>
              <th className="px-4 py-3 font-semibold">Realization</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {values?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No value drivers defined yet. Click "Add Value" to get started.
                </td>
              </tr>
            ) : (
              values?.map((val) =>
                editingId === val.id ? (
                  <tr key={val.id} className="bg-primary/5">
                    <td colSpan={6} className="p-4">
                      <ValueForm
                        data={editData}
                        onChange={setEditData}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingId(null)}
                        isPending={updateMutation.isPending}
                        submitLabel="Update"
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={val.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{val.name}</p>
                      {val.description && <p className="text-xs text-muted-foreground mt-0.5">{val.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                        val.type === "revenue" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                        val.type === "cost_reduction" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                        val.type === "productivity" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" :
                        val.type === "risk" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {val.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      +{formatCurrency(val.annualValue)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                        CONFIDENCE_LEVELS.find((c) => c.value === val.confidenceLevel)?.color || ""
                      }`}>
                        {val.confidenceLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {val.monthsToRealize === 0 ? "Immediate" : `${val.monthsToRealize} mo`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(val)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate({ id: caseId, valueId: val.id })}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {incomingCascades.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Cascaded Value Inputs</h3>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Financial outputs from upstream cases are automatically included in this case&rsquo;s model calculations.
          </p>
          <div className="space-y-2">
            {incomingCascades.map((dep) => (
              <div key={dep.id} className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{caseNameMap.get(dep.fromCaseId) || `Case #${dep.fromCaseId}`}</span>
                  <span className="text-[10px] text-muted-foreground">&rarr;</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {CASCADE_LABELS[dep.cascadeField!] || dep.cascadeField}
                  </span>
                </div>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium capitalize">
                  {dep.dependencyType}
                  {dep.dependencyType === "conditional" && dep.conditionThreshold != null && ` ≥ ${dep.conditionThreshold}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
