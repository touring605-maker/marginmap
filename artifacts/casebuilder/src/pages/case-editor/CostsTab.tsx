import { useState } from "react";
import { useCosts, useCreateCost, useDeleteCost } from "@/hooks/use-costs";
import { Plus, Trash2, Loader2, DollarSign } from "lucide-react";
import type { CostLineItem } from "@workspace/api-client-react";

export function CostsTab({ caseId }: { caseId: number }) {
  const { data: costs, isLoading } = useCosts(caseId);
  const deleteMutation = useDeleteCost();
  const createMutation = useCreateCost();
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "one_time" as any,
    amount: "",
    frequency: "once" as any,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      id: caseId,
      data: {
        name: formData.name,
        type: formData.type,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
      }
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setFormData({ name: "", type: "one_time", amount: "", frequency: "once" });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold">Cost Model</h2>
          <p className="text-muted-foreground text-sm">Define all investments and operational expenses.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Cost
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Item Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="one_time">One-time</option>
                <option value="capex">CapEx</option>
                <option value="opex">OpEx</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Amount</label>
              <input required type="number" min="0" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Frequency</label>
              <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="once">Once</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Item
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
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Frequency</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {costs?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No cost items defined yet.
                </td>
              </tr>
            ) : (
              costs?.map((cost) => (
                <tr key={cost.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{cost.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium uppercase tracking-wider">{cost.type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 font-mono">{formatCurrency(cost.amount)}</td>
                  <td className="px-6 py-4 capitalize">{cost.frequency}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteMutation.mutate({ id: caseId, costId: cost.id })}
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
