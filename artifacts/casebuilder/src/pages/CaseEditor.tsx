import { useState } from "react";
import { useRoute } from "wouter";
import { useCase } from "@/hooks/use-cases";
import { useScenarios, useCreateScenarioMutation, useDeleteScenarioMutation } from "@/hooks/use-scenarios";
import { Link } from "wouter";
import { ArrowLeft, Settings, Calculator, Coins, BarChart3, Share2, Plus, Trash2, Layers, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OverviewTab } from "./case-editor/OverviewTab";
import { CostsTab } from "./case-editor/CostsTab";
import { ValuesTab } from "./case-editor/ValuesTab";
import { ModelTab } from "./case-editor/ModelTab";
import { Copy, Download } from "lucide-react";

export default function CaseEditor() {
  const [, params] = useRoute("/cases/:id");
  const caseId = parseInt(params?.id || "0", 10);

  const { data: caseData, isLoading } = useCase(caseId);
  const { data: scenarios } = useScenarios(caseId);
  const createScenario = useCreateScenarioMutation(caseId);
  const deleteScenario = useDeleteScenarioMutation(caseId);

  const [activeTab, setActiveTab] = useState("overview");
  const [activeScenarioId, setActiveScenarioId] = useState<number | undefined>(undefined);
  const [showScenarioPanel, setShowScenarioPanel] = useState(false);
  const [newScenarioType, setNewScenarioType] = useState<"base" | "optimistic" | "conservative">("optimistic");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!caseData) {
    return <div className="p-8 text-center text-rose-500">Case not found.</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Settings },
    { id: "costs", label: "Cost Model", icon: Calculator },
    { id: "values", label: "Value Drivers", icon: Coins },
    { id: "model", label: "Financial Model", icon: BarChart3 },
    { id: "export", label: "Export & Share", icon: Share2 },
  ];

  const handleAddScenario = () => {
    createScenario.mutate(
      {
        id: caseId,
        data: {
          name: `${newScenarioType.charAt(0).toUpperCase() + newScenarioType.slice(1)} Scenario`,
          type: newScenarioType,
        },
      },
      { onSuccess: () => setShowScenarioPanel(false) }
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 flex flex-col h-full min-h-[80vh]">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{caseData.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className={`uppercase tracking-wider font-semibold text-xs px-2 py-0.5 rounded border ${
                caseData.status === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  : caseData.status === "in_review"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                  : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
              }`}>
                {caseData.status.replace("_", " ")}
              </span>
              <span>{caseData.currency}</span>
              <span>{caseData.timeHorizonMonths} Months</span>
            </div>
          </div>
        </div>
      </div>

      {scenarios && scenarios.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Scenario:</span>
          <button
            onClick={() => setActiveScenarioId(undefined)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeScenarioId === undefined ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
            }`}
          >
            All (No Filter)
          </button>
          {scenarios.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => setActiveScenarioId(s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeScenarioId === s.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.name}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                  s.type === "optimistic" ? "bg-emerald-500/20 text-emerald-600" :
                  s.type === "conservative" ? "bg-rose-500/20 text-rose-600" :
                  "bg-blue-500/20 text-blue-600"
                }`}>
                  {s.type}
                </span>
              </button>
              <button
                onClick={() => {
                  if (activeScenarioId === s.id) setActiveScenarioId(undefined);
                  deleteScenario.mutate({ id: caseId, scenarioId: s.id });
                }}
                className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowScenarioPanel(!showScenarioPanel)}
            className="px-2 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {!scenarios?.length && (
        <div className="mb-4">
          <button
            onClick={() => setShowScenarioPanel(!showScenarioPanel)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Add Scenarios (Optimistic / Base / Conservative)</span>
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {showScenarioPanel && (
        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border flex items-end gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Scenario Type</label>
            <select
              value={newScenarioType}
              onChange={(e) => setNewScenarioType(e.target.value as "base" | "optimistic" | "conservative")}
              className="px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="base">Base</option>
              <option value="optimistic">Optimistic</option>
              <option value="conservative">Conservative</option>
            </select>
          </div>
          <button
            onClick={handleAddScenario}
            disabled={createScenario.isPending}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            {createScenario.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
          <button onClick={() => setShowScenarioPanel(false)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      )}

      <div className="flex overflow-x-auto border-b border-border mb-8 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative
              ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab caseId={caseId} caseData={caseData} />}
            {activeTab === "costs" && <CostsTab caseId={caseId} scenarioId={activeScenarioId} />}
            {activeTab === "values" && <ValuesTab caseId={caseId} scenarioId={activeScenarioId} />}
            {activeTab === "model" && <ModelTab caseId={caseId} caseData={caseData} scenarioId={activeScenarioId} />}
            {activeTab === "export" && (
              <div className="max-w-2xl mx-auto space-y-6 mt-8">
                <div className="bg-white dark:bg-slate-900 border border-border p-8 rounded-2xl shadow-sm text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Share Business Case</h3>
                  <p className="text-muted-foreground mb-6">Generate a read-only public link to share with stakeholders.</p>
                  <div className="flex items-center gap-2 max-w-md mx-auto">
                    <input
                      readOnly
                      value={caseData.shareToken ? `${window.location.origin}/cases/public/${caseData.shareToken}` : "Generate a share link first"}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground font-mono"
                    />
                    <button className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-foreground transition-colors">
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <Download className="w-8 h-8 text-slate-400 group-hover:text-primary mb-3" />
                    <span className="font-semibold">Export to PDF</span>
                    <span className="text-xs text-muted-foreground mt-1">Executive Summary</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <Download className="w-8 h-8 text-slate-400 group-hover:text-primary mb-3" />
                    <span className="font-semibold">Export to Excel</span>
                    <span className="text-xs text-muted-foreground mt-1">Full Data Model</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
