import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type EdgeChange,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import {
  useListBusinessCases,
  useGetCanvasPositions,
  useSaveCanvasPositions,
  useListCaseDependencies,
  useCreateCaseDependency,
  useDeleteCaseDependency,
  getGetCanvasPositionsQueryKey,
  getListCaseDependenciesQueryKey,
  getGetFinancialModelQueryOptions,
  getGetFinancialModelQueryKey,
  getListScenariosQueryOptions,
  type BusinessCase,
  type FinancialModel,
} from "@workspace/api-client-react";
import { LayoutGrid, Loader2, Network } from "lucide-react";
import CaseNode from "./canvas/CaseNode";
import DependencyEdge from "./canvas/DependencyEdge";
import DependencyDialog from "./canvas/DependencyDialog";
import { getAutoLayout } from "./canvas/autoLayout";

const nodeTypes: NodeTypes = {
  caseNode: CaseNode,
};

const edgeTypes: EdgeTypes = {
  dependency: DependencyEdge,
};

export default function Canvas() {
  const queryClient = useQueryClient();
  const { data: cases, isLoading: casesLoading } = useListBusinessCases();
  const { data: positionsData, isLoading: posLoading } = useGetCanvasPositions();
  const { data: deps, isLoading: depsLoading } = useListCaseDependencies();
  const savePositions = useSaveCanvasPositions();
  const createDep = useCreateCaseDependency();
  const deleteDep = useDeleteCaseDependency();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const caseMap = useMemo(() => {
    const m = new Map<number, BusinessCase>();
    if (cases) cases.forEach((c) => m.set(c.id, c));
    return m;
  }, [cases]);

  const modelQueries = useQueries({
    queries: (cases || []).map((c) => ({
      ...getGetFinancialModelQueryOptions(c.id),
      retry: false,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const scenarioQueries = useQueries({
    queries: (cases || []).map((c) => ({
      ...getListScenariosQueryOptions(c.id),
      retry: false,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const modelMap = useMemo(() => {
    const m = new Map<number, FinancialModel>();
    if (cases) {
      cases.forEach((c, i) => {
        const q = modelQueries[i];
        if (q?.data) m.set(c.id, q.data as FinancialModel);
      });
    }
    return m;
  }, [cases, modelQueries]);

  const scenarioCountMap = useMemo(() => {
    const m = new Map<number, number>();
    if (cases) {
      cases.forEach((c, i) => {
        const q = scenarioQueries[i];
        if (q?.data && Array.isArray(q.data)) m.set(c.id, q.data.length);
      });
    }
    return m;
  }, [cases, scenarioQueries]);

  const invalidateFinancialModels = useCallback(
    (...caseIds: number[]) => {
      caseIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: getGetFinancialModelQueryKey(id) });
      });
    },
    [queryClient]
  );

  const debounceSavePositions = useCallback(
    (updatedNodes: Node[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const positions = updatedNodes.map((n) => ({
          caseId: parseInt(n.id.replace("case-", ""), 10),
          x: n.position.x,
          y: n.position.y,
        }));
        savePositions.mutate(
          { data: { positions } },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetCanvasPositionsQueryKey() });
            },
          }
        );
      }, 800);
    },
    [savePositions, queryClient]
  );

  const handleDeleteDep = useCallback(
    (depId: number) => {
      const dep = deps?.find((d) => d.id === depId);
      deleteDep.mutate(
        { id: depId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCaseDependenciesQueryKey() });
            if (dep) invalidateFinancialModels(dep.fromCaseId, dep.toCaseId);
            setNodes((currentNodes) => {
              debounceSavePositions(currentNodes);
              return currentNodes;
            });
          },
        }
      );
    },
    [deleteDep, queryClient, setNodes, debounceSavePositions, deps, invalidateFinancialModels]
  );

  useEffect(() => {
    if (casesLoading || posLoading || depsLoading || !cases || initialized.current) return;
    initialized.current = true;

    const positions = positionsData?.positions || [];
    const posMap = new Map(positions.map((p) => [p.caseId, { x: p.x, y: p.y }]));

    const newNodes: Node[] = cases.map((c, i) => {
      const model = modelMap.get(c.id);
      return {
        id: `case-${c.id}`,
        type: "caseNode",
        position: posMap.get(c.id) || { x: (i % 4) * 300, y: Math.floor(i / 4) * 200 },
        data: {
          caseData: c,
          npv: model?.npv ?? null,
          breakevenMonth: model?.breakevenMonth ?? null,
          scenarioCount: scenarioCountMap.get(c.id) ?? 0,
        },
      };
    });

    const newEdges: Edge[] = (deps || []).map((d) => ({
      id: `dep-${d.id}`,
      source: `case-${d.fromCaseId}`,
      target: `case-${d.toCaseId}`,
      type: "dependency",
      data: {
        dependencyType: d.dependencyType,
        conditionThreshold: d.conditionThreshold,
        cascadeField: d.cascadeField,
        depId: d.id,
        onDelete: handleDeleteDep,
      },
    }));

    if (positions.length === 0 && newEdges.length > 0) {
      const laid = getAutoLayout(newNodes, newEdges);
      setNodes(laid);
      debounceSavePositions(laid);
    } else {
      setNodes(newNodes);
    }
    setEdges(newEdges);
  }, [cases, positionsData, deps, casesLoading, posLoading, depsLoading, setNodes, setEdges, handleDeleteDep, modelMap, scenarioCountMap, debounceSavePositions]);

  useEffect(() => {
    if (!initialized.current) return;
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const caseId = parseInt(node.id.replace("case-", ""), 10);
        const model = modelMap.get(caseId);
        const sc = scenarioCountMap.get(caseId);
        return {
          ...node,
          data: {
            ...node.data,
            npv: model?.npv ?? null,
            breakevenMonth: model?.breakevenMonth ?? null,
            scenarioCount: sc ?? 0,
          },
        };
      })
    );
  }, [modelMap, scenarioCountMap, setNodes]);

  useEffect(() => {
    if (!deps || !initialized.current) return;
    setEdges(
      deps.map((d) => ({
        id: `dep-${d.id}`,
        source: `case-${d.fromCaseId}`,
        target: `case-${d.toCaseId}`,
        type: "dependency",
        data: {
          dependencyType: d.dependencyType,
          conditionThreshold: d.conditionThreshold,
          cascadeField: d.cascadeField,
          depId: d.id,
          onDelete: handleDeleteDep,
        },
      }))
    );
  }, [deps, setEdges, handleDeleteDep]);

  const saveCurrentPositions = useCallback(() => {
    setNodes((currentNodes) => {
      debounceSavePositions(currentNodes);
      return currentNodes;
    });
  }, [debounceSavePositions, setNodes]);

  const onNodeDragStop = useCallback(() => {
    saveCurrentPositions();
  }, [saveCurrentPositions]);

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removals = changes.filter((c) => c.type === "remove");
      if (removals.length > 0) {
        removals.forEach((r) => {
          if (r.type === "remove") {
            const depId = parseInt(r.id.replace("dep-", ""), 10);
            if (!isNaN(depId)) handleDeleteDep(depId);
          }
        });
        return;
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, handleDeleteDep]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      setPendingConnection(connection);
    },
    []
  );

  const handleConfirmDependency = useCallback(
    (type: "sequential" | "parallel" | "conditional", threshold?: number, cascadeField?: string) => {
      if (!pendingConnection) return;
      const fromId = parseInt(pendingConnection.source.replace("case-", ""), 10);
      const toId = parseInt(pendingConnection.target.replace("case-", ""), 10);

      createDep.mutate(
        {
          data: {
            fromCaseId: fromId,
            toCaseId: toId,
            dependencyType: type,
            conditionThreshold: threshold,
            cascadeField,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCaseDependenciesQueryKey() });
            invalidateFinancialModels(fromId, toId);
            setPendingConnection(null);
            saveCurrentPositions();
          },
        }
      );
    },
    [pendingConnection, createDep, queryClient, saveCurrentPositions, invalidateFinancialModels]
  );

  const handleAutoLayout = useCallback(() => {
    setNodes((current) => {
      const laid = getAutoLayout(current, edges);
      debounceSavePositions(laid);
      return laid;
    });
  }, [edges, setNodes, debounceSavePositions]);

  const isLoading = casesLoading || posLoading || depsLoading;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Network className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No Business Cases Yet</h2>
        <p className="text-muted-foreground max-w-md">
          Create your first business case to start mapping dependencies on the canvas.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
        <Controls className="!bg-card !border-border !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent" />
        <MiniMap
          nodeColor={() => "hsl(var(--primary))"}
          maskColor="rgba(0,0,0,0.1)"
          className="!bg-card !border-border !shadow-lg"
        />
      </ReactFlow>

      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleAutoLayout}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
          Auto Layout
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-card border border-border rounded-lg shadow-md px-4 py-2.5 text-xs text-muted-foreground space-y-1">
          <p><strong className="text-foreground">{cases.length}</strong> cases on canvas</p>
          <p><strong className="text-foreground">{deps?.length || 0}</strong> dependencies</p>
          <p className="text-[10px]">Double-click a node to edit</p>
          <p className="text-[10px]">Drag between handles to connect</p>
        </div>
      </div>

      {pendingConnection && (
        <DependencyDialog
          fromName={caseMap.get(parseInt(pendingConnection.source.replace("case-", ""), 10))?.name || "Source"}
          toName={caseMap.get(parseInt(pendingConnection.target.replace("case-", ""), 10))?.name || "Target"}
          onConfirm={handleConfirmDependency}
          onCancel={() => setPendingConnection(null)}
        />
      )}
    </div>
  );
}
