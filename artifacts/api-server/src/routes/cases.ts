import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, sql, isNull } from "drizzle-orm";
import crypto from "crypto";
import {
  db,
  businessCasesTable,
  costLineItemsTable,
  valueDriversTable,
  financialObjectivesTable,
  scenariosTable,
  userTemplatesTable,
  companiesTable,
} from "@workspace/db";
import {
  CreateBusinessCaseBody,
  GetBusinessCaseParams,
  GetBusinessCaseResponse,
  UpdateBusinessCaseParams,
  UpdateBusinessCaseBody,
  UpdateBusinessCaseResponse,
  DeleteBusinessCaseParams,
  ListBusinessCasesResponse,
  ListCostLineItemsParams,
  ListCostLineItemsQueryParams,
  ListCostLineItemsResponse,
  ListCostLineItemsResponseItem,
  CreateCostLineItemParams,
  CreateCostLineItemBody,
  UpdateCostLineItemParams,
  UpdateCostLineItemBody,
  UpdateCostLineItemResponse,
  DeleteCostLineItemParams,
  ListValueDriversParams,
  ListValueDriversQueryParams,
  ListValueDriversResponse,
  ListValueDriversResponseItem,
  CreateValueDriverParams,
  CreateValueDriverBody,
  UpdateValueDriverParams,
  UpdateValueDriverBody,
  UpdateValueDriverResponse,
  DeleteValueDriverParams,
  GetFinancialObjectiveParams,
  GetFinancialObjectiveResponse,
  UpsertFinancialObjectiveParams,
  UpsertFinancialObjectiveBody,
  UpsertFinancialObjectiveResponse,
  ListScenariosParams,
  ListScenariosResponse,
  ListScenariosResponseItem,
  CreateScenarioParams,
  CreateScenarioBody,
  DeleteScenarioParams,
  GetFinancialModelParams,
  GetFinancialModelQueryParams,
  GetFinancialModelResponse,
  EnableSharingParams,
  EnableSharingResponse,
  DisableSharingParams,
  GetPublicCaseParams,
  GetPublicCaseResponse,
  ApplyIndustryTemplateParams,
  ApplyIndustryTemplateBody,
  ApplyIndustryTemplateResponse,
} from "@workspace/api-zod";
import { getOrCreateOrg } from "./organizations";
import { computeFinancialModel } from "../lib/financialEngine";
import { industryTemplates } from "../lib/industryTemplates";

const router: IRouter = Router();

async function verifyCaseOrgOwnership(caseId: number, userId: string): Promise<boolean> {
  const org = await getOrCreateOrg(userId);
  const [bc] = await db.select({ id: businessCasesTable.id }).from(businessCasesTable)
    .where(and(eq(businessCasesTable.id, caseId), eq(businessCasesTable.orgId, org.id)));
  return !!bc;
}

async function verifyScenarioBelongsToCase(scenarioId: number, businessCaseId: number): Promise<boolean> {
  const [scenario] = await db.select({ id: scenariosTable.id }).from(scenariosTable)
    .where(and(eq(scenariosTable.id, scenarioId), eq(scenariosTable.businessCaseId, businessCaseId)));
  return !!scenario;
}

function annualizeAmount(amount: number, frequency: string): number {
  if (frequency === "monthly") return amount * 12;
  if (frequency === "annually") return amount;
  return 0;
}

async function syncCostDeltaValueDriver(businessCaseId: number, scenarioId?: number | null): Promise<void> {
  const conditions = scenarioId
    ? [eq(costLineItemsTable.businessCaseId, businessCaseId), eq(costLineItemsTable.scenarioId, scenarioId)]
    : [eq(costLineItemsTable.businessCaseId, businessCaseId), isNull(costLineItemsTable.scenarioId)];

  const allCosts = await db.select().from(costLineItemsTable).where(and(...conditions));

  let annualCurrent = 0;
  let annualFuture = 0;
  let hasCurrentState = false;
  let hasFutureState = false;

  for (const c of allCosts) {
    if (c.costPhase === "current_state") {
      hasCurrentState = true;
      annualCurrent += annualizeAmount(c.amount, c.frequency);
    } else if (c.costPhase === "future_state") {
      hasFutureState = true;
      annualFuture += annualizeAmount(c.amount, c.frequency);
    }
  }

  const vdConditions = scenarioId
    ? [eq(valueDriversTable.businessCaseId, businessCaseId), eq(valueDriversTable.autoCalcKey, "cost_delta"), eq(valueDriversTable.scenarioId, scenarioId)]
    : [eq(valueDriversTable.businessCaseId, businessCaseId), eq(valueDriversTable.autoCalcKey, "cost_delta"), isNull(valueDriversTable.scenarioId)];

  const [existing] = await db.select().from(valueDriversTable).where(and(...vdConditions));

  if (!hasCurrentState && !hasFutureState) {
    if (existing) {
      await db.delete(valueDriversTable).where(eq(valueDriversTable.id, existing.id));
    }
    return;
  }

  const delta = annualCurrent - annualFuture;
  const driverName = delta >= 0 ? "Cost Savings (Auto-Calculated)" : "Cost Increase (Auto-Calculated)";
  const driverType = delta >= 0 ? "cost_reduction" as const : "cost_reduction" as const;

  if (existing) {
    await db.update(valueDriversTable).set({
      name: driverName,
      annualValue: delta,
      type: driverType,
      description: `Automatically calculated from current state ($${Math.round(annualCurrent).toLocaleString()}/yr) vs future state ($${Math.round(annualFuture).toLocaleString()}/yr)`,
    }).where(eq(valueDriversTable.id, existing.id));
  } else {
    await db.insert(valueDriversTable).values({
      businessCaseId,
      scenarioId: scenarioId || null,
      name: driverName,
      type: driverType,
      annualValue: delta,
      confidenceLevel: "high",
      monthsToRealize: 0,
      isAutoCalculated: true,
      autoCalcKey: "cost_delta",
      description: `Automatically calculated from current state ($${Math.round(annualCurrent).toLocaleString()}/yr) vs future state ($${Math.round(annualFuture).toLocaleString()}/yr)`,
    });
  }
}

router.get("/cases", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const cases = await db.select().from(businessCasesTable).where(eq(businessCasesTable.orgId, org.id));

  const casesWithSummary = await Promise.all(
    cases.map(async (bc) => {
      const [costAgg] = await db
        .select({ total: sql<number>`coalesce(sum(${costLineItemsTable.amount}), 0)` })
        .from(costLineItemsTable)
        .where(eq(costLineItemsTable.businessCaseId, bc.id));
      const [valueAgg] = await db
        .select({ total: sql<number>`coalesce(sum(${valueDriversTable.annualValue}), 0)` })
        .from(valueDriversTable)
        .where(eq(valueDriversTable.businessCaseId, bc.id));
      return {
        ...bc,
        totalInvestment: Number(costAgg?.total ?? 0),
        totalExpectedValue: Number(valueAgg?.total ?? 0),
      };
    })
  );

  res.json(ListBusinessCasesResponse.parse(casesWithSummary));
});

router.post("/cases", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateBusinessCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);

  if (parsed.data.companyId != null) {
    const [co] = await db.select({ id: companiesTable.id }).from(companiesTable)
      .where(and(eq(companiesTable.id, parsed.data.companyId), eq(companiesTable.orgId, org.id)));
    if (!co) { res.status(400).json({ error: "Company not found in this org" }); return; }
  }

  const [bc] = await db.insert(businessCasesTable).values({
    ...parsed.data,
    orgId: org.id,
    ownerId: req.user.id,
  }).returning();
  res.status(201).json(GetBusinessCaseResponse.parse(bc));
});

router.get("/cases/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetBusinessCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const [bc] = await db.select().from(businessCasesTable).where(
    and(eq(businessCasesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id))
  );
  if (!bc) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  res.json(GetBusinessCaseResponse.parse(bc));
});

router.patch("/cases/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateBusinessCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateBusinessCaseBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);

  if (body.data.companyId != null) {
    const [co] = await db.select({ id: companiesTable.id }).from(companiesTable)
      .where(and(eq(companiesTable.id, body.data.companyId), eq(companiesTable.orgId, org.id)));
    if (!co) { res.status(400).json({ error: "Company not found in this org" }); return; }
  }

  const [bc] = await db.update(businessCasesTable).set(body.data).where(
    and(eq(businessCasesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id))
  ).returning();
  if (!bc) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  res.json(UpdateBusinessCaseResponse.parse(bc));
});

router.delete("/cases/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteBusinessCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const [deleted] = await db.delete(businessCasesTable).where(
    and(eq(businessCasesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id))
  ).returning();
  if (!deleted) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/cases/:id/apply-template", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = ApplyIndustryTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const body = ApplyIndustryTemplateBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const template = industryTemplates.find(t => t.id === body.data.templateId);
  if (!template) {
    res.status(400).json({ error: "Template not found" });
    return;
  }
  const costRows = template.costItems.map(item => ({
    businessCaseId: params.data.id,
    name: item.name,
    description: item.description || null,
    type: item.type as "one_time" | "capex" | "opex" | "escalating" | "transition",
    amount: item.amount,
    frequency: item.frequency as "once" | "monthly" | "annually",
    escalationRate: item.escalationRate || null,
    depreciationYears: item.depreciationYears || null,
    costPhase: (item as { costPhase?: string }).costPhase as "current_state" | "future_state" | "project_cost" | undefined || "project_cost" as const,
  }));
  const createdCosts = await db.insert(costLineItemsTable).values(costRows).returning();

  if (template.valueDrivers && template.valueDrivers.length > 0) {
    const valueRows = template.valueDrivers.map(v => ({
      businessCaseId: params.data.id,
      name: v.name,
      description: v.description || null,
      type: v.type as "cost_reduction" | "revenue" | "margin" | "productivity" | "risk",
      annualValue: v.annualValue,
      confidenceLevel: v.confidenceLevel as "high" | "medium" | "low",
      monthsToRealize: v.monthsToRealize,
    }));
    await db.insert(valueDriversTable).values(valueRows);
  }

  await syncCostDeltaValueDriver(params.data.id);
  res.json(ApplyIndustryTemplateResponse.parse(createdCosts));
});

router.get("/cases/:id/costs", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = ListCostLineItemsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const query = ListCostLineItemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const scenarioId = query.data.scenarioId;

  if (scenarioId && !(await verifyScenarioBelongsToCase(scenarioId, params.data.id))) {
    res.status(400).json({ error: "Scenario does not belong to this business case" });
    return;
  }

  let conditions = [eq(costLineItemsTable.businessCaseId, params.data.id)];
  if (scenarioId) {
    conditions.push(eq(costLineItemsTable.scenarioId, scenarioId));
  }
  const items = await db.select().from(costLineItemsTable).where(and(...conditions));
  res.json(ListCostLineItemsResponse.parse(items));
});

router.post("/cases/:id/costs", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = CreateCostLineItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const body = CreateCostLineItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  if (body.data.scenarioId && !(await verifyScenarioBelongsToCase(body.data.scenarioId, params.data.id))) {
    res.status(400).json({ error: "Scenario does not belong to this business case" });
    return;
  }
  const [item] = await db.insert(costLineItemsTable).values({
    ...body.data,
    businessCaseId: params.data.id,
  }).returning();
  await syncCostDeltaValueDriver(params.data.id, body.data.scenarioId);
  res.status(201).json(ListCostLineItemsResponseItem.parse(item));
});

router.patch("/cases/:id/costs/:costId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateCostLineItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const body = UpdateCostLineItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [item] = await db.update(costLineItemsTable).set(body.data).where(
    and(eq(costLineItemsTable.id, params.data.costId), eq(costLineItemsTable.businessCaseId, params.data.id))
  ).returning();
  if (!item) {
    res.status(404).json({ error: "Cost line item not found" });
    return;
  }
  await syncCostDeltaValueDriver(params.data.id, item.scenarioId);
  res.json(UpdateCostLineItemResponse.parse(item));
});

router.delete("/cases/:id/costs/:costId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteCostLineItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const [deletedCost] = await db.select().from(costLineItemsTable).where(
    and(eq(costLineItemsTable.id, params.data.costId), eq(costLineItemsTable.businessCaseId, params.data.id))
  );
  await db.delete(costLineItemsTable).where(
    and(eq(costLineItemsTable.id, params.data.costId), eq(costLineItemsTable.businessCaseId, params.data.id))
  );
  await syncCostDeltaValueDriver(params.data.id, deletedCost?.scenarioId);
  res.sendStatus(204);
});

router.get("/cases/:id/values", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = ListValueDriversParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const query = ListValueDriversQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const scenarioId = query.data.scenarioId;

  if (scenarioId && !(await verifyScenarioBelongsToCase(scenarioId, params.data.id))) {
    res.status(400).json({ error: "Scenario does not belong to this business case" });
    return;
  }

  await syncCostDeltaValueDriver(params.data.id, scenarioId);

  let conditions = [eq(valueDriversTable.businessCaseId, params.data.id)];
  if (scenarioId) {
    conditions.push(eq(valueDriversTable.scenarioId, scenarioId));
  }
  const items = await db.select().from(valueDriversTable).where(and(...conditions));
  res.json(ListValueDriversResponse.parse(items));
});

router.post("/cases/:id/values", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = CreateValueDriverParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const body = CreateValueDriverBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  if (body.data.scenarioId && !(await verifyScenarioBelongsToCase(body.data.scenarioId, params.data.id))) {
    res.status(400).json({ error: "Scenario does not belong to this business case" });
    return;
  }
  const [item] = await db.insert(valueDriversTable).values({
    ...body.data,
    businessCaseId: params.data.id,
  }).returning();
  res.status(201).json(ListValueDriversResponseItem.parse(item));
});

router.patch("/cases/:id/values/:valueId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateValueDriverParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const body = UpdateValueDriverBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [existingDriver] = await db.select().from(valueDriversTable).where(
    and(eq(valueDriversTable.id, params.data.valueId), eq(valueDriversTable.businessCaseId, params.data.id))
  );
  if (!existingDriver) {
    res.status(404).json({ error: "Value driver not found" });
    return;
  }
  if (existingDriver.isAutoCalculated) {
    res.status(400).json({ error: "Cannot edit auto-calculated value drivers" });
    return;
  }
  const [item] = await db.update(valueDriversTable).set(body.data).where(
    and(eq(valueDriversTable.id, params.data.valueId), eq(valueDriversTable.businessCaseId, params.data.id))
  ).returning();
  res.json(UpdateValueDriverResponse.parse(item));
});

router.delete("/cases/:id/values/:valueId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteValueDriverParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const [existing] = await db.select().from(valueDriversTable).where(
    and(eq(valueDriversTable.id, params.data.valueId), eq(valueDriversTable.businessCaseId, params.data.id))
  );
  if (existing?.isAutoCalculated) {
    res.status(400).json({ error: "Cannot delete auto-calculated value drivers" });
    return;
  }
  await db.delete(valueDriversTable).where(
    and(eq(valueDriversTable.id, params.data.valueId), eq(valueDriversTable.businessCaseId, params.data.id))
  );
  res.sendStatus(204);
});

router.get("/cases/:id/objectives", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetFinancialObjectiveParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const [obj] = await db.select().from(financialObjectivesTable).where(eq(financialObjectivesTable.businessCaseId, params.data.id));
  res.json(GetFinancialObjectiveResponse.parse({ objective: obj || null }));
});

router.put("/cases/:id/objectives", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpsertFinancialObjectiveParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const body = UpsertFinancialObjectiveBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const existing = await db.select().from(financialObjectivesTable).where(eq(financialObjectivesTable.businessCaseId, params.data.id));
  let result;
  if (existing.length > 0) {
    [result] = await db.update(financialObjectivesTable).set(body.data).where(eq(financialObjectivesTable.businessCaseId, params.data.id)).returning();
  } else {
    [result] = await db.insert(financialObjectivesTable).values({ ...body.data, businessCaseId: params.data.id }).returning();
  }
  res.json(UpsertFinancialObjectiveResponse.parse(result));
});

router.delete("/cases/:id/objectives", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetFinancialObjectiveParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  await db.delete(financialObjectivesTable).where(eq(financialObjectivesTable.businessCaseId, params.data.id));
  res.sendStatus(204);
});

router.get("/cases/:id/scenarios", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = ListScenariosParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const items = await db.select().from(scenariosTable).where(eq(scenariosTable.businessCaseId, params.data.id));
  res.json(ListScenariosResponse.parse(items));
});

router.post("/cases/:id/scenarios", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = CreateScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const body = CreateScenarioBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [item] = await db.insert(scenariosTable).values({
    ...body.data,
    businessCaseId: params.data.id,
  }).returning();
  res.status(201).json(ListScenariosResponseItem.parse(item));
});

router.delete("/cases/:id/scenarios/:scenarioId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await verifyCaseOrgOwnership(params.data.id, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  await db.delete(scenariosTable).where(
    and(eq(scenariosTable.id, params.data.scenarioId), eq(scenariosTable.businessCaseId, params.data.id))
  );
  res.sendStatus(204);
});

router.get("/cases/:id/financial-model", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetFinancialModelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = GetFinancialModelQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const scenarioId = query.data.scenarioId;

  const org = await getOrCreateOrg(req.user.id);
  const [bc] = await db.select().from(businessCasesTable).where(
    and(eq(businessCasesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id))
  );
  if (!bc) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }

  if (scenarioId && !(await verifyScenarioBelongsToCase(scenarioId, params.data.id))) {
    res.status(400).json({ error: "Scenario does not belong to this business case" });
    return;
  }

  const model = await computeFinancialModel(bc, scenarioId);
  res.json(GetFinancialModelResponse.parse(model));
});

router.post("/cases/:id/share", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = EnableSharingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const shareToken = crypto.randomBytes(16).toString("hex");
  const org = await getOrCreateOrg(req.user.id);
  const [bc] = await db.update(businessCasesTable).set({ shareToken }).where(
    and(eq(businessCasesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id))
  ).returning();
  if (!bc) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  res.json(EnableSharingResponse.parse({ shareToken }));
});

router.delete("/cases/:id/share", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DisableSharingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  await db.update(businessCasesTable).set({ shareToken: null }).where(
    and(eq(businessCasesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id))
  );
  res.sendStatus(204);
});

router.get("/cases/public/:shareToken", async (req: Request, res: Response): Promise<void> => {
  const params = GetPublicCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [bc] = await db.select().from(businessCasesTable).where(eq(businessCasesTable.shareToken, params.data.shareToken));
  if (!bc) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const costs = await db.select().from(costLineItemsTable).where(eq(costLineItemsTable.businessCaseId, bc.id));
  const values = await db.select().from(valueDriversTable).where(eq(valueDriversTable.businessCaseId, bc.id));
  const financialModel = await computeFinancialModel(bc);

  res.json(GetPublicCaseResponse.parse({ case: bc, costs, values, financialModel }));
});

router.post("/cases/:id/apply-user-template", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const caseId = parseInt(req.params.id, 10);
  if (isNaN(caseId)) {
    res.status(400).json({ error: "Invalid case ID" });
    return;
  }
  if (!(await verifyCaseOrgOwnership(caseId, req.user.id))) {
    res.status(404).json({ error: "Business case not found" });
    return;
  }
  const { templateId } = req.body;
  if (!templateId) {
    res.status(400).json({ error: "templateId is required" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const [template] = await db.select().from(userTemplatesTable).where(
    and(eq(userTemplatesTable.id, templateId), eq(userTemplatesTable.orgId, org.id))
  );
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  let createdCosts: typeof costLineItemsTable.$inferSelect[] = [];
  let createdValues: typeof valueDriversTable.$inferSelect[] = [];

  const VALID_TYPES = ["one_time", "capex", "opex", "escalating", "transition"] as const;
  const VALID_FREQ = ["once", "monthly", "annually"] as const;
  const VALID_PHASES = ["current_state", "future_state", "project_cost"] as const;
  const VALID_DRIVER_TYPES = ["cost_reduction", "revenue", "margin", "productivity", "risk"] as const;
  const VALID_CONFIDENCE = ["high", "medium", "low"] as const;

  const costItems = (template.costItems as Array<Record<string, unknown>>) || [];
  if (costItems.length > 0) {
    const costRows = costItems.map(item => {
      const rawType = String(item.type || "opex");
      const rawFreq = String(item.frequency || "annually");
      const rawPhase = String(item.costPhase || "project_cost");
      return {
        businessCaseId: caseId,
        name: String(item.name || ""),
        description: item.description ? String(item.description) : null,
        type: (VALID_TYPES.includes(rawType as typeof VALID_TYPES[number]) ? rawType : "opex") as typeof VALID_TYPES[number],
        amount: Number(item.amount || 0),
        frequency: (VALID_FREQ.includes(rawFreq as typeof VALID_FREQ[number]) ? rawFreq : "annually") as typeof VALID_FREQ[number],
        escalationRate: item.escalationRate ? Number(item.escalationRate) : null,
        depreciationYears: item.depreciationYears ? Number(item.depreciationYears) : null,
        costPhase: (VALID_PHASES.includes(rawPhase as typeof VALID_PHASES[number]) ? rawPhase : "project_cost") as typeof VALID_PHASES[number],
      };
    });
    createdCosts = await db.insert(costLineItemsTable).values(costRows).returning();
  }

  const valueDriverItems = (template.valueDrivers as Array<Record<string, unknown>>) || [];
  if (valueDriverItems.length > 0) {
    const valueRows = valueDriverItems.map(v => {
      const rawType = String(v.type || "cost_reduction");
      const rawConf = String(v.confidenceLevel || "medium");
      return {
        businessCaseId: caseId,
        name: String(v.name || ""),
        description: v.description ? String(v.description) : null,
        type: (VALID_DRIVER_TYPES.includes(rawType as typeof VALID_DRIVER_TYPES[number]) ? rawType : "cost_reduction") as typeof VALID_DRIVER_TYPES[number],
        annualValue: Number(v.annualValue || 0),
        confidenceLevel: (VALID_CONFIDENCE.includes(rawConf as typeof VALID_CONFIDENCE[number]) ? rawConf : "medium") as typeof VALID_CONFIDENCE[number],
        monthsToRealize: Number(v.monthsToRealize || 0),
      };
    });
    createdValues = await db.insert(valueDriversTable).values(valueRows).returning();
  }

  await syncCostDeltaValueDriver(caseId);
  res.json({ costs: createdCosts, values: createdValues });
});

export default router;
