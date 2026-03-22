# Choices & Value Flow — Implementation Task Brief

## Goal

Replace `artifacts/casebuilder/src/pages/ChoicesValueFlow.tsx` (the old kanban-column page)
with stratscaler's Choice Cascade + Choice Flow UI pattern, adapted to use marginmap's existing
business cases as the "choices". Full architectural spec is in the
**"Choices & Value Flow (Migration Target)"** section of `replit.md` — read that first.

## Reference codebase

Stratscaler source lives at `/home/user/stratscaler/src/pages/choice-cascade/`. Read the
relevant files there before writing any new components. Key files:
- `ChoiceFlowView.tsx` — swimlane layout engine, drag-drop, bezier edges (~1380 lines)
- `CascadeCanvas.tsx` + `CascadeOutline.tsx` — tree outline + discovery map
- `useChoiceCascade.ts` — data layer hook pattern to follow
- `DiscoveryMap.tsx` — nested card grid pattern

## Hard constraints (do not violate)

- **Do not modify**: `ValuesTab.tsx`, `CostsTab.tsx`, `ModelTab.tsx`, `ExportTab.tsx`
- **Do not modify**: `financialEngine.ts`, `cases.ts` routes, `case_dependencies` table/routes
- **Do not modify**: `canvas.ts` routes or any `@xyflow/react` canvas logic
- `case_dependencies` (financial value cascading) ≠ `choiceDependencies` (strategic sequencing) — they coexist, do not merge them
- Business cases are the leaf nodes — do not create a separate "choice" entity
- All financial data (NPV) comes from the existing financial engine, stored in `cachedNpv` on the business case — do not replicate financial calculation logic
- Follow all patterns in `replit.md`: Express 5 async handlers, IDOR protection via `verifyCaseOrgOwnership`, Drizzle schema style, Zod validation
- Run `pnpm run typecheck` after completing each phase

---

## Current Phase: [FILL IN BEFORE PASTING]

> Replace this block with the phase prompt below when starting a session.

---

## Phase Reference

### Phase 1 — DB Schema

Add three new schema files to `lib/db/src/schema/` following the exact pattern of
`valueDrivers.ts`. Create:
- `hierarchies.ts` — `(id, orgId, name, description, createdBy, createdAt, updatedAt)`
- `hierarchyNodes.ts` — `(id, hierarchyId, parentNodeId, name, nodeType ['category'|'business_case'], businessCaseId nullable FK to businessCases, depth, position, flowPosition, createdBy, createdAt, updatedAt)`
- `choiceDependencies.ts` — `(id, fromCaseId, toCaseId, depType ['forced'|'natural'|'metric_based'], metricKey, metricTargetValue, metricComparator, description, createdBy, createdAt)`

Also add `deliverByYear integer` and `cachedNpv numeric` columns to the existing
`businessCasesTable` in `lib/db/src/schema/businessCases.ts`. Export all new tables from
`lib/db/src/schema/index.ts`. Run `pnpm --filter @workspace/db run push` to apply.

### Phase 2 — API Routes

Add three route files to `artifacts/api-server/src/routes/` following the pattern in
`cases.ts`. Create:
- `hierarchies.ts` — GET all (by orgId), POST create, PATCH update, DELETE; mount at `/api/hierarchies`
- `hierarchyNodes.ts` — GET by hierarchyId (returns flat list), POST create, PATCH update (supports reorder), DELETE; mount at `/api/hierarchy-nodes`
- `choiceDependencies.ts` — GET by fromCaseId or toCaseId, POST create, DELETE by id; mount at `/api/choice-dependencies`

Register all three in `src/routes/index.ts`. Apply `verifyCaseOrgOwnership` for any route
that touches a businessCaseId. Also add a handler in the existing cases route that updates
`cachedNpv` on the business case whenever the financial model is computed.

### Phase 3 — Data Hook

In `artifacts/casebuilder/src/hooks/`, create `use-hierarchy.ts`. Follow the React Query
pattern in `use-cases.ts`. Export:
- `useHierarchies(orgId)`, `useCreateHierarchy()`, `useUpdateHierarchy()`, `useDeleteHierarchy()`
- `useHierarchyNodes(hierarchyId)`, `useCreateHierarchyNode()`, `useUpdateHierarchyNode()`, `useDeleteHierarchyNode()`
- `useChoiceDependencies(caseId)`, `useCreateChoiceDependency()`, `useDeleteChoiceDependency()`
- `buildTree(nodes, cases)` — converts flat `hierarchyNodes` + `businessCases` into a nested
  `CascadeNode[]` tree, attaching the matching business case to each leaf node. Follow the
  `buildTree` pattern in `/home/user/stratscaler/src/pages/choice-cascade/useChoiceCascade.ts`.

### Phase 4 — Choice Cascade View

Create `artifacts/casebuilder/src/pages/choices/ChoiceCascadeView.tsx`. Port the layout from
`/home/user/stratscaler/src/pages/choice-cascade/CascadeCanvas.tsx`, `CascadeOutline.tsx`,
and `DiscoveryMap.tsx`. Adapt as follows:
- Left panel: expandable tree outline of categories and business case names
- Right panel: nested card grid — categories as column headers, sub-categories and business
  case cards nested inside
- Business case cards show: name, `cachedNpv` formatted as "+$X.XK/M", status badge
  (DRAFT/IN REVIEW/APPROVED mapped from `draft`/`in_review`/`approved`), `timeHorizonMonths` as "Xmo"
- Category nodes show rollup NPV (sum of all descendant `cachedNpv` values)
- Clicking a business case card navigates to `/cases/:id`
- "+ Add item" creates a new business case (POST `/api/cases`) and adds a hierarchy node

### Phase 5 — Choice Flow View

Create `artifacts/casebuilder/src/pages/choices/ChoiceFlowView.tsx`. Port from
`/home/user/stratscaler/src/pages/choice-cascade/ChoiceFlowView.tsx`. Adapt as follows:
- Rows (swimlanes): root-level category names from `hierarchyNodes`
- Columns: unique `deliverByYear` values from business cases, plus "Unscheduled" for nulls
- Card content: name, status (Draft/In Review/Approved), `cachedNpv` formatted as "↑ $X.XM"
- Status colors: `draft`=blue (#7db8d6), `in_review`=yellow (#fbbf24), `approved`=teal (#6abf80)
- Drag-drop updates `deliverByYear` + `flowPosition` on the business case via PATCH `/api/cases/:id`
- Bezier dependency edges from `choiceDependencies` (forced=red #ef4444, natural=slate #94a3b8,
  metric_based=amber #f59e0b)
- Do NOT use stratscaler's `npv`, `cost`, `ongoing_cost`, `ocean_tag`, or `value_type` fields

### Phase 6 — Wire Up Page

Create `artifacts/casebuilder/src/pages/choices/ChoicesPage.tsx`. It should:
- Show named hierarchy tabs across the top (from `useHierarchies`)
- Show Cascade / Flow toggle top-right
- Show aggregate NPV in header (sum of `cachedNpv` for all business cases in the hierarchy)
- Render `ChoiceCascadeView` or `ChoiceFlowView` based on active toggle
- Include `ChoiceDetailDrawer.tsx` — a slide-in summary panel on card click showing:
  name, status, NPV, timeHorizonMonths, description, "Open Full Case" button → `/cases/:id`,
  and a "Dependencies" tab for managing `choiceDependencies`

Update `artifacts/casebuilder/src/App.tsx` to route `/choices` to `ChoicesPage`. Update the
nav sidebar to point "Choices & Value Flow" to `/choices`. Delete or archive the old
`ChoicesValueFlow.tsx`.
