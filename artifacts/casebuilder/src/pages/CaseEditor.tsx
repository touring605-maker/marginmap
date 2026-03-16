import { useState } from "react";
import { useRoute } from "wouter";
import { useCase } from "@/hooks/use-cases";
import { Link } from "wouter";
import { ArrowLeft, Settings, Calculator, Coins, BarChart3, Download, Copy, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CostsTab } from "./case-editor/CostsTab";
import { ValuesTab } from "./case-editor/ValuesTab";
import { ModelTab } from "./case-editor/ModelTab";

export default function CaseEditor() {
  const [, params] = useRoute("/cases/:id");
  const caseId = parseInt(params?.id || "0", 10);
  
  const { data: caseData, isLoading } = useCase(caseId);
  const [activeTab, setActiveTab] = useState("costs");

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
    { id: "costs", label: "Cost Model", icon: Calculator },
    { id: "values", label: "Value Drivers", icon: Coins },
    { id: "model", label: "Financial Model", icon: BarChart3 },
    { id: "export", label: "Export & Share", icon: Share2 },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 flex flex-col h-full min-h-[80vh]">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{caseData.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="uppercase tracking-wider font-semibold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{caseData.status.replace('_', ' ')}</span>
              <span>•</span>
              <span>{caseData.currency}</span>
              <span>•</span>
              <span>{caseData.timeHorizonMonths} Months</span>
            </div>
          </div>
          <button className="p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex overflow-x-auto border-b border-border mb-8 scrollbar-hide">
        {tabs.map(tab => (
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

      {/* Tab Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "costs" && <CostsTab caseId={caseId} />}
            {activeTab === "values" && <ValuesTab caseId={caseId} />}
            {activeTab === "model" && <ModelTab caseId={caseId} />}
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
                      value={`https://app.casebuilder.com/public/${caseData.shareToken || 'generate-token-first'}`}
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
