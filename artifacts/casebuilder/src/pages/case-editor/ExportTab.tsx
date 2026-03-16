import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useEnableSharing,
  useDisableSharing,
  useListCostLineItems,
  useListValueDrivers,
  getGetBusinessCaseQueryKey,
} from "@workspace/api-client-react";
import { useFinancialModelData } from "@/hooks/use-cases";
import { useAuth } from "@workspace/replit-auth-web";
import { Share2, Copy, Check, Download, Loader2, Link2, Link2Off, FileText, Table } from "lucide-react";
import type { BusinessCase } from "@workspace/api-client-react";

interface ExportTabProps {
  caseId: number;
  caseData: BusinessCase;
  scenarioId?: number;
}

export function ExportTab({ caseId, caseData, scenarioId }: ExportTabProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const enableShare = useEnableSharing();
  const disableShare = useDisableSharing();
  const { data: costs } = useListCostLineItems(caseId, { scenarioId });
  const { data: values } = useListValueDrivers(caseId, { scenarioId });
  const { data: model } = useFinancialModelData(caseId, scenarioId);

  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const shareUrl = caseData.shareToken
    ? `${window.location.origin}${import.meta.env.BASE_URL}cases/public/${caseData.shareToken}`
    : null;

  const handleToggleShare = () => {
    if (caseData.shareToken) {
      disableShare.mutate({ id: caseId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBusinessCaseQueryKey(caseId) }),
      });
    } else {
      enableShare.mutate({ id: caseId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBusinessCaseQueryKey(caseId) }),
      });
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePdfExport = async () => {
    if (!costs || !values || !model) return;
    setPdfLoading(true);
    try {
      const { generatePdf } = await import("@/lib/exportPdf");
      const ownerName = user?.firstName || user?.id || "Unknown";
      await generatePdf({ caseData, costs, values, model, ownerName });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcelExport = async () => {
    if (!costs || !values || !model) return;
    setExcelLoading(true);
    try {
      const { generateExcel } = await import("@/lib/exportExcel");
      generateExcel({ caseData, costs, values, model });
    } catch (err) {
      console.error("Excel generation failed:", err);
    } finally {
      setExcelLoading(false);
    }
  };

  const dataReady = !!(costs && values && model);

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-4">
      <div className="bg-white dark:bg-slate-900 border border-border p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Share2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Shareable Link</h3>
            <p className="text-sm text-muted-foreground">Generate a read-only public link for stakeholders</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleToggleShare}
            disabled={enableShare.isPending || disableShare.isPending}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
              caseData.shareToken
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {(enableShare.isPending || disableShare.isPending) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : caseData.shareToken ? (
              <Link2Off className="w-4 h-4" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {caseData.shareToken ? "Disable Sharing" : "Enable Sharing"}
          </button>
        </div>

        {shareUrl && (
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-foreground transition-colors shrink-0"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handlePdfExport}
          disabled={pdfLoading || !dataReady}
          className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pdfLoading ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          ) : (
            <FileText className="w-10 h-10 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
          )}
          <span className="font-bold text-lg">Export to PDF</span>
          <span className="text-sm text-muted-foreground mt-1">Executive summary report</span>
          <span className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Download className="w-3 h-3" /> Downloads .pdf file
          </span>
        </button>

        <button
          onClick={handleExcelExport}
          disabled={excelLoading || !dataReady}
          className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {excelLoading ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          ) : (
            <Table className="w-10 h-10 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
          )}
          <span className="font-bold text-lg">Export to Excel</span>
          <span className="text-sm text-muted-foreground mt-1">Full data model workbook</span>
          <span className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Download className="w-3 h-3" /> Downloads .xlsx file
          </span>
        </button>
      </div>

      {!dataReady && (
        <div className="text-center text-sm text-muted-foreground p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          Add costs and value drivers to enable PDF and Excel exports.
        </div>
      )}
    </div>
  );
}
