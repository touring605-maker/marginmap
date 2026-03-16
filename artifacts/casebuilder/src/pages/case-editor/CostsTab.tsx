import { useState } from "react";
import { useCosts, useCreateCost, useUpdateCost, useDeleteCost } from "@/hooks/use-costs";
import { Plus, Trash2, Loader2, Pencil, X, Check } from "lucide-react";

const COST_TYPES = [
  { value: "one_time", label: "One-time" },
  { value: "capex", label: "CapEx" },
  { value: "opex", label: "OpEx" },
  { value: "escalating", label: "Escalating %" },
  { value: "transition", label: "Transition" },
] as const;

const FREQUENCIES = [
  { value: "once", label: "Once" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
] as const;

type CostType = "one_time" | "capex" | "opex" | "escalating" | "transition";
type Frequency = "once" | "monthly" | "annually";

interface CostFormData {
  name: string;
  type: CostType;
  amount: string;
  frequency: Frequency;
  depreciationYears: string;
  escalationRate: string;
  description: string;
}

const emptyForm: CostFormData = {
  name: "",
  type: "one_time",
  amount: "",
  frequency: "once",
  depreciationYears: "",
  escalationRate: "",
  description: "",
};

function CostForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  data: CostFormData;
  onChange: (d: CostFormData) => void;
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
          <label className="block text-xs font-semibold mb-1">Item Name</label>
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
            onChange={(e) => {
              const type = e.target.value as CostType;
              const freq = type === "one_time" || type === "transition" ? "once" as Frequency : data.frequency;
              onChange({ ...data, type, frequency: freq });
            }}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            {COST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Amount</label>
          <input
            required type="number" min="0" step="0.01" value={data.amount}
            onChange={(e) => onChange({ ...data, amount: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Frequency</label>
          <select
            value={data.frequency}
            onChange={(e) => onChange({ ...data, frequency: e.target.value as Frequency })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {data.type === "capex" && (
          <div>
            <label className="block text-xs font-semibold mb-1">Depreciation (Years)</label>
            <input
              type="number" min="1" value={data.depreciationYears}
              onChange={(e) => onChange({ ...data, depreciationYears: e.target.value })}
              placeholder="e.g., 5"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        )}

        {data.type === "escalating" && (
          <div>
            <label className="block text-xs font-semibold mb-1">Escalation Rate (%/yr)</label>
            <input
              type="number" min="0" step="0.1" value={data.escalationRate}
              onChange={(e) => onChange({ ...data, escalationRate: e.target.value })}
              placeholder="e.g., 3"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        )}
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

export function CostsTab({ caseId, scenarioId }: { caseId: number; scenarioId?: number }) {
  const { data: costs, isLoading } = useCosts(caseId, scenarioId);
  const createMutation = useCreateCost();
  const updateMutation = useUpdateCost();
  const deleteMutation = useDeleteCost();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CostFormData>({ ...emptyForm });
  const [editData, setEditData] = useState<CostFormData>({ ...emptyForm });

  const handleCreate = () => {
    createMutation.mutate(
      {
        id: caseId,
        data: {
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          ...(formData.type === "capex" && formData.depreciationYears ? { depreciationYears: parseInt(formData.depreciationYears, 10) } : {}),
          ...(formData.type === "escalating" && formData.escalationRate ? { escalationRate: parseFloat(formData.escalationRate) } : {}),
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

  const startEdit = (cost: { id: number; name: string; type: string; amount: number; frequency: string; depreciationYears?: number | null; escalationRate?: number | null; description?: string | null }) => {
    setEditingId(cost.id);
    setEditData({
      name: cost.name,
      type: cost.type as CostType,
      amount: String(cost.amount),
      frequency: cost.frequency as Frequency,
      depreciationYears: cost.depreciationYears ? String(cost.depreciationYears) : "",
      escalationRate: cost.escalationRate ? String(cost.escalationRate) : "",
      description: cost.description || "",
    });
  };

  const handleUpdate = () => {
    if (editingId === null) return;
    updateMutation.mutate(
      {
        id: caseId,
        costId: editingId,
        data: {
          name: editData.name,
          type: editData.type,
          amount: parseFloat(editData.amount),
          frequency: editData.frequency,
          ...(editData.type === "capex" && editData.depreciationYears ? { depreciationYears: parseInt(editData.depreciationYears, 10) } : { depreciationYears: undefined }),
          ...(editData.type === "escalating" && editData.escalationRate ? { escalationRate: parseFloat(editData.escalationRate) } : { escalationRate: undefined }),
          ...(editData.description ? { description: editData.description } : {}),
        },
      },
      { onSuccess: () => setEditingId(null) }
    );
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const totalCosts = costs?.reduce((sum, c) => sum + c.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold">Cost Model</h2>
          <p className="text-muted-foreground text-sm">
            Define all investments and operational expenses.
            {costs && costs.length > 0 && (
              <span className="ml-2 font-semibold text-foreground">{costs.length} items, total: {formatCurrency(totalCosts)}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Cost
        </button>
      </div>

      {isAdding && (
        <CostForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleCreate}
          onCancel={() => { setIsAdding(false); setFormData({ ...emptyForm }); }}
          isPending={createMutation.isPending}
          submitLabel="Save Item"
        />
      )}

      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Frequency</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {costs?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No cost items defined yet. Click "Add Cost" to get started.
                </td>
              </tr>
            ) : (
              costs?.map((cost) =>
                editingId === cost.id ? (
                  <tr key={cost.id} className="bg-primary/5">
                    <td colSpan={6} className="p-4">
                      <CostForm
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
                  <tr key={cost.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{cost.name}</p>
                      {cost.description && <p className="text-xs text-muted-foreground mt-0.5">{cost.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                        cost.type === "capex" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                        cost.type === "opex" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" :
                        cost.type === "escalating" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                        cost.type === "transition" ? "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {cost.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(cost.amount)}</td>
                    <td className="px-4 py-3 capitalize">{cost.frequency}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {cost.type === "capex" && cost.depreciationYears && `${cost.depreciationYears}yr depr.`}
                      {cost.type === "escalating" && cost.escalationRate && `${cost.escalationRate}%/yr esc.`}
                      {cost.type === "one_time" && "-"}
                      {cost.type === "opex" && "-"}
                      {cost.type === "transition" && "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(cost)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate({ id: caseId, costId: cost.id })}
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
    </div>
  );
}
