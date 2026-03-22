# Workspace

## Overview

MarginMap — a full-stack business case builder for finance teams. Multi-user with org scoping (users share cases within an org), multi-currency with live exchange rate conversion, multiple scenarios per case (optimistic/base/conservative), and a visual dependency canvas. pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Auth**: Replit Auth (OIDC with PKCE)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API server), Vite (frontend)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express 5 API server (port 8080)
│   └── casebuilder/        # React+Vite frontend (previewPath: /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # useAuth() hook for web client
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files emitted; JS bundling handled by esbuild/tsx/vite
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with Replit Auth, org-scoped business case management, financial engine, exchange rates, and industry templates.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, cookie-parser, JSON parsing, auth middleware, routes at `/api`
- Routes: `src/routes/index.ts` mounts: auth, organizations, cases, dependencies, canvas, exchangeRates, templates, health
- Auth: `src/routes/auth.ts` — OIDC/PKCE login/callback/logout, mobile token exchange
- Auth middleware: `src/middlewares/authMiddleware.ts` — session-based auth via cookies
- Auth lib: `src/lib/auth.ts` — session management (in-memory store)
- Financial engine: `src/lib/financialEngine.ts` — NPV (sum of discounted net cash flows over the full time horizon), IRR (Newton-Raphson), ROI, breakeven, confidence-adjusted values; CashFlowPeriod includes cumulativeCosts, cumulativeBenefits, and cumulativeNpv (running discounted net)
- Industry templates: `src/lib/industryTemplates.ts` — Manufacturing, Retail, SaaS, Healthcare
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/casebuilder` (`@workspace/casebuilder`)

React + Vite frontend with Tailwind CSS. Uses `@workspace/replit-auth-web` for auth and `@workspace/api-client-react` for API calls.

- Vite proxy: `/api` → `http://localhost:8080`
- Auth: uses `useAuth()` from `@workspace/replit-auth-web` (never the generated API client for auth)
- Pages: Login, Dashboard (with case cards showing investment/value totals), NewCase (3-step wizard: details+industry → template → review), CaseEditor (tabs: Overview, Costs, Values, Financial Model, Export), Canvas (React Flow dependency graph), PublicView
- Case editor tabs: OverviewTab (editable metadata + financial objectives), CostsTab (3-phase model: Current State, Future State, Project Costs — with cost delta summary bar), ValuesTab (auto-calc cost delta driver at top with lock icon + warning banner for cost increases; manual drivers in table below), ModelTab (NPV/IRR/ROI/breakeven charts + monthly table), ExportTab (PDF/Excel download + shareable URL toggle)
- Margin Map page (`/margin-map`): Driver-based margin scenario planner for 3-channel business (Wholesale, DTC, Dropship). Setup wizard enters baseline data (volume, price, cost, shared cost pool + constraints). Scenario dashboard shows side-by-side comparison (Baseline locked + up to 3 custom scenarios) with delta columns. State managed in React context + localStorage (no backend). Engine: `marginEngine.ts` computes per-channel and aggregate metrics (gross/net revenue, gross margin, contribution margin, allocated shared costs via revenue-weighted allocation, channel net margin). Shared cost behavior: Fixed/Step-Fixed/Variable. Constraint flags: warehouse capacity, inventory shortfall, CAC payback.
- Settings page (`/settings`): Templates tab with user template CRUD + industry template browser
- Scenario management: create/switch/delete scenarios; scenario filtering on costs and values
- Hooks: `use-cases.ts`, `use-costs.ts`, `use-values.ts`, `use-scenarios.ts` (scenarios, templates, financial objectives)
- Canvas: `@xyflow/react` (React Flow v12) for dependency graph visualization; `@dagrejs/dagre` for auto-layout; custom CaseNode (shows name, status, NPV, breakeven), DependencyEdge (typed: sequential/parallel/conditional with labels), DependencyDialog for edge creation; positions debounce-saved to server

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Schema tables:
- `sessions`, `users` — auth
- `organizations`, `organization_members` — org scoping
- `business_cases`, `scenarios` — case management
- `cost_line_items` (with `cost_phase` enum: current_state/future_state/project_cost), `value_drivers` (with `is_auto_calculated` + `auto_calc_key`), `financial_objectives` — financial data
- `user_templates` — org-scoped custom templates with JSONB costItems/valueDrivers
- `case_dependencies`, `canvas_positions` — dependency graph
- `exchange_rates` — cached exchange rates (1hr TTL)

Types exported: `BusinessCase`, `InsertBusinessCase`, etc.

Production migrations handled by Replit when publishing. Development: `pnpm --filter @workspace/db run push`.

## Choices & Value Flow (Migration Target)

Replaces the old kanban-column Choices page (`ChoicesValueFlow.tsx`). The new section has two views toggled top-right: **Choice Cascade** (hierarchy tree + nested card discovery map) and **Choice Flow** (category × year swimlane with dependency bezier edges). Business cases ARE the choices — no separate choice entity. The hierarchy provides organizational structure around them.

UI pattern sourced from: `/home/user/stratscaler/src/pages/choice-cascade/`
Key adaptations: stratscaler's standalone `npv/cost/opex` fields on choices → marginmap's existing financial engine output (`cachedNpv`); stratscaler's `company_id` → marginmap's `org_id`; stratscaler's approval/selection flow → marginmap's existing `draft|in_review|approved` status.

### New DB tables (add to `lib/db/src/schema/`)

- `hierarchies` — `(id, orgId, name, description, createdBy, createdAt, updatedAt)`
- `hierarchyNodes` — `(id, hierarchyId, parentNodeId, name, nodeType ['category'|'business_case'], businessCaseId nullable, depth, position, flowPosition, createdBy, createdAt, updatedAt)`
- `choiceDependencies` — `(id, fromCaseId, toCaseId, depType ['forced'|'natural'|'metric_based'], metricKey, metricTargetValue, metricComparator, description, createdBy, createdAt)`

New columns on `businessCases`: `deliverByYear integer` (for Choice Flow column placement), `cachedNpv numeric` (last financial model output, updated on every model run).

### New API routes (add to `artifacts/api-server/src/routes/`)

- `hierarchies.ts` — CRUD scoped by orgId; mount at `/api/hierarchies`
- `hierarchyNodes.ts` — CRUD + reorder; mount at `/api/hierarchy-nodes`
- `choiceDependencies.ts` — create/delete; mount at `/api/choice-dependencies`

Register all three in `src/routes/index.ts`. Apply `verifyCaseOrgOwnership` IDOR pattern for all case-linked operations.

### New frontend components (add to `artifacts/casebuilder/src/pages/choices/`)

- `ChoicesPage.tsx` — hierarchy selector tabs, Cascade/Flow toggle top-right, aggregate NPV header summed across all business cases in the hierarchy
- `ChoiceCascadeView.tsx` — left panel: expandable tree outline (categories + business case names); right panel: nested card grid (categories as column headers, sub-categories and business case cards nested inside). Cards show: name, `cachedNpv`, status badge (`draft`/`in_review`/`approved`), `timeHorizonMonths` as "Xmo". Category nodes show rollup NPV of descendants. Clicking a card navigates to `/cases/:id`.
- `ChoiceFlowView.tsx` — rows: root categories; cols: `deliverByYear` values + "Unscheduled". Cards show: name, status, `cachedNpv`. Drag-drop updates `deliverByYear` + `flowPosition`. Bezier dependency edges from `choiceDependencies` (forced=red, natural=slate, metric_based=amber).
- `ChoiceDetailDrawer.tsx` — summary drawer on card click; shows name, status, NPV, time horizon, description; "Open Full Case" button navigates to `CaseEditor`; "Dependencies" tab manages `choiceDependencies`.

### DO NOT MODIFY

`ValuesTab.tsx`, `CostsTab.tsx`, `ModelTab.tsx`, `ExportTab.tsx`, `financialEngine.ts`, `cases.ts` routes, `case_dependencies` table or routes, `canvas.ts` routes, any existing business case logic. The `case_dependencies` table (financial value cascading) is entirely separate from `choiceDependencies` (strategic sequencing) — both coexist.

### `lib/replit-auth-web` (`@workspace/replit-auth-web`)

Client-side auth hook for web. Exports `useAuth()` which provides `user`, `isLoading`, `isAuthenticated`, `login()`, `logout()`. Fetches `/api/auth/user` with credentials.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec (`openapi.yaml`) and Orval config. Codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec. Used by api-server for request/response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client. Custom fetch includes `credentials: "include"` for cookie-based auth.

## Key Architecture Notes

- Express 5: async handlers typed `Promise<void>`, use `res.status().json(); return;` pattern
- On first login, users auto-get a personal org via `getOrCreateOrg()` in organizations route
- Financial engine: confidence weights — high=1.0, medium=0.7, low=0.4
- Exchange rates: cached in DB with 1-hour TTL, fetched from `open.er-api.com/v6/latest/{base}`
- `scenariosTable` is referenced by `costLineItemsTable` and `valueDriversTable` — import order matters
- IDOR protection: all case sub-resource routes (costs, values, objectives, scenarios, apply-template) call `verifyCaseOrgOwnership(caseId, userId)` before processing — returns 404 if the case doesn't belong to the user's org
- DB enums: `scenario_type` enum = `base|optimistic|conservative` (used in scenarios table), `case_scenario_mode` enum = `single|multi` (used in business_cases table), `cost_phase` enum = `current_state|future_state|project_cost` (used in cost_line_items table) — these are separate PG enums to avoid collision
- Auto-calc value driver: when cost line items have current_state or future_state phases, a `cost_delta` value driver is auto-upserted/deleted on every cost mutation (create/update/delete). The driver is locked (cannot be manually edited or deleted). The backend `syncCostDeltaValueDriver()` handles this.
