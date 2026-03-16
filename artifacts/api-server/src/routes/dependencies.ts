import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, caseDependenciesTable, businessCasesTable } from "@workspace/db";
import {
  ListCaseDependenciesResponse,
  ListCaseDependenciesResponseItem,
  CreateCaseDependencyBody,
  UpdateCaseDependencyParams,
  UpdateCaseDependencyBody,
  UpdateCaseDependencyResponse,
  DeleteCaseDependencyParams,
} from "@workspace/api-zod";
import { getOrCreateOrg } from "./organizations";

const router: IRouter = Router();

async function verifyCaseOwnership(caseId: number, orgId: number): Promise<boolean> {
  const [bc] = await db.select({ id: businessCasesTable.id })
    .from(businessCasesTable)
    .where(and(eq(businessCasesTable.id, caseId), eq(businessCasesTable.orgId, orgId)));
  return !!bc;
}

router.get("/dependencies", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const deps = await db
    .select({ dep: caseDependenciesTable })
    .from(caseDependenciesTable)
    .innerJoin(businessCasesTable, eq(businessCasesTable.id, caseDependenciesTable.fromCaseId))
    .where(eq(businessCasesTable.orgId, org.id));

  res.json(ListCaseDependenciesResponse.parse(deps.map(d => d.dep)));
});

router.post("/dependencies", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = CreateCaseDependencyBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const fromOwned = await verifyCaseOwnership(body.data.fromCaseId, org.id);
  const toOwned = await verifyCaseOwnership(body.data.toCaseId, org.id);
  if (!fromOwned || !toOwned) {
    res.status(403).json({ error: "Both cases must belong to your organization" });
    return;
  }
  const [dep] = await db.insert(caseDependenciesTable).values(body.data).returning();
  res.status(201).json(ListCaseDependenciesResponseItem.parse(dep));
});

router.put("/dependencies/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateCaseDependencyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateCaseDependencyBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const existing = await db
    .select({ dep: caseDependenciesTable })
    .from(caseDependenciesTable)
    .innerJoin(businessCasesTable, eq(businessCasesTable.id, caseDependenciesTable.fromCaseId))
    .where(and(eq(caseDependenciesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id)));
  if (existing.length === 0) {
    res.status(404).json({ error: "Dependency not found" });
    return;
  }
  const [dep] = await db.update(caseDependenciesTable).set(body.data).where(eq(caseDependenciesTable.id, params.data.id)).returning();
  if (!dep) {
    res.status(404).json({ error: "Dependency not found" });
    return;
  }
  res.json(UpdateCaseDependencyResponse.parse(dep));
});

router.patch("/dependencies/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateCaseDependencyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateCaseDependencyBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const existing = await db
    .select({ dep: caseDependenciesTable })
    .from(caseDependenciesTable)
    .innerJoin(businessCasesTable, eq(businessCasesTable.id, caseDependenciesTable.fromCaseId))
    .where(and(eq(caseDependenciesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id)));
  if (existing.length === 0) {
    res.status(404).json({ error: "Dependency not found" });
    return;
  }
  const [dep] = await db.update(caseDependenciesTable).set(body.data).where(eq(caseDependenciesTable.id, params.data.id)).returning();
  if (!dep) {
    res.status(404).json({ error: "Dependency not found" });
    return;
  }
  res.json(UpdateCaseDependencyResponse.parse(dep));
});

router.delete("/dependencies/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteCaseDependencyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const existing = await db
    .select({ dep: caseDependenciesTable })
    .from(caseDependenciesTable)
    .innerJoin(businessCasesTable, eq(businessCasesTable.id, caseDependenciesTable.fromCaseId))
    .where(and(eq(caseDependenciesTable.id, params.data.id), eq(businessCasesTable.orgId, org.id)));
  if (existing.length === 0) {
    res.status(404).json({ error: "Dependency not found" });
    return;
  }
  await db.delete(caseDependenciesTable).where(eq(caseDependenciesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
