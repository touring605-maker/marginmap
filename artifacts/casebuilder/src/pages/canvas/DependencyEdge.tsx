import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

const typeColors: Record<string, string> = {
  sequential: "#6366f1",
  parallel: "#0ea5e9",
  conditional: "#f59e0b",
};

const typeLabels: Record<string, string> = {
  sequential: "Sequential",
  parallel: "Parallel",
  conditional: "Conditional",
};

export interface DependencyEdgeData extends Record<string, unknown> {
  dependencyType: string;
  conditionThreshold?: number | null;
  cascadeField?: string | null;
  depId: number;
  onDelete?: (id: number) => void;
}

function DependencyEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as DependencyEdgeData;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = typeColors[edgeData.dependencyType] || "#94a3b8";
  const label = typeLabels[edgeData.dependencyType] || edgeData.dependencyType;
  const dashArray = edgeData.dependencyType === "conditional" ? "6 3" : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: dashArray,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white shadow-md ${selected ? "ring-2 ring-white/50" : ""}`}
            style={{ backgroundColor: color }}
          >
            <span>{label}</span>
            {edgeData.dependencyType === "conditional" && edgeData.conditionThreshold != null && (
              <span className="opacity-80">&ge; {edgeData.conditionThreshold}</span>
            )}
            {edgeData.cascadeField && (
              <span className="opacity-80 border-l border-white/30 pl-1.5 ml-0.5">{edgeData.cascadeField}</span>
            )}
            {edgeData.onDelete && (
              <button
                className="ml-1 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  edgeData.onDelete?.(edgeData.depId);
                }}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(DependencyEdgeComponent);
