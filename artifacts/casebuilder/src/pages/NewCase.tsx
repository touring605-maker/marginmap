import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Save, Check, Factory, ShoppingBag, Code2, Heart, FileQuestion, Truck, Landmark, HardHat, Wind, Briefcase, ShoppingCart, GraduationCap } from "lucide-react";
import { useCreateCase } from "@/hooks/use-cases";
import { useApplyTemplate } from "@/hooks/use-scenarios";
import { Link } from "wouter";

const INDUSTRIES = [
  { id: "saas", label: "SaaS & Software", icon: Code2, color: "bg-blue-500/10 border-blue-500/30 text-blue-600" },
  { id: "manufacturing", label: "Manufacturing", icon: Factory, color: "bg-amber-500/10 border-amber-500/30 text-amber-600" },
  { id: "retail", label: "Retail", icon: ShoppingBag, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" },
  { id: "healthcare", label: "Healthcare", icon: Heart, color: "bg-rose-500/10 border-rose-500/30 text-rose-600" },
  { id: "logistics", label: "Logistics & Freight", icon: Truck, color: "bg-orange-500/10 border-orange-500/30 text-orange-600" },
  { id: "banking", label: "Commercial Banking", icon: Landmark, color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600" },
  { id: "construction", label: "Construction", icon: HardHat, color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600" },
  { id: "renewable_energy", label: "Renewable Energy", icon: Wind, color: "bg-teal-500/10 border-teal-500/30 text-teal-600" },
  { id: "professional_services", label: "Professional Services", icon: Briefcase, color: "bg-violet-500/10 border-violet-500/30 text-violet-600" },
  { id: "ecommerce", label: "E-Commerce", icon: ShoppingCart, color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-600" },
  { id: "education", label: "Corporate Training", icon: GraduationCap, color: "bg-lime-500/10 border-lime-500/30 text-lime-600" },
  { id: "other", label: "Other / Blank", icon: FileQuestion, color: "bg-slate-500/10 border-slate-500/30 text-slate-600" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20ac", name: "Euro" },
  { code: "GBP", symbol: "\u00a3", name: "British Pound" },
  { code: "JPY", symbol: "\u00a5", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export default function NewCase() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateCase();
  const [createdCaseId, setCreatedCaseId] = useState<number | null>(null);
  const applyTemplateMutation = useApplyTemplate(createdCaseId || 0);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "saas",
    currency: "USD",
    timeHorizonMonths: "36",
    discountRate: "10",
  });

  const [applyTemplate, setApplyTemplate] = useState(true);

  const templateId = formData.industry !== "other" ? formData.industry : null;
  const selectedIndustry = INDUSTRIES.find(i => i.id === formData.industry);

  const handleCreate = () => {
    createMutation.mutate(
      {
        data: {
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          currency: formData.currency,
          timeHorizonMonths: parseInt(formData.timeHorizonMonths, 10),
          discountRate: parseFloat(formData.discountRate) / 100,
        },
      },
      {
        onSuccess: (data) => {
          if (applyTemplate && templateId) {
            setCreatedCaseId(data.id);
            applyTemplateMutation.mutate(
              { id: data.id, data: { templateId } },
              { onSuccess: () => setLocation(`/cases/${data.id}`) }
            );
          } else {
            setLocation(`/cases/${data.id}`);
          }
        },
      }
    );
  };

  const canGoNext = () => {
    if (step === 1) return formData.name.trim().length > 0;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground">Create Business Case</h1>
        <p className="text-muted-foreground mt-2">Set up the foundational assumptions for your new financial model.</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              s < step ? "bg-primary text-white" : s === step ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-muted-foreground"
            }`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${s === step ? "text-foreground" : "text-muted-foreground"}`}>
              {s === 1 ? "Details" : s === 2 ? "Template" : "Review"}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Case Name *</label>
                  <input
                    required autoFocus type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Cloud Migration 2025"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <textarea
                    rows={3} value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe the objective of this business case..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Industry</label>
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
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Base Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Time Horizon (Months)</label>
                  <input
                    required type="number" min="1" value={formData.timeHorizonMonths}
                    onChange={(e) => setFormData({ ...formData, timeHorizonMonths: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Discount Rate (%)</label>
                  <input
                    required type="number" step="0.1" value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Used for NPV calculation.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-border flex justify-end">
              <button
                onClick={() => setStep(2)} disabled={!canGoNext()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-display font-bold mb-1">Industry Template</h2>
                <p className="text-sm text-muted-foreground">
                  {formData.industry !== "other"
                    ? `Apply pre-built cost line items for ${selectedIndustry?.label}?`
                    : "No industry template available for 'Other'. You can add cost items manually."}
                </p>
              </div>

              {formData.industry !== "other" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 rounded-xl border-2 border-primary bg-primary/5">
                    {selectedIndustry && (
                      <>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${selectedIndustry.color}`}>
                          <selectedIndustry.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{selectedIndustry.label} Template</p>
                          <p className="text-sm text-muted-foreground">Pre-configured cost items for this industry</p>
                        </div>
                      </>
                    )}
                  </div>

                  <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border cursor-pointer">
                    <input
                      type="checkbox" checked={applyTemplate}
                      onChange={(e) => setApplyTemplate(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Apply template cost items</p>
                      <p className="text-xs text-muted-foreground">Pre-fill typical cost line items for {selectedIndustry?.label}</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-border text-center">
                  <p className="text-muted-foreground text-sm">You selected "Other / Blank". No template will be applied.</p>
                  <p className="text-xs text-muted-foreground mt-1">You can change the industry on the previous step if needed.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-border flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 inline mr-2" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-display font-bold mb-1">Review & Create</h2>
                <p className="text-sm text-muted-foreground">Confirm your business case settings before creating.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Name</p>
                    <p className="font-semibold text-foreground">{formData.name}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Industry</p>
                    <p className="font-semibold text-foreground">{selectedIndustry?.label}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Currency</p>
                    <p className="font-semibold text-foreground">{formData.currency}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Time Horizon</p>
                    <p className="font-semibold text-foreground">{formData.timeHorizonMonths} months</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Discount Rate</p>
                    <p className="font-semibold text-foreground">{formData.discountRate}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Template</p>
                    <p className="font-semibold text-foreground">{applyTemplate && templateId ? "Applied" : "None"}</p>
                  </div>
                </div>

                {formData.description && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-foreground">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-border flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 inline mr-2" /> Back
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || applyTemplateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
              >
                {(createMutation.isPending || applyTemplateMutation.isPending)
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Save className="w-5 h-5" />
                }
                Create Case
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
