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
import { Loader2, Plus, Trash2, Pencil, FileText, Building2, ChevronDown, ChevronRight, X, Check, ArrowRight, Zap } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

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
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; description?: string } }) => {
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

function ApplyToCaseDialog({
  onApply,
  onClose,
  isPending,
  templateName,
}: {
  onApply: (caseId: number) => void;
  onClose: () => void;
  isPending: boolean;
  templateName: string;
}) {
  const { data: cases, isLoading } = useListBusinessCases();
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Apply Template</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Apply <span className="font-semibold text-foreground">{templateName}</span> to a business case. This will add cost items and value drivers from the template.
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
            onClick={() => selectedCaseId && onApply(selectedCaseId)}
            disabled={!selectedCaseId || isPending}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
}

function IndustryTemplatesSection() {
  const { data: templates, isLoading } = useListIndustryTemplates();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<{ id: string; name: string } | null>(null);
  const applyMutation = useApplyIndustryTemplate();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleApply = (caseId: number) => {
    if (!applyingTemplate) return;
    applyMutation.mutate(
      { id: caseId, data: { templateId: applyingTemplate.id } },
      {
        onSuccess: () => {
          setApplyingTemplate(null);
          setSuccessMsg(`Template applied successfully!`);
          queryClient.invalidateQueries({ queryKey: getListCostLineItemsQueryKey(caseId) });
          queryClient.invalidateQueries({ queryKey: getListValueDriversQueryKey(caseId) });
          queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(caseId) });
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      }
    );
  };

  if (isLoading) return <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Industry Templates</h3>
        <span className="text-xs text-muted-foreground">({templates?.length || 0})</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Pre-built templates for common industries. Apply these to any business case.
      </p>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMsg}</p>
        </div>
      )}

      <div className="space-y-2">
        {templates?.map((t) => {
          const isExpanded = expandedId === t.id;
          return (
            <div key={t.id} className="border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.costItems.length} costs</span>
                  {t.valueDrivers && <span>{t.valueDrivers.length} drivers</span>}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border">
                  {t.description && (
                    <p className="text-xs text-muted-foreground py-2">{t.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cost Items</p>
                      <div className="space-y-1">
                        {t.costItems.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded">
                            <span className="text-foreground">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground capitalize">{item.costPhase?.replace("_", " ") || "project"}</span>
                              <span className="font-mono">${item.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {t.valueDrivers && t.valueDrivers.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Value Drivers</p>
                        <div className="space-y-1">
                          {t.valueDrivers.map((v, i) => (
                            <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded">
                              <span className="text-foreground">{v.name}</span>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400">${v.annualValue.toLocaleString()}/yr</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setApplyingTemplate({ id: t.id, name: t.name })}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" /> Apply to Case
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {applyingTemplate && (
        <ApplyToCaseDialog
          onApply={handleApply}
          onClose={() => setApplyingTemplate(null)}
          isPending={applyMutation.isPending}
          templateName={applyingTemplate.name}
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
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [applyingTemplate, setApplyingTemplate] = useState<{ id: number; name: string } | null>(null);
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

  const handleApply = (caseId: number) => {
    if (!applyingTemplate) return;
    applyMutation.mutate(
      { caseId, templateId: applyingTemplate.id },
      {
        onSuccess: () => {
          setApplyingTemplate(null);
          setSuccessMsg(`Template applied successfully!`);
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
    costItems: unknown[];
    valueDrivers: unknown[];
    createdAt?: string;
  }>;

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
        Create custom templates to reuse across business cases. Save cost items and value drivers for quick setup.
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
            No custom templates yet. Click "New Template" to create one.
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
                      onClick={() => setApplyingTemplate({ id: t.id, name: t.name })}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Apply to case"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(t.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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

      {applyingTemplate && (
        <ApplyToCaseDialog
          onApply={handleApply}
          onClose={() => setApplyingTemplate(null)}
          isPending={applyMutation.isPending}
          templateName={applyingTemplate.name}
        />
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"templates">("templates");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage templates and organization settings.</p>
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
      </div>

      {activeTab === "templates" && (
        <div className="space-y-8">
          <UserTemplatesSection />
          <div className="border-t border-border pt-6">
            <IndustryTemplatesSection />
          </div>
        </div>
      )}
    </div>
  );
}
