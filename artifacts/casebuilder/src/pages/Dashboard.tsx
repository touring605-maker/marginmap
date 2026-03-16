import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, Briefcase, TrendingUp, Calendar, AlertCircle, DollarSign, ArrowRight } from "lucide-react";
import { useCases } from "@/hooks/use-cases";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: cases, isLoading } = useCases();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeCases = cases?.filter(c => c.status !== "approved")?.length || 0;
  const totalCases = cases?.length || 0;
  const totalInvestment = cases?.reduce((sum, c) => sum + (c.totalInvestment || 0), 0) || 0;
  const totalExpectedValue = cases?.reduce((sum, c) => sum + (c.totalExpectedValue || 0), 0) || 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(val);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your organization's business cases.</p>
        </div>
        <Link href="/cases/new">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Plus className="w-5 h-5" />
            New Case
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
            <Briefcase className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-display font-bold mt-2">{totalCases}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">Active (Draft/Review)</p>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-display font-bold mt-2">{activeCases}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
            <DollarSign className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-display font-bold mt-2">{formatCurrency(totalInvestment)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-muted-foreground">Expected Value (Annual)</p>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-display font-bold mt-2">{formatCurrency(totalExpectedValue)}</p>
        </motion.div>
      </div>

      <div>
        <h2 className="text-xl font-display font-bold mb-4">Recent Business Cases</h2>

        {!cases || cases.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No business cases yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create your first business case to start modeling costs, tracking value, and generating financial projections.</p>
            <Link href="/cases/new">
              <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                Create First Case
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cases.map((c, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={c.id}
              >
                <Link href={`/cases/${c.id}`}>
                  <div className="block bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{c.description || "No description provided."}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        c.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                        c.status === "in_review" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      }`}>
                        {c.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Investment</p>
                        <p className="text-sm font-semibold font-mono">{formatCurrency(c.totalInvestment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Value/yr</p>
                        <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(c.totalExpectedValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Horizon</p>
                        <p className="text-sm font-semibold">{c.timeHorizonMonths} mos</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Updated</p>
                        <p className="text-sm font-semibold">{format(new Date(c.updatedAt), "MMM d")}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
