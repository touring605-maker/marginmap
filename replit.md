# Workspace

## Overview

CaseBuilder — a full-stack business case builder for finance teams. Multi-user with org scoping (users share cases within an org), multi-currency with live exchange rate conversion, multiple scenarios per case (optimistic/base/conservative), and a visual dependency canvas. pnpm workspace monorepo using TypeScript.

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
- Financial engine: `src/lib/financialEngine.ts` — NPV (monthly discount), IRR (Newton-Raphson), ROI, breakeven, confidence-adjusted values
- Industry templates: `src/lib/industryTemplates.ts` — Manufacturing, Retail, SaaS, Healthcare
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/casebuilder` (`@workspace/casebuilder`)

React + Vite frontend with Tailwind CSS. Uses `@workspace/replit-auth-web` for auth and `@workspace/api-client-react` for API calls.

- Vite proxy: `/api` → `http://localhost:8080`
- Auth: uses `useAuth()` from `@workspace/replit-auth-web` (never the generated API client for auth)
- Pages: Login, Dashboard (with case cards showing investment/value totals), NewCase (3-step wizard: details+industry → template → review), CaseEditor (tabs: Overview, Costs, Values, Financial Model, Export), Canvas, PublicView
- Case editor tabs: OverviewTab (editable metadata + financial objectives), CostsTab (5 cost types with inline editing), ValuesTab (5 value types with inline editing), ModelTab (NPV/IRR/ROI charts), Export (share + PDF/Excel placeholders)
- Scenario management: create/switch/delete scenarios; scenario filtering on costs and values
- Hooks: `use-cases.ts`, `use-costs.ts`, `use-values.ts`, `use-scenarios.ts` (scenarios, templates, financial objectives)

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Schema tables:
- `sessions`, `users` — auth
- `organizations`, `organization_members` — org scoping
- `business_cases`, `scenarios` — case management
- `cost_line_items`, `value_drivers`, `financial_objectives` — financial data
- `case_dependencies`, `canvas_positions` — dependency graph
- `exchange_rates` — cached exchange rates (1hr TTL)

Types exported: `BusinessCase`, `InsertBusinessCase`, etc.

Production migrations handled by Replit when publishing. Development: `pnpm --filter @workspace/db run push`.

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
- DB enums: `scenario_type` enum = `base|optimistic|conservative` (used in scenarios table), `case_scenario_mode` enum = `single|multi` (used in business_cases table) — these are separate PG enums to avoid collision
