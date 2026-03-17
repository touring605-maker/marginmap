import { AlertTriangle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { ScenarioResult } from './marginEngine';

interface Props {
  results: ScenarioResult[];
}

export function ConstraintFlagsPanel({ results }: Props) {
  const allFlags = results.flatMap((r) =>
    r.constraints.map((c) => ({ ...c, scenarioId: r.scenario.id }))
  );

  const hasIssues = allFlags.some((f) => f.severity !== 'info');

  return (
    <div className="space-y-1.5">
      {allFlags.length === 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs border bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium">No active constraints across all scenarios</span>
        </div>
      )}

      {allFlags.length > 0 && !hasIssues && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs border bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium">All constraints healthy</span>
        </div>
      )}

      {allFlags.map((flag, i) => {
        const isCritical = flag.severity === 'critical';
        const isWarning = flag.severity === 'warning';
        const isInfo = flag.severity === 'info';

        let containerClass: string;
        if (isCritical) {
          containerClass = 'bg-red-50 text-red-800 border-red-200';
        } else if (isWarning) {
          containerClass = 'bg-amber-50 text-amber-800 border-amber-200';
        } else {
          containerClass = 'bg-slate-50 text-slate-700 border-slate-200';
        }

        let Icon = Clock;
        if (isCritical) Icon = AlertCircle;
        else if (isWarning) Icon = AlertTriangle;

        return (
          <div
            key={`${flag.scenarioId}-${flag.type}-${flag.channel ?? ''}-${i}`}
            className={`flex items-start gap-2.5 px-4 py-2.5 rounded-lg text-xs border ${containerClass}`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{flag.scenarioName}</span>
              <span className="mx-1.5">&middot;</span>
              <span>{flag.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
