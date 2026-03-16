import { useRoute } from "wouter";
import { useGetPublicCase } from "@workspace/api-client-react";
import { Loader2, Lock } from "lucide-react";

export default function PublicView() {
  const [, params] = useRoute("/cases/public/:token");
  const token = params?.token || "";
  
  const { data, isLoading, error } = useGetPublicCase(token, {
    query: { enabled: !!token, retry: false }
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">This link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border p-8">
        <div className="border-b border-border pb-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-6 h-6 rounded" />
            <span className="font-display font-bold text-lg">CaseBuilder Public Report</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-4">{data.case.name}</h1>
          <p className="text-muted-foreground mt-2">{data.case.description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">NPV</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">${data.financialModel.npv.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">IRR</p>
            <p className="text-xl font-bold mt-1">{data.financialModel.irr?.toFixed(1) || 'N/A'}%</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">ROI</p>
            <p className="text-xl font-bold mt-1">{data.financialModel.roi.toFixed(0)}%</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Horizon</p>
            <p className="text-xl font-bold mt-1">{data.case.timeHorizonMonths} mos</p>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          Generated via CaseBuilder
        </div>
      </div>
    </div>
  );
}
