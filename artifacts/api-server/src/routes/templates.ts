import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, userTemplatesTable } from "@workspace/db";
import { ListIndustryTemplatesResponse } from "@workspace/api-zod";
import { industryTemplates } from "../lib/industryTemplates";
import { getOrCreateOrg } from "./organizations";

const router: IRouter = Router();

router.get("/industry-templates", (_req: Request, res: Response) => {
  res.json(ListIndustryTemplatesResponse.parse(industryTemplates));
});

router.get("/user-templates", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const templates = await db.select().from(userTemplatesTable).where(eq(userTemplatesTable.orgId, org.id));
  res.json(templates);
});

router.post("/user-templates", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const { name, industry, description, costItems, valueDrivers } = req.body;
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const [template] = await db.insert(userTemplatesTable).values({
    orgId: org.id,
    name,
    industry: industry || null,
    description: description || null,
    costItems: costItems || [],
    valueDrivers: valueDrivers || [],
  }).returning();
  res.status(201).json(template);
});

router.patch("/user-templates/:templateId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const templateId = parseInt(req.params.templateId, 10);
  const updates: Record<string, unknown> = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.industry !== undefined) updates.industry = req.body.industry;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.costItems !== undefined) updates.costItems = req.body.costItems;
  if (req.body.valueDrivers !== undefined) updates.valueDrivers = req.body.valueDrivers;

  const [template] = await db.update(userTemplatesTable).set(updates).where(
    and(eq(userTemplatesTable.id, templateId), eq(userTemplatesTable.orgId, org.id))
  ).returning();
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }
  res.json(template);
});

router.delete("/user-templates/:templateId", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const templateId = parseInt(req.params.templateId, 10);
  await db.delete(userTemplatesTable).where(
    and(eq(userTemplatesTable.id, templateId), eq(userTemplatesTable.orgId, org.id))
  );
  res.sendStatus(204);
});

export default router;
