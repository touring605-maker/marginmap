import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";
import {
  db,
  businessCasesTable,
  costLineItemsTable,
  valueDriversTable,
  financialObjectivesTable,
  scenariosTable,
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
  const { templateId } = req.body as { templateId: string };
  const template = industryTemplates.find(t => t.id === templateId);
  if (!template) {
    res.status(400).json({ error: "Template not found" });
    return;
  }
  const items = template.costItems.map(item => ({
    businessCaseId: params.data.id,
    name: item.name,
    description: item.description || null,
    type: item.type as "one_time" | "capex" | "opex" | "escalating" | "transition",
    amount: item.amount,
    frequency: item.frequency as "once" | "monthly" | "annually",
    escalationRate: item.escalationRate || null,
    depreciationYears: item.depreciationYears || null,
  }));
  const created = await db.insert(costLineItemsTable).values(items).returning();
  res.json(ApplyIndustryTemplateResponse.parse(created));
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
  const scenarioId = query.success ? query.data.scenarioId : undefined;

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
  const [item] = await db.insert(costLineItemsTable).values({
    ...body.data,
    businessCaseId: params.data.id,
  }).returning();
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
  await db.delete(costLineItemsTable).where(
    and(eq(costLineItemsTable.id, params.data.costId), eq(costLineItemsTable.businessCaseId, params.data.id))
  );
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
  const scenarioId = query.success ? query.data.scenarioId : undefined;

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
  const [item] = await db.update(valueDriversTable).set(body.data).where(
    and(eq(valueDriversTable.id, params.data.valueId), eq(valueDriversTable.businessCaseId, params.data.id))
  ).returning();
  if (!item) {
    res.status(404).json({ error: "Value driver not found" });
    return;
  }
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
  const scenarioId = query.success ? query.data.scenarioId : undefined;

  const org = await getOrCreateOrg(req.user.id);
  const [bc] = await db.select().from(businessCasesTable).where(
    and(eq(businessCasesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id))
  );
  if (!bc) {
    res.status(404).json({ error: "Business case not found" });
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

export default router;
