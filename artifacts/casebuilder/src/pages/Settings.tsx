import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListIndustryTemplates,
  useListBusinessCases,
  useApplyIndustryTemplate,
  getListCostLineItemsQueryKey,
  getListValueDriversQueryKey,
  getGetFinancialModelQueryKey,
} from "@workspace/api-client-react";
import { Loader2, Plus, Trash2, Pencil, FileText, Building2, X, Check, ArrowRight, Zap, Copy, Eye, ChevronRight, GripVertical, Network, Store } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

interface TemplateCostItem {
  name: string;
  type: string;
  costPhase?: string;
  amount: number;
  frequency?: string;
}

interface TemplateValueDriver {
  name: string;
  type: string;
  annualValue: number;
  confidenceLevel?: string;
  description?: string;
  monthsToRealize?: number;
}

interface ExtraCostItem {
  name: string;
  amount: string;
  type: string;
  costPhase: string;
}

const EMPTY_EXTRA: ExtraCostItem = { name: "", amount: "", type: "opex", costPhase: "project_cost" };

function useUserTemplates() {
  return useQuery({
    queryKey: ["user-templates"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user-templates`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user templates");
      return res.json();
    },
  });
}

function useCreateUserTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; industry?: string; description?: string; costItems?: unknown[]; valueDrivers?: unknown[] }) => {
      const res = await fetch(`${API_BASE}/user-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-templates"] }),
  });
}

function useDeleteUserTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: number) => {
      const res = await fetch(`${API_BASE}/user-templates/${templateId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete template");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-templates"] }),
  });
}

function useUpdateUserTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; description?: string; costItems?: TemplateCostItem[]; valueDrivers?: TemplateValueDriver[] } }) => {
      const res = await fetch(`${API_BASE}/user-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-templates"] }),
  });
}

function useApplyUserTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, templateId }: { caseId: number; templateId: number }) => {
      const res = await fetch(`${API_BASE}/cases/${caseId}/apply-user-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) throw new Error("Failed to apply template");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: getListValueDriversQueryKey(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(variables.caseId) });
    },
  });
}

function TemplateDetailSlideOver({
  name,
  description,
  industry,
  costItems,
  valueDrivers,
  onClose,
  actions,
}: {
  name: string;
  description?: string | null;
  industry?: string | null;
  costItems: TemplateCostItem[];
  valueDrivers: TemplateValueDriver[];
  onClose: () => void;
  actions: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-foreground">{name}</h2>
            {industry && <p className="text-xs text-muted-foreground">{industry}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Cost Items ({costItems.length})
            </p>
            {costItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cost items in this template.</p>
            ) : (
              <div className="space-y-1.5">
                {costItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <span className="text-foreground font-medium">{item.name}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground capitalize">
                        {item.costPhase?.replace("_", " ") || "project"} &middot; {item.type}
                      </span>
                    </div>
                    <span className="font-mono text-sm">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {valueDrivers.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Value Drivers ({valueDrivers.length})
              </p>
              <div className="space-y-1.5">
                {valueDrivers.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <span className="text-foreground font-medium">{v.name}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground capitalize">{v.type?.replace("_", " ")}</span>
                    </div>
                    <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                      ${v.annualValue.toLocaleString()}/yr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border flex items-center gap-2">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserTemplateContentEditor({
  templateId,
  initialCostItems,
  initialValueDrivers,
  onClose,
  onSaved,
}: {
  templateId: number;
  initialCostItems: TemplateCostItem[];
  initialValueDrivers: TemplateValueDriver[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const updateMutation = useUpdateUserTemplate();
  const [costItems, setCostItems] = useState<TemplateCostItem[]>(initialCostItems);
  const [valueDrivers, setValueDrivers] = useState<TemplateValueDriver[]>(initialValueDrivers);
  const [newCost, setNewCost] = useState({ name: "", type: "opex", costPhase: "project_cost", amount: "", frequency: "annually" });
  const [newDriver, setNewDriver] = useState({ name: "", type: "revenue", annualValue: "" });
  const [showAddCost, setShowAddCost] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);

  const addCostItem = () => {
    if (!newCost.name.trim() || !newCost.amount) return;
    setCostItems([...costItems, { name: newCost.name, type: newCost.type, costPhase: newCost.costPhase, amount: Number(newCost.amount), frequency: newCost.frequency }]);
    setNewCost({ name: "", type: "opex", costPhase: "project_cost", amount: "", frequency: "annually" });
    setShowAddCost(false);
  };

  const removeCostItem = (index: number) => {
    setCostItems(costItems.filter((_, i) => i !== index));
  };

  const addValueDriver = () => {
    if (!newDriver.name.trim() || !newDriver.annualValue) return;
    setValueDrivers([...valueDrivers, { name: newDriver.name, type: newDriver.type, annualValue: Number(newDriver.annualValue) }]);
    setNewDriver({ name: "", type: "revenue", annualValue: "" });
    setShowAddDriver(false);
  };

  const removeValueDriver = (index: number) => {
    setValueDrivers(valueDrivers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateMutation.mutate(
      { id: templateId, data: { costItems, valueDrivers } },
      { onSuccess: onSaved }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-foreground">Edit Template Content</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Cost Items ({costItems.length})
              </p>
              <button onClick={() => setShowAddCost(true)} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                <Plus className="w-3 h-3" /> Add Cost
              </button>
            </div>

            {showAddCost && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-border space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCost.name}
                    onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                    placeholder="Cost item name"
                    className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none"
                  />
                  <input
                    type="number"
                    value={newCost.amount}
                    onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
                    placeholder="Amount ($)"
                    className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select value={newCost.type} onChange={(e) => setNewCost({ ...newCost, type: e.target.value })} className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none">
                    <option value="opex">OpEx</option>
                    <option value="capex">CapEx</option>
                    <option value="one_time">One-Time</option>
                    <option value="escalating">Escalating</option>
                    <option value="transition">Transition</option>
                  </select>
                  <select value={newCost.costPhase} onChange={(e) => setNewCost({ ...newCost, costPhase: e.target.value })} className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none">
                    <option value="project_cost">Project Cost</option>
                    <option value="current_state">Current State</option>
                    <option value="future_state">Future State</option>
                  </select>
                  <select value={newCost.frequency} onChange={(e) => setNewCost({ ...newCost, frequency: e.target.value })} className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none">
                    <option value="annually">Annually</option>
                    <option value="monthly">Monthly</option>
                    <option value="once">Once</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddCost(false)} className="px-2 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 rounded">Cancel</button>
                  <button onClick={addCostItem} disabled={!newCost.name.trim() || !newCost.amount} className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">Add</button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {costItems.length === 0 && !showAddCost && (
                <p className="text-xs text-muted-foreground text-center py-4">No cost items. Click "Add Cost" to define template costs.</p>
              )}
              {costItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg group">
                  <div>
                    <span className="text-foreground font-medium">{item.name}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground capitalize">
                      {item.costPhase?.replace("_", " ") || "project"} &middot; {item.type} &middot; {item.frequency || "annually"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">${item.amount.toLocaleString()}</span>
                    <button onClick={() => removeCostItem(i)} className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Value Drivers ({valueDrivers.length})
              </p>
              <button onClick={() => setShowAddDriver(true)} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                <Plus className="w-3 h-3" /> Add Driver
              </button>
            </div>

            {showAddDriver && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-border space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    placeholder="Driver name"
                    className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none"
                  />
                  <input
                    type="number"
                    value={newDriver.annualValue}
                    onChange={(e) => setNewDriver({ ...newDriver, annualValue: e.target.value })}
                    placeholder="Annual Value ($)"
                    className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <select value={newDriver.type} onChange={(e) => setNewDriver({ ...newDriver, type: e.target.value })} className="px-2 py-1.5 rounded border border-border bg-white dark:bg-slate-900 text-xs outline-none">
                    <option value="revenue">Revenue</option>
                    <option value="cost_reduction">Cost Reduction</option>
                    <option value="margin">Margin</option>
                    <option value="productivity">Productivity</option>
                    <option value="risk">Risk</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddDriver(false)} className="px-2 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 rounded">Cancel</button>
                  <button onClick={addValueDriver} disabled={!newDriver.name.trim() || !newDriver.annualValue} className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">Add</button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {valueDrivers.length === 0 && !showAddDriver && (
                <p className="text-xs text-muted-foreground text-center py-4">No value drivers. Click "Add Driver" to define template drivers.</p>
              )}
              {valueDrivers.map((v, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg group">
                  <div>
                    <span className="text-foreground font-medium">{v.name}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground capitalize">{v.type?.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">${v.annualValue.toLocaleString()}/yr</span>
                    <button onClick={() => removeValueDriver(i)} className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplyToCaseDialog({
  onApply,
  onClose,
  isPending,
  templateName,
  templateCostItems,
  templateValueDrivers,
}: {
  onApply: (caseId: number, extraCost: ExtraCostItem | null) => void;
  onClose: () => void;
  isPending: boolean;
  templateName: string;
  templateCostItems: TemplateCostItem[];
  templateValueDrivers: TemplateValueDriver[];
}) {
  const { data: cases, isLoading } = useListBusinessCases();
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [addExtraCost, setAddExtraCost] = useState(false);
  const [extraCost, setExtraCost] = useState<ExtraCostItem>({ ...EMPTY_EXTRA });

  const handleContinue = () => {
    if (!selectedCaseId) return;
    setStep("confirm");
  };

  const handleApply = () => {
    if (!selectedCaseId) return;
    const extra = addExtraCost && extraCost.name.trim() && Number(extraCost.amount) > 0 ? extraCost : null;
    onApply(selectedCaseId, extra);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {step === "select" ? "Select Business Case" : "Review & Apply"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "select" && (
          <>
            <p className="text-sm text-muted-foreground">
              Choose a business case to apply <span className="font-semibold text-foreground">{templateName}</span> to.
            </p>
            {isLoading ? (
              <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
            ) : !cases || cases.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No business cases found. Create one first.</p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${
                      selectedCaseId === c.id
                        ? "bg-primary/10 border border-primary/30 text-foreground font-medium"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-foreground border border-transparent"
                    }`}
                  >
                    <p className="font-medium">{c.name}</p>
                    {c.industry && <p className="text-xs text-muted-foreground">{c.industry}</p>}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedCaseId}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>This will add the following items to your case:</p>
              <ul className="list-disc list-inside text-xs space-y-0.5 mt-2">
                <li>{templateCostItems.length} cost item{templateCostItems.length !== 1 ? "s" : ""}</li>
                <li>{templateValueDrivers.length} value driver{templateValueDrivers.length !== 1 ? "s" : ""}</li>
              </ul>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => { setAddExtraCost(!addExtraCost); setExtraCost({ ...EMPTY_EXTRA }); }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Add an extra cost item
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${addExtraCost ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"}`}>
                  {addExtraCost ? "On" : "Optional"}
                </span>
              </button>
              {addExtraCost && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Name</label>
                      <input
                        type="text"
                        value={extraCost.name}
                        onChange={(e) => setExtraCost({ ...extraCost, name: e.target.value })}
                        placeholder="e.g., Implementation Fee"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Amount ($)</label>
                      <input
                        type="number"
                        value={extraCost.amount}
                        onChange={(e) => setExtraCost({ ...extraCost, amount: e.target.value })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Type</label>
                      <select
                        value={extraCost.type}
                        onChange={(e) => setExtraCost({ ...extraCost, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                      >
                        <option value="opex">OpEx</option>
                        <option value="capex">CapEx</option>
                        <option value="one_time">One-Time</option>
                        <option value="escalating">Escalating</option>
                        <option value="transition">Transition</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Phase</label>
                      <select
                        value={extraCost.costPhase}
                        onChange={(e) => setExtraCost({ ...extraCost, costPhase: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                      >
                        <option value="project_cost">Project Cost</option>
                        <option value="current_state">Current State</option>
                        <option value="future_state">Future State</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button onClick={() => setStep("select")} className="px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Back
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={isPending}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Apply Template
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IndustryTemplatesSection() {
  const { data: templates, isLoading } = useListIndustryTemplates();
  const [viewingTemplate, setViewingTemplate] = useState<string | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<{ id: string; name: string; costItems: TemplateCostItem[]; valueDrivers: TemplateValueDriver[] } | null>(null);
  const applyMutation = useApplyIndustryTemplate();
  const createUserTemplate = useCreateUserTemplate();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleApply = (caseId: number, extraCost: ExtraCostItem | null) => {
    if (!applyingTemplate) return;
    applyMutation.mutate(
      { id: caseId, data: { templateId: applyingTemplate.id } },
      {
        onSuccess: async () => {
          if (extraCost) {
            await fetch(`${API_BASE}/cases/${caseId}/costs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                name: extraCost.name,
                type: extraCost.type,
                amount: Number(extraCost.amount),
                frequency: extraCost.type === "one_time" || extraCost.type === "transition" ? "once" : "annually",
                costPhase: extraCost.costPhase,
              }),
            });
          }
          setApplyingTemplate(null);
          setSuccessMsg("Template applied successfully!");
          queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(caseId) });
          queryClient.invalidateQueries({ queryKey: getListValueDriversQueryKey(caseId) });
          queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(caseId) });
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      }
    );
  };

  const handleDuplicate = (t: { name: string; industry: string; description?: string; costItems: TemplateCostItem[]; valueDrivers?: TemplateValueDriver[] }) => {
    createUserTemplate.mutate(
      {
        name: `${t.name} (Copy)`,
        industry: t.industry,
        description: t.description,
        costItems: t.costItems,
        valueDrivers: t.valueDrivers || [],
      },
      {
        onSuccess: () => {
          setSuccessMsg("Industry template duplicated to My Templates!");
          setViewingTemplate(null);
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      }
    );
  };

  if (isLoading) return <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;

  const viewedTemplate = templates?.find((t) => t.id === viewingTemplate);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Industry Templates</h3>
        <span className="text-xs text-muted-foreground">({templates?.length || 0})</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Pre-built templates for common industries. View details, apply to a case, or duplicate as your own template.
      </p>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMsg}</p>
        </div>
      )}

      <div className="space-y-2">
        {templates?.map((t) => (
          <div key={t.id} className="border border-border rounded-xl bg-white dark:bg-slate-900 flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                <span>{t.costItems.length} costs</span>
                {t.valueDrivers && <span>{t.valueDrivers.length} drivers</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewingTemplate(t.id)}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="View details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDuplicate(t)}
                disabled={createUserTemplate.isPending}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Duplicate to My Templates"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setApplyingTemplate({
                  id: t.id,
                  name: t.name,
                  costItems: t.costItems as TemplateCostItem[],
                  valueDrivers: (t.valueDrivers || []) as TemplateValueDriver[],
                })}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Apply to case"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewedTemplate && (
        <TemplateDetailSlideOver
          name={viewedTemplate.name}
          description={viewedTemplate.description}
          industry={viewedTemplate.industry}
          costItems={viewedTemplate.costItems as TemplateCostItem[]}
          valueDrivers={(viewedTemplate.valueDrivers || []) as TemplateValueDriver[]}
          onClose={() => setViewingTemplate(null)}
          actions={
            <>
              <button
                onClick={() => handleDuplicate(viewedTemplate as { name: string; industry: string; description?: string; costItems: TemplateCostItem[]; valueDrivers?: TemplateValueDriver[] })}
                disabled={createUserTemplate.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {createUserTemplate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Duplicate to My Templates
              </button>
              <button
                onClick={() => {
                  setViewingTemplate(null);
                  setApplyingTemplate({
                    id: viewedTemplate.id,
                    name: viewedTemplate.name,
                    costItems: viewedTemplate.costItems as TemplateCostItem[],
                    valueDrivers: (viewedTemplate.valueDrivers || []) as TemplateValueDriver[],
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> Apply to Case
              </button>
            </>
          }
        />
      )}

      {applyingTemplate && (
        <ApplyToCaseDialog
          onApply={handleApply}
          onClose={() => setApplyingTemplate(null)}
          isPending={applyMutation.isPending}
          templateName={applyingTemplate.name}
          templateCostItems={applyingTemplate.costItems}
          templateValueDrivers={applyingTemplate.valueDrivers}
        />
      )}
    </div>
  );
}

function UserTemplatesSection() {
  const { data: templates, isLoading } = useUserTemplates();
  const createMutation = useCreateUserTemplate();
  const deleteMutation = useDeleteUserTemplate();
  const updateMutation = useUpdateUserTemplate();
  const applyMutation = useApplyUserTemplate();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [viewingTemplate, setViewingTemplate] = useState<number | null>(null);
  const [editContentId, setEditContentId] = useState<number | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<{ id: number; name: string; costItems: TemplateCostItem[]; valueDrivers: TemplateValueDriver[] } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreate = () => {
    if (!formName.trim()) return;
    createMutation.mutate(
      { name: formName, description: formDescription || undefined, costItems: [], valueDrivers: [] },
      {
        onSuccess: () => {
          setIsCreating(false);
          setFormName("");
          setFormDescription("");
        },
      }
    );
  };

  const startEdit = (t: { id: number; name: string; description?: string | null }) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditDescription(t.description || "");
  };

  const handleUpdate = () => {
    if (editingId === null || !editName.trim()) return;
    updateMutation.mutate(
      { id: editingId, data: { name: editName, description: editDescription || undefined } },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const handleApply = (caseId: number, extraCost: ExtraCostItem | null) => {
    if (!applyingTemplate) return;
    applyMutation.mutate(
      { caseId, templateId: applyingTemplate.id },
      {
        onSuccess: async () => {
          if (extraCost) {
            await fetch(`${API_BASE}/cases/${caseId}/costs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                name: extraCost.name,
                type: extraCost.type,
                amount: Number(extraCost.amount),
                frequency: extraCost.type === "one_time" || extraCost.type === "transition" ? "once" : "annually",
                costPhase: extraCost.costPhase,
              }),
            });
          }
          setApplyingTemplate(null);
          setSuccessMsg("Template applied successfully!");
          queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(caseId) });
          queryClient.invalidateQueries({ queryKey: getListValueDriversQueryKey(caseId) });
          queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(caseId) });
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      }
    );
  };

  if (isLoading) return <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;

  const templatesList = (templates || []) as Array<{
    id: number;
    name: string;
    description?: string | null;
    industry?: string | null;
    costItems: TemplateCostItem[];
    valueDrivers: TemplateValueDriver[];
    createdAt?: string;
  }>;

  const viewedTemplate = templatesList.find((t) => t.id === viewingTemplate);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">My Templates</h3>
          <span className="text-xs text-muted-foreground">({templatesList.length})</span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-3 h-3" /> New Template
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Create custom templates to reuse across business cases, or duplicate industry templates here to customize them.
      </p>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMsg}</p>
        </div>
      )}

      {isCreating && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-border space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Template Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., SaaS Migration Template"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description (Optional)</label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setIsCreating(false); setFormName(""); setFormDescription(""); }} className="px-3 py-1.5 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !formName.trim()}
              className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-1"
            >
              {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {templatesList.length === 0 && !isCreating ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            No custom templates yet. Click "New Template" to create one, or duplicate an industry template below.
          </div>
        ) : (
          templatesList.map((t) => (
            <div key={t.id} className="border border-border rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
              {editingId === t.id ? (
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={handleUpdate} disabled={updateMutation.isPending} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg">
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{(t.costItems || []).length} cost items</span>
                      <span>{(t.valueDrivers || []).length} value drivers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingTemplate(t.id)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditContentId(t.id)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit cost items &amp; value drivers"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setApplyingTemplate({
                        id: t.id,
                        name: t.name,
                        costItems: t.costItems || [],
                        valueDrivers: t.valueDrivers || [],
                      })}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Apply to case"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit name &amp; description"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(t.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {viewedTemplate && (
        <TemplateDetailSlideOver
          name={viewedTemplate.name}
          description={viewedTemplate.description}
          industry={viewedTemplate.industry}
          costItems={viewedTemplate.costItems || []}
          valueDrivers={viewedTemplate.valueDrivers || []}
          onClose={() => setViewingTemplate(null)}
          actions={
            <>
              <button
                onClick={() => {
                  setViewingTemplate(null);
                  setApplyingTemplate({
                    id: viewedTemplate.id,
                    name: viewedTemplate.name,
                    costItems: viewedTemplate.costItems || [],
                    valueDrivers: viewedTemplate.valueDrivers || [],
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> Apply to Case
              </button>
            </>
          }
        />
      )}

      {applyingTemplate && (
        <ApplyToCaseDialog
          onApply={handleApply}
          onClose={() => setApplyingTemplate(null)}
          isPending={applyMutation.isPending}
          templateName={applyingTemplate.name}
          templateCostItems={applyingTemplate.costItems}
          templateValueDrivers={applyingTemplate.valueDrivers}
        />
      )}

      {editContentId !== null && (() => {
        const t = templatesList.find((tpl) => tpl.id === editContentId);
        if (!t) return null;
        return (
          <UserTemplateContentEditor
            templateId={t.id}
            initialCostItems={t.costItems || []}
            initialValueDrivers={t.valueDrivers || []}
            onClose={() => setEditContentId(null)}
            onSaved={() => {
              setEditContentId(null);
              setSuccessMsg("Template content saved!");
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
          />
        );
      })()}
    </div>
  );
}

interface Company {
  id: number;
  orgId: number;
  name: string;
  parentCompanyId?: number | null;
  industry?: string | null;
  logoUrl?: string | null;
  hq?: string | null;
  description?: string | null;
  fiscalYearEnd?: string | null;
}

interface Channel {
  id: number;
  orgId: number;
  name: string;
  sortOrder: number;
  companyIds: number[];
}

function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/companies`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });
}

function useChannels() {
  return useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/channels`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch channels");
      return res.json();
    },
  });
}

function CompanyForm({
  initial,
  companies,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Partial<Company>;
  companies: Company[];
  onSave: (data: Omit<Company, "id" | "orgId">) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    parentCompanyId: initial?.parentCompanyId ?? null as number | null,
    industry: initial?.industry || "",
    logoUrl: initial?.logoUrl || "",
    hq: initial?.hq || "",
    description: initial?.description || "",
    fiscalYearEnd: initial?.fiscalYearEnd || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const parentCandidates = companies.filter((c) => !initial?.id || c.id !== initial.id);

  const handleLogoFileChange = async (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch(`${API_BASE}/companies/logo-upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const { logoUrl } = await res.json();
      setForm((prev) => ({ ...prev, logoUrl }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Company Name *</label>
          <input
            autoFocus
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Acme Corp"
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Parent Company</label>
          <select
            value={form.parentCompanyId ?? ""}
            onChange={(e) => setForm({ ...form, parentCompanyId: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          >
            <option value="">None (Top-Level)</option>
            {parentCandidates.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Industry</label>
          <input
            type="text"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="e.g., Retail"
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Headquarters</label>
          <input
            type="text"
            value={form.hq}
            onChange={(e) => setForm({ ...form, hq: e.target.value })}
            placeholder="e.g., New York, NY"
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Company Logo</label>
          <div className="flex items-center gap-3">
            {form.logoUrl ? (
              <div className="relative shrink-0">
                <img src={form.logoUrl} alt="Logo preview" className="w-10 h-10 rounded object-contain border border-border bg-white" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center"
                  title="Remove logo"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div className="w-10 h-10 rounded border border-dashed border-border bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-slate-900 text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {isUploading ? "Uploading..." : form.logoUrl ? "Change" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} disabled={isUploading} />
            </label>
          </div>
          {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Fiscal Year End</label>
          <input
            type="text"
            value={form.fiscalYearEnd}
            onChange={(e) => setForm({ ...form, fiscalYearEnd: e.target.value })}
            placeholder="e.g., December 31"
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1">Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of the company..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
          Cancel
        </button>
        <button
          onClick={() => onSave({ ...form, parentCompanyId: form.parentCompanyId, industry: form.industry || null, logoUrl: form.logoUrl || null, hq: form.hq || null, description: form.description || null, fiscalYearEnd: form.fiscalYearEnd || null })}
          disabled={!form.name.trim() || isSaving}
          className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}

function CompanyNode({
  company,
  companies,
  depth,
  onEdit,
  onDelete,
}: {
  company: Company;
  companies: Company[];
  depth: number;
  onEdit: (c: Company) => void;
  onDelete: (id: number) => void;
}) {
  const children = companies.filter((c) => c.parentCompanyId === company.id);

  return (
    <div>
      <div
        className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-900 border border-border rounded-xl group mb-1"
        style={{ marginLeft: depth * 20 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="w-7 h-7 rounded object-contain border border-border shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{company.name}</p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {company.industry && <span>{company.industry}</span>}
              {company.hq && <span>{company.hq}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(company)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(company.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {children.map((child) => (
        <CompanyNode
          key={child.id}
          company={child}
          companies={companies}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function CompanyTab() {
  const queryClient = useQueryClient();
  const { data: companies = [], isLoading } = useCompanies();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Company, "id" | "orgId">) => {
      const res = await fetch(`${API_BASE}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Omit<Company, "id" | "orgId">> }) => {
      const res = await fetch(`${API_BASE}/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setEditingCompany(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/companies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete company");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  if (isLoading) return <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;

  const topLevel = companies.filter((c) => !c.parentCompanyId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Company Hierarchy</h3>
          <span className="text-xs text-muted-foreground">({companies.length})</span>
        </div>
        <button
          onClick={() => { setIsCreating(true); setEditingCompany(null); }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Company
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Define your organization's legal entities and subsidiaries. Assign a parent to build the hierarchy tree.
      </p>

      {isCreating && (
        <CompanyForm
          companies={companies}
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreating(false)}
          isSaving={createMutation.isPending}
        />
      )}

      {editingCompany && (
        <CompanyForm
          initial={editingCompany}
          companies={companies}
          onSave={(data) => updateMutation.mutate({ id: editingCompany.id, data })}
          onCancel={() => setEditingCompany(null)}
          isSaving={updateMutation.isPending}
        />
      )}

      {companies.length === 0 && !isCreating ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          No companies defined yet. Add your first company to get started.
        </div>
      ) : (
        <div className="space-y-1">
          {topLevel.map((company) => (
            <CompanyNode
              key={company.id}
              company={company}
              companies={companies}
              depth={0}
              onEdit={(c) => { setEditingCompany(c); setIsCreating(false); }}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelForm({
  initial,
  companies,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Partial<Channel>;
  companies: Company[];
  onSave: (data: { name: string; companyIds: number[] }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [companyIds, setCompanyIds] = useState<number[]>(initial?.companyIds || []);

  const toggleCompany = (id: number) => {
    setCompanyIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
      <div>
        <label className="block text-xs font-semibold mb-1">Channel Name *</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Wholesale, DTC, Dropship"
          className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>
      {companies.length > 0 && (
        <div>
          <label className="block text-xs font-semibold mb-2">Linked Companies</label>
          <div className="flex flex-wrap gap-2">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCompany(c.id)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  companyIds.includes(c.id)
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-white dark:bg-slate-900 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
          Cancel
        </button>
        <button
          onClick={() => onSave({ name, companyIds })}
          disabled={!name.trim() || isSaving}
          className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}

function ChannelsTab() {
  const queryClient = useQueryClient();
  const { data: channels = [], isLoading } = useChannels();
  const { data: companies = [] } = useCompanies();
  const [isCreating, setIsCreating] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; companyIds: number[] }) => {
      const res = await fetch(`${API_BASE}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create channel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; companyIds?: number[] } }) => {
      const res = await fetch(`${API_BASE}/channels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update channel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setEditingChannel(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/channels/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete channel");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["channels"] }),
  });

  const moveChannel = async (id: number, direction: "up" | "down") => {
    const sorted = [...channels].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((c) => c.id === id);
    if (direction === "up" && idx <= 0) return;
    if (direction === "down" && idx >= sorted.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = sorted.map((c) => c.id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    await fetch(`${API_BASE}/channels/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderedIds: newOrder }),
    });
    queryClient.invalidateQueries({ queryKey: ["channels"] });
  };

  if (isLoading) return <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;

  const sortedChannels = [...channels].sort((a, b) => a.sortOrder - b.sortOrder);
  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Sales & Distribution Channels</h3>
          <span className="text-xs text-muted-foreground">({channels.length}/3)</span>
        </div>
        <button
          onClick={() => { setIsCreating(true); setEditingChannel(null); }}
          disabled={channels.length >= 3}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" /> Add Channel
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Define up to 3 sales and distribution channels for use in Margin Map modeling. Each channel maps to a distinct revenue and cost profile. Link channels to companies from your hierarchy.
      </p>

      {isCreating && (
        <ChannelForm
          companies={companies}
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreating(false)}
          isSaving={createMutation.isPending}
        />
      )}

      {editingChannel && (
        <ChannelForm
          initial={editingChannel}
          companies={companies}
          onSave={(data) => updateMutation.mutate({ id: editingChannel.id, data })}
          onCancel={() => setEditingChannel(null)}
          isSaving={updateMutation.isPending}
        />
      )}

      {channels.length === 0 && !isCreating ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          No channels defined yet. Add channels like "Wholesale", "DTC", or "Dropship".
        </div>
      ) : (
        <div className="space-y-2">
          {sortedChannels.map((ch, idx) => (
            <div key={ch.id} className="border border-border rounded-xl bg-white dark:bg-slate-900 flex items-center gap-3 px-4 py-3 group">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveChannel(ch.id, "up")}
                  disabled={idx === 0}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button
                  onClick={() => moveChannel(ch.id, "down")}
                  disabled={idx === sortedChannels.length - 1}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6"/></svg>
                </button>
              </div>
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{ch.name}</p>
                {ch.companyIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ch.companyIds.map((cid) => companyMap[cid] && (
                      <span key={cid} className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded font-medium">
                        {companyMap[cid].name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingChannel(ch); setIsCreating(false); }}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(ch.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "company" | "channels">("templates");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage templates, company profile, and organization settings.</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "templates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("company")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "company"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Company
        </button>
        <button
          onClick={() => setActiveTab("channels")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "channels"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Channels
        </button>
      </div>

      {activeTab === "templates" && (
        <div className="space-y-8">
          <UserTemplatesSection />
          <div className="border-t border-border pt-6">
            <IndustryTemplatesSection />
          </div>
        </div>
      )}

      {activeTab === "company" && <CompanyTab />}
      {activeTab === "channels" && <ChannelsTab />}
    </div>
  );
}
