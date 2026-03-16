import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useCreateCase } from "@/hooks/use-cases";
import { Link } from "wouter";

export default function NewCase() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateCase();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "SaaS",
    currency: "USD",
    timeHorizonMonths: "36",
    discountRate: "10"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        currency: formData.currency,
        timeHorizonMonths: parseInt(formData.timeHorizonMonths, 10),
        discountRate: parseFloat(formData.discountRate)
      }
    }, {
      onSuccess: (data) => {
        setLocation(`/cases/${data.id}`);
      }
    });
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

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Case Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Cloud Migration 2025"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe the objective of this business case..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Industry Template</label>
              <select 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
              >
                <option value="SaaS">SaaS & Software</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other / Blank</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">Optional starting template for costs.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Base Currency</label>
              <select 
                value={formData.currency}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Time Horizon (Months)</label>
              <input 
                required
                type="number" 
                min="1"
                value={formData.timeHorizonMonths}
                onChange={e => setFormData({...formData, timeHorizonMonths: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Discount Rate (%)</label>
              <input 
                required
                type="number" 
                step="0.1"
                value={formData.discountRate}
                onChange={e => setFormData({...formData, discountRate: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <p className="text-xs text-muted-foreground mt-2">Used for NPV calculation.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-border flex justify-end">
          <button 
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Create Case
          </button>
        </div>
      </motion.form>
    </div>
  );
}
