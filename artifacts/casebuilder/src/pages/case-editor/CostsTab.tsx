import { useState } from "react";
import { useCosts, useCreateCost, useUpdateCost, useDeleteCost } from "@/hooks/use-costs";
import { Plus, Trash2, Loader2, Pencil, ChevronDown, ChevronRight, TrendingDown, TrendingUp, Minus } from "lucide-react";

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
type CostPhase = "current_state" | "future_state" | "project_cost";

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
  type: "opex",
  amount: "",
  frequency: "annually",
  depreciationYears: "",
  escalationRate: "",
  description: "",
};

const PHASE_CONFIG: Record<CostPhase, { label: string; subtitle: string; color: string; bgColor: string; borderColor: string }> = {
  current_state: {
    label: "Current State",
    subtitle: "What you spend today before the proposed change",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    borderColor: "border-blue-200 dark:border-blue-500/20",
  },
  future_state: {
    label: "Future State",
    subtitle: "Projected costs after the proposed change",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-500/20",
  },
  project_cost: {
    label: "Project Costs",
    subtitle: "One-time implementation and transition expenses",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    borderColor: "border-amber-200 dark:border-amber-500/20",
  },
};

function annualizeAmount(amount: number, frequency: string): number {
  if (frequency === "monthly") return amount * 12;
  if (frequency === "annually") return amount;
  return 0;
}

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
      className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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

      <div className="flex justify-end gap-2 pt-1">
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

interface CostItem {
  id: number;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  depreciationYears?: number | null;
  escalationRate?: number | null;
  description?: string | null;
  costPhase?: string | null;
}

function PhaseSection({
  phase,
  costs,
  caseId,
  scenarioId,
  createMutation,
  updateMutation,
  deleteMutation,
  formatCurrency,
}: {
  phase: CostPhase;
  costs: CostItem[];
  caseId: number;
  scenarioId?: number;
  createMutation: ReturnType<typeof useCreateCost>;
  updateMutation: ReturnType<typeof useUpdateCost>;
  deleteMutation: ReturnType<typeof useDeleteCost>;
  formatCurrency: (val: number) => string;
}) {
  const config = PHASE_CONFIG[phase];
  const [isOpen, setIsOpen] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CostFormData>({ ...emptyForm });
  const [editData, setEditData] = useState<CostFormData>({ ...emptyForm });

  const sectionTotal = costs.reduce((sum, c) => sum + c.amount, 0);
  const annualTotal = costs.reduce((sum, c) => sum + annualizeAmount(c.amount, c.frequency), 0);

  const handleCreate = () => {
    createMutation.mutate(
      {
        id: caseId,
        data: {
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          costPhase: phase,
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

  const startEdit = (cost: CostItem) => {
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
          costPhase: phase,
          ...(editData.type === "capex" && editData.depreciationYears ? { depreciationYears: parseInt(editData.depreciationYears, 10) } : { depreciationYears: undefined }),
          ...(editData.type === "escalating" && editData.escalationRate ? { escalationRate: parseFloat(editData.escalationRate) } : { escalationRate: undefined }),
          ...(editData.description ? { description: editData.description } : {}),
        },
      },
      { onSuccess: () => setEditingId(null) }
    );
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${config.borderColor}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 ${config.bgColor} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className={`w-4 h-4 ${config.color}`} /> : <ChevronRight className={`w-4 h-4 ${config.color}`} />}
          <h3 className={`text-sm font-bold ${config.color}`}>{config.label}</h3>
          <span className="text-xs text-muted-foreground">({costs.length} items)</span>
        </div>
        <div className="flex items-center gap-3">
          {annualTotal > 0 && (
            <span className={`text-xs font-semibold ${config.color}`}>
              {formatCurrency(annualTotal)}/yr
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="bg-white dark:bg-slate-900">
          <div className="px-4 py-2 border-b border-border flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {isAdding && (
            <div className="p-4 border-b border-border">
              <CostForm
                data={formData}
                onChange={setFormData}
                onSubmit={handleCreate}
                onCancel={() => { setIsAdding(false); setFormData({ ...emptyForm }); }}
                isPending={createMutation.isPending}
                submitLabel="Save Item"
              />
            </div>
          )}

          {costs.length === 0 && !isAdding ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No items yet. Click "Add" to get started.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-border">
                <tr>
                  <th className="px-4 py-2 font-semibold text-xs">Name</th>
                  <th className="px-4 py-2 font-semibold text-xs">Type</th>
                  <th className="px-4 py-2 font-semibold text-xs">Amount</th>
                  <th className="px-4 py-2 font-semibold text-xs">Frequency</th>
                  <th className="px-4 py-2 font-semibold text-xs">Details</th>
                  <th className="px-4 py-2 font-semibold text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {costs.map((cost) =>
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
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-foreground text-sm">{cost.name}</p>
                        {cost.description && <p className="text-xs text-muted-foreground mt-0.5">{cost.description}</p>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider ${
                          cost.type === "capex" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                          cost.type === "opex" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" :
                          cost.type === "escalating" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                          cost.type === "transition" ? "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}>
                          {cost.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-sm">{formatCurrency(cost.amount)}</td>
                      <td className="px-4 py-2.5 capitalize text-sm">{cost.frequency}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {cost.type === "capex" && cost.depreciationYears && `${cost.depreciationYears}yr depr.`}
                        {cost.type === "escalating" && cost.escalationRate && `${cost.escalationRate}%/yr esc.`}
                        {!["capex", "escalating"].includes(cost.type) && "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(cost)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate({ id: caseId, costId: cost.id })}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function CostsTab({ caseId, scenarioId }: { caseId: number; scenarioId?: number }) {
  const { data: costs, isLoading } = useCosts(caseId, scenarioId);
  const createMutation = useCreateCost();
  const updateMutation = useUpdateCost();
  const deleteMutation = useDeleteCost();

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const currentCosts = (costs || []).filter(c => c.costPhase === "current_state");
  const futureCosts = (costs || []).filter(c => c.costPhase === "future_state");
  const projectCosts = (costs || []).filter(c => !c.costPhase || c.costPhase === "project_cost");

  const annualCurrent = currentCosts.reduce((sum, c) => sum + annualizeAmount(c.amount, c.frequency), 0);
  const annualFuture = futureCosts.reduce((sum, c) => sum + annualizeAmount(c.amount, c.frequency), 0);
  const delta = annualCurrent - annualFuture;
  const hasBothPhases = currentCosts.length > 0 && futureCosts.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold">Cost Model</h2>
        <p className="text-muted-foreground text-sm">
          Define current state, future state, and project implementation costs.
          {costs && costs.length > 0 && (
            <span className="ml-2 font-semibold text-foreground">{costs.length} total items</span>
          )}
        </p>
      </div>

      {hasBothPhases && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          delta > 0
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
            : delta < 0
            ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
            : "bg-slate-50 dark:bg-slate-800/50 border-border"
        }`}>
          {delta > 0 ? (
            <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : delta < 0 ? (
            <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          ) : (
            <Minus className="w-5 h-5 text-slate-500 shrink-0" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${
              delta > 0 ? "text-emerald-700 dark:text-emerald-300" :
              delta < 0 ? "text-rose-700 dark:text-rose-300" : "text-foreground"
            }`}>
              {delta > 0
                ? `Annual Cost Savings: ${formatCurrency(delta)}/yr`
                : delta < 0
                ? `Annual Cost Increase: ${formatCurrency(Math.abs(delta))}/yr`
                : "No net cost change"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Current: {formatCurrency(annualCurrent)}/yr &rarr; Future: {formatCurrency(annualFuture)}/yr
              {delta !== 0 && ` (${delta > 0 ? "-" : "+"}${Math.abs(Math.round((delta / annualCurrent) * 100))}%)`}
            </p>
          </div>
        </div>
      )}

      <PhaseSection
        phase="current_state"
        costs={currentCosts}
        caseId={caseId}
        scenarioId={scenarioId}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        formatCurrency={formatCurrency}
      />

      <PhaseSection
        phase="future_state"
        costs={futureCosts}
        caseId={caseId}
        scenarioId={scenarioId}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        formatCurrency={formatCurrency}
      />

      <PhaseSection
        phase="project_cost"
        costs={projectCosts}
        caseId={caseId}
        scenarioId={scenarioId}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
