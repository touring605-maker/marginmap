import { useState } from "react";
import { X } from "lucide-react";

interface DependencyDialogProps {
  fromName: string;
  toName: string;
  onConfirm: (type: "sequential" | "parallel" | "conditional", threshold?: number, cascadeField?: string) => void;
  onCancel: () => void;
}

const cascadeOptions = [
  { value: "", label: "None" },
  { value: "npv", label: "NPV" },
  { value: "totalAnnualSavings", label: "Total Annual Savings" },
  { value: "totalExpectedValue", label: "Total Expected Value" },
  { value: "confidenceAdjustedValue", label: "Confidence-Adjusted Value" },
];

export default function DependencyDialog({ fromName, toName, onConfirm, onCancel }: DependencyDialogProps) {
  const [depType, setDepType] = useState<"sequential" | "parallel" | "conditional">("sequential");
  const [threshold, setThreshold] = useState("");
  const [cascadeField, setCascadeField] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      depType,
      depType === "conditional" && threshold ? parseFloat(threshold) : undefined,
      cascadeField || undefined
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Dependency</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <span className="font-medium text-foreground truncate">{fromName}</span>
            <span className="shrink-0">&rarr;</span>
            <span className="font-medium text-foreground truncate">{toName}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Dependency Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["sequential", "parallel", "conditional"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDepType(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                    depType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-accent"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {depType === "conditional" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Condition Threshold</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. 100000"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum value required from source case</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Cascade Financial Output</label>
            <select
              value={cascadeField}
              onChange={(e) => setCascadeField(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              {cascadeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Optionally feed a financial output from the source into the target as a value driver
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
              Create Dependency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
