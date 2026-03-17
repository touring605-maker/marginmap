import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { ScenarioResult } from './marginEngine';

interface Props {
  results: ScenarioResult[];
}

export function ConstraintFlagsPanel({ results }: Props) {
  const allFlags = results.flatMap((r) =>
    r.constraints.map((c) => ({ ...c, scenarioId: r.scenario.id }))
  );

  if (allFlags.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {allFlags.map((flag, i) => {
        const isCritical = flag.severity === 'critical';
        return (
          <div
            key={`${flag.scenarioId}-${flag.type}-${flag.channel ?? ''}-${i}`}
            className={`flex items-start gap-2.5 px-4 py-2.5 rounded-lg text-xs border ${
              isCritical
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isCritical ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold">{flag.scenarioName}</span>
              <span className="mx-1.5">·</span>
              <span>{flag.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
