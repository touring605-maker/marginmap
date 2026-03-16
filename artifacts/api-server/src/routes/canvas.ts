import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, canvasPositionsTable, businessCasesTable, caseDependenciesTable } from "@workspace/db";
import {
  GetCanvasPositionsResponse,
  SaveCanvasPositionsBody,
  SaveCanvasPositionsResponse,
} from "@workspace/api-zod";
import { getOrCreateOrg } from "./organizations";

const router: IRouter = Router();

router.get("/canvas", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const cases = await db.select().from(businessCasesTable).where(eq(businessCasesTable.orgId, org.id));
  const positions = await db.select().from(canvasPositionsTable).where(eq(canvasPositionsTable.orgId, org.id));
  const deps = await db
    .select({ dep: caseDependenciesTable })
    .from(caseDependenciesTable)
    .innerJoin(businessCasesTable, eq(businessCasesTable.id, caseDependenciesTable.fromCaseId))
    .where(eq(businessCasesTable.orgId, org.id));

  const posMap = new Map(positions.map(p => [p.caseId, { x: p.x, y: p.y }]));
  const casesWithPositions = cases.map(c => ({
    ...c,
    canvasPosition: posMap.get(c.id) || null,
  }));

  res.json({ cases: casesWithPositions, dependencies: deps.map(d => d.dep) });
});

router.get("/canvas/positions", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const positions = await db.select().from(canvasPositionsTable).where(eq(canvasPositionsTable.orgId, org.id));
  res.json(GetCanvasPositionsResponse.parse({ positions }));
});

router.put("/canvas/positions", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = SaveCanvasPositionsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);

  if (body.data.positions.length > 0) {
    const caseIds = body.data.positions.map(p => p.caseId);
    const ownedCases = await db
      .select({ id: businessCasesTable.id })
      .from(businessCasesTable)
      .where(and(eq(businessCasesTable.orgId, org.id), inArray(businessCasesTable.id, caseIds)));
    const ownedIds = new Set(ownedCases.map(c => c.id));
    const invalid = caseIds.filter(id => !ownedIds.has(id));
    if (invalid.length > 0) {
      res.status(403).json({ error: "Some cases do not belong to your organization" });
      return;
    }
  }

  await db.delete(canvasPositionsTable).where(eq(canvasPositionsTable.orgId, org.id));

  if (body.data.positions.length > 0) {
    await db.insert(canvasPositionsTable).values(
      body.data.positions.map(p => ({ orgId: org.id, caseId: p.caseId, x: p.x, y: p.y }))
    );
  }

  const positions = await db.select().from(canvasPositionsTable).where(eq(canvasPositionsTable.orgId, org.id));
  res.json(SaveCanvasPositionsResponse.parse({ positions }));
});

export default router;
