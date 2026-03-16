import { useState } from "react";
import { useValues, useCreateValue, useDeleteValue } from "@/hooks/use-values";
import { Plus, Trash2, Loader2 } from "lucide-react";

export function ValuesTab({ caseId }: { caseId: number }) {
  const { data: values, isLoading } = useValues(caseId);
  const deleteMutation = useDeleteValue();
  const createMutation = useCreateValue();
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "cost_reduction" as any,
    annualValue: "",
    confidenceLevel: "medium" as any,
    monthsToRealize: "0",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      id: caseId,
      data: {
        name: formData.name,
        type: formData.type,
        annualValue: parseFloat(formData.annualValue),
        confidenceLevel: formData.confidenceLevel,
        monthsToRealize: parseInt(formData.monthsToRealize, 10),
      }
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setFormData({ name: "", type: "cost_reduction", annualValue: "", confidenceLevel: "medium", monthsToRealize: "0" });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold">Value Drivers</h2>
          <p className="text-muted-foreground text-sm">Define expected savings, revenue, and productivity gains.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Value
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">Driver Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="cost_reduction">Cost Reduction</option>
                <option value="revenue">Revenue</option>
                <option value="productivity">Productivity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Annual Value</label>
              <input required type="number" min="0" step="0.01" value={formData.annualValue} onChange={e => setFormData({...formData, annualValue: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Confidence</label>
              <select value={formData.confidenceLevel} onChange={e => setFormData({...formData, confidenceLevel: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="high">High (90%)</option>
                <option value="medium">Medium (70%)</option>
                <option value="low">Low (50%)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Driver
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Annual Value</th>
              <th className="px-6 py-4 font-semibold">Confidence</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {values?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No value drivers defined yet.
                </td>
              </tr>
            ) : (
              values?.map((val) => (
                <tr key={val.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{val.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium uppercase tracking-wider">{val.type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-600 dark:text-emerald-400 font-medium">+{formatCurrency(val.annualValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                      val.confidenceLevel === 'high' ? 'bg-emerald-100 text-emerald-700' :
                      val.confidenceLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {val.confidenceLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteMutation.mutate({ id: caseId, valueId: val.id })}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
