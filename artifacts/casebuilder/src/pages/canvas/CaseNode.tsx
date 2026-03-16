import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useLocation } from "wouter";
import type { BusinessCase } from "@workspace/api-client-react";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-400",
  in_review: "bg-blue-400",
  approved: "bg-green-400",
  rejected: "bg-red-400",
  archived: "bg-gray-400",
};

function formatCurrency(val: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: val > 999999 ? "compact" : "standard",
  }).format(val);
}

export interface CaseNodeData extends Record<string, unknown> {
  caseData: BusinessCase;
  npv?: number | null;
  breakevenMonth?: number | null;
}

function CaseNodeComponent({ data }: NodeProps) {
  const [, setLocation] = useLocation();
  const { caseData, npv, breakevenMonth } = data as CaseNodeData;
  const currency = caseData.currency || "USD";
  const statusColor = statusColors[caseData.status] || "bg-gray-400";

  return (
    <div
      className="bg-card border border-border rounded-xl shadow-lg min-w-[220px] max-w-[260px] cursor-pointer hover:shadow-xl transition-shadow"
      onDoubleClick={() => setLocation(`/cases/${caseData.id}`)}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />

      <div className="px-4 pt-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor} flex-shrink-0`} />
          <h3 className="text-sm font-semibold text-foreground truncate">{caseData.name}</h3>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{caseData.status.replace("_", " ")}</span>
      </div>

      <div className="px-4 py-2.5 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide">NPV</p>
          <p className={`text-sm font-bold ${npv != null && npv >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
            {npv != null ? formatCurrency(npv, currency) : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Breakeven</p>
          <p className="text-sm font-bold text-foreground">
            {breakevenMonth ? `Month ${breakevenMonth}` : "N/A"}
          </p>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">{currency}</span>
          <span className="text-[10px] text-muted-foreground">&bull;</span>
          <span className="text-[10px] text-muted-foreground">{caseData.timeHorizonMonths}mo</span>
          {caseData.industry && (
            <>
              <span className="text-[10px] text-muted-foreground">&bull;</span>
              <span className="text-[10px] text-muted-foreground truncate">{caseData.industry}</span>
            </>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
    </div>
  );
}

export default memo(CaseNodeComponent);
