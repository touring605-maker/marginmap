# Margin Scenario Planning Tool — Product Specification

## Overview

This tool is a **driver-based margin scenario planner** designed for a multi-channel business that generates revenue across three distinct but intersecting channels:

1. **Wholesale** — Products sold to distributors and dealers
2. **DTC E-Commerce** — Products sold directly to consumers through an owned online storefront
3. **Dropship / Fulfillment Services** — Fulfillment and logistics services sold to third-party e-commerce partners

Layers 1 and 2 of the underlying financial model already exist:
- **Layer 1** is a SKU/product-level margin model capturing unit economics (COGS, labor, overhead per unit)
- **Layer 2** is a channel P&L model applying channel-specific revenue realization and variable costs to the Layer 1 foundation

This tool builds **Layer 3** on top of those: an interactive scenario engine that allows non-technical users — including finance leads and business leadership — to model trade-offs, stress-test assumptions, and compare strategic alternatives without needing to modify the underlying models directly.

---

## Goals

- Allow leadership to run named scenarios (Baseline, Optimistic, Realistic, Pessimistic) and compare them side by side
- Surface the **delta** between scenarios — not just new totals — so decisions are grounded in what changes
- Flag when a scenario pushes against operational constraints (e.g., warehouse capacity, inventory availability)
- Make the model self-service: no finance analyst required to operate it
- Keep the calculation logic transparent and traceable — every output should be explainable by the inputs that drove it

---

## Input Drivers

Inputs are organized into four categories. Each input has a **baseline value** sourced from Layers 1 and 2, a configurable range, and — where relevant — a realistic bound that prevents operationally impossible scenarios.

### 1. Volume Drivers

These control how much revenue flows through each channel.

| Driver | Description | Configurable? |
|---|---|---|
| Wholesale unit volume | Total units sold through distributors/dealers | Yes |
| DTC unit volume | Total units sold through owned e-commerce | Yes |
| Dropship order volume | Total orders fulfilled for third-party partners | Yes |
| Channel mix shift (%) | % of total volume reallocated between channels | Yes |
| New dropship partner volume | Incremental orders from a new fulfillment partner | Yes |

> **Note:** When channel mix shift is applied, the tool should automatically reduce one channel's volume while increasing another's — not simply add volume to the system. Total demand should remain constant unless a separate total demand growth driver is adjusted.

---

### 2. Price and Revenue Realization Drivers

These control the revenue actually captured per unit or order after discounts, fees, and returns.

| Driver | Description | Configurable? |
|---|---|---|
| Wholesale ASP | Average selling price per unit to distributors/dealers | Yes |
| Wholesale discount rate (%) | Average discount from list price applied to wholesale | Yes |
| DTC ASP | Average selling price per unit on owned e-commerce | Yes |
| DTC return rate (%) | % of DTC orders returned; returned units reduce net revenue | Yes |
| Dropship service fee rate (%) | Fee charged to partners as % of order value fulfilled | Yes |
| Marketplace/platform fees (%) | Fees paid to e-commerce platforms (if applicable) | Yes |

---

### 3. Cost Drivers

These control the variable and semi-variable costs attributable to each channel.

| Driver | Description | Configurable? |
|---|---|---|
| Product COGS per unit | Direct cost of goods; flows from Layer 1 | **Locked (calculated)** |
| Fulfillment cost per unit (DTC) | Pick, pack, and last-mile shipping for DTC orders | Yes |
| Fulfillment cost per order (Dropship) | Ops cost to fulfill a partner's dropship order | Yes |
| Customer acquisition cost (CAC) — DTC | Blended paid + organic cost to acquire one DTC customer | Yes |
| Sales commission rate (%) — Wholesale | Commission paid to sales reps on wholesale channel | Yes |
| Return processing cost per unit | Cost to receive, inspect, and restock returned DTC items | Yes |

---

### 4. Shared Cost Pool Drivers

These are costs that serve all channels and must be allocated. The behavior of shared costs when volume shifts is one of the most consequential assumptions in the model.

| Driver | Description | Configurable? |
|---|---|---|
| Total shared cost pool ($) | Warehouse, tech stack, brand marketing, G&A | Yes |
| Shared cost allocation method | Fixed pool / Activity-based / Revenue-weighted | Yes (toggle) |
| Warehouse throughput ceiling (units/period) | Max fulfillable units before capacity is breached | Yes |
| Inventory availability (units by SKU tier) | Available units for each channel to draw from | Yes |
| Shared cost behavior | Fixed / Step-fixed / Variable as volume scales | Yes (toggle) |

> **Shared cost behavior is a critical assumption.** If set to Fixed, a volume shift between channels doesn't change the shared cost pool — only the allocation changes. If set to Step-fixed, the pool jumps at defined capacity thresholds. If set to Variable, shared costs scale proportionally with total volume. This toggle should be prominent in the UI with a clear label explaining what each option means.

---

## What Is Calculated (Not Adjustable)

The following values are **outputs** derived from the inputs above. They should not be editable by the user — they are the results of the model, not its assumptions.

### Per Channel

- **Gross Revenue** = Volume × ASP × (1 − Discount Rate)
- **Net Revenue** = Gross Revenue − (Return Rate × DTC ASP × Return Processing Cost)
- **Gross Margin ($)** = Net Revenue − (Volume × COGS per Unit)
- **Gross Margin (%)** = Gross Margin / Net Revenue
- **Channel Variable Costs** = Sum of CAC, commissions, fulfillment costs, platform fees attributable to that channel
- **Contribution Margin ($)** = Gross Margin − Channel Variable Costs
- **Contribution Margin (%)** = Contribution Margin / Net Revenue
- **Allocated Shared Costs** = Portion of shared cost pool assigned to this channel per chosen allocation method
- **Channel Net Margin ($)** = Contribution Margin − Allocated Shared Costs
- **Channel Net Margin (%)** = Channel Net Margin / Net Revenue

### Aggregate / Cross-Channel

- **Total Revenue** = Sum of Net Revenue across all channels
- **Blended Gross Margin (%)** = Weighted average across channels
- **Blended Contribution Margin (%)** = Weighted average across channels
- **Total Contribution Margin ($)** = Sum across channels
- **Total Net Margin ($)** = Total Contribution Margin − Total Shared Cost Pool
- **Revenue Mix (%)** = Each channel's share of total revenue
- **Contribution Mix (%)** = Each channel's share of total contribution margin

### Constraint Flags (Calculated Automatically)

- **Warehouse capacity breach** — flagged when total scenario volume exceeds throughput ceiling
- **Inventory shortfall** — flagged when a channel's scenario volume exceeds available inventory for a SKU tier
- **CAC payback period** — calculated as (CAC / Average Order Contribution Margin) and displayed per DTC scenario

---

## Sensitivity Scenarios

The tool supports three pre-defined scenario types in addition to a free-form custom scenario. Each scenario type applies a structured set of assumptions across the input drivers.

### Scenario Types

#### Baseline
The current state of the business as reflected in Layers 1 and 2. All drivers are set to their actual values. This scenario is **locked** — it cannot be edited, only viewed. All other scenarios are measured as a delta against Baseline.

---

#### Optimistic
Models a favorable outcome. Assumptions tilt toward higher revenue realization, lower costs, and improved channel mix.

Suggested Optimistic assumptions (adjustable by user):

| Driver | Optimistic Adjustment |
|---|---|
| DTC volume | +15–20% vs. Baseline |
| DTC ASP | +5% (improved pricing power) |
| DTC return rate | −2 percentage points |
| CAC — DTC | −10% (improved efficiency) |
| Wholesale ASP | Held flat or +2% |
| Fulfillment cost/unit | −5% (volume leverage) |
| Shared costs | Fixed (no increase) |

---

#### Realistic
Models the most probable near-term outcome. Assumptions reflect current trends with modest improvement. This is the primary planning scenario.

Suggested Realistic assumptions:

| Driver | Realistic Adjustment |
|---|---|
| DTC volume | +5–8% vs. Baseline |
| DTC ASP | Flat |
| DTC return rate | Flat |
| CAC — DTC | Flat to +5% |
| Wholesale ASP | −2% (distributor pressure) |
| Fulfillment cost/unit | Flat |
| Shared costs | +3–5% (inflation) |

---

#### Pessimistic
Models a downside scenario. Assumptions reflect margin compression, demand softness, or cost escalation.

Suggested Pessimistic assumptions:

| Driver | Pessimistic Adjustment |
|---|---|
| DTC volume | −10–15% vs. Baseline |
| DTC ASP | −5% (promotional pressure) |
| DTC return rate | +3 percentage points |
| CAC — DTC | +20% (paid media inflation) |
| Wholesale ASP | −5% (distributor discounting) |
| Fulfillment cost/unit | +8% (carrier rate increases) |
| Shared costs | +8–10% (step-fixed increase) |

---

#### Custom
A free-form scenario where the user can set any driver to any value independently. Custom scenarios can be named, saved, and compared against Baseline and each other. The tool should support at least **three named custom scenarios** visible simultaneously.

---

## Sensitivity Table

In addition to point-estimate scenarios, the tool should include a **sensitivity table** for the most impactful single driver in a given scenario. The table shows how a key output metric (e.g., Total Contribution Margin) changes as one driver varies across a range, holding all other drivers at scenario values.

### Example: CAC Sensitivity on DTC Contribution Margin

| CAC ($) | DTC Contribution Margin ($) | DTC Contribution Margin (%) | Delta vs. Baseline |
|---|---|---|---|
| $18 | — | — | — |
| $22 | — | — | — |
| $26 (Baseline) | — | — | 0% |
| $30 | — | — | — |
| $34 | — | — | — |

The sensitivity table should be configurable: the user selects the driver on the X-axis and the output metric on the Y-axis.

A two-variable sensitivity table (cross-tab) should also be available for power users — for example, varying both DTC volume and CAC simultaneously to show a matrix of contribution margin outcomes.

---

## UI and Output Requirements

### Required Views

1. **Scenario Dashboard** — Side-by-side comparison of up to four scenarios (Baseline + three others). Shows all key metrics with delta columns.

2. **Contribution Margin Waterfall** — Per channel, per scenario. Shows how revenue steps down through each cost layer to contribution margin. This is the primary visual for executive communication.

3. **Channel Mix Summary** — Stacked bar or table showing each channel's share of revenue and contribution margin across scenarios.

4. **Sensitivity Table** — Configurable single- or two-variable sensitivity grid.

5. **Constraint Flags Panel** — Persistent indicator showing whether any scenario has breached a capacity or inventory constraint.

### UX Principles

- **Delta first.** Every metric should show the change vs. Baseline, not just the new value.
- **Inputs and outputs visually separated.** Users should never confuse a driver they can change with a result the model computes.
- **Scenario names are user-defined.** Don't hard-code "Optimistic / Realistic / Pessimistic" as labels — let users name their scenarios.
- **Shared cost behavior assumption always visible.** Because this single toggle has outsized impact on results, it should always be displayed prominently alongside any scenario output.
- **No finance background required.** Tooltips or inline definitions should accompany any jargon (e.g., "contribution margin," "CAC," "step-fixed costs").

---

## Data Inputs from Layers 1 and 2

The tool should accept the following as seed inputs from the existing model. These can be entered manually at setup or imported via a structured data file (CSV or JSON):

- Unit COGS by SKU tier
- Baseline ASP by channel
- Baseline volume by channel
- Channel-specific variable cost rates (commissions, platform fees, return rates)
- Shared cost pool total and current allocation method
- Warehouse throughput ceiling
- Inventory availability by SKU tier

All baseline values should be locked behind a separate "Edit Baseline" mode to prevent accidental modification during scenario planning sessions.

---

## Out of Scope (V1)

The following are intentionally excluded from the initial version to keep scope manageable:

- Multi-period / time-series modeling (this is a single-period, snapshot tool)
- SKU-level scenario planning (scenarios operate at the channel level)
- Automated data sync with accounting or ERP systems
- User authentication and role-based access control
- Currency or multi-country support
