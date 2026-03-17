import { useState, useEffect } from "react";
import { useUpdateCase } from "@/hooks/use-cases";
import { useObjective, useUpsertObjective, useDeleteObjective } from "@/hooks/use-scenarios";
import { Loader2, Save, Target, Trash2 } from "lucide-react";
import type { BusinessCase } from "@workspace/api-client-react";
import { UpdateBusinessCaseBodyStatus } from "@workspace/api-client-react";

const INDUSTRIES = [
  { id: "saas", label: "SaaS & Software" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "retail", label: "Retail" },
  { id: "healthcare", label: "Healthcare" },
  { id: "logistics", label: "Logistics & Freight" },
  { id: "banking", label: "Commercial Banking" },
  { id: "construction", label: "Construction" },
  { id: "renewable_energy", label: "Renewable Energy" },
  { id: "professional_services", label: "Professional Services" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "education", label: "Corporate Training" },
  { id: "other", label: "Other" },
];

export function OverviewTab({ caseId, caseData }: { caseId: number; caseData: BusinessCase }) {
  const updateMutation = useUpdateCase();
  const { data: objectiveData } = useObjective(caseId);
  const upsertObjective = useUpsertObjective(caseId);
  const deleteObjective = useDeleteObjective(caseId);

  const [formData, setFormData] = useState({
    name: caseData.name,
    description: caseData.description || "",
    industry: caseData.industry || "",
    currency: caseData.currency,
    timeHorizonMonths: String(caseData.timeHorizonMonths),
    discountRate: String(caseData.discountRate * 100),
    status: caseData.status,
  });

  const objective = objectiveData?.objective;
  const [objForm, setObjForm] = useState({
    targetValue: "",
    targetMonth: "",
  });

  useEffect(() => {
    if (objective) {
      setObjForm({
        targetValue: String(objective.targetValue ?? ""),
        targetMonth: String(objective.targetMonth ?? ""),
      });
    }
  }, [objective]);

  const handleSave = () => {
    updateMutation.mutate({
      id: caseId,
      data: {
        name: formData.name,
        description: formData.description || undefined,
        industry: formData.industry || undefined,
        currency: formData.currency,
        timeHorizonMonths: parseInt(formData.timeHorizonMonths, 10),
        discountRate: parseFloat(formData.discountRate) / 100,
        status: formData.status as UpdateBusinessCaseBodyStatus,
      },
    });
  };

  const handleSaveObjective = () => {
    if (!objForm.targetValue || !objForm.targetMonth) return;
    upsertObjective.mutate({
      id: caseId,
      data: {
        targetValue: parseFloat(objForm.targetValue),
        targetMonth: parseInt(objForm.targetMonth, 10),
      },
    });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold">Case Details</h3>
          <p className="text-sm text-muted-foreground">Update the core metadata for this business case.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Case Name</label>
            <input
              type="text" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Description</label>
            <textarea
              rows={3} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
              >
                {["USD", "EUR", "GBP", "JPY", "CAD", "AUD"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Time Horizon (Months)</label>
              <input
                type="number" min="1" value={formData.timeHorizonMonths}
                onChange={(e) => setFormData({ ...formData, timeHorizonMonths: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Discount Rate (%)</label>
              <input
                type="number" step="0.1" value={formData.discountRate}
                onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-border flex justify-end">
          <button
            onClick={handleSave} disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Financial Objective</h3>
              <p className="text-sm text-muted-foreground">Set a target value and timeline for this case.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Target Value ({formData.currency})</label>
              <input
                type="number" step="0.01" value={objForm.targetValue}
                onChange={(e) => setObjForm({ ...objForm, targetValue: e.target.value })}
                placeholder="e.g., 500000"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Target Month</label>
              <input
                type="number" min="1" value={objForm.targetMonth}
                onChange={(e) => setObjForm({ ...objForm, targetMonth: e.target.value })}
                placeholder="e.g., 24"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            {objective && (
              <button
                onClick={() => deleteObjective.mutate({ id: caseId })}
                disabled={deleteObjective.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
            <button
              onClick={handleSaveObjective}
              disabled={upsertObjective.isPending || !objForm.targetValue || !objForm.targetMonth}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {upsertObjective.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {objective ? "Update Objective" : "Set Objective"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
